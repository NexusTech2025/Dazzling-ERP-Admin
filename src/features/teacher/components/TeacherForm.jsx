import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// V2 Components
import FormSection from '../../../components/ui/v2/FormSection';
import FormField from '../../../components/ui/v2/FormField';
import TextInput from '../../../components/ui/v2/TextInput';
import SelectInput from '../../../components/ui/v2/SelectInput';
import DateInput from '../../../components/ui/v2/DateInput';
import PhoneInput from '../../../components/ui/v2/PhoneInput';
import FileUpload from '../../../components/ui/v2/FileUpload';
import RadioGroup from '../../../components/ui/v2/RadioGroup';
import ToggleSwitch from '../../../components/ui/v2/ToggleSwitch';
import SegmentedControl from '../../../components/ui/v2/SegmentedControl';
import CourseSelectionModal from '../../course/components/CourseSelectionModal';
import Button from '../../../components/ui/v2/Button';
import MainLayout from '../../../components/layout/MainLayout';

/**
 * TeacherForm Component: Presentation layer and state manager for faculty forms.
 * Decoupled from AddTeacher page controller to support clean add/edit modes.
 */
const TeacherForm = ({
  teacher = null,
  subjects = [],
  salaryConfig = null,
  documents = [],
  courses = [],
  branches = [],
  isBranchesLoading = false,
  isDataLoading = false,
  isSubmitting = false,
  error = null,
  fieldErrors = {},
  onSubmit,
  onCancel
}) => {
  const isEditMode = !!teacher;
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [isSticky, setIsSticky] = useState(false);

  const handleBodyScroll = (e) => {
    const shouldBeSticky = e.currentTarget.scrollTop > 80;
    setIsSticky(prev => {
      if (prev !== shouldBeSticky) {
        return shouldBeSticky;
      }
      return prev;
    });
  };

  // Utility to generate a random password
  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const [formData, setFormData] = useState({
    // Basic Info
    full_name: '',
    mobile_number: '',
    email: '',
    gender: 'male',
    date_of_birth: '',
    address: '',
    profile_photo_url: '',

    // Professional Details
    subjects: [],
    experience_years: '',
    qualification: '',
    specialization: '',
    previous_institute: '',

    // Assignment
    branch: '',
    teacher_type: 'full_time',
    joining_date: new Date().toISOString().split('T')[0],
    time_slots: ['Morning'],

    // Financials
    salary_type: 'Monthly',
    base_salary: '',

    // Account
    createLogin: false,
    username: '',
    password: generatePassword(),
    role: 'Teacher',

    // Status
    status: 'active',
    internal_notes: ''
  });

  const selectedCourseObjects = useMemo(() => {
    if (!courses || !formData.subjects) return [];
    return courses.filter(c => formData.subjects.includes(c.course_id));
  }, [courses, formData.subjects]);

  const branchOptions = useMemo(() => {
    return branches?.map(branch => ({
      label: branch.branch_name,
      value: branch.branch_id
    })) || [];
  }, [branches]);

  // Helper to format date string to YYYY-MM-DD for standard HTML date input
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  };

  // Synchronize database records on load
  useEffect(() => {
    if (isEditMode && teacher) {
      const meta = teacher.metadata || {};
      const salType = salaryConfig?.salary_type === 'monthly' ? 'Monthly' :
        salaryConfig?.salary_type === 'per_class' ? 'Per Class' :
          meta.salary_type || 'Monthly';
      const baseSalary = salaryConfig?.base_amount !== undefined ? salaryConfig.base_amount : (meta.base_salary || '');

      setFormData({
        full_name: teacher.full_name || '',
        mobile_number: teacher.mobile_number || '',
        email: teacher.email || '',
        gender: teacher.gender || 'male',
        date_of_birth: formatDateForInput(teacher.date_of_birth),
        address: teacher.address || meta.address || '',
        profile_photo_url: teacher.profile_photo_url || '',

        subjects: subjects || [],
        experience_years: teacher.experience_years || '',
        qualification: teacher.qualification || '',
        specialization: teacher.specialization || '',
        previous_institute: teacher.previous_institute || '',

        branch: teacher.branch_id || meta.branch || '',
        teacher_type: teacher.teacher_type || 'full_time',
        joining_date: formatDateForInput(teacher.joining_date),
        time_slots: meta.time_slots || ['Morning'],

        salary_type: salType,
        base_salary: baseSalary,

        createLogin: false,
        username: teacher.username || '',
        password: '••••••••',
        role: 'Teacher',

        status: teacher.status || 'active',
        internal_notes: teacher.notes || ''
      });
    }
  }, [isEditMode, teacher, subjects, salaryConfig]);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) return "Full Name is required.";
    if (!formData.mobile_number.trim()) return "Mobile Number is required.";
    if (!formData.branch) return "Assigned Branch is required.";
    if (!formData.experience_years) return "Experience is required.";
    if (!formData.joining_date) return "Joining Date is required.";

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Invalid email format.";
    }

    if (formData.createLogin && !formData.username.trim()) {
      return "Username is required when 'Create Login' is enabled.";
    }

    return null;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setLocalError(null);

    const validationError = validateForm();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    onSubmit(formData);
  };

  const handleCoursesSelect = (selectedObjects) => {
    const identifiers = selectedObjects.map(c => c.course_id);
    handleChange('subjects', identifiers);
  };

  const displayError = error || localError;

  return (
    <>
      <CourseSelectionModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onSelect={handleCoursesSelect}
        selectedCourses={selectedCourseObjects}
        availableCourses={courses || []}
      />
      
      <MainLayout
        onBodyScroll={handleBodyScroll}
        slotClasses={{
          container: "relative lg:max-w-7xl lg:mx-auto",
          body: "py-0"
        }}
        header={
          <div
            className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${
              isSticky
                ? 'opacity-100 translate-y-0 shadow-md pointer-events-auto'
                : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
          >
            <div className="bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-border-light dark:border-border-dark px-4 lg:px-6 py-3 flex items-center justify-between rounded-b-xl">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">person_apron</span>
                <span className="text-sm font-bold text-text-main dark:text-white">
                  {isEditMode ? 'Edit Faculty Profile' : 'Teacher Registration'}
                </span>
                {formData.full_name && (
                  <>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-xs text-text-secondary dark:text-slate-400 font-semibold truncate max-w-[200px]">
                      {formData.full_name}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        }
        body={
          <div className="px-4 lg:px-0 pt-6 lg:pt-10 pb-6">
            {/* Top Header Section */}
            <header className="mb-8 flex justify-between items-end">
              <div>
                <nav className="flex text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2 gap-2 items-center">
                  <span className="cursor-pointer hover:text-primary transition-colors" onClick={onCancel}>Teachers</span>
                  <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                  <span className="text-primary font-bold">{isEditMode ? 'Edit Profile' : 'New Registration'}</span>
                </nav>
                <h1 className="text-3xl font-black tracking-tight text-text-main dark:text-white">
                  {isEditMode ? 'Edit Faculty Profile' : 'Teacher Registration'}
                </h1>
                <p className="text-text-secondary mt-1 font-medium text-sm">
                  {isEditMode ? `Updating information for ${formData.full_name}` : 'Onboard a new faculty member to the Meridian ecosystem.'}
                </p>
              </div>
            </header>

            {displayError && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-lg border border-red-100 dark:border-red-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <span className="material-symbols-outlined">error</span>
                <span className="text-sm font-bold">{displayError}</span>
              </div>
            )}

            <form className="grid grid-cols-12 gap-6 items-start" onSubmit={handleSubmit}>
              {/* Left Column */}
              <div className="col-span-12 lg:col-span-8 space-y-6">
                {/* 1. Basic Information */}
                <FormSection title="Basic Information" icon="badge">
                  <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField label="Full Name" name="full_name" required error={fieldErrors['full_name']}>
                      <TextInput
                        value={formData.full_name}
                        onChange={(e) => handleChange('full_name', e.target.value)}
                        placeholder="e.g. Dr. Jonathan Smith"
                      />
                    </FormField>

                    <FormField label="Date of Birth" name="date_of_birth">
                      <DateInput
                        value={formData.date_of_birth}
                        onChange={(e) => handleChange('date_of_birth', e.target.value)}
                      />
                    </FormField>

                    <FormField label="Gender" name="gender">
                      <SelectInput
                        value={formData.gender}
                        onChange={(val) => handleChange('gender', val)}
                        options={[
                          { label: 'Male', value: 'male' },
                          { label: 'Female', value: 'female' },
                          { label: 'Other', value: 'other' }
                        ]}
                      />
                    </FormField>
                  </div>

                  <FormField label="Mobile Number" name="mobile_number" required error={fieldErrors['mobile_number']}>
                    <PhoneInput
                      value={formData.mobile_number}
                      onChange={(e) => handleChange('mobile_number', e.target.value)}
                      placeholder="000 000 0000"
                    />
                  </FormField>

                  <FormField label="Email Address" name="email" error={fieldErrors['email']}>
                    <TextInput
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="jonathan@meridian.com"
                    />
                  </FormField>

                  <FormField label="Residential Address" name="address" className="col-span-2">
                    <TextInput
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="Full residential address..."
                    />
                  </FormField>

                  <FormField label="Profile Photo" name="profile_photo" className="col-span-2">
                    <FileUpload
                      accept="image/*"
                      helperText="Drag & drop image"
                      onFileSelect={(file) => handleChange('profile_photo_url', file.name)}
                      value={formData.profile_photo_url}
                    />
                  </FormField>
                </FormSection>

                {/* 2. Professional Details */}
                <FormSection title="Professional Details" icon="history_edu">
                  <FormField label="Subjects/Courses" name="subjects" className="col-span-2" error={fieldErrors['subjects']}>
                    <div className="space-y-3">
                      {isDataLoading ? (
                        <div className="flex items-center gap-2 p-3 text-xs text-text-secondary bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                          <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                          Loading assigned subjects...
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 min-h-[38px] p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                          {selectedCourseObjects.length > 0 ? (
                            selectedCourseObjects.map((course) => (
                              <div
                                key={course.course_id}
                                className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary rounded-lg border border-primary/20 text-[11px] font-bold"
                              >
                                {course.name}
                                <button
                                  type="button"
                                  onClick={() => handleChange('subjects', formData.subjects.filter(s => s !== course.course_id))}
                                  className="material-symbols-outlined text-sm hover:text-red-500 transition-colors"
                                >
                                  close
                                </button>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic flex items-center px-2">No courses selected</span>
                          )}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsCourseModalOpen(true)}
                        className="w-full py-2 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        Select Subjects / Courses
                      </button>
                    </div>
                  </FormField>

                  <FormField label="Experience (Years)" name="experience_years" required>
                    <TextInput
                      type="number"
                      value={formData.experience_years}
                      onChange={(e) => handleChange('experience_years', e.target.value)}
                      placeholder="0"
                    />
                  </FormField>

                  <FormField label="Qualification" name="qualification">
                    <TextInput
                      value={formData.qualification}
                      onChange={(e) => handleChange('qualification', e.target.value)}
                      placeholder="e.g. PhD in Physics"
                    />
                  </FormField>

                  <FormField label="Specialization" name="specialization">
                    <TextInput
                      value={formData.specialization}
                      onChange={(e) => handleChange('specialization', e.target.value)}
                      placeholder="Quantum Mechanics"
                    />
                  </FormField>

                  <FormField label="Previous Institute" name="previous_institute">
                    <TextInput
                      value={formData.previous_institute}
                      onChange={(e) => handleChange('previous_institute', e.target.value)}
                      placeholder="Metropolis Academic Center"
                    />
                  </FormField>
                </FormSection>

                {/* 6. Account Setup */}
                <FormSection
                  title="Account Setup"
                  icon="lock_open"
                  headerAction={
                    <ToggleSwitch
                      label="Create Login"
                      checked={formData.createLogin}
                      onChange={(val) => handleChange('createLogin', val)}
                      disabled={isEditMode}
                    />
                  }
                >
                  <div className={`col-span-2 grid grid-cols-2 gap-4 transition-all duration-300 ${formData.createLogin || isEditMode ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                    <FormField label="Username" name="username" className="col-span-2" error={fieldErrors['userData.username']}>
                      <TextInput
                        value={formData.username}
                        onChange={(e) => handleChange('username', e.target.value)}
                        placeholder="jsmith_meridian"
                      />
                    </FormField>

                    <FormField label={isEditMode ? "Password (Encrypted)" : "Generated Password"} name="password">
                      <div className="flex items-center p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-border-light dark:border-border-dark justify-between h-[38px]">
                        <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
                          {isEditMode ? '••••••••' : formData.password}
                        </span>
                        {!isEditMode && (
                          <button
                            type="button"
                            onClick={() => handleChange('password', generatePassword())}
                            className="material-symbols-outlined text-primary text-lg hover:rotate-180 transition-transform duration-300"
                          >
                            cached
                          </button>
                        )}
                      </div>
                    </FormField>
                  </div>
                </FormSection>
              </div>

              {/* Right Column */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                {/* 3. Assignment Details */}
                <FormSection title="Assignment Details" icon="assignment_ind">
                  <FormField label="Assigned Branch" name="branch" required>
                    <SelectInput
                      value={formData.branch}
                      onChange={(val) => handleChange('branch', val)}
                      options={isBranchesLoading ? [{ label: 'Loading...', value: '' }] : branchOptions}
                    />
                  </FormField>

                  <FormField label="Teacher Type" name="teacher_type">
                    <SelectInput
                      value={formData.teacher_type}
                      onChange={(val) => handleChange('teacher_type', val)}
                      options={[
                        { label: 'Full Time', value: 'full_time' },
                        { label: 'Part Time', value: 'part_time' },
                        { label: 'Contractor', value: 'contract' }
                      ]}
                    />
                  </FormField>

                  <FormField label="Joining Date" name="joining_date" required>
                    <DateInput
                      value={formData.joining_date}
                      onChange={(e) => handleChange('joining_date', e.target.value)}
                    />
                  </FormField>

                  <div className="col-span-2 border-t border-border-light dark:border-border-dark pt-4 mt-2">
                    <SegmentedControl
                      label="Preferred Time Slot"
                      value={Array.isArray(formData.time_slots) ? formData.time_slots[0] : formData.time_slots}
                      onChange={(val) => handleChange('time_slots', [val])}
                      options={[
                        { label: 'Morning', value: 'Morning' },
                        { label: 'Afternoon', value: 'Afternoon' },
                        { label: 'Evening', value: 'Evening' }
                      ]}
                    />
                  </div>
                </FormSection>

                {/* 4. Financials */}
                <FormSection title="Financial Details" icon="payments">
                  {isEditMode ? (
                    <div className="col-span-2 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                      <p className="text-xs font-semibold text-text-secondary">Financial Settings Locked</p>
                      <p className="text-[11px] text-slate-400 mt-1">Salary configurations for existing accounts must be updated via the dedicated Finance Portal.</p>
                    </div>
                  ) : (
                    <>
                      <RadioGroup
                        label="Salary Type"
                        name="salary_type"
                        className="col-span-2"
                        value={formData.salary_type}
                        onChange={(val) => handleChange('salary_type', val)}
                        options={[
                          { label: 'Monthly Fixed', value: 'Monthly' },
                          { label: 'Per Class Rate', value: 'Per Class' }
                        ]}
                      />

                      <FormField label="Base Salary / Rate ($)" name="base_salary" className="col-span-2">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                          <TextInput
                            type="number"
                            value={formData.base_salary}
                            onChange={(e) => handleChange('base_salary', e.target.value)}
                            className="pl-7"
                            placeholder="5,000"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 italic">Standard corporate deductions will be applied automatically during payroll.</p>
                      </FormField>
                    </>
                  )}
                </FormSection>

                {/* 7. Status & Notes */}
                <FormSection title="Status & Internal Notes" icon="notes">
                  <RadioGroup
                    label="Onboarding Status"
                    name="status"
                    layout="grid"
                    className="col-span-2"
                    value={formData.status}
                    onChange={(val) => handleChange('status', val)}
                    options={[
                      { label: 'Active', value: 'active' },
                      { label: 'Inactive', value: 'inactive' },
                      { label: 'Pending', value: 'pending' }
                    ]}
                  />
                  <FormField label="Internal Notes" name="internal_notes" className="col-span-2">
                    <textarea
                      name="internal_notes"
                      value={formData.internal_notes}
                      onChange={(e) => handleChange('internal_notes', e.target.value)}
                      className="w-full rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark focus:border-primary focus:ring-1 focus:ring-primary text-sm p-3 outline-none min-h-[160px] resize-none dark:text-white transition-all"
                      placeholder="Add any background checks, interview feedback, or special requests here..."
                    ></textarea>
                  </FormField>
                </FormSection>
              </div>
            </form>
          </div>
        }
        footer={
          <footer className="border border-border-light dark:border-border-dark bg-white dark:bg-slate-900 shadow-lg px-4 lg:px-6 py-3 flex items-center justify-between gap-4 rounded-xl w-full">
            {/* Left Block: Cancel Button */}
            <div className="flex items-center gap-4 justify-start w-1/3 md:w-auto">
              <Button
                variant="text"
                size="md"
                startIcon="close"
                onClick={onCancel}
                className="min-w-0 px-3 md:px-5"
              >
                <span className="hidden md:inline">
                  {isEditMode ? 'Discard' : 'Cancel'}
                </span>
              </Button>
              <div className="hidden md:block h-4 w-[1px] bg-slate-200"></div>
              <p className="hidden md:block text-[11px] text-slate-400 font-medium italic">Changes are not saved automatically.</p>
            </div>

            {/* Center Block: Save & Create Another (Visible only in Add Mode) */}
            {!isEditMode && (
              <div className="flex justify-center w-1/3 md:w-auto md:ml-auto">
                <Button variant="outlined" size="md">
                  Save & Create Another
                </Button>
              </div>
            )}

            {/* Right Block: Complete / Save */}
            <div className={`flex justify-end w-1/3 md:w-auto ${isEditMode ? 'ml-auto' : ''}`}>
              <Button
                variant="contained"
                size="md"
                endIcon="arrow_forward"
                loading={isSubmitting}
                onClick={handleSubmit}
                className="min-w-0 px-3 md:px-5 flex-1 md:flex-none"
              >
                <span className="hidden md:inline">
                  {isEditMode ? 'Update Profile' : 'Complete Registration'}
                </span>
              </Button>
            </div>
          </footer>
        }
      />
    </>
  );
};

export default TeacherForm;

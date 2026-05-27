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
    <div className="pb-32">
      <CourseSelectionModal 
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onSelect={handleCoursesSelect}
        selectedCourses={selectedCourseObjects}
        availableCourses={courses || []}
      />
      {/* Top Header Section */}
      <header className="mb-8 flex justify-between items-end px-4 lg:px-0">
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
        
        <div className="hidden md:flex items-center bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark px-4 py-2 rounded-lg shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase mr-4 tracking-widest">
            {isEditMode ? 'Profile Integrity' : 'Progress'}
          </span>
          <div className="w-32 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="bg-primary w-3/4 h-full"></div>
          </div>
          <span className="ml-4 text-xs font-bold text-primary">{isEditMode ? '100%' : '25%'}</span>
        </div>
      </header>

      {displayError && (
        <div className="mx-4 lg:mx-0 mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-lg border border-red-100 dark:border-red-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined">error</span>
          <span className="text-sm font-bold">{displayError}</span>
        </div>
      )}

      <form className="space-y-6 px-4 lg:px-0" onSubmit={handleSubmit}>
        {/* Section 1 & 2: Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Basic Information */}
          <FormSection title="Basic Information" icon="badge">
            <FormField label="Full Name" name="full_name" required className="col-span-2" error={fieldErrors['full_name']}>
              <TextInput 
                value={formData.full_name} 
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="e.g. Dr. Jonathan Smith" 
              />
            </FormField>

            <FormField label="Mobile Number" name="mobile_number" required className="col-span-2" error={fieldErrors['mobile_number']}>
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

            <FormField label="Date of Birth" name="date_of_birth">
              <DateInput 
                value={formData.date_of_birth}
                onChange={(e) => handleChange('date_of_birth', e.target.value)}
              />
            </FormField>

            <FormField label="Residential Address" name="address" className="col-span-2">
              <TextInput 
                value={formData.address} 
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Full residential address..." 
              />
            </FormField>

            <FormField label="Profile Photo" name="avatar">
              <FileUpload 
                accept="image/*"
                helperText="Drag & drop image"
                onFileSelect={(file) => handleChange('profile_photo_url', file.name)}
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
                  <div className="flex flex-wrap gap-2 min-h-[42px] p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
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
                  className="w-full py-2.5 bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">add_circle</span>
                  Select Subjects / Courses
                </button>
              </div>
            </FormField>

            <FormField label="Experience (Years)" name="experience_years">
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

            <FormField label="Specialization" name="specialization" className="col-span-2">
              <TextInput 
                value={formData.specialization}
                onChange={(e) => handleChange('specialization', e.target.value)}
                placeholder="Quantum Mechanics" 
              />
            </FormField>

            <FormField label="Previous Institute" name="previous_institute" className="col-span-2">
              <TextInput 
                value={formData.previous_institute}
                onChange={(e) => handleChange('previous_institute', e.target.value)}
                placeholder="Metropolis Academic Center" 
              />
            </FormField>
          </FormSection>
        </div>

        {/* 3. Assignment & 4. Salary Configuration */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 3. Assignment Details */}
          <FormSection title="Assignment Details" icon="assignment_ind">
            <FormField label="Assigned Branch" name="branch">
              <SelectInput 
                value={formData.branch}
                onChange={(val) => handleChange('branch', val)}
                options={isBranchesLoading ? [{ label: 'Loading...', value: '' }] : branchOptions}
                disabled={isBranchesLoading}
              />
            </FormField>

            <FormField label="Teacher Type" name="teacher_type">
              <SelectInput 
                value={formData.teacher_type}
                onChange={(val) => handleChange('teacher_type', val)}
                options={[
                  { label: 'Full-Time', value: 'full_time' },
                  { label: 'Part-Time', value: 'part_time' },
                  { label: 'Guest Faculty', value: 'guest' }
                ]}
              />
            </FormField>

            <FormField label="Joining Date" name="joining_date">
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
                  { label: 'Morning', value: 'Morning', icon: 'wb_sunny' },
                  { label: 'Afternoon', value: 'Afternoon', icon: 'light_mode' },
                  { label: 'Evening', value: 'Evening', icon: 'dark_mode' }
                ]}
              />
            </div>
          </FormSection>

          {/* 4. Salary Configuration */}
          <FormSection title="Salary Configuration" icon="payments">
            {isDataLoading ? (
              <div className="col-span-2 flex items-center gap-2 p-3 text-xs text-text-secondary bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                Loading payroll configuration...
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
                    { label: 'Monthly', value: 'Monthly', icon: 'calendar_month' },
                    { label: 'Per Class', value: 'Per Class', icon: 'school' }
                  ]}
                />

                <FormField label="Base Salary / Rate ($)" name="base_salary" className="col-span-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <TextInput 
                      type="number"
                      value={formData.base_salary}
                      onChange={(e) => handleChange('base_salary', e.target.value)}
                      className="pl-8"
                      placeholder="5,000" 
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 italic">Standard corporate deductions will be applied automatically during payroll.</p>
                </FormField>
              </>
            )}
          </FormSection>
        </div>

        {/* 5. Documents & 6. Account Setup */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 5. Documents */}
          <FormSection title="Documents" icon="description">
            {isDataLoading ? (
              <div className="col-span-2 flex items-center gap-2 p-3 text-xs text-text-secondary bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                Loading document attachments...
              </div>
            ) : (
              <div className="col-span-2 flex flex-col gap-4">
                <div className="flex items-center p-4 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-text-main dark:text-white">ID Proof</h4>
                    <p className="text-xs text-slate-500">
                      {documents?.find(d => d.document_type === 'id_proof')?.file_url ? 'File linked successfully' : 'Passport, Driving License or State ID'}
                    </p>
                  </div>
                  <button type="button" className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark shadow-sm text-xs font-medium hover:bg-slate-50 transition-colors dark:text-white">
                    <span className="material-symbols-outlined text-sm">upload</span>
                    Upload
                  </button>
                </div>
                <div className="flex items-center p-4 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-text-main dark:text-white">Updated Resume</h4>
                    <p className="text-xs text-slate-500">
                      {documents?.find(d => d.document_type === 'resume')?.file_url ? 'Resume file linked' : 'PDF or DOCX max 5MB'}
                    </p>
                  </div>
                  <button type="button" className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark shadow-sm text-xs font-medium hover:bg-slate-50 transition-colors dark:text-white">
                    <span className="material-symbols-outlined text-sm">upload</span>
                    Upload
                  </button>
                </div>
              </div>
            )}
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
                  disabled={isEditMode}
                />
              </FormField>
              
              <FormField label={isEditMode ? "Password (Encrypted)" : "Generated Password"} name="password">
                <div className="flex items-center p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-border-light dark:border-border-dark justify-between h-[42px]">
                  <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
                    {isEditMode ? '••••••••' : formData.password}
                  </span>
                  {!isEditMode && (
                    <button 
                      type="button" 
                      onClick={() => handleChange('password', generatePassword())}
                      className="material-symbols-outlined text-primary text-lg hover:rotate-180 transition-transform duration-300"
                    >
                      refresh
                    </button>
                  )}
                </div>
              </FormField>

              <FormField label="System Role" name="role">
                <div className="h-[42px] bg-primary/5 rounded-lg border border-primary/20 text-sm font-semibold text-primary flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  Teacher
                </div>
              </FormField>
            </div>
          </FormSection>
        </div>

        {/* 7. Status & Notes */}
        <FormSection title="Status & Internal Notes" icon="notes">
          <div className="col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <RadioGroup 
                label="Onboarding Status"
                name="status"
                layout="list"
                value={formData.status}
                onChange={(val) => handleChange('status', val)}
                options={[
                  { label: 'Active', value: 'active' },
                  { label: 'Inactive', value: 'inactive' },
                  { label: 'Pending', value: 'pending' }
                ]}
              />
            </div>
            <div className="md:col-span-2">
              <FormField label="Internal Notes" name="internal_notes">
                <textarea 
                  name="internal_notes"
                  value={formData.internal_notes}
                  onChange={(e) => handleChange('internal_notes', e.target.value)}
                  className="w-full rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark focus:border-primary focus:ring-1 focus:ring-primary text-sm p-3 outline-none min-h-[160px] resize-none dark:text-white transition-all"
                  placeholder="Add any background checks, interview feedback, or special requests here..."
                ></textarea>
              </FormField>
            </div>
          </div>
        </FormSection>
      </form>

      {/* Sticky Bottom Action Bar */}
      <footer className="fixed bottom-0 right-0 w-full md:w-[calc(100%-16rem)] border-t z-50 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-lg px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="text" 
            size="md" 
            startIcon="close"
            onClick={onCancel}
          >
            {isEditMode ? 'Discard Changes' : 'Cancel Registration'}
          </Button>
          <div className="hidden md:block h-4 w-[1px] bg-slate-200"></div>
          <p className="hidden md:block text-[11px] text-slate-400 font-medium italic">Changes are not saved automatically.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {!isEditMode && (
            <Button variant="outlined" size="md">
              Save & Create Another
            </Button>
          )}
          <Button 
            variant="contained" 
            size="md" 
            endIcon="arrow_forward"
            loading={isSubmitting}
            onClick={handleSubmit}
            className="flex-1 md:flex-none"
          >
            {isEditMode ? 'Update Profile' : 'Complete Registration'}
          </Button>
        </div>
      </footer>
    </div>
  );
};

export default TeacherForm;

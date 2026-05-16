import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { 
  useCreateTeacherMutation, 
  useTeacherDetailQuery, 
  useUpdateTeacherMutation 
} from '../../features/teacher/hooks/useTeacherQueries';

// V2 Components
import FormSection from '../../components/ui/v2/FormSection';
import FormField from '../../components/ui/v2/FormField';
import TextInput from '../../components/ui/v2/TextInput';
import SelectInput from '../../components/ui/v2/SelectInput';
import DateInput from '../../components/ui/v2/DateInput';
import PhoneInput from '../../components/ui/v2/PhoneInput';
import MultiSelect from '../../components/ui/v2/MultiSelect';
import FileUpload from '../../components/ui/v2/FileUpload';
import RadioGroup from '../../components/ui/v2/RadioGroup';
import ToggleSwitch from '../../components/ui/v2/ToggleSwitch';
import PasswordInput from '../../components/ui/v2/PasswordInput';
import SegmentedControl from '../../components/ui/v2/SegmentedControl';

/**
 * TeacherForm Page: Handles both New Registration and Profile Editing.
 * Fully refactored using modular V2 component library.
 * Synchronized with Teacher Profile schema.
 */
const AddTeacher = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Mutations & Queries
  const addMutation = useCreateTeacherMutation();
  const updateMutation = useUpdateTeacherMutation();
  const { data: existingTeacher, isLoading: isFetchingTeacher } = useTeacherDetailQuery(id);

  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    // Basic Info
    fullName: '',
    mobile: '',
    email: '',
    gender: 'Male',
    date_of_birth: '',
    address: '',
    avatarUrl: '',
    
    // Professional Details
    subjects: [], 
    experience: '',
    qualification: '',
    specialization: '',
    previousInstitute: '',
    
    // Assignment
    branch: 'Downtown Campus',
    teacherType: 'Full-Time',
    joiningDate: new Date().toISOString().split('T')[0],
    timeSlots: ['Morning'],
    
    // Financials
    salaryType: 'Monthly', 
    baseSalary: '',
    
    // Account
    createLogin: false,
    username: '',
    password: '••••••••',
    role: 'Teacher',
    
    // Status
    status: 'Active',
    internalNotes: ''
  });

  // Sync existing teacher data into form
  useEffect(() => {
    if (isEditMode && existingTeacher) {
      const meta = existingTeacher.metadata || {};
      setFormData({
        fullName: existingTeacher.teacher_name || '',
        mobile: existingTeacher.mobile || '',
        email: existingTeacher.email || '',
        gender: existingTeacher.gender || 'Male',
        date_of_birth: existingTeacher.date_of_birth || '',
        address: meta.address || '',
        avatarUrl: existingTeacher.avatar || '',
        
        subjects: existingTeacher.subject_code ? existingTeacher.subject_code.split(', ').filter(Boolean) : [],
        experience: existingTeacher.experience_years || meta.experience || '',
        qualification: existingTeacher.designation || '',
        specialization: existingTeacher.specialization || meta.specialization || '',
        previousInstitute: existingTeacher.previous_institute || meta.previous_institute || '',
        
        branch: meta.branch || 'Downtown Campus',
        teacherType: meta.teacher_type || 'Full-Time',
        joiningDate: meta.joining_date || '',
        timeSlots: meta.time_slots || ['Morning'],
        
        salaryType: meta.salary_type || 'Monthly',
        baseSalary: meta.base_salary || '',
        
        createLogin: false,
        username: existingTeacher.username || '',
        password: '••••••••',
        role: 'Teacher',
        
        status: existingTeacher.status === 'active' ? 'Active' : 'Pending',
        internalNotes: meta.internal_notes || ''
      });
    }
  }, [isEditMode, existingTeacher]);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setError(null);

    const profileData = {
      name: formData.fullName,
      mobile: formData.mobile,
      gender: formData.gender?.toLowerCase(),
      date_of_birth: formData.date_of_birth,
      department: 'Academic',
      designation: formData.qualification || 'Faculty',
      subject_code: formData.subjects.join(', '),
      specialization: formData.specialization,
      experience_years: Number(formData.experience),
      teacher_type: formData.teacherType?.toLowerCase().replace('-', '_'),
      joining_date: formData.joiningDate,
      previous_institute: formData.previousInstitute,
      status: formData.status?.toLowerCase(),
      metadata: {
        experience: formData.experience,
        specialization: formData.specialization,
        previous_institute: formData.previousInstitute,
        address: formData.address,
        branch: formData.branch,
        teacher_type: formData.teacherType,
        joining_date: formData.joiningDate,
        time_slots: formData.timeSlots,
        salary_type: formData.salaryType,
        base_salary: formData.baseSalary,
        internal_notes: formData.internalNotes
      }
    };

    if (isEditMode) {
      updateMutation.mutate({ id, data: profileData }, {
        onSuccess: (res) => {
          if (res.success) navigate(`/admin/teachers/${id}`);
          else setError(res.message || 'Failed to update profile.');
        },
        onError: (err) => setError(err.message)
      });
    } else {
      const userData = {
        username: formData.username || formData.fullName.toLowerCase().replace(/\s+/g, '_'),
        password: 'InitialPassword123',
        email: formData.email
      };

      addMutation.mutate({ userData, profileData }, {
        onSuccess: (res) => {
          if (res.success) navigate('/admin/teachers');
          else setError(res.message || 'Failed to register faculty.');
        },
        onError: (err) => setError(err.message)
      });
    }
  };

  if (isEditMode && isFetchingTeacher) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pb-32">
      {/* Top Header Section */}
      <header className="mb-8 flex justify-between items-end px-4 lg:px-0">
        <div>
          <nav className="flex text-[10px] font-black uppercase tracking-widest text-text-secondary mb-2 gap-2 items-center">
            <Link to="/admin" className="hover:text-primary transition-colors">Management</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <Link to="/admin/teachers" className="hover:text-primary transition-colors">Teachers</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-primary font-bold">{isEditMode ? 'Edit Profile' : 'New Registration'}</span>
          </nav>
          <h1 className="text-3xl font-black tracking-tight text-text-main dark:text-white">
            {isEditMode ? 'Edit Faculty Profile' : 'Teacher Registration'}
          </h1>
          <p className="text-text-secondary mt-1 font-medium text-sm">
            {isEditMode ? `Updating information for ${formData.fullName}` : 'Onboard a new faculty member to the Meridian ecosystem.'}
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

      {error && (
        <div className="mx-4 lg:mx-0 mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-lg border border-red-100 dark:border-red-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined">error</span>
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      <form className="space-y-6 px-4 lg:px-0" onSubmit={handleSubmit}>
        {/* Section 1 & 2: Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Basic Information */}
          <FormSection title="Basic Information" icon="badge">
            <FormField label="Full Name" name="fullName" required className="col-span-2">
              <TextInput 
                value={formData.fullName} 
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="e.g. Dr. Jonathan Smith" 
              />
            </FormField>

            <FormField label="Mobile Number" name="mobile" required className="col-span-2">
              <PhoneInput 
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
                placeholder="000 000 0000"
              />
            </FormField>

            <FormField label="Email Address" name="email">
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
                  { label: 'Male', value: 'Male' },
                  { label: 'Female', value: 'Female' },
                  { label: 'Other', value: 'Other' }
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
                onFileSelect={(file) => console.log("Uploaded:", file)}
              />
            </FormField>
          </FormSection>

          {/* 2. Professional Details */}
          <FormSection title="Professional Details" icon="history_edu">
            <FormField label="Subjects/Courses (Multi-select)" name="subjects" className="col-span-2">
              <MultiSelect 
                value={formData.subjects}
                onChange={(vals) => handleChange('subjects', vals)}
                options={[
                  { label: 'Advanced Physics', value: 'Advanced Physics' },
                  { label: 'Calculus BC', value: 'Calculus BC' },
                  { label: 'Quantum Mechanics', value: 'Quantum Mechanics' },
                  { label: 'Bio-Chemistry', value: 'Bio-Chemistry' }
                ]}
                searchable
              />
            </FormField>

            <FormField label="Experience (Years)" name="experience">
              <TextInput 
                type="number"
                value={formData.experience}
                onChange={(e) => handleChange('experience', e.target.value)}
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

            <FormField label="Previous Institute" name="previousInstitute" className="col-span-2">
              <TextInput 
                value={formData.previousInstitute}
                onChange={(e) => handleChange('previousInstitute', e.target.value)}
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
                options={[
                  { label: 'Downtown Campus', value: 'Downtown Campus' },
                  { label: 'West Side Wing', value: 'West Side Wing' },
                  { label: 'Global Online', value: 'Global Online' }
                ]}
              />
            </FormField>

            <FormField label="Teacher Type" name="teacherType">
              <SelectInput 
                value={formData.teacherType}
                onChange={(val) => handleChange('teacherType', val)}
                options={[
                  { label: 'Full-Time', value: 'Full-Time' },
                  { label: 'Part-Time', value: 'Part-Time' },
                  { label: 'Guest Faculty', value: 'Guest Faculty' }
                ]}
              />
            </FormField>

            <FormField label="Joining Date" name="joiningDate">
              <DateInput 
                value={formData.joiningDate}
                onChange={(e) => handleChange('joiningDate', e.target.value)}
              />
            </FormField>

            <div className="col-span-2 border-t border-border-light dark:border-border-dark pt-4 mt-2">
              <SegmentedControl 
                label="Preferred Time Slot"
                value={Array.isArray(formData.timeSlots) ? formData.timeSlots[0] : formData.timeSlots}
                onChange={(val) => handleChange('timeSlots', [val])}
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
            <RadioGroup 
              label="Salary Type"
              name="salaryType"
              className="col-span-2"
              value={formData.salaryType}
              onChange={(val) => handleChange('salaryType', val)}
              options={[
                { label: 'Monthly', value: 'Monthly', icon: 'calendar_month' },
                { label: 'Per Class', value: 'Per Class', icon: 'school' }
              ]}
            />

            <FormField label="Base Salary / Rate ($)" name="baseSalary" className="col-span-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <TextInput 
                  type="number"
                  value={formData.baseSalary}
                  onChange={(e) => handleChange('baseSalary', e.target.value)}
                  className="pl-8"
                  placeholder="5,000" 
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 italic">Standard corporate deductions will be applied automatically during payroll.</p>
            </FormField>
          </FormSection>
        </div>

        {/* 5. Documents & 6. Account Setup */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 5. Documents */}
          <FormSection title="Documents" icon="description">
            <div className="col-span-2 flex flex-col gap-4">
              <div className="flex items-center p-4 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-text-main dark:text-white">ID Proof</h4>
                  <p className="text-xs text-slate-500">Passport, Driving License or State ID</p>
                </div>
                <button type="button" className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark shadow-sm text-xs font-medium hover:bg-slate-50 transition-colors dark:text-white">
                  <span className="material-symbols-outlined text-sm">upload</span>
                  Upload
                </button>
              </div>
              <div className="flex items-center p-4 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-text-main dark:text-white">Updated Resume</h4>
                  <p className="text-xs text-slate-500">PDF or DOCX max 5MB</p>
                </div>
                <button type="button" className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-border-light dark:border-border-dark shadow-sm text-xs font-medium hover:bg-slate-50 transition-colors dark:text-white">
                  <span className="material-symbols-outlined text-sm">upload</span>
                  Upload
                </button>
              </div>
            </div>
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
              <FormField label="Username" name="username" className="col-span-2">
                <TextInput 
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  placeholder="jsmith_meridian"
                  disabled={isEditMode}
                />
              </FormField>
              
              <FormField label={isEditMode ? "Password (Encrypted)" : "Auto-Password"} name="password">
                <div className="flex items-center p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-border-light dark:border-border-dark justify-between h-[42px]">
                  <span className="text-sm font-mono text-slate-600 dark:text-slate-400">••••••••</span>
                  {!isEditMode && <button type="button" className="material-symbols-outlined text-primary text-lg">refresh</button>}
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
                  { label: 'Active', value: 'Active' },
                  { label: 'Pending', value: 'Pending' },
                  { label: 'Rejected', value: 'Rejected' }
                ]}
              />
            </div>
            <div className="md:col-span-2">
              <FormField label="Internal Notes" name="internalNotes">
                <textarea 
                  name="internalNotes"
                  value={formData.internalNotes}
                  onChange={(e) => handleChange('internalNotes', e.target.value)}
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
          <button 
            type="button"
            onClick={() => navigate(isEditMode ? `/admin/teachers/${id}` : '/admin/teachers')}
            className="text-slate-500 hover:text-slate-900 font-medium text-sm flex items-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
            {isEditMode ? 'Discard Changes' : 'Cancel Registration'}
          </button>
          <div className="hidden md:block h-4 w-[1px] bg-slate-200"></div>
          <p className="hidden md:block text-[11px] text-slate-400 font-medium italic">Changes are not saved automatically.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          {!isEditMode && (
            <button type="button" className="hidden lg:block px-5 py-2.5 rounded-lg border border-primary text-primary hover:bg-primary/5 transition-colors font-semibold text-sm">
              Save & Create Another
            </button>
          )}
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={addMutation.isPending || updateMutation.isPending}
            className="flex-1 md:flex-none px-8 py-2.5 rounded-lg bg-primary text-white hover:bg-blue-700 transition-all font-bold text-sm shadow-md shadow-primary/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
          >
            {addMutation.isPending || updateMutation.isPending ? 'Saving...' : isEditMode ? 'Update Profile' : 'Complete Registration'}
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default AddTeacher;
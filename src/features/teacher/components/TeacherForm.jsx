import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

// Layout & UI
import MainLayout from '../../../components/layout/MainLayout';
import FormSection from '../../../components/ui/v2/FormSection';
import FormField from '../../../components/ui/v2/FormField';
import TextInput from '../../../components/ui/v2/TextInput';
import SelectInput from '../../../components/ui/v2/SelectInput';
import DateInput from '../../../components/ui/v2/DateInput';
import PhoneInput from '../../../components/ui/v2/PhoneInput';
import RadioGroup from '../../../components/ui/v2/RadioGroup';
import ToggleSwitch from '../../../components/ui/v2/ToggleSwitch';
import SegmentedControl from '../../../components/ui/v2/SegmentedControl';
import Button from '../../../components/ui/v2/Button';
import IconButton from '../../../components/ui/v2/IconButton';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import LowDensityCard from '../../../components/ui/v2/cards/LowDensityCard';

// Feature Modals
import CourseSelectionModal from '../../course/components/CourseSelectionModal';
import SalaryConfigModal from './profile/SalaryConfigModal';
import DocumentUploadModal from './profile/DocumentUploadModal';

// ─── Contract Status → Badge Variant map ─────────────────────────────────────
const CONTRACT_STATUS_VARIANT = {
  active: 'success',
  drafted: 'warning',
  expired: 'default',
  terminated: 'danger',
  voided: 'danger'
};

// ─── Rate type display helpers ────────────────────────────────────────────────
const formatSalaryLabel = (config) => {
  if (!config) return '—';
  const { rateType, baseValue } = config;
  if (rateType === 'revenue_percentage') return `${baseValue}% of Revenue`;
  if (rateType === 'yearly') return `₹${Number(baseValue).toLocaleString('en-IN')} / Year`;
  return `₹${Number(baseValue).toLocaleString('en-IN')} / Month`;
};

const formatConfigType = (type) => {
  if (!type) return '—';
  return type === 'recurring_monthly' ? 'Recurring Monthly' : 'Fixed Duration Pool';
};

// ─── Document type display helper ────────────────────────────────────────────
const DOC_TYPE_LABELS = { id_proof: 'ID Proof', resume: 'Resume', other: 'Other' };
const DOC_TYPE_ICONS = { id_proof: 'badge', resume: 'description', other: 'attach_file' };

// Stable global reference to prevent downstream dropdown churn
const EMPTY_ARRAY = [];

/**
 * TeacherForm Component: Presentation layer and state manager for faculty registration/editing forms.
 * Implements a high-density two-column layout with popup modals for subjects, salary configs, and documents.
 */
const TeacherForm = ({
  teacher = null,
  subjects = EMPTY_ARRAY,
  salaryConfig = null,
  documents = EMPTY_ARRAY,
  courses = EMPTY_ARRAY,
  branches = EMPTY_ARRAY,
  isBranchesLoading = false,
  isDataLoading = false,
  isSubmitting = false,
  error = null,
  fieldErrors = {},
  onSubmit,
  onCancel
}) => {
  const isEditMode = !!teacher;

  // ─── Sticky header state ────────────────────────────────────────────────────
  const [isSticky, setIsSticky] = useState(false);

  // ─── Modal state ─────────────────────────────────────────────────────────────
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  // ─── Local form error ────────────────────────────────────────────────────────
  const [localError, setLocalError] = useState(null);

  // ─── Accumulated sub-entity local arrays (onboarding mode) ─────────────────
  const [localSalaryConfigs, setLocalSalaryConfigs] = useState([]);
  const [localDocuments, setLocalDocuments] = useState([]);

  // ─── Editing indexes for modals ──────────────────────────────────────────────
  const [editingSalaryIndex, setEditingSalaryIndex] = useState(null);
  const [editingDocIndex, setEditingDocIndex] = useState(null);

  // ─── Password generation utility ────────────────────────────────────────────
  const generatePassword = useCallback(() => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }, []);

  // ─── Core form state ─────────────────────────────────────────────────────────
  const [formData, setFormData] = useState(() => ({
    full_name: '',
    mobile_number: '',
    email: '',
    gender: 'male',
    date_of_birth: '',
    address: '',
    profile_photo_url: '',
    subjects: [],
    experience_years: '',
    qualification: '',
    specialization: '',
    previous_institute: '',
    branch: '',
    teacher_type: 'full_time',
    joining_date: format(new Date(), 'yyyy-MM-dd'),
    prefered_time_slot: 'Morning',
    createLogin: false,
    username: '',
    password: generatePassword(),
    role: 'Teacher',
    status: 'active',
    internal_notes: ''
  }));

  // ─── Branch select options ────────────────────────────────────────────────────
  const branchOptions = useMemo(() => {
    return branches?.map(b => ({ label: b.branch_name, value: b.branch_id })) || EMPTY_ARRAY;
  }, [branches]);

  // ─── Selected course objects for display ─────────────────────────────────────
  const selectedCourseObjects = useMemo(() => {
    if (!courses || !formData.subjects) return EMPTY_ARRAY;
    return courses.filter(c => formData.subjects.includes(c.course_id));
  }, [courses, formData.subjects]);

  // ─── Sync edit mode data on load ─────────────────────────────────────────────
  useEffect(() => {
    if (isEditMode && teacher) {
      const formatDateForInput = (dateStr) => {
        if (!dateStr) return '';
        try { return dateStr.split('T')[0]; } catch { return ''; }
      };

      setFormData({
        full_name: teacher.full_name || '',
        mobile_number: teacher.mobile_number || '',
        email: teacher.email || '',
        gender: teacher.gender || 'male',
        date_of_birth: formatDateForInput(teacher.date_of_birth),
        address: teacher.address || '',
        profile_photo_url: teacher.profile_photo_url || '',
        subjects: subjects || EMPTY_ARRAY,
        experience_years: teacher.experience_years || '',
        qualification: teacher.qualification || '',
        specialization: teacher.specialization || '',
        previous_institute: teacher.previous_institute || '',
        branch: teacher.branch_id || '',
        teacher_type: teacher.teacher_type || 'full_time',
        joining_date: formatDateForInput(teacher.joining_date),
        prefered_time_slot: teacher.prefered_time_slot || 'Morning',
        createLogin: false,
        username: teacher.username || '',
        password: '••••••••',
        role: 'Teacher',
        status: teacher.status || 'active',
        internal_notes: teacher.notes || ''
      });

      // Initialize local docs from existing records
      if (documents?.length > 0) {
        setLocalDocuments(documents.map(d => ({
          document_type: d.document_type || 'other',
          file_url: d.file_url || '',
          display_name: d.display_name || d.file_url?.split('/').pop() || 'Document'
        })));
      }
    }
  }, [isEditMode, teacher, subjects, documents]);

  // ─── Form field handler ───────────────────────────────────────────────────────
  const handleChange = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // ─── Sticky header handler ────────────────────────────────────────────────────
  const handleBodyScroll = useCallback((e) => {
    const shouldBeSticky = e.currentTarget.scrollTop > 80;
    setIsSticky(prev => prev !== shouldBeSticky ? shouldBeSticky : prev);
  }, []);

  // ─── Course selection ─────────────────────────────────────────────────────────
  const handleCoursesSelect = useCallback((selectedObjects) => {
    handleChange('subjects', selectedObjects.map(c => c.course_id));
  }, [handleChange]);

  const handleRemoveCourse = useCallback((courseId) => {
    setFormData(prev => ({ ...prev, subjects: prev.subjects.filter(s => s !== courseId) }));
  }, []);

  // ─── Salary config handlers ───────────────────────────────────────────────────
  const handleSalarySubmitLocal = useCallback((payload) => {
    console.log('[TeacherForm] Salary config added locally:', payload);
    if (editingSalaryIndex !== null) {
      setLocalSalaryConfigs(prev => prev.map((c, i) => i === editingSalaryIndex ? payload : c));
    } else {
      setLocalSalaryConfigs(prev => [...prev, payload]);
    }
    setEditingSalaryIndex(null);
  }, [editingSalaryIndex]);

  const handleEditSalary = useCallback((index) => {
    setEditingSalaryIndex(index);
    setIsSalaryModalOpen(true);
  }, []);

  const handleDeleteSalary = useCallback((index) => {
    setLocalSalaryConfigs(prev => prev.filter((_, i) => i !== index));
  }, []);

  // ─── Document handlers ────────────────────────────────────────────────────────
  const handleDocumentSubmit = useCallback((payload) => {
    console.log('[TeacherForm] Document added locally:', payload);
    if (editingDocIndex !== null) {
      setLocalDocuments(prev => prev.map((d, i) => i === editingDocIndex ? payload : d));
    } else {
      setLocalDocuments(prev => [...prev, payload]);
    }
    setEditingDocIndex(null);
    setIsDocModalOpen(false);
  }, [editingDocIndex]);

  const handleEditDoc = useCallback((index) => {
    setEditingDocIndex(index);
    setIsDocModalOpen(true);
  }, []);

  const handleDeleteDoc = useCallback((index) => {
    setLocalDocuments(prev => prev.filter((_, i) => i !== index));
  }, []);

  // ─── Form validation ──────────────────────────────────────────────────────────
  const validateForm = useCallback(() => {
    if (!formData.full_name.trim()) return 'Full Name is required.';
    if (!formData.mobile_number.trim()) return 'Mobile Number is required.';
    if (!formData.branch) return 'Assigned Branch is required.';
    if (!formData.experience_years) return 'Experience is required.';
    if (!formData.joining_date) return 'Joining Date is required.';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Invalid email format.';
    }
    if (formData.createLogin && !formData.username.trim()) {
      return "Username is required when 'Create Login' is enabled.";
    }
    return null;
  }, [formData]);

  // ─── Submit handler ───────────────────────────────────────────────────────────
  const handleSubmit = useCallback((e) => {
    if (e) e.preventDefault();
    setLocalError(null);
    const validationError = validateForm();
    if (validationError) { setLocalError(validationError); return; }

    onSubmit({
      ...formData,
      salaryConfigs: localSalaryConfigs,
      documents: localDocuments
    });
  }, [formData, localSalaryConfigs, localDocuments, validateForm, onSubmit]);

  const displayError = error || localError;

  // ─── Editing config for salary modal ─────────────────────────────────────────
  const editingLocalSalaryConfig = editingSalaryIndex !== null ? localSalaryConfigs[editingSalaryIndex] : null;

  return (
    <>
      {/* ── Modals ───────────────────────────────────────────────────────────── */}
      {isCourseModalOpen && (
        <CourseSelectionModal
          isOpen={isCourseModalOpen}
          onClose={() => setIsCourseModalOpen(false)}
          onSelect={handleCoursesSelect}
          selectedCourses={selectedCourseObjects}
          availableCourses={courses}
        />
      )}

      {isSalaryModalOpen && (
        <SalaryConfigModal
          isOpen={isSalaryModalOpen}
          onClose={() => { setIsSalaryModalOpen(false); setEditingSalaryIndex(null); }}
          onSubmitLocal={handleSalarySubmitLocal}
          config={editingLocalSalaryConfig
            ? {
                salary_config_type: editingLocalSalaryConfig.salaryConfigType,
                rate_type: editingLocalSalaryConfig.rateType,
                base_value: editingLocalSalaryConfig.baseValue,
                scope_type: editingLocalSalaryConfig.scopeType,
                scope_id: editingLocalSalaryConfig.scopeId,
                total_contract_value: editingLocalSalaryConfig.totalContractValue,
                effective_from: editingLocalSalaryConfig.effectiveFrom,
                effective_to: editingLocalSalaryConfig.effectiveTo,
                remark: editingLocalSalaryConfig.remark,
                notes: editingLocalSalaryConfig.notes,
                contract_status: editingLocalSalaryConfig.contractStatus,
                settlement_state: editingLocalSalaryConfig.settlementState
              }
            : null
          }
        />
      )}

      {isDocModalOpen && (
        <DocumentUploadModal
          isOpen={isDocModalOpen}
          onClose={() => { setIsDocModalOpen(false); setEditingDocIndex(null); }}
          onSubmit={handleDocumentSubmit}
          document={editingDocIndex !== null ? localDocuments[editingDocIndex] : null}
        />
      )}

      {/* ── Page Shell ───────────────────────────────────────────────────────── */}
      <MainLayout
        onBodyScroll={handleBodyScroll}
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
          <div className="pt-6 lg:pt-10 pb-6">

            {/* ── Page Header ─────────────────────────────────────────────── */}
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

            {/* ── Global Error Banner ─────────────────────────────────────── */}
            {displayError && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-lg border border-red-100 dark:border-red-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <span className="material-symbols-outlined">error</span>
                <span className="text-sm font-bold">{displayError}</span>
              </div>
            )}

            {/* ── Metadata Header Block ───────────────────────────────────── */}
            <Card className="mb-6">
              <Card.Body className="py-4">
                <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                  {/* Status */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Status</span>
                    <SelectInput
                      value={formData.status}
                      onChange={(val) => handleChange('status', val)}
                      options={[
                        { label: 'Active', value: 'active' },
                        { label: 'Inactive', value: 'inactive' },
                        { label: 'Pending', value: 'pending' }
                      ]}
                      className="min-w-[120px]"
                    />
                  </div>

                  {/* Teacher Type */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Teacher Type</span>
                    <SelectInput
                      value={formData.teacher_type}
                      onChange={(val) => handleChange('teacher_type', val)}
                      options={[
                        { label: 'Full Time', value: 'full_time' },
                        { label: 'Part Time', value: 'part_time' },
                        { label: 'Guest', value: 'guest' }
                      ]}
                      className="min-w-[130px]"
                    />
                  </div>

                  {/* Joining Date */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Joining Date</span>
                    <DateInput
                      value={formData.joining_date}
                      onChange={(e) => handleChange('joining_date', e.target.value)}
                    />
                  </div>

                  {/* Experience */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Experience (Yrs)</span>
                    <TextInput
                      type="number"
                      value={formData.experience_years}
                      onChange={(e) => handleChange('experience_years', e.target.value)}
                      placeholder="0"
                      className="w-[90px]"
                    />
                  </div>

                  {/* Branch */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Branch <span className="text-red-500">*</span></span>
                    <SelectInput
                      value={formData.branch}
                      onChange={(val) => handleChange('branch', val)}
                      options={isBranchesLoading ? [{ label: 'Loading...', value: '' }] : branchOptions}
                      className="min-w-[150px]"
                    />
                    {fieldErrors['branch_id'] && (
                      <span className="text-[10px] text-red-500 font-semibold">{fieldErrors['branch_id']}</span>
                    )}
                  </div>

                  {/* Preferred Time Slot */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Time Slot</span>
                    <SegmentedControl
                      value={formData.prefered_time_slot}
                      onChange={(val) => handleChange('prefered_time_slot', val)}
                      options={[
                        { label: 'Morning', value: 'Morning' },
                        { label: 'Afternoon', value: 'Afternoon' },
                        { label: 'Evening', value: 'Evening' }
                      ]}
                    />
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* ── Two-Column Body ─────────────────────────────────────────── */}
            <form className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start" onSubmit={handleSubmit}>

              {/* ══ LEFT COLUMN ══════════════════════════════════════════════ */}
              <div className="col-span-12 lg:col-span-7 space-y-6">

                {/* 1. Personal Information */}
                <FormSection title="Personal Information" icon="badge">
                  <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label="Full Name" name="full_name" required error={fieldErrors['full_name']} className="md:col-span-2">
                      <TextInput
                        value={formData.full_name}
                        onChange={(e) => handleChange('full_name', e.target.value)}
                        placeholder="e.g. Dr. Jonathan Smith"
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

                  <FormField label="Date of Birth" name="date_of_birth">
                    <DateInput
                      value={formData.date_of_birth}
                      onChange={(e) => handleChange('date_of_birth', e.target.value)}
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

                  <FormField label="Residential Address" name="address" className="col-span-2">
                    <TextInput
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="Full residential address..."
                    />
                  </FormField>

                  <FormField label="Internal Notes" name="internal_notes" className="col-span-2">
                    <textarea
                      name="internal_notes"
                      value={formData.internal_notes}
                      onChange={(e) => handleChange('internal_notes', e.target.value)}
                      className="w-full rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark focus:border-primary focus:ring-1 focus:ring-primary text-sm p-3 outline-none min-h-[80px] resize-none dark:text-white transition-all"
                      placeholder="Background checks, interview feedback, or special requests..."
                    />
                  </FormField>
                </FormSection>

                {/* 2. Login Account */}
                <FormSection
                  title="Login Account"
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

                    <FormField label={isEditMode ? 'Password (Encrypted)' : 'Generated Password'} name="password" className="col-span-2">
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

              {/* ══ RIGHT COLUMN ═════════════════════════════════════════════ */}
              <div className="col-span-12 lg:col-span-5 space-y-6">

                {/* 4. Subjects */}
                <Card>
                  <Card.Header border>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <span className="material-symbols-outlined">menu_book</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-text-main dark:text-white tracking-tight">
                            Subjects
                            {selectedCourseObjects.length > 0 && (
                              <span className="ml-2 text-xs font-bold text-text-secondary">({selectedCourseObjects.length})</span>
                            )}
                          </h3>
                          <p className="text-[11px] text-text-secondary">Assigned teaching courses</p>
                        </div>
                      </div>
                      <Button
                        variant="outlined"
                        size="sm"
                        startIcon="add"
                        onClick={() => setIsCourseModalOpen(true)}
                        type="button"
                        disabled={isDataLoading}
                      >
                        Add Subject
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body className="py-3">
                    {isDataLoading ? (
                      <div className="flex items-center gap-2 py-4 justify-center text-xs text-text-secondary">
                        <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                        Loading subjects...
                      </div>
                    ) : selectedCourseObjects.length === 0 ? (
                      <div
                        className="flex flex-col items-center justify-center py-6 text-center cursor-pointer group"
                        onClick={() => setIsCourseModalOpen(true)}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                          <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">add_circle</span>
                        </div>
                        <p className="text-sm font-semibold text-text-secondary">No subjects assigned</p>
                        <p className="text-xs text-slate-400 mt-1">Click to select courses</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border-light dark:divide-border-dark">
                        {selectedCourseObjects.map((course) => (
                          <LowDensityCard
                            key={course.course_id}
                            icon="book"
                            title={course.name || course.course_name || course.course_id}
                            subtitle1={course.course_id}
                            subtitle2={course.board || null}
                            bodyText={
                              course.segment || course.category ? (
                                <Badge variant="primary" className="text-[9px]">
                                  {course.segment || course.category}
                                </Badge>
                              ) : null
                            }
                            actions={[
                              {
                                label: 'Remove',
                                icon: 'close',
                                priority: 'primary',
                                onClick: () => handleRemoveCourse(course.course_id)
                              }
                            ]}
                          />
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>

                {/* 5. Salary Configurations */}
                <Card>
                  <Card.Header border>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <span className="material-symbols-outlined">payments</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-text-main dark:text-white tracking-tight">
                            Salary Configurations
                            {localSalaryConfigs.length > 0 && (
                              <span className="ml-2 text-xs font-bold text-text-secondary">({localSalaryConfigs.length})</span>
                            )}
                          </h3>
                          <p className="text-[11px] text-text-secondary">Compensation contracts</p>
                        </div>
                      </div>
                      <Button
                        variant="outlined"
                        size="sm"
                        startIcon="add"
                        onClick={() => { setEditingSalaryIndex(null); setIsSalaryModalOpen(true); }}
                        type="button"
                      >
                        New Contract
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body className="py-3">
                    {localSalaryConfigs.length === 0 ? (
                      <div
                        className="flex flex-col items-center justify-center py-6 text-center cursor-pointer group"
                        onClick={() => { setEditingSalaryIndex(null); setIsSalaryModalOpen(true); }}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                          <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">contract</span>
                        </div>
                        <p className="text-sm font-semibold text-text-secondary">No salary configuration</p>
                        <p className="text-xs text-slate-400 mt-1">Click to add a compensation contract</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {localSalaryConfigs.map((cfg, index) => (
                          <div
                            key={index}
                            className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
                          >
                            {/* Card Header Row */}
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                  <span className="material-symbols-outlined text-sm">
                                    {cfg.rateType === 'revenue_percentage' ? 'percent' : 'currency_rupee'}
                                  </span>
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-bold text-text-main dark:text-white">
                                      {formatConfigType(cfg.salaryConfigType)}
                                    </span>
                                    <Badge variant={CONTRACT_STATUS_VARIANT[cfg.contractStatus] || 'default'}>
                                      {cfg.contractStatus || 'drafted'}
                                    </Badge>
                                  </div>
                                  <p className="text-[10px] text-text-secondary mt-0.5">{cfg.remark || 'No remark'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <IconButton
                                  icon="edit"
                                  title="Edit configuration"
                                  onClick={() => handleEditSalary(index)}
                                  className="size-7 text-text-secondary hover:text-primary"
                                />
                                <IconButton
                                  icon="delete_outline"
                                  title="Remove configuration"
                                  onClick={() => handleDeleteSalary(index)}
                                  className="size-7 text-text-secondary hover:text-red-500"
                                />
                              </div>
                            </div>

                            {/* Metadata Property Grid */}
                            <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                              <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Rate</p>
                                <p className="text-sm font-extrabold text-text-main dark:text-white tracking-tight">
                                  {formatSalaryLabel(cfg)}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Scope</p>
                                <p className="text-sm font-extrabold text-text-main dark:text-white tracking-tight capitalize">
                                  {cfg.scopeType?.replace('_', ' ') || 'Global'}
                                </p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Validity Window</p>
                                <p className="text-sm font-extrabold text-text-main dark:text-white tracking-tight">
                                  {cfg.effectiveFrom || '—'} → {cfg.effectiveTo || 'Permanent'}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Multi-config note */}
                        {localSalaryConfigs.length > 1 && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                            <span className="material-symbols-outlined text-amber-600 text-sm">info</span>
                            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                              Only the first configuration will be submitted during registration. Additional contracts can be added from the teacher profile after onboarding.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </Card.Body>
                </Card>

                {/* 6. Documents */}
                <Card>
                  <Card.Header border>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                          <span className="material-symbols-outlined">folder_open</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-base text-text-main dark:text-white tracking-tight">
                            Documents
                            {localDocuments.length > 0 && (
                              <span className="ml-2 text-xs font-bold text-text-secondary">({localDocuments.length})</span>
                            )}
                          </h3>
                          <p className="text-[11px] text-text-secondary">Verification and onboarding files</p>
                        </div>
                      </div>
                      <Button
                        variant="outlined"
                        size="sm"
                        startIcon="upload"
                        onClick={() => { setEditingDocIndex(null); setIsDocModalOpen(true); }}
                        type="button"
                      >
                        Upload Document
                      </Button>
                    </div>
                  </Card.Header>
                  <Card.Body className="py-3">
                    {localDocuments.length === 0 ? (
                      <div
                        className="flex flex-col items-center justify-center py-6 text-center cursor-pointer group"
                        onClick={() => { setEditingDocIndex(null); setIsDocModalOpen(true); }}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                          <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors">upload_file</span>
                        </div>
                        <p className="text-sm font-semibold text-text-secondary">No documents added yet</p>
                        <p className="text-xs text-slate-400 mt-1">Click to upload verification files</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {localDocuments.map((doc, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
                          >
                            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                              <span className="material-symbols-outlined text-sm">
                                {DOC_TYPE_ICONS[doc.document_type] || 'attach_file'}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-text-main dark:text-white truncate">
                                {doc.display_name || doc.file_url?.split('/').pop() || 'Document'}
                              </p>
                              <p className="text-[10px] text-text-secondary">
                                {DOC_TYPE_LABELS[doc.document_type] || 'Other'}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <IconButton
                                icon="edit"
                                title="Edit document"
                                onClick={() => handleEditDoc(index)}
                                className="size-7 text-text-secondary hover:text-primary"
                              />
                              <IconButton
                                icon="delete_outline"
                                title="Remove document"
                                onClick={() => handleDeleteDoc(index)}
                                className="size-7 text-text-secondary hover:text-red-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>
            </form>
          </div>
        }
        footer={
          <footer className="border border-border-light dark:border-border-dark bg-white dark:bg-slate-900 shadow-lg px-4 lg:px-6 py-3 flex items-center justify-between gap-4 rounded-xl w-full">
            {/* Left: Cancel */}
            <div className="flex items-center gap-4 justify-start w-1/3 md:w-auto">
              <Button
                variant="text"
                size="md"
                startIcon="close"
                onClick={onCancel}
                className="min-w-0 px-3 md:px-5"
              >
                <span className="hidden md:inline">{isEditMode ? 'Discard' : 'Cancel'}</span>
              </Button>
              <div className="hidden md:block h-4 w-[1px] bg-slate-200" />
              <p className="hidden md:block text-[11px] text-slate-400 font-medium italic">Changes are not saved automatically.</p>
            </div>

            {/* Right: Submit */}
            <div className="flex justify-end items-center gap-3 w-2/3 md:w-auto ml-auto">
              {!isEditMode && (
                <Button variant="outlined" size="md" type="button" onClick={() => {}}>
                  Save Draft
                </Button>
              )}
              <Button
                variant="contained"
                size="md"
                endIcon="arrow_forward"
                loading={isSubmitting}
                onClick={handleSubmit}
                className="min-w-0 px-3 md:px-5 flex-1 md:flex-none"
              >
                <span className="hidden md:inline">
                  {isEditMode ? 'Update Profile' : 'Register Teacher'}
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

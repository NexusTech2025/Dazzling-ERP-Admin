import React, { useState, useEffect } from 'react';
import FormSection from '../../../components/ui/v2/FormSection';
import FormField from '../../../components/ui/v2/FormField';
import TextInput from '../../../components/ui/v2/TextInput';
import SelectInput from '../../../components/ui/v2/SelectInput';
import SegmentedControl from '../../../components/ui/v2/SegmentedControl';
import ToggleSwitch from '../../../components/ui/v2/ToggleSwitch';
import Button from '../../../components/ui/v2/Button';
import Breadcrumbs from '../../../components/ui/Breadcrumbs';
import MainLayout from '../../../components/layout/MainLayout';

/**
 * CourseForm Component
 * Renders the forms to add or edit academic subjects and skill courses.
 * Built using Azure Meridian V2 Atomic UI Design standards.
 */
const CourseForm = ({
  initialData,
  courseTypes = [],
  isLoadingTypes = false,
  onSubmit,
  isSaving = false,
  externalError = null,
  createTypeMutation,
  onCancel
}) => {
  const [validationError, setValidationError] = useState(null);
  const displayError = validationError || externalError;
  const isEditMode = !!initialData;
  const [isSticky, setIsSticky] = useState(false);

  const handleBodyScroll = (e) => {
    const shouldBeSticky = e.currentTarget.scrollTop > 80;
    setIsSticky(prev => {
      if (prev !== shouldBeSticky) return shouldBeSticky;
      return prev;
    });
  };

  const crumbs = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'home' },
    { label: 'Courses', path: '/admin/courses' },
    { label: isEditMode ? 'Edit Course' : 'Add Course' }
  ];

  console.log("initial data", initialData);

  const [formData, setFormData] = useState({
    course_id: '',
    name: '',
    short_code: '',
    entity_type: 'subject', // 'subject' or 'course'
    language_medium: 'English',
    description: '',
    segment_id: '',
    duration_value: 12,
    duration_unit: 'months',
    class_level: '',
    min_class: '',
    max_class: '',
    board: '',
    base_fee: '',
    default_installment_count: 1,
    is_active: true
  });

  const [isCreatingType, setIsCreatingType] = useState(false);
  const generateSegmentId = () => "SEG-" + Date.now().toString().slice(-6);

  const [newTypeData, setNewTypeData] = useState({
    segment_id: generateSegmentId(),
    segment_name: '',
    entity_label: 'Course',
    description: ''
  });

  useEffect(() => {
    if (initialData) {
      // Self-healing parsing fallback in case of cache-bypass
      const rawMeta = initialData.metadata;
      let parsedMeta = {};
      if (rawMeta) {
        if (typeof rawMeta === 'object') {
          parsedMeta = rawMeta;
        } else if (typeof rawMeta === 'string') {
          try {
            parsedMeta = JSON.parse(rawMeta);
          } catch (e) {
            console.error('Failed to parse metadata in CourseForm component:', e);
          }
        }
      }

      setFormData({
        course_id: initialData.course_id || '',
        name: initialData.name || '',
        short_code: initialData.short_code || '',
        entity_type: initialData.entity_type || 'subject',
        language_medium: initialData.language_medium || 'English',
        description: initialData.description || '',
        segment_id: initialData.segment_id || '',
        duration_value: initialData.duration_value || 12,
        duration_unit: initialData.duration_unit || 'months',
        class_level: parsedMeta.class || '',
        min_class: parsedMeta.min_class || '',
        max_class: parsedMeta.max_class || '',
        board: parsedMeta.board || '',
        base_fee: initialData.base_fee || '',
        default_installment_count: initialData.default_installment_count || 1,
        is_active: initialData.is_active ?? (initialData.status === 'active')
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateType = async () => {
    if (!newTypeData.segment_name) return;

    createTypeMutation.mutate({ data: newTypeData }, {
      onSuccess: (res) => {
        if (res.success) {
          setFormData(prev => ({ ...prev, segment_id: res.data.segment_id }));
          setIsCreatingType(false);
          setNewTypeData({
            segment_id: generateSegmentId(),
            segment_name: '',
            entity_label: 'Course',
            description: ''
          });
        }
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError(null);

    // Basic validation
    if (!formData.name || !formData.base_fee || !formData.segment_id || !formData.short_code) {
      setValidationError('Please fill in all required fields, including the Short Code and Category.');
      return;
    }

    if (formData.entity_type === 'subject' && !formData.board) {
      setValidationError('Please select an Educational Board for academic subjects.');
      return;
    }

    // 1. Construct dynamic metadata based on entity type
    const metadata = formData.entity_type === 'subject'
      ? { class: formData.class_level, board: formData.board }
      : { min_class: formData.min_class, max_class: formData.max_class };

    // 2. Assemble surgical payload matching full_schema.json
    const alignedPayload = {
      course_id: formData.course_id || `CRS-${Date.now().toString().slice(-6)}`,
      segment_id: formData.segment_id,
      entity_type: formData.entity_type,
      name: formData.name,
      short_code: formData.short_code.toUpperCase(),
      language_medium: formData.language_medium,
      description: formData.description,
      duration_value: Number(formData.duration_value),
      duration_unit: formData.duration_unit,
      base_fee: Number(formData.base_fee),
      default_installment_count: Number(formData.default_installment_count),
      metadata: metadata,
      status: formData.is_active ? 'active' : 'inactive'
    };

    onSubmit(alignedPayload);
  };

  // Options Definitions
  const entityTypeOptions = [
    { label: 'Subject', value: 'subject', icon: 'menu_book' },
    { label: 'Course', value: 'course', icon: 'psychology' }
  ];

  const languageOptions = [
    { label: 'English', value: 'English' },
    { label: 'Hindi', value: 'Hindi' },
    { label: 'Urdu', value: 'Urdu' }
  ];

  const boardOptions = [
    { label: 'CBSE', value: 'CBSE' },
    { label: 'RBSE', value: 'RBSE' },
    { label: 'ICSE', value: 'ICSE' },
    { label: 'IB', value: 'IB' }
  ];

  const classOptions = [...Array(12)].map((_, i) => ({
    label: `Class ${i + 1}`,
    value: String(i + 1)
  }));

  const categoryOptions = courseTypes.map(type => ({
    label: `${type.segment_name} (${type.entity_label})`,
    value: type.segment_id
  }));

  return (
    <MainLayout
      onBodyScroll={handleBodyScroll}
      slotClasses={{
        container: "relative",
        body: "py-0 px-0"
      }}
      header={
        <div
          className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${isSticky
            ? 'opacity-100 translate-y-0 shadow-md pointer-events-auto'
            : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
        >
          <div className="bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-border-light dark:border-border-dark px-4 lg:px-6 py-3 flex items-center justify-between rounded-b-xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">menu_book</span>
              <span className="text-sm font-bold text-text-main dark:text-white">
                {isEditMode ? 'Edit Offering' : 'Create New Offering'}
              </span>
              {formData.name && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-xs text-text-secondary dark:text-slate-400 font-semibold truncate max-w-[200px]">
                    {formData.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      }
      body={
        <div className="px-4 lg:px-0 pt-6 lg:pt-10 pb-6">
          {/* Dynamic Breadcrumbs */}
          <Breadcrumbs items={crumbs} className="mb-4" />

          <div className="flex flex-col gap-1 mb-8">
            <h1 className="text-3xl font-black text-text-main dark:text-white tracking-tight leading-tight">
              {isEditMode ? 'Edit Offering' : 'Create New Offering'}
            </h1>
            <p className="text-text-secondary text-base">
              {isEditMode
                ? 'Update course details or academic subject config and save changes.'
                : 'Define a new academic subject or skill course with specific board, medium, and fee structure.'
              }
            </p>
          </div>

          {displayError && (
            <div className="mb-6 bg-rose-50 dark:bg-rose-900/20 text-rose-600 p-4 rounded-lg border border-rose-100 dark:border-rose-800 flex items-center gap-3 animate-in slide-in-from-top-2">
              <span className="material-symbols-outlined">error</span>
              <span className="text-sm font-bold">{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Core Info (7/12) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Basic Information Section */}
                <FormSection title="Basic Information" icon="info">

                  {/* Entity Type selection */}
                  <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-4 p-4 bg-background-light/30 dark:bg-background-dark/30 rounded-lg border border-border-light dark:border-border-dark">
                    <SegmentedControl
                      label="Offering Type"
                      value={formData.entity_type}
                      onChange={(val) => setFormData(prev => ({ ...prev, entity_type: val }))}
                      options={entityTypeOptions}
                    />

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Active Status</span>
                        <span className="text-[9px] text-text-secondary/70">Allow new enrollments</span>
                      </div>
                      <ToggleSwitch
                        checked={formData.is_active}
                        onChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                        name="is_active"
                      />
                    </div>
                  </div>

                  {/* Name and Short Code */}
                  <FormField label="Offering Name" name="name" required>
                    <TextInput
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={formData.entity_type === 'subject' ? "e.g. Mathematics 10 (CBSE)" : "e.g. Graphic Design Basics"}
                    />
                  </FormField>

                  <FormField label="Short Code" name="short_code" required>
                    <TextInput
                      required
                      name="short_code"
                      value={formData.short_code}
                      onChange={handleChange}
                      placeholder="e.g. MAT10-C"
                      className="font-mono uppercase"
                      trim={true}
                    />
                  </FormField>

                  {/* Language Medium */}
                  <FormField label="Language Medium" name="language_medium" required>
                    <SelectInput
                      value={formData.language_medium}
                      onChange={(val) => setFormData(prev => ({ ...prev, language_medium: val }))}
                      options={languageOptions}
                    />
                  </FormField>

                  {/* Category segment */}
                  <div className="flex flex-col gap-1.5 w-full">
                    <div className="flex items-center justify-between pl-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                        Segment / Category <span className="text-red-500">*</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCreatingType(!isCreatingType)}
                        className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">{isCreatingType ? 'list' : 'add'}</span>
                        {isCreatingType ? 'Select Existing' : 'Create New'}
                      </button>
                    </div>

                    {isCreatingType ? (
                      <div className="bg-background-light/40 dark:bg-background-dark/40 p-4 rounded-lg border border-border-light dark:border-border-dark space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-text-secondary uppercase">Category Name</label>
                            <TextInput
                              value={newTypeData.segment_name}
                              onChange={(e) => setNewTypeData({ ...newTypeData, segment_name: e.target.value })}
                              placeholder="e.g. Summer Special"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-black text-text-secondary uppercase">Label</label>
                            <SelectInput
                              value={newTypeData.entity_label}
                              onChange={(val) => setNewTypeData({ ...newTypeData, entity_label: val })}
                              options={[
                                { label: 'Course', value: 'Course' },
                                { label: 'Subject', value: 'Subject' },
                                { label: 'Program', value: 'Program' }
                              ]}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outlined"
                            size="sm"
                            onClick={() => setIsCreatingType(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            size="sm"
                            onClick={handleCreateType}
                            loading={createTypeMutation?.isPending}
                            disabled={!newTypeData.segment_name}
                          >
                            Save & Select
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <SelectInput
                        value={formData.segment_id}
                        onChange={(val) => setFormData(prev => ({ ...prev, segment_id: val }))}
                        options={categoryOptions}
                        placeholder={isLoadingTypes ? "Loading categories..." : "Select a Category"}
                        disabled={isLoadingTypes}
                      />
                    )}
                  </div>

                  {/* Description textarea */}
                  <FormField label="Description" name="description" className="md:col-span-2">
                    <textarea
                      rows={3}
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Provide a detailed description of the course offerings, syllabus overview, and targets..."
                      className="w-full bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg py-2 px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-200 resize-none text-text-main dark:text-white placeholder:text-text-secondary/50"
                    />
                  </FormField>
                </FormSection>
              </div>

              {/* Right Column: Classification & Pricing (5/12) */}
              <div className="lg:col-span-5 space-y-6">
                {/* Target Eligibility and configuration */}
                <FormSection
                  title={formData.entity_type === 'subject' ? "Board & Class Mapping" : "Eligibility & Range"}
                  icon="school"
                >
                  {formData.entity_type === 'subject' ? (
                    <>
                      <FormField label="Educational Board" name="board" required>
                        <SelectInput
                          value={formData.board}
                          onChange={(val) => setFormData(prev => ({ ...prev, board: val }))}
                          options={boardOptions}
                          placeholder="Select Board"
                        />
                      </FormField>

                      <FormField label="Target Class" name="class_level">
                        <SelectInput
                          value={formData.class_level}
                          onChange={(val) => setFormData(prev => ({ ...prev, class_level: val }))}
                          options={classOptions}
                          placeholder="Select Class"
                        />
                      </FormField>
                    </>
                  ) : (
                    <>
                      <FormField label="Min Class Eligibility" name="min_class">
                        <SelectInput
                          value={formData.min_class}
                          onChange={(val) => setFormData(prev => ({ ...prev, min_class: val }))}
                          options={classOptions}
                          placeholder="No Minimum"
                        />
                      </FormField>

                      <FormField label="Max Class Eligibility" name="max_class">
                        <SelectInput
                          value={formData.max_class}
                          onChange={(val) => setFormData(prev => ({ ...prev, max_class: val }))}
                          options={classOptions}
                          placeholder="No Maximum"
                        />
                      </FormField>
                    </>
                  )}
                </FormSection>

                {/* Duration and Pricing Section */}
                <FormSection title="Duration & Pricing" icon="payments">

                  {/* Custom duration value & unit */}
                  <FormField label="Duration" name="duration_value" className="md:col-span-2">
                    <div className="flex items-center bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all duration-200">
                      <input
                        type="number"
                        name="duration_value"
                        value={formData.duration_value}
                        onChange={handleChange}
                        className="flex-1 bg-transparent border-none py-2 px-4 text-sm outline-none text-text-main dark:text-white placeholder:text-text-secondary/50"
                      />
                      <div className="w-px h-6 bg-border-light dark:bg-border-dark"></div>
                      <select
                        name="duration_unit"
                        value={formData.duration_unit}
                        onChange={handleChange}
                        className="w-32 bg-transparent border-none py-2 px-3 text-xs font-bold outline-none cursor-pointer text-text-secondary hover:text-text-main dark:hover:text-white dark:bg-surface-dark"
                      >
                        <option value="months">Months</option>
                        <option value="weeks">Weeks</option>
                        <option value="days">Days</option>
                      </select>
                    </div>
                  </FormField>

                  {/* Base fee (Rupee currency indicator) */}
                  <FormField label="Base Fee (₹)" name="base_fee" required>
                    <TextInput
                      required
                      type="number"
                      name="base_fee"
                      value={formData.base_fee}
                      onChange={handleChange}
                      placeholder="0.00"
                      leftIcon="currency_rupee"
                    />
                  </FormField>

                  {/* Exposing installments count */}
                  <FormField label="Default Installment Count" name="default_installment_count">
                    <TextInput
                      type="number"
                      name="default_installment_count"
                      value={formData.default_installment_count}
                      onChange={handleChange}
                      placeholder="1"
                      min="1"
                    />
                  </FormField>
                </FormSection>
              </div>
            </div>
          </form>
        </div>
      }
      footer={
        <footer className="border border-border-light dark:border-border-dark bg-white dark:bg-slate-900 shadow-lg px-4 lg:px-6 py-3 flex items-center justify-between gap-4 rounded-xl w-full">
          <div className="flex items-center justify-start w-1/2 md:w-auto">
            <Button
              variant="text"
              onClick={onCancel}
              className="min-w-0 px-3 md:px-5"
            >
              Cancel
            </Button>
          </div>
          <div className="flex justify-end w-1/2 md:w-auto ml-auto">
            <Button
              type="submit"
              variant="contained"
              loading={isSaving}
              onClick={handleSubmit}
              startIcon="save"
              className="min-w-0 px-4 md:px-6"
            >
              {isEditMode ? 'Save Changes' : 'Save Item'}
            </Button>
          </div>
        </footer>
      }
    />
  );
};

export default CourseForm;

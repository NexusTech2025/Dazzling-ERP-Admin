import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { packageSchema } from './utils/packageValidation';
import {
  useCoursesQuery,
  useCourseTypesQuery
} from './hooks/useCourseQueries';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys, EMPTY_FILTER } from '../../lib/react-query/queryKeys';
import {
  useCreatePackageMutation,
  useUpdatePackageMutation,
  usePackageDetailQuery
} from './hooks/usePackageQueries';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import FormInput from '../../components/ui/form/FormInput';
import FormTextarea from '../../components/ui/form/FormTextarea';
import FormSelect from '../../components/ui/form/FormSelect';
import PerksSelectionModal from './components/PerksSelectionModal';
import CourseSelectionModal from './components/CourseSelectionModal';
import ActionCardButton from '../../components/ui/buttons/ActionCardButton';
import MainLayout from '../../components/layout/MainLayout';

const INITIAL_FORM_STATE = {
  name: '',
  description: '',
  segment_id: 'SEG-ACA',
  target_class: '9',
  board: 'CBSE',
  month: 12,
  package_fee: '0.00',
  recurring_billing: false,
  status: 'active'
};

/**
 * Course Package Form Page
 * Refined high-fidelity layout based on prototype design.
 * Refactored using react-hook-form and yup validation schema.
 */
const CoursePackagesForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const [isSticky, setIsSticky] = useState(false);
  const [error, setError] = useState(null);

  const queryClient = useQueryClient();
  const availablePerks = useMemo(() => {
    return queryClient.getQueryData(queryKeys.course.packagePerk.list(EMPTY_FILTER)) || [];
  }, [queryClient]);

  // Queries & Mutations
  const { data: courses = [] } = useCoursesQuery();
  const { data: courseTypes = [] } = useCourseTypesQuery();
  const { data: existingPkg, isLoading: pkgLoading } = usePackageDetailQuery(id);

  const createMutation = useCreatePackageMutation();
  const updateMutation = useUpdatePackageMutation();

  // State Definitions for modal selections
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [perks, setPerks] = useState([]);
  const [isPerksModalOpen, setIsPerksModalOpen] = useState(false);

  // React Hook Form initialization
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(packageSchema),
    defaultValues: INITIAL_FORM_STATE
  });

  // Watch fields for derived math/UI states
  const name = watch('name');
  const packageFee = watch('package_fee');
  const segmentId = watch('segment_id');
  const targetClass = watch('target_class');
  const board = watch('board');
  const month = watch('month');
  const recurringBilling = watch('recurring_billing');

  // Event Handlers wrapped with useCallback
  const handleBodyScroll = useCallback((e) => {
    const shouldBeSticky = e.currentTarget.scrollTop > 80;
    setIsSticky(prev => (prev !== shouldBeSticky ? shouldBeSticky : prev));
  }, []);

  // Options memoizations
  const classOptions = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({ label: `Class ${i + 1}`, value: String(i + 1) })),
    []);

  const boardOptions = useMemo(() =>
    ['CBSE', 'RBSE', 'ICSE', 'IB'].map(b => ({ label: b, value: b })),
    []);

  const segmentOptions = useMemo(() =>
    courseTypes.map(t => ({ label: t.segment_name, value: t.segment_id })),
    [courseTypes]
  );

  const breadcrumbItems = useMemo(() => [
    { label: 'Home', path: '/admin/dashboard', icon: 'home' },
    { label: 'Packages', path: '/admin/packages' },
    { label: isEditMode ? 'Edit Package' : 'Create Package' }
  ], [isEditMode]);

  // Synchronize details when config loaded or reset
  useEffect(() => {
    if (isEditMode && existingPkg) {
      reset({
        name: existingPkg.name,
        description: existingPkg.description || '',
        segment_id: existingPkg.segment_id || 'SEG-ACA',
        target_class: existingPkg.target_class || '9',
        board: existingPkg.board || 'CBSE',
        month: existingPkg.month || 12,
        package_fee: String(existingPkg.package_fee || existingPkg.base_fee),
        recurring_billing: !!existingPkg.recurring_billing,
        status: existingPkg.status || 'active'
      });
      setSelectedCourses(existingPkg.courses || []);
      setPerks(existingPkg.perks || []);
    } else if (!isEditMode) {
      reset(INITIAL_FORM_STATE);
      setSelectedCourses([]);
      setPerks([]);
    }
  }, [isEditMode, existingPkg, id, reset]);

  const aggregateValue = useMemo(() => {
    return selectedCourses.reduce((sum, c) => sum + (c.base_fee || 0), 0);
  }, [selectedCourses]);

  const savingsPercent = useMemo(() => {
    const fee = parseFloat(packageFee) || 0;
    if (aggregateValue === 0 || fee === 0) return 0;
    return Math.round(((aggregateValue - fee) / aggregateValue) * 100);
  }, [aggregateValue, packageFee]);

  const handleSave = useCallback((data) => {
    setError(null);
    if (selectedCourses.length === 0) {
      setError('Please select at least one course.');
      return;
    }

    const payload = {
      name: data.name,
      description: data.description || '',
      target_class: data.target_class,
      board: data.board,
      month: Number(data.month) || 12,
      package_fee: Number(data.package_fee),
      discount_percent: savingsPercent,
      status: data.status,
      segment_id: data.segment_id,
      recurring_billing: !!data.recurring_billing,
      courses: selectedCourses.map(c => ({
        entity_type: 'course',
        entity_id: c.course_id
      })),
      perks: perks.map(p => ({
        perk_title: p.perk_title,
        perk_description: p.perk_description,
        icon: p.icon || 'check-square',
        display_order: Number(p.display_order) || 1
      }))
    };

    const mutationOptions = {
      onSuccess: (res) => {
        if (res.success) {
          navigate(isEditMode ? `/admin/packages/${id}` : '/admin/packages');
        } else {
          setError(res.error?.message || 'Operation failed.');
        }
      },
      onError: (err) => {
        setError(err.message || 'An unexpected server error occurred.');
      }
    };

    if (isEditMode) {
      updateMutation.mutate({ id, data: payload }, mutationOptions);
    } else {
      createMutation.mutate({ data: payload }, mutationOptions);
    }
  }, [selectedCourses, perks, savingsPercent, isEditMode, id, navigate, updateMutation, createMutation]);

  if (isEditMode && pkgLoading) {
    return <div className="p-20 text-center font-black animate-pulse">Synchronizing relational data...</div>;
  }

  return (
    <MainLayout
      onBodyScroll={handleBodyScroll}
      header={
        <div
          className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${isSticky
            ? 'opacity-100 translate-y-0 shadow-md pointer-events-auto'
            : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
        >
          <div className="bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-border-light dark:border-border-dark px-4 lg:px-6 py-3 flex items-center justify-between rounded-b-xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">inventory_2</span>
              <span className="text-sm font-bold text-text-main dark:text-white">
                {isEditMode ? 'Edit Package' : 'Create Package'}
              </span>
              {name && (
                <>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-xs text-text-secondary dark:text-slate-400 font-semibold truncate max-w-[200px]">
                    {name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      }
      body={
        <form id="course-package-form" onSubmit={handleSubmit(handleSave)}>
          <div className="px-4 lg:px-0 pt-6 lg:pt-10 pb-6">
            {/* Dynamic Breadcrumbs */}
            <Breadcrumbs items={breadcrumbItems} />

            {/* Header Section */}
            <div className="flex flex-col gap-1 mb-8">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight animate-in fade-in duration-300">
                {isEditMode ? 'Edit Course Package' : 'Create Course Package'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 text-base">
                Bundle multiple courses together with specific pricing and duration rules.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-bold flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined">error</span>
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column: Form Details */}
              <div className="lg:col-span-2 space-y-6">

                {/* Basic Information Card */}
                <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                  {savingsPercent > 0 && (
                    <div className="flex justify-end mb-6">
                      <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg animate-pulse">
                        <span className="material-symbols-outlined text-sm">timer</span>
                        Limited Time Offer: {savingsPercent}% OFF
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-8 text-slate-900 dark:text-white">
                    <span className="material-symbols-outlined text-primary">info</span>
                    <h3 className="text-lg font-bold">Basic Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormInput
                      label="Package ID"
                      value={isEditMode ? existingPkg?.package_id : "PKG-[Auto-generated on save]"}
                      readOnly
                      icon="fingerprint"
                      className="opacity-60"
                    />

                    <Controller
                      name="segment_id"
                      control={control}
                      render={({ field }) => (
                        <FormSelect
                          label="Category Segment"
                          value={field.value}
                          onChange={field.onChange}
                          options={segmentOptions}
                          icon="category"
                          error={errors.segment_id?.message}
                        />
                      )}
                    />

                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <FormInput
                          label="Package Name"
                          value={field.value}
                          onChange={field.onChange}
                          required
                          icon="label"
                          placeholder="e.g. Advanced Science Bundle"
                          className="md:col-span-2"
                          error={errors.name?.message}
                        />
                      )}
                    />

                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <FormTextarea
                          label="Description"
                          value={field.value || ''}
                          onChange={field.onChange}
                          className="md:col-span-2"
                          placeholder="Enter package details and learning objectives..."
                          error={errors.description?.message}
                        />
                      )}
                    />
                  </div>
                </section>

                {/* Included Courses Card */}
                <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-8 text-slate-900 dark:text-white">
                    <span className="material-symbols-outlined text-primary">library_books</span>
                    <h3 className="text-lg font-bold">Included Courses</h3>
                  </div>

                  <div className="space-y-6">
                    {selectedCourses.length === 0 ? (
                      <ActionCardButton
                        variant="dashed"
                        layout="centered"
                        label="Select Courses to Bundle"
                        description="Search and pick subjects or programs to include in this special package."
                        icon="add_to_photos"
                        onClick={() => setIsCourseModalOpen(true)}
                      />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedCourses.map(c => (
                          <div key={c.course_id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 group relative">
                            <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black text-xs">
                              {c.short_code || c.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{c.name}</p>
                              <p className="text-[10px] font-black text-slate-500 uppercase mt-0.5">{c.course_id} • ₹{c.base_fee}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedCourses(prev => prev.filter(x => x.course_id !== c.course_id))}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 transition-all"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        ))}
                        <ActionCardButton
                          variant="solid"
                          layout="grid"
                          label="Add More"
                          icon="add"
                          onClick={() => setIsCourseModalOpen(true)}
                          className="min-h-[72px]"
                        />
                      </div>
                    )}

                    {selectedCourses.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-dashed border-slate-300 dark:border-slate-700 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                          <span className="font-black text-slate-900 dark:text-white">{selectedCourses.length}</span> items selected. Total value: <span className="font-black text-primary">₹{aggregateValue.toLocaleString()}</span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Perks & Features */}
                  <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white mb-6">
                      <span className="material-symbols-outlined text-primary">featured_play_list</span>
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Package Perks & Features</h4>
                    </div>

                    {perks.length === 0 ? (
                      <ActionCardButton
                        variant="dashed"
                        layout="centered"
                        label="Add Package Perks & Benefits"
                        description="Highlight additional value like extra certificates, mentorship, or resources."
                        icon="stars"
                        onClick={() => setIsPerksModalOpen(true)}
                      />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {perks.map((p, i) => (
                          <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 group hover:border-primary/30 transition-all">
                            <span className="material-symbols-outlined text-green-500 text-sm">{p.icon || 'check_circle'}</span>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{p.perk_title}</p>
                              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{p.perk_description}</p>
                            </div>
                            <button type="button" onClick={() => setPerks(prev => prev.filter((_, idx) => idx !== i))} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all">
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        ))}
                        <ActionCardButton
                          variant="solid"
                          layout="grid"
                          label="Add Another Perk"
                          icon="add"
                          onClick={() => setIsPerksModalOpen(true)}
                          className="min-h-[74px]"
                        />
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Right Column: Metadata & Pricing */}
              <div className="space-y-6">

                {/* Metadata & Classification */}
                <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-8 text-slate-900 dark:text-white">
                    <span className="material-symbols-outlined text-primary">label</span>
                    <h3 className="text-lg font-bold">Classification</h3>
                  </div>
                  <div className="space-y-6">
                    <Controller
                      name="target_class"
                      control={control}
                      render={({ field }) => (
                        <FormSelect
                          label="Target Class"
                          value={field.value}
                          onChange={field.onChange}
                          options={classOptions}
                          icon="school"
                          error={errors.target_class?.message}
                        />
                      )}
                    />

                    <Controller
                      name="board"
                      control={control}
                      render={({ field }) => (
                        <FormSelect
                          label="Education Board"
                          value={field.value}
                          onChange={field.onChange}
                          options={boardOptions}
                          icon="account_balance"
                          error={errors.board?.message}
                        />
                      )}
                    />

                    <Controller
                      name="month"
                      control={control}
                      render={({ field }) => (
                        <FormInput
                          label="Duration (Months)"
                          type="number"
                          value={field.value}
                          onChange={field.onChange}
                          icon="calendar_month"
                          error={errors.month?.message}
                        />
                      )}
                    />
                  </div>
                </section>

                {/* Pricing Section */}
                <section className="bg-primary/5 dark:bg-primary/10 p-8 rounded-2xl shadow-sm border border-primary/20 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-8 text-slate-900 dark:text-white">
                    <span className="material-symbols-outlined text-primary">payments</span>
                    <h3 className="text-lg font-bold">Package Pricing</h3>
                  </div>
                  <div className="space-y-6 relative z-10">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Individual Sum:</span>
                        <span className="text-sm text-slate-400 line-through font-medium">₹{aggregateValue.toLocaleString()}</span>
                        {savingsPercent > 0 && (
                          <span className="text-[10px] font-black text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">SAVE {savingsPercent}%</span>
                        )}
                      </div>

                      <Controller
                        name="package_fee"
                        control={control}
                        render={({ field }) => (
                          <FormInput
                            label="Total Package Fee (₹)"
                            type="number"
                            value={field.value}
                            onChange={field.onChange}
                            icon="payments"
                            className="font-bold"
                            error={errors.package_fee?.message}
                          />
                        )}
                      />

                      <p className="text-[10px] text-slate-500 font-medium italic">Suggested discount: 15% off individual total</p>
                    </div>

                    <div className="pt-6 border-t border-primary/10 flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Recurring Billing</span>
                        <span className="text-[10px] text-slate-500 font-medium">Auto-renew bundle every cycle</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <Controller
                          name="recurring_billing"
                          control={control}
                          render={({ field }) => (
                            <input
                              type="checkbox"
                              checked={!!field.value}
                              onChange={field.onChange}
                              className="sr-only peer"
                            />
                          )}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </section>

                {/* Status Card */}
                <section className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Status</span>
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded uppercase tracking-wider">
                        {isEditMode ? 'Active' : 'Draft'}
                      </span>
                    </div>
                    <button type="button" className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95">
                      Schedule Publication
                    </button>
                  </div>
                </section>
              </div>
            </div>

            {isCourseModalOpen && <CourseSelectionModal
              isOpen={isCourseModalOpen}
              onClose={() => setIsCourseModalOpen(false)}
              onSelect={(selected) => setSelectedCourses(selected)}
              selectedCourses={selectedCourses}
              availableCourses={courses}
            />}

            {isPerksModalOpen && <PerksSelectionModal
              isOpen={isPerksModalOpen}
              onClose={() => setIsPerksModalOpen(false)}
              onSelect={(selected) => setPerks(selected)}
              selectedPerks={perks}
              availablePerks={availablePerks}
            />}
          </div>
        </form>
      }
      footer={
        <footer className="border border-border-light dark:border-border-dark bg-white dark:bg-slate-900 shadow-lg px-4 lg:px-6 py-3 flex items-center justify-between gap-4 rounded-xl w-full">
          <div className="flex items-center justify-start w-1/2 md:w-auto">
            <button
              type="button"
              onClick={() => navigate('/admin/packages')}
              className="px-5 py-2.5 rounded-lg border border-border-light dark:border-border-dark text-text-secondary font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
            >
              Cancel
            </button>
          </div>
          <div className="flex justify-end w-1/2 md:w-auto ml-auto">
            <button
              type="submit"
              form="course-package-form"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-5 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : 'Save Package'}
            </button>
          </div>
        </footer>
      }
    />
  );
};

export default CoursePackagesForm;

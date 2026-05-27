import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { 
  useCoursesQuery, 
  useCreatePackageMutation, 
  useUpdatePackageMutation,
  usePackageDetailQuery,
  useCourseTypesQuery
} from './hooks/useCourseQueries';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import FormInput from '../../components/ui/form/FormInput';
import FormTextarea from '../../components/ui/form/FormTextarea';
import FormSelect from '../../components/ui/form/FormSelect';
import Badge from '../../components/ui/Badge';
import PerksSelectionModal from './components/PerksSelectionModal';
import CourseSelectionModal from './components/CourseSelectionModal';
import ActionCardButton from '../../components/ui/buttons/ActionCardButton';

/**
 * Course Package Form Page
 * Refined high-fidelity layout based on prototype design.
 */
const CoursePackagesForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { data: courses = [], isLoading: coursesLoading } = useCoursesQuery();
  const { data: courseTypes = [] } = useCourseTypesQuery();
  const { data: existingPkg, isLoading: pkgLoading } = usePackageDetailQuery(id);
  
  const createMutation = useCreatePackageMutation();
  const updateMutation = useUpdatePackageMutation();
  
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    packageId: `PKG-${Date.now().toString().slice(-6)}`,
    name: '',
    description: '',
    segmentId: 'SEG-ACA',
    targetClass: '9',
    board: 'CBSE',
    month: 12,
    packageFee: '0.00',
    recurringBilling: false,
    status: 'active'
  });

  const [selectedCourses, setSelectedCourses] = useState([]);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [perks, setPerks] = useState([]);
  const [isPerksModalOpen, setIsPerksModalOpen] = useState(false);

  // Setup options for selects
  const classOptions = Array.from({ length: 12 }, (_, i) => ({ label: `Class ${i + 1}`, value: String(i + 1) }));
  const boardOptions = ['CBSE', 'RBSE', 'ICSE', 'IB'].map(b => ({ label: b, value: b }));
  const segmentOptions = courseTypes.map(t => ({ label: t.segment_name, value: t.segment_id }));

  const breadcrumbItems = [
    { label: 'Home', path: '/admin/dashboard', icon: 'home' },
    { label: 'Courses', path: '/admin/courses' },
    { label: isEditMode ? 'Edit Package' : 'Create Package' }
  ];

  // Populate form if in Edit Mode
  useEffect(() => {
    if (isEditMode && existingPkg) {
      setFormData({
        packageId: existingPkg.package_id,
        name: existingPkg.name,
        description: existingPkg.description || '',
        segmentId: existingPkg.segment_id || 'SEG-ACA',
        targetClass: existingPkg.target_class || '9',
        board: existingPkg.board || 'CBSE',
        month: existingPkg.month || 12,
        packageFee: String(existingPkg.package_fee || existingPkg.base_fee),
        recurringBilling: !!existingPkg.recurring_billing,
        status: existingPkg.status || 'active'
      });
      setSelectedCourses(existingPkg.courses || []);
      setPerks(existingPkg.perks || []);
    } else if (!isEditMode) {
      // Reset state for "Create" mode if we were previously in "Edit" mode or ID changed
      setSelectedCourses([]);
      setPerks([]);
      setFormData({
        packageId: `PKG-${Date.now().toString().slice(-6)}`,
        name: '',
        description: '',
        segmentId: 'SEG-ACA',
        targetClass: '9',
        board: 'CBSE',
        month: 12,
        packageFee: '0.00',
        recurringBilling: false,
        status: 'active'
      });
    }
  }, [isEditMode, existingPkg, id]);

  const aggregateValue = useMemo(() => {
    return selectedCourses.reduce((sum, c) => sum + (c.base_fee || 0), 0);
  }, [selectedCourses]);

  const savingsPercent = useMemo(() => {
    const fee = parseFloat(formData.packageFee) || 0;
    if (aggregateValue === 0 || fee === 0) return 0;
    return Math.round(((aggregateValue - fee) / aggregateValue) * 100);
  }, [aggregateValue, formData.packageFee]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    setError(null);
    if (!formData.name || selectedCourses.length === 0) {
      setError('Please provide a name and select at least one course.');
      return;
    }
    
    const payload = {
      ...formData,
      package_id: formData.packageId,
      package_fee: Number(formData.packageFee),
      base_fee: Number(formData.packageFee),
      discount_percent: savingsPercent,
      included_courses: selectedCourses.map(c => c.name),
      perks: perks,
      courses: selectedCourses
    };

    const mutationOptions = {
      onSuccess: (res) => {
        if (res.success) {
          navigate(isEditMode ? `/admin/packages/${id}` : '/admin/courses');
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
  };

  if (isEditMode && pkgLoading) return <div className="p-20 text-center font-black animate-pulse">Synchronizing relational data...</div>;

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 py-8 animate-in fade-in duration-500">
      {/* Dynamic Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
            {isEditMode ? 'Edit Course Package' : 'Create Course Package'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Bundle multiple courses together with specific pricing and duration rules.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => navigate('/admin/courses')} 
            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined">save</span>
            {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : 'Save Package'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm font-bold flex items-center gap-2">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                value={formData.packageId} 
                readOnly 
                icon="fingerprint" 
                className="opacity-60" 
              />
              <FormSelect 
                label="Category Segment" 
                name="segmentId" 
                value={formData.segmentId} 
                onChange={handleChange} 
                options={segmentOptions} 
                icon="category" 
              />
              <FormInput 
                label="Package Name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                icon="label" 
                placeholder="e.g. Advanced Science Bundle" 
                className="md:col-span-2" 
              />
              <FormTextarea 
                label="Description" 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                className="md:col-span-2" 
                placeholder="Enter package details and learning objectives..." 
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
                      <button onClick={() => setPerks(prev => prev.filter((_, idx) => idx !== i))} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-all">
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
              <FormSelect 
                label="Target Class" 
                name="targetClass" 
                value={formData.targetClass} 
                onChange={handleChange} 
                options={classOptions} 
                icon="school" 
              />
              <FormSelect 
                label="Education Board" 
                name="board" 
                value={formData.board} 
                onChange={handleChange} 
                options={boardOptions} 
                icon="account_balance" 
              />
              <FormInput 
                label="Duration (Months)" 
                name="month" 
                type="number" 
                value={formData.month} 
                onChange={handleChange} 
                icon="calendar_month" 
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
                
                <FormInput 
                  label="Total Package Fee (₹)" 
                  name="packageFee" 
                  type="number" 
                  value={formData.packageFee} 
                  onChange={handleChange} 
                  icon="payments" 
                  className="font-bold"
                />
                
                <p className="text-[10px] text-slate-500 font-medium italic">Suggested discount: 15% off individual total</p>
              </div>
              
              <div className="pt-6 border-t border-primary/10 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Recurring Billing</span>
                  <span className="text-[10px] text-slate-500 font-medium">Auto-renew bundle every cycle</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="recurringBilling"
                    checked={formData.recurringBilling}
                    onChange={handleChange}
                    className="sr-only peer" 
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
              <button className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95">
                Schedule Publication
              </button>
            </div>
          </section>
        </div>
      </div>

      <CourseSelectionModal 
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onSelect={(selected) => setSelectedCourses(selected)}
        selectedCourses={selectedCourses}
        availableCourses={courses}
      />

      <PerksSelectionModal 
        isOpen={isPerksModalOpen} 
        onClose={() => setIsPerksModalOpen(false)} 
        onSelect={(selected) => setPerks(selected)} 
        selectedPerks={perks} 
      />
    </div>
  );
};

export default CoursePackagesForm;

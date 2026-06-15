import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  useCourseTypesQuery,
  useCoursesQuery
} from './hooks/useCourseQueries';
import {
  useCreatePackageMutation
} from './hooks/usePackageQueries';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import CourseSelectionModal from './components/CourseSelectionModal';
import APIErrorModal from '../../components/ui/APIErrorModal';
import ConfirmModal from '../../components/ui/ConfirmModal';
import FormField from '../../components/ui/v2/FormField';
import TextInput from '../../components/ui/v2/TextInput';
import SelectInput from '../../components/ui/v2/SelectInput';
import ToggleSwitch from '../../components/ui/v2/ToggleSwitch';

/**
 * Inline Course Package Form Page (Light Theme)
 * Enhanced with spinner buttons, standard success/error modals, and hybrid existing-course catalog selection.
 */
const InlineCoursePackagesForm = () => {
  const navigate = useNavigate();
  
  // Queries & Mutations
  const { data: courseTypes = [], isLoading: typesLoading } = useCourseTypesQuery();
  const { data: availableCourses = [], isLoading: coursesLoading } = useCoursesQuery();
  const createMutation = useCreatePackageMutation();
  
  // Modal & Selection States
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    status: 'idle', // 'idle' | 'success' | 'error'
    error: null,
    resultMessage: ''
  });

  // Local Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_class: '', // forced empty initially (required)
    board: '', // forced empty initially (required)
    month: 12,
    package_fee: '0.00',
    status: 'active'
  });

  // Local Form validation errors
  const [formErrors, setFormErrors] = useState({});

  // Perks toggle and state
  const [useDefaultPerks, setUseDefaultPerks] = useState(true);
  const [perks, setPerks] = useState([
    { perk_title: 'Regular Assignments & Material', perk_description: 'Daily assignments and printed/PDF notes.', icon: 'check_circle', display_order: 1 }
  ]);

  // Inline courses table state (Hybrid: inline entries + picked catalog items)
  const [inlineCourses, setInlineCourses] = useState([
    {
      name: '',
      short_code: '',
      entity_type: 'course',
      segment_id: '',
      language_medium: 'English',
      duration_value: 12,
      duration_unit: 'months',
      base_fee: '0.00',
      default_installment_count: 1,
      status: 'active',
      isExisting: false
    }
  ]);

  const classOptions = useMemo(() => [
    ...Array.from({ length: 12 }, (_, i) => ({
      label: `Class ${i + 1}`,
      value: String(i + 1)
    })),
    { label: 'Senior (Class 11/12)', value: 'Senior' }
  ], []);

  const boardOptions = useMemo(() => [
    { label: 'CBSE', value: 'CBSE' },
    { label: 'RBSE', value: 'RBSE' },
    { label: 'ICSE', value: 'ICSE' },
    { label: 'IB', value: 'IB' }
  ], []);
  const languageOptions = ['English', 'Hindi', 'Urdu'];
  const durationUnitOptions = ['months', 'days', 'weeks'];
  const entityTypeOptions = ['course', 'subject'];

  // Resolve default segment ID fallback for new empty rows
  useEffect(() => {
    if (courseTypes.length > 0 && inlineCourses.length > 0) {
      setInlineCourses(prev => prev.map(c => c.segment_id ? c : { ...c, segment_id: courseTypes[0].segment_id }));
    }
  }, [courseTypes]);

  const breadcrumbItems = [
    { label: 'Home', path: '/admin/dashboard', icon: 'home' },
    { label: 'Packages', path: '/admin/packages' },
    { label: 'Quick Build Package' }
  ];

  // Dynamic pricing calculations
  const coursesSum = useMemo(() => {
    return inlineCourses.reduce((sum, c) => sum + (parseFloat(c.base_fee) || 0), 0);
  }, [inlineCourses]);

  const savingsPercent = useMemo(() => {
    const fee = parseFloat(formData.package_fee) || 0;
    if (coursesSum === 0 || fee === 0) return 0;
    const diff = coursesSum - fee;
    if (diff <= 0) return 0;
    return Math.round((diff / coursesSum) * 100);
  }, [coursesSum, formData.package_fee]);

  const pricingWarning = useMemo(() => {
    const fee = parseFloat(formData.package_fee) || 0;
    if (fee > coursesSum && coursesSum > 0) {
      return 'Warning: Package fee exceeds the sum of individual courses.';
    }
    return null;
  }, [coursesSum, formData.package_fee]);

  // General inputs handler
  const handleMetaChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCourseChange = (index, field, value) => {
    setInlineCourses(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const addEmptyCourseRow = () => {
    const defaultSegment = courseTypes[0]?.segment_id || '';
    setInlineCourses(prev => [
      ...prev,
      {
        name: '',
        short_code: '',
        entity_type: 'course',
        segment_id: defaultSegment,
        language_medium: 'English',
        duration_value: 12,
        duration_unit: 'months',
        base_fee: '0.00',
        default_installment_count: 1,
        status: 'active',
        isExisting: false
      }
    ]);
  };

  // Callback when existing course catalog items are picked
  const handleSelectExistingCourses = (selected) => {
    const coursesToAdd = Array.isArray(selected) ? selected : [selected];
    const mapped = coursesToAdd.map(c => ({
      course_id: c.course_id,
      name: c.name,
      short_code: c.short_code || c.course_id,
      entity_type: c.entity_type || 'course',
      segment_id: c.segment_id || 'SEG-ACA',
      language_medium: c.language_medium || 'English',
      duration_value: c.duration_value || 12,
      duration_unit: c.duration_unit || 'months',
      base_fee: String(c.base_fee || '0.00'),
      default_installment_count: c.default_installment_count || 1,
      status: c.status || 'active',
      isExisting: true
    }));

    // Filter out items already added to prevent duplicates
    const currentCodes = new Set(inlineCourses.map(x => x.short_code.toUpperCase()));
    const uniqueNew = mapped.filter(x => !currentCodes.has(x.short_code.toUpperCase()));

    if (uniqueNew.length > 0) {
      // If the first row is empty, replace it, otherwise append
      setInlineCourses(prev => {
        if (prev.length === 1 && !prev[0].name && !prev[0].short_code && !prev[0].isExisting) {
          return uniqueNew;
        }
        return [...prev, ...uniqueNew];
      });
    }
  };

  const removeCourseRow = (index) => {
    if (inlineCourses.length === 1) {
      setModalState({
        isOpen: true,
        status: 'error',
        error: new Error('A course package must contain at least one constituent course.')
      });
      return;
    }
    setInlineCourses(prev => prev.filter((_, i) => i !== index));
  };

  // Custom Perks handlers
  const handlePerkChange = (index, field, value) => {
    setPerks(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const addPerkRow = () => {
    setPerks(prev => [
      ...prev,
      { perk_title: '', perk_description: '', icon: 'check_circle', display_order: prev.length + 1 }
    ]);
  };

  const removePerkRow = (index) => {
    setPerks(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Quick Package Creation Payload
  const handleSave = () => {
    // Validation
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Package name is required';
    }
    if (!formData.target_class) {
      errors.target_class = 'Target class is required';
    }
    if (!formData.board) {
      errors.board = 'Education board is required';
    }
    const feeVal = parseFloat(formData.package_fee);
    if (isNaN(feeVal) || feeVal < 0) {
      errors.package_fee = 'Please provide a valid package fee.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setModalState({
        isOpen: true,
        status: 'error',
        error: new Error('Please fill in all required fields.')
      });
      return;
    }
    setFormErrors({});

    // Row validations
    const seenCodes = new Set();
    for (let i = 0; i < inlineCourses.length; i++) {
      const c = inlineCourses[i];
      if (!c.name.trim()) {
        setModalState({ isOpen: true, status: 'error', error: new Error(`Please provide a name for Course Row #${i + 1}.`) });
        return;
      }
      if (!c.short_code.trim()) {
        setModalState({ isOpen: true, status: 'error', error: new Error(`Please provide a short code for Course Row #${i + 1}.`) });
        return;
      }
      const codeUpper = c.short_code.trim().toUpperCase();
      if (seenCodes.has(codeUpper)) {
        setModalState({ isOpen: true, status: 'error', error: new Error(`Duplicate short code "${c.short_code}" found in Course Row #${i + 1}.`) });
        return;
      }
      seenCodes.add(codeUpper);
    }

    // Assemble dynamic payload
    const classInt = formData.target_class === 'Senior' ? 12 : parseInt(formData.target_class, 10);
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      target_class: formData.target_class,
      board: formData.board,
      month: Number(formData.month) || 12,
      package_fee: feeVal,
      discount_percent: savingsPercent,
      status: formData.status,
      courses: inlineCourses.map(c => {
        if (c.isExisting) {
          return {
            entity_type: c.entity_type,
            entity_id: c.course_id
          };
        }
        return {
          entity_type: c.entity_type,
          on_demand: true,
          name: c.name.trim(),
          short_code: c.short_code.trim().toUpperCase(),
          language_medium: c.language_medium,
          duration_value: Number(c.duration_value) || 12,
          duration_unit: c.duration_unit,
          base_fee: Number(c.base_fee) || 0,
          segment_id: c.segment_id,
          default_installment_count: Number(c.default_installment_count) || 1,
          status: c.status,
          class: classInt,
          board: formData.board
        };
      }),
      perks: useDefaultPerks ? [] : perks.filter(p => p.perk_title.trim()).map(p => ({
        perk_title: p.perk_title.trim(),
        perk_description: p.perk_description.trim(),
        icon: p.icon || 'check_circle',
        display_order: Number(p.display_order) || 1
      }))
    };

    createMutation.mutate(
      { data: payload },
      {
        onSuccess: (res) => {
          if (res.success) {
            setModalState({
              isOpen: true,
              status: 'success',
              resultMessage: `Package "${formData.name}" successfully created with ID: ${res.data?.package_id || 'N/A'}`
            });
          } else {
            const serverErr = res.error;
            setModalState({
              isOpen: true,
              status: 'error',
              error: {
                name: serverErr?.type || "CreationError",
                message: serverErr?.message || "Failed to submit quick package definition.",
                details: serverErr?.errorCode ? `Error Code: ${serverErr.errorCode}` : null
              }
            });
          }
        },
        onError: (err) => {
          setModalState({
            isOpen: true,
            status: 'error',
            error: err
          });
        }
      }
    );
  };

  const handleDismissModals = () => {
    const isSuccess = modalState.status === 'success';
    setModalState({ isOpen: false, status: 'idle', error: null, resultMessage: '' });
    if (isSuccess) {
      navigate('/admin/packages');
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto space-y-6 py-6 px-4 animate-in fade-in duration-300 bg-[#faf8ff] text-[#0b1c30]">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-black text-[#002044] tracking-tight leading-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">bolt</span>
            Quick Build Package (Hybrid Catalog Creator)
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Build packages dynamically by creating new subjects inline or attaching existing courses from the directory.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => navigate('/admin/packages')} 
            className="flex-1 md:flex-none px-5 py-2 rounded-lg border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95 text-[13px]"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={createMutation.isPending || typesLoading}
            className="flex-1 md:flex-none px-6 py-2 rounded-lg bg-[#002044] hover:bg-[#001b3c] text-white font-bold shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95 text-[13px] disabled:opacity-50"
          >
            {createMutation.isPending ? (
              <>
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating Package...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">save</span>
                Save & Publish Package
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Package Metadata & Course Grid */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Metadata Card */}
          <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm relative">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3 text-[#002044]">
              <span className="material-symbols-outlined text-[#b08e4f] text-lg">info</span>
              <h3 className="text-sm font-black uppercase tracking-wider">Package Specifications</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                label="Package Name" 
                name="name" 
                required 
                error={formErrors.name}
              >
                <TextInput 
                  value={formData.name} 
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Class 10 Advanced Combo" 
                />
              </FormField>

              <FormField 
                label="Description" 
                name="description"
                error={formErrors.description}
              >
                <TextInput 
                  value={formData.description} 
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Summary of course package..." 
                />
              </FormField>

              <FormField 
                label="Target Class" 
                name="target_class" 
                required 
                error={formErrors.target_class}
              >
                <SelectInput 
                  options={classOptions} 
                  value={formData.target_class} 
                  onChange={(val) => setFormData(prev => ({ ...prev, target_class: val }))}
                  placeholder="Select Target Class..."
                />
              </FormField>

              <FormField 
                label="Education Board" 
                name="board" 
                required 
                error={formErrors.board}
              >
                <SelectInput 
                  options={boardOptions} 
                  value={formData.board} 
                  onChange={(val) => setFormData(prev => ({ ...prev, board: val }))}
                  placeholder="Select Education Board..."
                />
              </FormField>
            </div>
          </section>

          {/* Table section */}
          <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-[#002044]">
                <span className="material-symbols-outlined text-[#b08e4f] text-lg">grid_on</span>
                <h3 className="text-sm font-black uppercase tracking-wider">Constituent Courses & Subjects</h3>
              </div>
              <span className="text-[11px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                Hybrid creator mode
              </span>
            </div>

            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full min-w-[1000px] border-collapse text-left">
                <thead>
                  <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-500">
                    <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider w-[22%]">Course Name *</th>
                    <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider w-[12%]">Short Code *</th>
                    <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider w-[10%]">Type</th>
                    <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider w-[12%]">Segment</th>
                    <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider w-[11%]">Medium</th>
                    <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider w-[7%] text-center">Dur</th>
                    <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider w-[8%]">Unit</th>
                    <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider w-[10%]">Base Fee (₹)</th>
                    <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider w-[5%] text-center">Inst.</th>
                    <th className="py-2.5 px-3 text-[11px] font-bold uppercase tracking-wider w-[3%] text-center">Del</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inlineCourses.map((course, idx) => (
                    <tr 
                      key={idx} 
                      className={`hover:bg-[#F8FAFC]/50 transition-colors ${
                        course.isExisting 
                          ? 'bg-slate-50/70 text-slate-400 select-none' 
                          : 'bg-white'
                      }`}
                    >
                      {/* Name */}
                      <td className="py-2 px-1">
                        <input 
                          type="text" 
                          value={course.name} 
                          disabled={course.isExisting}
                          onChange={(e) => handleCourseChange(idx, 'name', e.target.value)} 
                          className={`h-8 border border-slate-200 rounded px-2 text-[12px] w-full focus:outline-none focus:border-[#b08e4f] ${
                            course.isExisting ? 'bg-slate-100 border-slate-200/50 text-slate-400 font-semibold cursor-not-allowed' : 'bg-white text-slate-800'
                          }`}
                          placeholder="e.g. Mathematics Core"
                        />
                      </td>

                      {/* Code */}
                      <td className="py-2 px-1">
                        <input 
                          type="text" 
                          value={course.short_code} 
                          disabled={course.isExisting}
                          onChange={(e) => handleCourseChange(idx, 'short_code', e.target.value.toUpperCase())} 
                          className={`h-8 border border-slate-200 rounded px-2 text-[12px] w-full focus:outline-none focus:border-[#b08e4f] font-mono uppercase ${
                            course.isExisting ? 'bg-slate-100 border-slate-200/50 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-800'
                          }`}
                          placeholder="e.g. MATH-10"
                        />
                      </td>

                      {/* Type */}
                      <td className="py-2 px-1">
                        <select 
                          value={course.entity_type} 
                          disabled={course.isExisting}
                          onChange={(e) => handleCourseChange(idx, 'entity_type', e.target.value)}
                          className={`h-8 border border-slate-200 rounded px-1 text-[12px] w-full bg-white focus:outline-none focus:border-[#b08e4f] ${
                            course.isExisting ? 'bg-slate-100 border-slate-200/50 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-800'
                          }`}
                        >
                          {entityTypeOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </td>

                      {/* Segment */}
                      <td className="py-2 px-1">
                        <select 
                          value={course.segment_id} 
                          disabled={course.isExisting}
                          onChange={(e) => handleCourseChange(idx, 'segment_id', e.target.value)}
                          className={`h-8 border border-slate-200 rounded px-1 text-[12px] w-full bg-white focus:outline-none focus:border-[#b08e4f] ${
                            course.isExisting ? 'bg-slate-100 border-slate-200/50 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-800'
                          }`}
                        >
                          {courseTypes.map(t => (
                            <option key={t.segment_id} value={t.segment_id}>{t.segment_name}</option>
                          ))}
                        </select>
                      </td>

                      {/* Medium */}
                      <td className="py-2 px-1">
                        <select 
                          value={course.language_medium} 
                          disabled={course.isExisting}
                          onChange={(e) => handleCourseChange(idx, 'language_medium', e.target.value)}
                          className={`h-8 border border-slate-200 rounded px-1 text-[12px] w-full bg-white focus:outline-none focus:border-[#b08e4f] ${
                            course.isExisting ? 'bg-slate-100 border-slate-200/50 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-800'
                          }`}
                        >
                          {languageOptions.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </td>

                      {/* Duration Val */}
                      <td className="py-2 px-1">
                        <input 
                          type="number" 
                          value={course.duration_value} 
                          disabled={course.isExisting}
                          onChange={(e) => handleCourseChange(idx, 'duration_value', e.target.value)} 
                          className={`h-8 border border-slate-200 rounded px-2 text-[12px] w-full focus:outline-none focus:border-[#b08e4f] text-center ${
                            course.isExisting ? 'bg-slate-100 border-slate-200/50 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-800'
                          }`}
                        />
                      </td>

                      {/* Duration Unit */}
                      <td className="py-2 px-1">
                        <select 
                          value={course.duration_unit} 
                          disabled={course.isExisting}
                          onChange={(e) => handleCourseChange(idx, 'duration_unit', e.target.value)}
                          className={`h-8 border border-slate-200 rounded px-1 text-[12px] w-full bg-white focus:outline-none focus:border-[#b08e4f] ${
                            course.isExisting ? 'bg-slate-100 border-slate-200/50 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-800'
                          }`}
                        >
                          {durationUnitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </td>

                      {/* Base Fee */}
                      <td className="py-2 px-1">
                        <input 
                          type="number" 
                          value={course.base_fee} 
                          disabled={course.isExisting}
                          onChange={(e) => handleCourseChange(idx, 'base_fee', e.target.value)} 
                          className={`h-8 border border-slate-200 rounded px-2 text-[12px] w-full focus:outline-none focus:border-[#b08e4f] ${
                            course.isExisting ? 'bg-slate-100 border-slate-200/50 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-800'
                          }`}
                        />
                      </td>

                      {/* Installment count */}
                      <td className="py-2 px-1">
                        <input 
                          type="number" 
                          value={course.default_installment_count} 
                          disabled={course.isExisting}
                          onChange={(e) => handleCourseChange(idx, 'default_installment_count', e.target.value)} 
                          className={`h-8 border border-slate-200 rounded px-2 text-[12px] w-full focus:outline-none focus:border-[#b08e4f] text-center ${
                            course.isExisting ? 'bg-slate-100 border-slate-200/50 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-800'
                          }`}
                        />
                      </td>

                      {/* Delete */}
                      <td className="py-2 px-1 text-center">
                        <button 
                          onClick={() => removeCourseRow(idx)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Row Addition Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <button 
                onClick={addEmptyCourseRow}
                className="py-2.5 border border-dashed border-slate-300 rounded-lg text-slate-500 font-bold hover:bg-slate-50 text-[12px] transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                + Create New Course Row
              </button>
              
              <button 
                onClick={() => setIsSelectionModalOpen(true)}
                className="py-2.5 border border-dashed border-slate-300 rounded-lg text-slate-500 font-bold hover:bg-slate-50 text-[12px] transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">library_add</span>
                + Select Existing Course
              </button>
            </div>
          </section>
        </div>

        {/* Right Side: Pricing & Perks */}
        <div className="space-y-6">
          
          {/* Pricing Card */}
          <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm relative">
            {savingsPercent > 0 && (
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500 text-white rounded text-[10px] font-black uppercase tracking-wider">
                  {savingsPercent}% Discount
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3 text-[#002044]">
              <span className="material-symbols-outlined text-[#b08e4f] text-lg">payments</span>
              <h3 className="text-sm font-black uppercase tracking-wider">Pricing details</h3>
            </div>

            <div className="space-y-4">
              <FormField 
                label="Duration (Months)" 
                name="month"
                error={formErrors.month}
              >
                <TextInput 
                  type="number" 
                  value={formData.month} 
                  onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
                />
              </FormField>

              <div className="flex flex-col gap-1.5 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div className="flex justify-between items-center text-[12px] font-medium text-slate-500 mb-2">
                  <span>Courses Fee Sum:</span>
                  <span className="font-bold text-[#002044]">₹{coursesSum.toLocaleString()}</span>
                </div>

                <FormField 
                  label="Package Bundle Fee" 
                  name="package_fee" 
                  required
                  error={formErrors.package_fee}
                >
                  <TextInput 
                    type="number" 
                    value={formData.package_fee} 
                    onChange={(e) => setFormData(prev => ({ ...prev, package_fee: e.target.value }))}
                    className="font-black text-primary"
                  />
                </FormField>

                {pricingWarning && (
                  <p className="text-[10px] text-amber-600 font-bold mt-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    {pricingWarning}
                  </p>
                )}
              </div>

              <FormField 
                label="Package Status" 
                name="status"
                error={formErrors.status}
              >
                <SelectInput 
                  options={[
                    { label: 'Active', value: 'active' },
                    { label: 'Draft', value: 'draft' },
                    { label: 'Inactive', value: 'inactive' }
                  ]} 
                  value={formData.status} 
                  onChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                />
              </FormField>
            </div>
          </section>

          {/* Perks Presets Card */}
          <section className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#002044]">
                  <span className="material-symbols-outlined text-[#b08e4f] text-lg">stars</span>
                  <h3 className="text-sm font-black uppercase tracking-wider">Package Perks</h3>
                </div>
                
                <ToggleSwitch 
                  checked={useDefaultPerks}
                  onChange={setUseDefaultPerks}
                  name="useDefaultPerks"
                />
              </div>
              
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                <span>USE CLASS PERK PRESETS</span>
                <span className={useDefaultPerks ? 'text-green-600 font-black' : 'text-slate-400 font-medium'}>
                  {useDefaultPerks ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
            </div>

            {useDefaultPerks ? (
              <div className="bg-slate-50 p-4 rounded-lg border border-dashed border-slate-200 text-center text-slate-500 space-y-2">
                <p className="text-[12px] font-medium leading-relaxed">
                  Perks will be auto-generated based on the target class selection (Standard vs Senior presets).
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {perks.map((perk, idx) => (
                  <div key={idx} className="p-3 border border-slate-100 rounded-lg space-y-2 bg-[#FAFBFD] relative group">
                    <button 
                      onClick={() => removePerkRow(idx)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                    
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-slate-400">PERK TITLE *</label>
                      <TextInput 
                        value={perk.perk_title} 
                        onChange={(e) => handlePerkChange(idx, 'perk_title', e.target.value)}
                        placeholder="e.g. Daily Practice Papers"
                        inputSize="sm"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-slate-400">DESCRIPTION</label>
                      <TextInput 
                        value={perk.perk_description} 
                        onChange={(e) => handlePerkChange(idx, 'perk_description', e.target.value)}
                        placeholder="Detail benefits..."
                        inputSize="sm"
                      />
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={addPerkRow}
                  className="w-full py-2 border border-dashed border-slate-300 rounded-lg text-slate-500 font-bold hover:bg-slate-50 text-[11px] transition-all flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                  Add Custom Perk
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Reusable Modals Integrations */}
      <CourseSelectionModal 
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        onSelect={handleSelectExistingCourses}
        selectedCourses={inlineCourses.filter(x => x.isExisting)}
        availableCourses={availableCourses}
      />

      <ConfirmModal 
        isOpen={modalState.isOpen && modalState.status === 'success'}
        onClose={handleDismissModals}
        onConfirm={handleDismissModals}
        status="success"
        title="Package Saved Successfully"
        resultMessage={modalState.resultMessage}
      />

      <APIErrorModal 
        isOpen={modalState.isOpen && modalState.status === 'error'}
        onClose={handleDismissModals}
        title="Quick Package Creation Error"
        error={modalState.error}
      />
    </div>
  );
};

export default InlineCoursePackagesForm;

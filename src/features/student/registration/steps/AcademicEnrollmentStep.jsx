import React, { useState, useMemo, useEffect } from 'react';
import { useCoursesQuery } from '../../../course/hooks/useCourseQueries';
import { usePackagesQuery } from '../../../course/hooks/usePackageQueries';
import { useBatchesQuery } from '../../../batch/hooks/useBatchQueries';
import Card from '../../../../components/ui/Card';
import Avatar from '../../../../components/ui/v2/Avatar';
import TextInput from '../../../../components/ui/v2/TextInput';
import SelectInput from '../../../../components/ui/v2/SelectInput';
import Button from '../../../../components/ui/v2/Button';
import ProgramSelectionModal from '../components/ProgramSelectionModal';

/**
 * AcademicEnrollmentStep: Merged Step 2 of the student registration wizard.
 * Integrates dynamic catalog item selection (Packages, Courses, Subjects),
 * batch allocations, manual discount overrides, and custom installment schedule customization.
 */
const AcademicEnrollmentStep = ({ formData, setFormData, onNext, onBack, errors = {} }) => {
  // Query catalogs and active schedules from cache/API
  const { data: packages = [], isLoading: isLoadingPkgs } = usePackagesQuery();
  const { data: courses = [], isLoading: isLoadingCourses } = useCoursesQuery();
  const { data: batches = [], isLoading: isLoadingBatches } = useBatchesQuery();

  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);

  // Helper utility wrappers to mutator parent state
  const setBasket = (newBasket) => {
    setFormData(prev => ({ 
      ...prev, 
      enrollmentBasket: typeof newBasket === 'function' ? newBasket(prev.enrollmentBasket || []) : newBasket 
    }));
  };

  const setSelectedBatches = (newBatches) => {
    setFormData(prev => ({ 
      ...prev, 
      selectedBatches: typeof newBatches === 'function' ? newBatches(prev.selectedBatches || {}) : newBatches 
    }));
  };

  const setInstallments = (newInst) => {
    setFormData(prev => ({ 
      ...prev, 
      installments: typeof newInst === 'function' ? newInst(prev.installments || []) : newInst 
    }));
  };

  const setIsManualPlan = (val) => {
    setFormData(prev => ({ ...prev, isManualPlan: val }));
  };

  // Compile full-fidelity catalog list by joining packages/courses with physical scheduled batches
  const catalog = useMemo(() => {
    if (isLoadingPkgs || isLoadingCourses || isLoadingBatches) return [];

    const mappedPackages = packages.map(pkg => {
      const pkgCourses = (pkg.courses || []).map(course => {
        const courseBatches = batches.filter(b => b.course_id === course.course_id && b.status === 'active');
        return {
          id: course.course_id,
          name: course.name,
          description: course.description || 'Core Course',
          batches: courseBatches.map(b => ({
            id: b.batch_id,
            name: `${b.batch_name} | ${b.schedule?.start_time || '00:00'} - ${b.schedule?.end_time || '00:00'}`,
            seatsLeft: Math.max(0, (b.capacity || 30) - (b.enrolled_students || 0)),
            seatsColor: Math.max(0, (b.capacity || 30) - (b.enrolled_students || 0)) <= 2 
              ? 'text-rose-500' 
              : Math.max(0, (b.capacity || 30) - (b.enrolled_students || 0)) <= 6 
              ? 'text-amber-500' 
              : 'text-emerald-500'
          }))
        };
      });

      return {
        id: pkg.package_id,
        type: 'package',
        name: pkg.name,
        fee: pkg.package_fee || pkg.base_fee || 0,
        stream: pkg.board ? `${pkg.board} Stream` : 'Academic Package',
        courses: pkgCourses,
        target_class: pkg.target_class || pkg.class || ''
      };
    });

    const mappedCourses = courses.map(course => {
      const courseBatches = batches.filter(b => b.course_id === course.course_id && b.status === 'active');
      const type = course.entity_type === 'subject' ? 'subject' : 'course';

      return {
        id: course.course_id,
        type,
        name: course.name,
        fee: course.base_fee || 0,
        description: course.description || 'Standalone course selection',
        batches: courseBatches.map(b => ({
          id: b.batch_id,
          name: `${b.batch_name} | ${b.schedule?.start_time || '00:00'} - ${b.schedule?.end_time || '00:00'}`,
          seatsLeft: Math.max(0, (b.capacity || 30) - (b.enrolled_students || 0)),
          seatsColor: Math.max(0, (b.capacity || 30) - (b.enrolled_students || 0)) <= 2 
            ? 'text-rose-500' 
            : Math.max(0, (b.capacity || 30) - (b.enrolled_students || 0)) <= 6 
            ? 'text-amber-500' 
            : 'text-emerald-500'
        })),
        target_class: course.metadata?.class || ''
      };
    });

    return [...mappedPackages, ...mappedCourses];
  }, [packages, courses, batches, isLoadingPkgs, isLoadingCourses, isLoadingBatches]);

  const handleBatchChange = (id, batchId) => {
    setSelectedBatches(prev => ({ ...prev, [id]: batchId }));
  };

  // Set selected items from ProgramSelectionModal
  const handleSelectPrograms = (selectedItems) => {
    setBasket(selectedItems);
    
    // Auto-populate default batch for added courses
    setSelectedBatches(prev => {
      const next = { ...prev };
      selectedItems.forEach(item => {
        if (item.type === 'package') {
          item.courses.forEach(c => {
            if (!next[c.id]) {
              next[c.id] = c.batches?.[0]?.id || '';
            }
          });
        } else {
          if (!next[item.id]) {
            next[item.id] = item.batches?.[0]?.id || '';
          }
        }
      });
      return next;
    });
  };

  // Discount Override Handlers
  const setOverrideAmount = (val) => {
    setFormData(prev => ({ ...prev, discountVal: val }));
  };

  const setOverrideReason = (val) => {
    setFormData(prev => ({ ...prev, discountReason: val }));
  };

  // Remove item from basket
  const handleRemoveItemFromBasket = (id) => {
    setBasket((formData.enrollmentBasket || []).filter(item => item.id !== id));
  };

  // Pricing calculations
  const basePackageSum = useMemo(() => {
    return (formData.enrollmentBasket || []).reduce((sum, item) => sum + item.fee, 0);
  }, [formData.enrollmentBasket]);

  const regFee = 0; // Removed registration fee to prevent accounting split discrepancies
  const discountVal = Number(formData.discountVal) || 0;
  const totalAmount = Math.max(0, basePackageSum - discountVal);

  // Sync calculated prices back to master wizard state container
  useEffect(() => {
    setFormData(prev => {
      if (prev.baseFee === basePackageSum && prev.registrationFee === regFee && prev.finalFee === totalAmount) {
        return prev;
      }
      return {
        ...prev,
        baseFee: basePackageSum,
        registrationFee: regFee,
        finalFee: totalAmount
      };
    });
  }, [basePackageSum, regFee, totalAmount, setFormData]);

  // Auto-populate basket and selected batches from initial lead data if available
  useEffect(() => {
    if (formData.courseId && catalog.length > 0 && (formData.enrollmentBasket || []).length === 0) {
      const matchedItem = catalog.find(item => item.id === formData.courseId && item.type !== 'package');
      if (matchedItem) {
        setBasket([matchedItem]);
        setSelectedBatches(prev => ({
          ...prev,
          [formData.courseId]: formData.batchId || matchedItem.batches?.[0]?.id || ''
        }));
      }
    }
  }, [formData.courseId, formData.batchId, catalog]);

  // Construct a default split date in YYYY-MM-DD
  const getDefaultDateStr = (monthsAhead = 0) => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsAhead);
    return d.toISOString().split('T')[0];
  };

  // Effect to automatically calculate installments when total changes and user has not set a manual plan
  useEffect(() => {
    if (!formData.isManualPlan) {
      const half = Math.round(totalAmount / 2);
      const remainder = totalAmount - half;
      setInstallments([
        { number: 1, label: 'Installment 1', amount: half, dueDate: getDefaultDateStr(0) },
        { number: 2, label: 'Installment 2', amount: remainder, dueDate: getDefaultDateStr(3) }
      ]);
    }
  }, [totalAmount, formData.isManualPlan]);

  // Auto-split amount evenly across current custom installment lines
  const handleAutoSplit = () => {
    const instList = formData.installments || [];
    if (instList.length === 0) return;
    const count = instList.length;
    const standardAmount = Math.floor(totalAmount / count);
    const remainder = totalAmount - (standardAmount * count);

    setInstallments(
      instList.map((inst, idx) => ({
        ...inst,
        amount: idx === 0 ? standardAmount + remainder : standardAmount
      }))
    );
  };

  // Update specific input column of an installment
  const updateInstallmentField = (index, field, value) => {
    const instList = [...(formData.installments || [])];
    if (instList[index]) {
      instList[index] = { ...instList[index], [field]: value };
      setInstallments(instList);
      setIsManualPlan(true);
    }
  };

  // Add new installment to custom timeline list
  const handleAddInstallment = () => {
    const instList = formData.installments || [];
    setInstallments([
      ...instList,
      {
        number: instList.length + 1,
        label: `Installment ${instList.length + 1}`,
        amount: 0,
        dueDate: getDefaultDateStr(instList.length * 2)
      }
    ]);
    setIsManualPlan(true);
  };

  // Delete installment from timeline list
  const handleDeleteInstallment = (index) => {
    const instList = (formData.installments || []).filter((_, idx) => idx !== index);
    setInstallments(
      instList.map((inst, idx) => ({
        ...inst,
        number: idx + 1,
        label: `Installment ${idx + 1}`
      }))
    );
    setIsManualPlan(true);
  };

  // Reset custom manual plans to default auto-generated plan
  const handleResetToDefaultPlan = () => {
    setIsManualPlan(false);
    setIsEditingPlan(false);
  };

  // Verify installment sum matches final contract total
  const installmentChecksumSum = useMemo(() => {
    return (formData.installments || []).reduce((sum, inst) => sum + (Number(inst.amount) || 0), 0);
  }, [formData.installments]);

  const isChecksumValid = installmentChecksumSum === totalAmount;



  // Verify that all required courses/subjects in the basket have a selected physical batch assignment
  const isBasketValidationValid = useMemo(() => {
    return (formData.enrollmentBasket || []).every(item => {
      if (item.type === 'package') {
        return (item.courses || []).every(c => {
          const batchId = (formData.selectedBatches || {})[c.id || c.course_id];
          return !!batchId;
        });
      } else {
        const batchId = (formData.selectedBatches || {})[item.id || item.course_id];
        return !!batchId;
      }
    });
  }, [formData.enrollmentBasket, formData.selectedBatches]);

  // Next disabled guard (cart must be populated, validation satisfied, and manual plans must satisfy checksum matches)
  const isNextDisabled = (formData.enrollmentBasket || []).length === 0 || 
                         !isBasketValidationValid || 
                         (formData.isManualPlan && !isChecksumValid);

  if (isLoadingPkgs || isLoadingCourses || isLoadingBatches) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading catalog items and schedules...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6 md:gap-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-7xl mx-auto px-4 lg:px-0 w-full text-slate-700 dark:text-slate-200">
      
      {/* Left Column: Cart Selection & Configuration (Col span 7/12 Equivalent) */}
      <div className="col-span-12 lg:col-span-7 space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Enrollment & Course Selection</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Add target packages or individual subjects and assign physical scheduled batches.</p>
        </div>

        {/* Configure Programs Button / Configurator Banner */}
        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Manage Enrolled Programs
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Browse our catalog of structured academic packages, standalone courses, and individual subjects.
            </p>
          </div>
          <button
            onClick={() => setIsSelectionModalOpen(true)}
            className="bg-primary hover:bg-primary-dark text-white font-black px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 text-xs uppercase tracking-wider flex items-center justify-center gap-2 self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            Configure Programs
          </button>
        </div>

        {/* Selected Items */}
        {errors.enrollmentBasket && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error_outline</span>
            {errors.enrollmentBasket.message}
          </div>
        )}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
            SELECTED ITEMS IN CART ({(formData.enrollmentBasket || []).length})
          </h3>
          
          {(formData.enrollmentBasket || []).length > 0 ? (
            <div className="space-y-5">
              {(formData.enrollmentBasket || []).map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 hover:border-slate-300 dark:hover:border-slate-800 transition-all shadow-sm"
                >
                  {/* Cart Item Header */}
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                        item.type === 'package' 
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' 
                          : item.type === 'course' 
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' 
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      }`}>
                        {item.type}
                      </span>
                      <h4 className="text-base font-black text-slate-900 dark:text-white">{item.name}</h4>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-black text-primary">
                        ₹{item.fee.toLocaleString()}
                      </span>
                      <button 
                        onClick={() => handleRemoveItemFromBasket(item.id)}
                        className="p-1 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-500 transition-all"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Cart Item Body - Batch Selection list */}
                  {item.type === 'package' ? (
                    <div className="space-y-3.5 pl-2">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">REQUIRED COURSES FOR THIS PACKAGE</h5>
                      <div className="space-y-3">
                        {(item.courses || []).map((course) => {
                          const currentBatchId = (formData.selectedBatches || {})[course.id];
                          const currentBatch = course.batches.find(b => b.id === currentBatchId) || course.batches[0];

                          return (
                            <div key={course.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/40">
                              <div className="space-y-0.5">
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{course.name}</p>
                                <p className="text-[10px] text-slate-500">{course.description}</p>
                              </div>
                              <div className="flex items-center gap-3 w-full sm:w-auto">
                                <SelectInput
                                  value={currentBatchId || ''}
                                  onChange={(val) => handleBatchChange(course.id, val)}
                                  options={(course.batches || []).map(b => ({ value: b.id, label: b.name }))}
                                  inputSize="sm"
                                  containerClassName="min-w-[170px]"
                                  placeholder="Select Batch"
                                  error={!currentBatchId && errors.selectedBatches ? 'Batch is required' : null}
                                />
                                <div className="flex items-center gap-1">
                                  <span className={`size-1.5 rounded-full bg-current ${currentBatch?.seatsColor || 'text-emerald-500'}`}></span>
                                  <span className={`text-[9px] font-black uppercase ${currentBatch?.seatsColor || 'text-emerald-500'}`}>
                                    {currentBatch?.seatsLeft}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/40">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500 dark:text-slate-400">{item.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <SelectInput
                          value={(formData.selectedBatches || {})[item.id] || ''}
                          onChange={(val) => handleBatchChange(item.id, val)}
                          options={(item.batches || []).map(b => ({ value: b.id, label: b.name }))}
                          inputSize="sm"
                          containerClassName="min-w-[200px]"
                          placeholder="Select Batch"
                          error={!(formData.selectedBatches || {})[item.id] && errors.selectedBatches ? 'Batch is required' : null}
                        />
                        
                        <div className="flex items-center gap-1 px-1">
                          <span className={`size-2 rounded-full bg-current ${item.batches?.[0]?.seatsColor || 'text-emerald-500'}`}></span>
                          <span className={`text-[10px] font-black uppercase tracking-wider ${item.batches?.[0]?.seatsColor || 'text-emerald-500'}`}>
                            {item.batches?.[0]?.seatsLeft} seats
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/10">
              <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">shopping_basket</span>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Your enrollment basket is empty.</p>
              <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">Select an item above to add it to the enrollment checklist.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Pricing & Installments (Col span 5/12 Equivalent) */}
      <div className="col-span-12 lg:col-span-5 space-y-6">
        
        {/* Pricing Card */}
        <Card className="bg-white dark:bg-slate-900/50 p-6 border-slate-200 dark:border-slate-800/80 shadow-sm backdrop-blur-md flex flex-col gap-5">
          <div className="space-y-4">
            <h3 className="text-slate-800 dark:text-slate-300 text-xs font-black uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-3">
              ENROLLMENT SUMMARY
            </h3>
            
            <div className="space-y-3 text-sm">
              {(formData.enrollmentBasket || []).map(item => (
                <div key={item.id} className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span className="truncate max-w-[200px]">{item.name}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">₹{item.fee.toLocaleString()}</span>
                </div>
              ))}

              {(formData.enrollmentBasket || []).length > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-800/40 my-2 pt-2"></div>
              )}
              
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Base Subtotal</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">₹{basePackageSum.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Registration Fee</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">₹{regFee.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                <span>Discount Applied</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">- ₹{discountVal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Discount Override Input fields */}
          <div className="space-y-3 pt-2">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 pl-0.5">
              MANUAL DISCOUNT OVERRIDE
            </h4>
            
            <div className="space-y-3">
              <TextInput
                type="number"
                value={formData.discountVal || ''}
                onChange={(e) => setOverrideAmount(Number(e.target.value))}
                placeholder="Override Amount"
              />
              <TextInput
                type="text"
                value={formData.discountReason || ''}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Reason (e.g., Entrance Scholarship)"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-5 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Amount</span>
            <span className="text-2xl font-black text-primary">₹{totalAmount.toLocaleString()}</span>
          </div>
        </Card>

        {/* Installment Customizer Card */}
        <Card className="bg-white dark:bg-slate-900/50 p-6 border-slate-200 dark:border-slate-800/80 shadow-sm backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-slate-800 dark:text-slate-300 text-xs font-black uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-slate-400">calendar_month</span>
              INSTALLMENT SCHEDULE
            </h3>
            
            <div className="flex gap-2">
              {isEditingPlan ? (
                <button 
                  onClick={() => setIsEditingPlan(false)}
                  className="text-[10px] font-black uppercase text-primary hover:text-primary-dark transition-colors"
                >
                  Done
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setIsEditingPlan(true);
                    setIsManualPlan(true);
                  }}
                  className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  Edit Plan
                </button>
              )}
            </div>
          </div>

          {/* Validation Checklist / Checksum status indicator */}
          {formData.isManualPlan && (
            <div className="flex flex-col gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800/50">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-500 dark:text-slate-400">Checksum Status:</span>
                <span className={isChecksumValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}>
                  ₹{installmentChecksumSum.toLocaleString()} / ₹{totalAmount.toLocaleString()}
                </span>
              </div>
              
              {(errors.installments || !isChecksumValid) && (
                <p className="text-[10px] text-rose-500 dark:text-rose-400 leading-tight">
                  {errors.installments?.message || 'Installments sum does not match total amount. Click "Auto-Split" below to rebalance.'}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <button 
                  onClick={handleAutoSplit}
                  className="flex-1 text-[9px] font-black uppercase tracking-wider py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded transition-all"
                >
                  Auto-Split
                </button>
                <button 
                  onClick={handleResetToDefaultPlan}
                  className="flex-1 text-[9px] font-black uppercase tracking-wider py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded transition-all"
                >
                  Reset to Auto
                </button>
              </div>
            </div>
          )}

          {/* Timeline representation */}
          <div className="relative pl-6 border-l border-slate-200 dark:border-slate-800 space-y-6 ml-2 py-1">
            {(formData.installments || []).map((inst, index) => (
              <div key={index} className="relative">
                <div className="absolute -left-[30px] top-1.5 size-4 rounded-full bg-primary border-2 border-white dark:border-slate-900 flex items-center justify-center">
                  <div className="size-1.5 rounded-full bg-white dark:bg-slate-900"></div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/50 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{inst.label}</span>
                    {isEditingPlan && (
                      <button 
                        onClick={() => handleDeleteInstallment(index)}
                        className="p-0.5 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    )}
                  </div>

                  {isEditingPlan ? (
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500">Amount (₹)</span>
                        <TextInput 
                          type="number"
                          value={inst.amount || ''}
                          onChange={(e) => updateInstallmentField(index, 'amount', Number(e.target.value))}
                          inputSize="sm"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500">Due Date</span>
                        <TextInput 
                          type="date"
                          value={inst.dueDate || ''}
                          onChange={(e) => updateInstallmentField(index, 'dueDate', e.target.value)}
                          inputSize="sm"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white">₹{inst.amount?.toLocaleString()}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        {index === 0 ? 'Due on Enrollment' : `Due on ${new Date(inst.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isEditingPlan && (
              <button 
                onClick={handleAddInstallment}
                className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-slate-300 dark:border-slate-800 hover:border-primary/50 rounded-xl text-slate-400 hover:text-primary transition-all text-xs font-bold"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Installment Cycle
              </button>
            )}
          </div>
        </Card>

      </div>

      {/* Program Selection Modal */}
      <ProgramSelectionModal
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        onSelect={handleSelectPrograms}
        selectedItems={formData.enrollmentBasket || []}
        availableItems={catalog}
      />
    </div>
  );
};

export default AcademicEnrollmentStep;

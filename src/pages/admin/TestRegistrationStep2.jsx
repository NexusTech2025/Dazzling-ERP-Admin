import React, { useState, useMemo, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Avatar from '../../components/ui/v2/Avatar';
import KeyValuePair from '../../components/ui/v2/KeyValuePair';
import TextInput from '../../components/ui/v2/TextInput';
import Button from '../../components/ui/v2/Button';

// Catalog of Available Packages, Standalone Courses, and Individual Subjects
const CATALOG = [
  {
    id: 'PKG-12-SCI',
    type: 'package',
    name: 'Class 12th Board Science Package',
    fee: 12000,
    stream: 'Science Stream',
    courses: [
      {
        id: 'CRS-12-PHY',
        name: 'Physics 12th',
        description: 'Core Subjects • High Priority',
        batches: [
          { id: 'BAT-PHY-M1', name: 'PHY-12-M1 | 08:00 AM - 09:30 AM', seatsLeft: 6, seatsColor: 'text-amber-500' },
          { id: 'BAT-PHY-E1', name: 'PHY-12-E1 | 04:00 PM - 05:30 PM', seatsLeft: 15, seatsColor: 'text-emerald-500' }
        ]
      },
      {
        id: 'CRS-12-CHE',
        name: 'Chemistry 12th',
        description: 'Core Subjects • Regular Batch',
        batches: [
          { id: 'BAT-CHE-M2', name: 'CHM-12-M2 | 09:30 AM - 11:00 AM', seatsLeft: 12, seatsColor: 'text-emerald-500' },
          { id: 'BAT-CHE-E2', name: 'CHM-12-E2 | 05:30 PM - 07:00 PM', seatsLeft: 2, seatsColor: 'text-rose-500' }
        ]
      },
      {
        id: 'CRS-12-MTH',
        name: 'Maths 12th',
        description: 'Core Subjects • Advanced Calculus',
        batches: [
          { id: 'BAT-MTH-M1', name: 'MTH-12-M1 | 08:00 AM - 09:30 AM', seatsLeft: 18, seatsColor: 'text-emerald-500' },
          { id: 'BAT-MTH-E1', name: 'MTH-12-E1 | 04:00 PM - 05:30 PM', seatsLeft: 24, seatsColor: 'text-emerald-500' }
        ]
      }
    ]
  },
  {
    id: 'PKG-12-COM',
    type: 'package',
    name: 'Class 12th Board Commerce Package',
    fee: 10500,
    stream: 'Commerce Stream',
    courses: [
      {
        id: 'CRS-12-ACC',
        name: 'Accountancy 12th',
        description: 'Core Subjects • Heavy Practice',
        batches: [
          { id: 'BAT-ACC-M1', name: 'ACC-12-M1 | 09:00 AM - 10:30 AM', seatsLeft: 8, seatsColor: 'text-emerald-500' }
        ]
      },
      {
        id: 'CRS-12-BST',
        name: 'Business Studies 12th',
        description: 'Core Subjects • Case Studies',
        batches: [
          { id: 'BAT-BST-M1', name: 'BST-12-M1 | 10:30 AM - 12:00 PM', seatsLeft: 14, seatsColor: 'text-emerald-500' }
        ]
      },
      {
        id: 'CRS-12-ECO',
        name: 'Economics 12th',
        description: 'Core Subjects • Macro & Micro',
        batches: [
          { id: 'BAT-ECO-M1', name: 'ECO-12-M1 | 12:00 PM - 01:30 PM', seatsLeft: 5, seatsColor: 'text-amber-500' }
        ]
      }
    ]
  },
  {
    id: 'CRS-WD',
    type: 'course',
    name: 'Web Development Course',
    fee: 5000,
    description: 'Full Stack JavaScript Frameworks',
    batches: [
      { id: 'BAT-WD-M1', name: 'BAT-WD-M1 | 10:00 AM - 11:30 AM', seatsLeft: 8, seatsColor: 'text-emerald-500' },
      { id: 'BAT-WD-E1', name: 'BAT-WD-E1 | 06:00 PM - 07:30 PM', seatsLeft: 22, seatsColor: 'text-emerald-500' }
    ]
  },
  {
    id: 'CRS-DM',
    type: 'course',
    name: 'Digital Marketing Course',
    fee: 4500,
    description: 'SEO, SEM, and Social Media Marketing',
    batches: [
      { id: 'BAT-DM-M1', name: 'BAT-DM-M1 | 09:00 AM - 10:30 AM', seatsLeft: 14, seatsColor: 'text-emerald-500' }
    ]
  },
  {
    id: 'SBJ-ENG',
    type: 'subject',
    name: 'English Core 12th',
    fee: 2500,
    description: 'Literature & Language Grammar',
    batches: [
      { id: 'BAT-ENG-M1', name: 'BAT-ENG-M1 | 11:30 AM - 01:00 PM', seatsLeft: 18, seatsColor: 'text-emerald-500' }
    ]
  },
  {
    id: 'SBJ-PED',
    type: 'subject',
    name: 'Physical Education 12th',
    fee: 2000,
    description: 'Health, Yoga, & Sports Science',
    batches: [
      { id: 'BAT-PED-M1', name: 'BAT-PED-M1 | 02:00 PM - 03:30 PM', seatsLeft: 29, seatsColor: 'text-emerald-500' }
    ]
  }
];

const TestRegistrationStep2 = () => {
  // State: items in the enrollment basket
  const [basket, setBasket] = useState([CATALOG[0]]);
  const [selectedItemIdToAdd, setSelectedItemIdToAdd] = useState('');
  const [overrideAmount, setOverrideAmount] = useState('');
  const [overrideReason, setOverrideReason] = useState('');

  // Installment schedule states
  const [installments, setInstallments] = useState([]);
  const [isManualPlan, setIsManualPlan] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);

  // Keep track of batch selection for all possible courses/subjects
  const [selectedBatches, setSelectedBatches] = useState(() => {
    const initial = {};
    CATALOG.forEach(item => {
      if (item.type === 'package') {
        item.courses.forEach(c => {
          initial[c.id] = c.batches[0]?.id || '';
        });
      } else {
        initial[item.id] = item.batches[0]?.id || '';
      }
    });
    return initial;
  }, []);

  const handleBatchChange = (id, batchId) => {
    setSelectedBatches(prev => ({ ...prev, [id]: batchId }));
  };

  // Add selected catalog item to basket
  const handleAddItemToBasket = () => {
    if (!selectedItemIdToAdd) return;
    const item = CATALOG.find(i => i.id === selectedItemIdToAdd);
    if (item && !basket.find(i => i.id === item.id)) {
      setBasket(prev => [...prev, item]);
    }
    setSelectedItemIdToAdd('');
  };

  // Remove item from basket
  const handleRemoveItemFromBasket = (id) => {
    setBasket(prev => prev.filter(item => item.id !== id));
  };

  // Pricing calculations
  const basePackageSum = useMemo(() => {
    return basket.reduce((sum, item) => sum + item.fee, 0);
  }, [basket]);

  const regFee = basket.length > 0 ? 500 : 0;
  const discountVal = Number(overrideAmount) || 0;
  const totalAmount = Math.max(0, basePackageSum + regFee - discountVal);

  // Helper to construct a default split date in YYYY-MM-DD
  const getDefaultDateStr = (monthsAhead = 0) => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthsAhead);
    return d.toISOString().split('T')[0];
  };

  // Effect to automatically calculate installments when total changes and user has not set a manual plan
  useEffect(() => {
    if (!isManualPlan) {
      const half = Math.round(totalAmount / 2);
      const remainder = totalAmount - half;
      setInstallments([
        { number: 1, label: 'Installment 1', amount: half, dueDate: getDefaultDateStr(0) },
        { number: 2, label: 'Installment 2', amount: remainder, dueDate: getDefaultDateStr(3) }
      ]);
    }
  }, [totalAmount, isManualPlan]);

  // Handle re-splitting the current total evenly across the current number of installments
  const handleAutoSplit = () => {
    if (installments.length === 0) return;
    const count = installments.length;
    const standardAmount = Math.floor(totalAmount / count);
    const remainder = totalAmount - (standardAmount * count);

    setInstallments(prev => 
      prev.map((inst, idx) => ({
        ...inst,
        amount: idx === 0 ? standardAmount + remainder : standardAmount
      }))
    );
  };

  // Handle modifications in edit mode
  const updateInstallmentField = (index, field, value) => {
    setInstallments(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setIsManualPlan(true);
  };

  // Add new installment to list
  const handleAddInstallment = () => {
    setInstallments(prev => [
      ...prev,
      {
        number: prev.length + 1,
        label: `Installment ${prev.length + 1}`,
        amount: 0,
        dueDate: getDefaultDateStr(prev.length * 2) // default to spacing out
      }
    ]);
    setIsManualPlan(true);
  };

  // Delete installment from list
  const handleDeleteInstallment = (index) => {
    setInstallments(prev => {
      const filtered = prev.filter((_, idx) => idx !== index);
      // Re-number labels sequentially
      return filtered.map((inst, idx) => ({
        ...inst,
        number: idx + 1,
        label: `Installment ${idx + 1}`
      }));
    });
    setIsManualPlan(true);
  };

  // Reset to auto-calculation (50/50 2-step plan)
  const handleResetToDefaultPlan = () => {
    setIsManualPlan(false);
    setIsEditingPlan(false);
  };

  // Checksum calculation to verify sum of installments matches the total amount
  const installmentChecksumSum = useMemo(() => {
    return installments.reduce((sum, inst) => sum + (Number(inst.amount) || 0), 0);
  }, [installments]);

  const isChecksumValid = installmentChecksumSum === totalAmount;

  // Filter out already added catalog items for the add selector
  const availableItemsToAdd = useMemo(() => {
    return CATALOG.filter(catItem => !basket.find(bItem => bItem.id === catItem.id));
  }, [basket]);

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 p-6 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-[1240px] space-y-6">
        
        {/* Step 1 Profile Summary Card */}
        <div className="bg-[#0f172a]/70 rounded-2xl p-6 border border-slate-800/80 shadow-md backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80"
                initials="RS"
                alt="Student Avatar"
                size="xl"
                variant="rounded"
                className="border-2 border-slate-700"
              />
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-indigo-500 text-[9px] font-black tracking-widest px-2 py-0.5 rounded-full text-white shadow border border-indigo-400">
                VERIFIED
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-bold text-white">Rahul Sharma</h2>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">STUDENT ID: STU-2024-0012</span>
              </div>
              
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="material-symbols-outlined text-sm text-slate-500">school</span>
                <span>Grade: 12th Standard</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mt-2 pt-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Multiple Enrollee
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1e293b] text-slate-300 border border-slate-700/50">
                  New Admission
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Section Selection & Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column - Enrollment Basket & Course Selection (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-white">Enrollment & Course Selection</h1>
              <p className="text-sm text-slate-400">Customize the curriculum and select preferred batches for the student.</p>
            </div>

            {/* Catalog Item Adder */}
            <div className="bg-[#0f172a]/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-0.5">ADD PACKAGE, COURSE, OR SUBJECT</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative bg-[#080c14] border border-slate-800 rounded-xl px-4 py-3 flex-1 flex items-center cursor-pointer hover:border-slate-700 transition-all">
                  <select
                    value={selectedItemIdToAdd}
                    onChange={(e) => setSelectedItemIdToAdd(e.target.value)}
                    className="w-full bg-transparent border-none text-sm text-slate-200 font-bold focus:ring-0 cursor-pointer pr-8 appearance-none"
                  >
                    <option value="" className="bg-[#080c14]">-- Select Catalog Item --</option>
                    
                    {/* Packages Group */}
                    {availableItemsToAdd.filter(i => i.type === 'package').length > 0 && (
                      <optgroup label="Packages" className="bg-[#080c14] text-slate-400 font-black">
                        {availableItemsToAdd.filter(i => i.type === 'package').map(pkg => (
                          <option key={pkg.id} value={pkg.id} className="text-slate-200 font-bold">
                            {pkg.name} (₹{pkg.fee.toLocaleString()})
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {/* Courses Group */}
                    {availableItemsToAdd.filter(i => i.type === 'course').length > 0 && (
                      <optgroup label="Standalone Courses" className="bg-[#080c14] text-slate-400 font-black">
                        {availableItemsToAdd.filter(i => i.type === 'course').map(crs => (
                          <option key={crs.id} value={crs.id} className="text-slate-200 font-bold">
                            {crs.name} (₹{crs.fee.toLocaleString()})
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {/* Subjects Group */}
                    {availableItemsToAdd.filter(i => i.type === 'subject').length > 0 && (
                      <optgroup label="Individual Subjects" className="bg-[#080c14] text-slate-400 font-black">
                        {availableItemsToAdd.filter(i => i.type === 'subject').map(sbj => (
                          <option key={sbj.id} value={sbj.id} className="text-slate-200 font-bold">
                            {sbj.name} (₹{sbj.fee.toLocaleString()})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                  <span className="material-symbols-outlined text-slate-500 absolute right-3 pointer-events-none">expand_more</span>
                </div>
                <button
                  onClick={handleAddItemToBasket}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 text-sm"
                >
                  Add to Cart
                </button>
              </div>
            </div>

            {/* Selected items in the Basket */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 pl-1">
                SELECTED ITEMS IN CART ({basket.length})
              </h3>
              
              {basket.length > 0 ? (
                <div className="space-y-6">
                  {basket.map((item) => (
                    <div 
                      key={item.id} 
                      className="bg-[#0f172a]/70 border border-slate-800/80 rounded-2xl p-6 space-y-4 hover:border-slate-800 transition-all shadow-md"
                    >
                      {/* Cart Item Header */}
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                            item.type === 'package' 
                              ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                              : item.type === 'course' 
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {item.type}
                          </span>
                          <h4 className="text-base font-black text-white">{item.name}</h4>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-black text-indigo-400">
                            ₹{item.fee.toLocaleString()}
                          </span>
                          <button 
                            onClick={() => handleRemoveItemFromBasket(item.id)}
                            className="p-1 hover:bg-rose-500/10 rounded-lg text-slate-500 hover:text-rose-400 transition-all"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Cart Item Body - Batch Allocations */}
                      {item.type === 'package' ? (
                        <div className="space-y-3.5 pl-2">
                          <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-500">REQUIRED COURSES FOR THIS PACKAGE</h5>
                          <div className="space-y-3">
                            {item.courses.map((course) => {
                              const currentBatchId = selectedBatches[course.id];
                              const currentBatch = course.batches.find(b => b.id === currentBatchId) || course.batches[0];

                              return (
                                <div key={course.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#080d15]/50 p-3.5 rounded-xl border border-slate-800/40">
                                  <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-slate-200">{course.name}</p>
                                    <p className="text-[10px] text-slate-500">{course.description}</p>
                                  </div>
                                  <div className="flex items-center gap-3 w-full sm:w-auto">
                                    {/* Batch selection dropdown */}
                                    <div className="relative bg-[#080c14] border border-slate-800 rounded-lg px-2.5 py-1.5 flex items-center min-w-[170px] cursor-pointer hover:border-slate-700 transition-all">
                                      <select
                                        value={currentBatchId}
                                        onChange={(e) => handleBatchChange(course.id, e.target.value)}
                                        className="w-full bg-transparent border-none text-[11px] text-slate-300 font-bold focus:ring-0 cursor-pointer pr-5 appearance-none"
                                      >
                                        {course.batches.map(batch => (
                                          <option key={batch.id} value={batch.id} className="bg-[#080c14] text-slate-300">
                                            {batch.name}
                                          </option>
                                        ))}
                                      </select>
                                      <span className="material-symbols-outlined text-slate-500 pointer-events-none absolute right-2 text-sm">expand_more</span>
                                    </div>
                                    {/* Seats count */}
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
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#080d15]/50 p-4 rounded-xl border border-[#1e293b]/40">
                          <div className="space-y-1">
                            <p className="text-xs text-slate-400">{item.description}</p>
                          </div>
                          
                          <div className="flex items-center gap-4 w-full sm:w-auto">
                            {/* Single batch selector */}
                            <div className="relative bg-[#080c14] border border-slate-800 rounded-lg px-3 py-2 flex items-center min-w-[200px] cursor-pointer hover:border-slate-700 transition-all">
                              <select
                                value={selectedBatches[item.id]}
                                onChange={(e) => handleBatchChange(item.id, e.target.value)}
                                className="w-full bg-transparent border-none text-xs text-slate-300 font-bold focus:ring-0 cursor-pointer pr-6 appearance-none"
                              >
                                {item.batches.map(batch => (
                                  <option key={batch.id} value={batch.id} className="bg-[#080c14] text-slate-300">
                                    {batch.name}
                                  </option>
                                ))}
                              </select>
                              <span className="material-symbols-outlined text-slate-500 pointer-events-none absolute right-2 text-base">expand_more</span>
                            </div>
                            
                            {/* Seats count */}
                            <div className="flex items-center gap-1 px-1">
                              <span className={`size-2 rounded-full bg-current ${item.batches[0]?.seatsColor || 'text-emerald-500'}`}></span>
                              <span className={`text-[10px] font-black uppercase tracking-wider ${item.batches[0]?.seatsColor || 'text-emerald-500'}`}>
                                {item.batches[0]?.seatsLeft} seats
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl bg-[#0f172a]/10">
                  <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">shopping_basket</span>
                  <p className="text-slate-400 text-sm font-semibold">Your enrollment basket is empty.</p>
                  <p className="text-slate-600 text-xs mt-1">Select an item above to add it to the enrollment checklist.</p>
                </div>
              )}
            </div>

          </div>

          {/* Right Column - Summary & Schedule (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Enrollment Summary Card */}
            <Card className="bg-[#0f172a]/70 p-6 border-slate-800/80 shadow-lg backdrop-blur-md flex flex-col gap-6">
              
              <div className="space-y-4">
                <h3 className="text-slate-300 text-xs font-black uppercase tracking-widest border-b border-slate-800 pb-3">
                  ENROLLMENT SUMMARY
                </h3>
                
                <div className="space-y-3.5 text-sm">
                  {basket.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-slate-400">
                      <span className="truncate max-w-[200px]">{item.name}</span>
                      <span className="font-semibold text-slate-200">₹{item.fee.toLocaleString()}</span>
                    </div>
                  ))}

                  {basket.length > 0 && <div className="border-t border-slate-800/40 my-2 pt-2"></div>}
                  
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Base Subtotal</span>
                    <span className="font-bold text-slate-200">₹{basePackageSum.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Registration Fee</span>
                    <span className="font-bold text-slate-200">₹{regFee.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Discount Applied</span>
                    <span className="font-semibold text-emerald-400">- ₹{discountVal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Manual Discount Override Section */}
              <div className="space-y-3.5 pt-2">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-0.5">
                  MANUAL DISCOUNT OVERRIDE
                </h4>
                
                <div className="space-y-3">
                  <TextInput
                    type="number"
                    value={overrideAmount}
                    onChange={(e) => setOverrideAmount(e.target.value)}
                    placeholder="Override Amount"
                    className="bg-[#080d1a] border-slate-800 focus:border-indigo-500 h-11 text-sm text-slate-100 placeholder-slate-600"
                  />
                  <TextInput
                    type="text"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Reason (e.g., Scholarship)"
                    className="bg-[#080d1a] border-slate-800 focus:border-indigo-500 h-11 text-sm text-slate-100 placeholder-slate-600"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-800 pt-5 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-400">Total Amount</span>
                <span className="text-2xl font-black text-indigo-400">₹{totalAmount.toLocaleString()}</span>
              </div>
            </Card>

            {/* Installment Schedule Card */}
            <Card className="bg-[#0f172a]/70 p-6 border-slate-800/80 shadow-lg backdrop-blur-md space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-slate-300 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-slate-400">calendar_month</span>
                  INSTALLMENT SCHEDULE
                </h3>
                
                {/* Edit Schedule Toggles */}
                <div className="flex gap-2">
                  {isEditingPlan ? (
                    <button 
                      onClick={() => setIsEditingPlan(false)}
                      className="text-[10px] font-black uppercase text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      Done
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setIsEditingPlan(true);
                        setIsManualPlan(true);
                      }}
                      className="text-[10px] font-black uppercase text-slate-400 hover:text-white transition-colors"
                    >
                      Edit Plan
                    </button>
                  )}
                </div>
              </div>

              {/* Checksum and helper buttons when in manual/edit mode */}
              {isManualPlan && (
                <div className="flex flex-col gap-2 bg-[#080c14]/40 p-3 rounded-xl border border-slate-800/50">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-400">Checksum Status:</span>
                    <span className={isChecksumValid ? 'text-emerald-400' : 'text-rose-400'}>
                      ₹{installmentChecksumSum.toLocaleString()} / ₹{totalAmount.toLocaleString()}
                    </span>
                  </div>
                  
                  {/* Warning message if checksum fails */}
                  {!isChecksumValid && (
                    <p className="text-[10px] text-rose-400 leading-tight">
                      Installments sum does not match total amount. Click "Auto-Split" below to rebalance.
                    </p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button 
                      onClick={handleAutoSplit}
                      className="flex-1 text-[9px] font-black uppercase tracking-wider py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded transition-all"
                    >
                      Auto-Split
                    </button>
                    <button 
                      onClick={handleResetToDefaultPlan}
                      className="flex-1 text-[9px] font-black uppercase tracking-wider py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-all"
                    >
                      Reset to Auto
                    </button>
                  </div>
                </div>
              )}

              <div className="relative pl-6 border-l border-slate-800 space-y-6 ml-2 py-1">
                {installments.map((inst, index) => (
                  <div key={index} className="relative">
                    {/* Timeline Node Dot */}
                    <div className="absolute -left-[30px] top-1.5 size-4 rounded-full bg-indigo-500 border-2 border-[#080d1a] flex items-center justify-center">
                      <div className="size-1.5 rounded-full bg-[#080d1a]"></div>
                    </div>

                    <div className="bg-[#080d18] border border-slate-800/50 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300">{inst.label}</span>
                        {isEditingPlan && (
                          <button 
                            onClick={() => handleDeleteInstallment(index)}
                            className="p-0.5 text-slate-600 hover:text-rose-400 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        )}
                      </div>

                      {isEditingPlan ? (
                        <div className="grid grid-cols-2 gap-2 mt-1">
                          {/* Amount Input */}
                          <div className="space-y-0.5">
                            <span className="text-[8px] font-black uppercase text-slate-500">Amount (₹)</span>
                            <input 
                              type="number"
                              value={inst.amount}
                              onChange={(e) => updateInstallmentField(index, 'amount', Number(e.target.value))}
                              className="w-full bg-[#080d1a] border border-slate-800 rounded px-2 py-1 text-xs text-white focus:ring-0 focus:border-indigo-500"
                            />
                          </div>
                          {/* Date Input */}
                          <div className="space-y-0.5">
                            <span className="text-[8px] font-black uppercase text-slate-500">Due Date</span>
                            <input 
                              type="date"
                              value={inst.dueDate}
                              onChange={(e) => updateInstallmentField(index, 'dueDate', e.target.value)}
                              className="w-full bg-[#080d1a] border border-slate-800 rounded px-2 py-1 text-xs text-white focus:ring-0 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white">₹{inst.amount.toLocaleString()}</h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                            {index === 0 ? 'Due on Enrollment' : `Due on ${new Date(inst.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add Installment Button in Edit Mode */}
                {isEditingPlan && (
                  <button 
                    onClick={handleAddInstallment}
                    className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl text-slate-500 hover:text-indigo-400 transition-all text-xs font-bold"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Add Installment Cycle
                  </button>
                )}
              </div>
            </Card>

            {/* CTA action block */}
            <div className="space-y-3 text-center">
              <button 
                disabled={isManualPlan && !isChecksumValid}
                className="w-full bg-[#d8b4fe] hover:bg-[#c084fc] disabled:bg-[#d8b4fe]/30 disabled:text-slate-600 disabled:cursor-not-allowed text-slate-950 font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10 active:scale-95 text-base"
              >
                <span>Confirm Enrollment</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
              <p className="text-[10px] text-slate-500 leading-relaxed px-4">
                By confirming, you agree to the Institution's financial terms and refund policy.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default TestRegistrationStep2;

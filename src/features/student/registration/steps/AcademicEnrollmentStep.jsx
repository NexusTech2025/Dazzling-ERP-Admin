import React, { useState, useMemo, useEffect } from 'react';
import { useBatchesQuery } from '../../../batch/hooks/useBatchQueries';

// V2 UI Components
import FormField from '../../../../components/ui/v2/FormField';
import TextInput from '../../../../components/ui/v2/TextInput';
import SelectInput from '../../../../components/ui/v2/SelectInput';
import SegmentedControl from '../../../../components/ui/v2/SegmentedControl';
import ToggleSwitch from '../../../../components/ui/v2/ToggleSwitch';

/**
 * AcademicEnrollmentStep: Merged Step 2 & 3.
 * Handles Program Configuration and Batch Selection in a 2-column layout.
 */
const AcademicEnrollmentStep = ({ formData, setFormData, onNext, onBack }) => {
  const { data: batches = [], isLoading: isBatchesLoading } = useBatchesQuery();
  const [searchQuery, setSearchQuery] = useState('');
  const [isBenefitsEnabled, setIsBenefitsEnabled] = useState(!!(formData.couponCode || formData.referralId));

  // 1. Calculate Scholarship based on Score (Simple Logic)
  useEffect(() => {
    const score = parseFloat(formData.entranceScore) || 0;
    let scholarship = 0;
    if (score >= 95) scholarship = 50;
    else if (score >= 90) scholarship = 30;
    else if (score >= 80) scholarship = 20;
    else if (score >= 70) scholarship = 10;
    
    if (formData.applicableScholarship !== scholarship) {
      setFormData(prev => ({ ...prev, applicableScholarship: scholarship }));
    }
  }, [formData.entranceScore]);

  // 2. Filter Batches based on Search and Program Type
  const filteredBatches = useMemo(() => {
    return batches.filter(batch => {
      const matchesSearch = batch.batch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           batch.course_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Additional logic: filter by program type if batch has metadata for it
      // For now, keeping it simple as per original EnrollmentStep
      return matchesSearch;
    });
  }, [batches, searchQuery]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectBatch = (batch) => {
    setFormData(prev => ({
      ...prev,
      batchId: batch.batch_id,
      batchName: batch.batch_name,
      courseId: batch.item_id,
      courseName: batch.course_name
    }));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in slide-in-from-right-4 duration-500 max-w-[1440px] mx-auto w-full">
      
      {/* Left Column: Program Configuration (40%) */}
      <div className="w-full lg:w-[40%] flex flex-col gap-6">
        
        {/* Program Selection */}
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 shadow-sm border border-primary/5">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-primary">category</span>
            <h2 className="text-lg font-bold">Program Selection</h2>
          </div>

          <SegmentedControl 
            value={formData.programType}
            onChange={(val) => handleChange('programType', val)}
            options={[
              { label: 'Academic Package', value: 'academic' },
              { label: 'Single Course', value: 'single' }
            ]}
            className="w-full"
            containerClassName="mb-6"
          />

          <FormField label="Admission Type" name="admissionType">
            <SelectInput 
              value={formData.admissionType}
              onChange={(val) => handleChange('admissionType', val)}
              options={[
                { label: 'Regular Enrollment', value: 'direct' },
                { label: 'Merit Based', value: 'merit' },
                { label: 'Entrance Exam', value: 'entrance' }
              ]}
              placeholder="Select Type"
            />
          </FormField>
        </div>

        {/* Scholarship Eligibility (Only if Entrance) */}
        {formData.admissionType === 'entrance' && (
          <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 animate-in zoom-in-95 duration-300">
            <h3 className="text-[11px] font-black text-primary uppercase tracking-widest mb-4">Scholarship Eligibility</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Entrance Score (%)">
                <TextInput 
                  type="number"
                  value={formData.entranceScore}
                  onChange={(e) => handleChange('entranceScore', e.target.value)}
                  placeholder="0-100"
                />
              </FormField>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-text-secondary pl-1">Applicable %</span>
                <div className="h-11 flex items-center px-4 bg-white dark:bg-slate-800 rounded-lg border border-primary/20">
                  <span className="text-xl font-black text-primary">{formData.applicableScholarship}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Apply Benefits */}
        <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 shadow-sm border border-primary/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">redeem</span>
              <h2 className="text-lg font-bold">Apply Benefits</h2>
            </div>
            <ToggleSwitch 
              checked={isBenefitsEnabled}
              onChange={setIsBenefitsEnabled}
              label={isBenefitsEnabled ? "Enabled" : "Disabled"}
            />
          </div>
          
          {isBenefitsEnabled && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <FormField label="Coupon Code">
                    <TextInput 
                      value={formData.couponCode}
                      onChange={(e) => handleChange('couponCode', e.target.value.toUpperCase())}
                      placeholder="ENTER CODE"
                      className="uppercase"
                    />
                  </FormField>
                </div>
                <button 
                  type="button"
                  className="h-11 px-4 bg-slate-900 dark:bg-slate-700 text-white rounded-lg font-bold text-xs hover:bg-primary transition-colors mb-0.5"
                >
                  Apply
                </button>
              </div>

              <FormField label="Referral ID">
                <TextInput 
                  value={formData.referralId}
                  onChange={(e) => handleChange('referralId', e.target.value)}
                  placeholder="Optional"
                />
              </FormField>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Batch Selection (60%) */}
      <div className="w-full lg:w-[60%] flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold">Select Active Batch</h2>
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 outline-none h-11 transition-all"
              placeholder="Search batches..."
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 max-h-[600px] custom-scrollbar">
          {isBatchesLoading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredBatches.map(batch => (
                <div 
                  key={batch.batch_id}
                  onClick={() => handleSelectBatch(batch)}
                  className={`
                    relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200
                    ${formData.batchId === batch.batch_id 
                      ? 'bg-white dark:bg-slate-800 border-primary shadow-lg shadow-primary/5' 
                      : 'bg-white/50 dark:bg-slate-900/50 border-transparent hover:border-primary/30 hover:bg-white'}
                  `}
                >
                  <div className="absolute top-4 right-4">
                    <span className={`material-symbols-outlined ${formData.batchId === batch.batch_id ? 'text-primary' : 'text-slate-300'}`}>
                      {formData.batchId === batch.batch_id ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className={`
                      h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg
                      ${formData.batchId === batch.batch_id ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}
                    `}>
                      {batch.course_name?.charAt(0) || 'B'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{batch.batch_name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{batch.course_name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Teacher</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{batch.teacher_name || 'Unassigned'}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-right">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Schedule</span>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{batch.schedule_time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 mt-auto">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 font-bold hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back
          </button>
          <button 
            disabled={!formData.batchId}
            onClick={onNext}
            className="flex items-center gap-2 px-10 py-2.5 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            Save & Continue
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcademicEnrollmentStep;

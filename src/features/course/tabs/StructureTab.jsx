import React, { memo } from 'react';

/**
 * StructureTab Component - Renders fee details and installments calculators.
 * Supports isMobile layout variant.
 */
export const StructureTab = ({ course = {}, isMobile = false }) => {
  const baseFee = Number(course.base_fee) || 0;
  const installmentCount = course.default_installment_count || 1;
  const estimatedInstallment = baseFee / installmentCount;

  return (
    <div className={`bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm space-y-6 animate-in fade-in duration-300 ${isMobile ? 'p-4' : 'p-6'}`}>
      <div className="border-b border-border-light dark:border-border-dark pb-4">
        <h3 className="font-bold text-text-main dark:text-white text-lg">Fee Breakdown & Configurations</h3>
        <p className="text-xs text-text-secondary mt-1">Below are the billing parameters configured for this course.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-4 bg-background-light dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark">
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Base Fee</p>
          <p className="text-2xl font-black text-text-main dark:text-white mt-1">₹{baseFee.toLocaleString()}</p>
          <p className="text-[10px] text-text-secondary mt-2">One-time / standard enrollment fee for this course.</p>
        </div>

        <div className="p-4 bg-background-light dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark">
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Installments Allowed</p>
          <p className="text-2xl font-black text-text-main dark:text-white mt-1">{installmentCount} Cycles</p>
          <p className="text-[10px] text-text-secondary mt-2">Default splits offered for student payments.</p>
        </div>

        <div className="p-4 bg-background-light dark:bg-background-dark rounded-xl border border-border-light dark:border-border-dark">
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-wider">Installment Amount</p>
          <p className="text-2xl font-black text-text-main dark:text-white mt-1">
            ₹{estimatedInstallment.toFixed(2).toLocaleString()}
          </p>
          <p className="text-[10px] text-text-secondary mt-2">Estimated base installment per cycle.</p>
        </div>
      </div>

      <div className="pt-4 border-t border-border-light dark:border-border-dark">
        <h4 className="text-xs font-bold text-text-main dark:text-white mb-3 uppercase tracking-wider">Additional Parameters</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
            <p className="text-[10px] text-text-secondary font-bold uppercase">Medium</p>
            <p className="font-bold text-text-main dark:text-white mt-0.5">{course.language_medium || 'English'}</p>
          </div>
          <div className="p-3 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
            <p className="text-[10px] text-text-secondary font-bold uppercase">Duration</p>
            <p className="font-bold text-text-main dark:text-white mt-0.5">
              {course.duration_value} {course.duration_unit || 'months'}
            </p>
          </div>
          <div className="p-3 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
            <p className="text-[10px] text-text-secondary font-bold uppercase">Entity Type</p>
            <p className="font-bold text-text-main dark:text-white mt-0.5 capitalize">{course.entity_type || 'course'}</p>
          </div>
          <div className="p-3 bg-background-light dark:bg-background-dark rounded-lg border border-border-light dark:border-border-dark">
            <p className="text-[10px] text-text-secondary font-bold uppercase">Short Code</p>
            <p className="font-bold text-text-main dark:text-white mt-0.5">{course.short_code || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(StructureTab);

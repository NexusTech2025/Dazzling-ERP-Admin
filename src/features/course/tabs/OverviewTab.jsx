import React, { useState, memo } from 'react';
import KpiCard from '../../../components/ui/v2/KpiCard';
import KpiGrid from '../../../components/ui/v2/KpiGrid';

/**
 * OverviewTab Component - Renders KPI metrics (Base Fee, Enrollment, Installments) and analytics charts.
 * Supports isMobile prop to render a condensed layout matching the design blueprint.
 */
export const OverviewTab = ({ 
  baseFee, 
  allocationsLength, 
  installmentCount, 
  isAllocationsLoading, 
  course = {}, 
  isMobile = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isMobile) {
    const estimatedInstallment = baseFee / installmentCount;

    return (
      <div className="space-y-4 animate-in fade-in duration-200 text-text-main dark:text-white">
        {/* Package/Course Details Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
          <h3 className="text-sm font-black mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-500 text-lg">featured_play_list</span>
            Course Details
          </h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="flex flex-col items-center">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl mb-1">
                <span className="material-symbols-outlined text-xl">calendar_today</span>
              </div>
              <p className="text-[9px] text-text-secondary font-bold uppercase">Duration</p>
              <p className="text-xs font-bold mt-0.5 whitespace-nowrap">
                {course.duration_value || 12} {course.duration_unit || 'm'}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-2 bg-green-50 dark:bg-green-950/40 text-green-600 rounded-xl mb-1">
                <span className="material-symbols-outlined text-xl">account_balance</span>
              </div>
              <p className="text-[9px] text-text-secondary font-bold uppercase">Board</p>
              <p className="text-xs font-bold mt-0.5">{course.metadata?.board || 'N/A'}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-xl mb-1">
                <span className="material-symbols-outlined text-xl">ads_click</span>
              </div>
              <p className="text-[9px] text-text-secondary font-bold uppercase">Class</p>
              <p className="text-xs font-bold mt-0.5">{course.metadata?.class || 'N/A'}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl mb-1">
                <span className="material-symbols-outlined text-xl">translate</span>
              </div>
              <p className="text-[9px] text-text-secondary font-bold uppercase">Medium</p>
              <p className="text-xs font-bold mt-0.5">{course.language_medium || 'English'}</p>
            </div>
          </div>
        </div>

        {/* Course Objectives with Progressive Disclosure */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
          <h3 className="text-sm font-black mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500 text-lg">track_changes</span>
            Course Objectives
          </h3>
          <p className={`text-xs text-text-secondary leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
            {course.description || "This subject course integrates core syllabus modules with mock tests, session homework, and expert mentoring sessions to ensure board preparation and competitive excellence."}
          </p>
          <button 
            type="button"
            onClick={() => setIsExpanded(!isExpanded)} 
            className="text-xs text-primary font-bold mt-2 flex items-center gap-1 focus:outline-none"
          >
            {isExpanded ? 'Read Less ▲' : 'Read More ▼'}
          </button>
        </div>

        {/* Perks Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
          <h3 className="text-sm font-black mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-500 text-lg">verified</span>
            Standard Features & Benefits
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {['Expert Faculty Lectures', 'Doubt Solving Panels', 'Weekly Evaluation Tests', 'Full Study Materials'].map((perk, idx) => (
              <div key={idx} className="flex items-center gap-2 py-1">
                <span className="material-symbols-outlined text-emerald-500 text-base font-bold">check_circle</span>
                <span className="text-text-main dark:text-slate-200 font-medium">{perk}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary Block */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
          <h3 className="text-sm font-black mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-500 text-lg">sell</span>
            Installment Breakdown
          </h3>
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-dashed border-border-light dark:border-border-dark">
            <div>
              <p className="text-[9px] font-bold text-text-secondary uppercase">Base Tuition Fee</p>
              <p className="text-xs font-bold text-text-main dark:text-white">₹{baseFee.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-bold text-text-secondary uppercase">Installment Splits</p>
              <p className="text-xs font-extrabold text-primary">{installmentCount} Payments</p>
            </div>
            <div className="text-right bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-100 dark:border-rose-900/50">
              <p className="text-[9px] font-bold text-rose-500 dark:text-rose-400 uppercase">Estimated Cycle Fee</p>
              <p className="text-base font-black text-rose-600 dark:text-rose-400">₹{estimatedInstallment.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop view layout
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* KPI Metric Row */}
      <KpiGrid cols={1} smCols={3} lgCols={3} gap={4}>
        <KpiCard
          label="Base Fee"
          value={baseFee}
          icon="payments"
          size="md"
          variant="info"
        />
        <KpiCard
          label="Enrollment"
          value={isAllocationsLoading ? 'Loading...' : `${allocationsLength} Students`}
          icon="group"
          size="md"
          variant="neutral"
          isCount
        />
        <KpiCard
          label="Installments"
          value={`${installmentCount} Cycles`}
          icon="event_repeat"
          size="md"
          variant="success"
          isCount
        />
      </KpiGrid>

      {/* Performance Analytics Placeholder */}
      <div className="bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm min-h-[300px] flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-5xl text-text-secondary/20 mb-4">analytics</span>
        <h3 className="text-lg font-bold text-text-main dark:text-white mb-2">Performance Analytics</h3>
        <p className="text-text-secondary text-sm max-w-sm">
          Detailed revenue and enrollment charts will be visualized here using historical course data.
        </p>
      </div>
    </div>
  );
};

export default memo(OverviewTab);

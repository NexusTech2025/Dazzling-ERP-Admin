import React, { useState, memo } from 'react';

/**
 * PackageOverviewTab Component - Renders package details, duration, objectives, perks, and pricing details.
 * Supports layout adaptation via the isMobile prop.
 */
export const PackageOverviewTab = ({ 
  pkg = {}, 
  aggregateValue = 0, 
  packageFee = 0, 
  savingsPercent = 0, 
  onEnroll, 
  isMobile = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isMobile) {
    const installmentCount = pkg.default_installment_count || 1;
    const estimatedInstallment = packageFee / installmentCount;

    return (
      <div className="space-y-4 animate-in fade-in duration-200 text-text-main dark:text-white">
        {/* Package details grid */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
          <h3 className="text-sm font-black mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-500 text-lg">featured_play_list</span>
            Package Details
          </h3>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="flex flex-col items-center">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl mb-1">
                <span className="material-symbols-outlined text-xl">calendar_today</span>
              </div>
              <p className="text-[9px] text-text-secondary font-bold uppercase">Duration</p>
              <p className="text-xs font-bold mt-0.5">{pkg.month} Months</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-2 bg-green-50 dark:bg-green-950/40 text-green-600 rounded-xl mb-1">
                <span className="material-symbols-outlined text-xl">account_balance</span>
              </div>
              <p className="text-[9px] text-text-secondary font-bold uppercase">Board</p>
              <p className="text-xs font-bold mt-0.5">{pkg.board || 'N/A'}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 rounded-xl mb-1">
                <span className="material-symbols-outlined text-xl">ads_click</span>
              </div>
              <p className="text-[9px] text-text-secondary font-bold uppercase">Class</p>
              <p className="text-xs font-bold mt-0.5">Class {pkg.target_class || 'N/A'}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl mb-1">
                <span className="material-symbols-outlined text-xl">menu_book</span>
              </div>
              <p className="text-[9px] text-text-secondary font-bold uppercase">Subjects</p>
              <p className="text-xs font-bold mt-0.5">{pkg.courses?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Objectives Description with Progressive Disclosure */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
          <h3 className="text-sm font-black mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500 text-lg">track_changes</span>
            Course Objectives
          </h3>
          <p className={`text-xs text-text-secondary leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
            {pkg.description || "This package integrates core disciplines with advanced foundations, ensuring students are over-prepared for academic transitions and board excellence."}
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
            Perks & Exclusive Benefits
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {pkg.perks?.length > 0 ? (
              pkg.perks.map((perk) => (
                <div key={perk.perk_id} className="flex items-center gap-2 py-1">
                  <span className="material-symbols-outlined text-emerald-500 text-base font-bold">check_circle</span>
                  <span className="text-text-main dark:text-slate-200 font-medium truncate" title={perk.perk_title}>
                    {perk.perk_title}
                  </span>
                </div>
              ))
            ) : (
              ['Study Material', 'Practice Tests', 'Doubt Sessions', 'Priority Support'].map((perk, idx) => (
                <div key={idx} className="flex items-center gap-2 py-1">
                  <span className="material-symbols-outlined text-emerald-500 text-base font-bold">check_circle</span>
                  <span className="text-text-main dark:text-slate-200 font-medium">{perk}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pricing Summary Block */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-border-light dark:border-border-dark shadow-sm">
          <h3 className="text-sm font-black mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-500 text-lg">sell</span>
            Pricing Summary
          </h3>
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-dashed border-border-light dark:border-border-dark">
            <div>
              <p className="text-[9px] font-bold text-text-secondary uppercase">Original Price</p>
              <p className="text-xs font-bold text-text-secondary line-through">₹{aggregateValue.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-bold text-text-secondary uppercase">Discount</p>
              <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">{savingsPercent}% OFF</p>
            </div>
            <div className="text-right bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 rounded-xl border border-rose-100 dark:border-rose-900/50">
              <p className="text-[9px] font-bold text-rose-500 dark:text-rose-400 uppercase">Package Fee</p>
              <p className="text-base font-black text-rose-600 dark:text-rose-400">₹{packageFee.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Desktop view layout
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-text-main dark:text-white">
      {/* Main Overview Column */}
      <div className="lg:col-span-2 space-y-10">
        {/* Summary Stats Bento Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Subjects', value: pkg.courses?.length || 0, icon: 'list_alt' },
            { label: 'Duration', value: `${pkg.month} Months`, icon: 'calendar_month' },
            { label: 'Target Class', value: `Class ${pkg.target_class}`, icon: 'school' },
            { label: 'Board', value: pkg.board, icon: 'menu_book' }
          ].map((stat, i) => (
            <div key={i} className="bg-background-light dark:bg-background-dark p-5 rounded-2xl border border-border-light dark:border-border-dark flex flex-col gap-1">
              <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-text-main dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Description Card */}
        <div className="space-y-4">
          <h3 className="text-lg font-black flex items-center gap-2">
            <span className="size-2 bg-primary rounded-full"></span>
            Course Objectives
          </h3>
          <div className="text-text-secondary leading-relaxed font-medium">
            <p>{pkg.description}</p>
            <p className="mt-4">This package integrates core disciplines with advanced foundations, ensuring students are over-prepared for academic transitions and board excellence.</p>
          </div>
        </div>

        {/* Perks & Benefits */}
        <div className="bg-primary/5 dark:bg-primary/10 rounded-3xl p-8 border border-primary/10">
          <h3 className="text-lg font-black text-primary mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined">auto_awesome</span>
            Perks & Exclusive Benefits
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pkg.perks?.length > 0 ? pkg.perks.map((perk) => (
              <div key={perk.perk_id} className="flex items-start gap-4 bg-white/60 dark:bg-slate-800/60 p-5 rounded-2xl border border-white dark:border-slate-700 shadow-sm">
                <span className="material-symbols-outlined text-primary fill-1" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <div>
                  <p className="font-black text-sm text-text-main dark:text-white">{perk.perk_title}</p>
                  <p className="text-xs text-text-secondary font-medium mt-1">{perk.perk_description}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-text-secondary italic">Standard institute support features included.</p>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Info Column */}
      <div className="space-y-8">
        {/* Pricing Card */}
        <div className="bg-text-main dark:bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden ring-1 ring-white/10">
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
          <p className="text-xs font-black text-primary mb-8 uppercase tracking-[0.2em]">Pricing Strategy</p>
          <div className="space-y-6 relative z-10">
            <div className="flex justify-between items-center opacity-60">
              <span className="text-xs font-bold uppercase">Individual Value</span>
              <span className="text-lg font-mono">₹{aggregateValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-end border-b border-white/10 pb-6">
              <span className="text-sm font-bold">Package Fee</span>
              <div className="text-right">
                <span className="text-4xl font-black text-white tracking-tighter">₹{packageFee.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-bold text-slate-400">Total Savings</span>
              <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                {savingsPercent}% OFF
              </span>
            </div>
          </div>
          <button 
            type="button"
            onClick={onEnroll}
            className="w-full mt-10 bg-primary py-4 rounded-2xl font-black text-white hover:bg-primary-dark transition-all shadow-lg shadow-primary/30 active:scale-95"
          >
            Enroll New Student
          </button>
        </div>

        {/* Quick Info Card */}
        <div className="bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark p-8 rounded-3xl shadow-sm">
          <h4 className="font-black text-xs uppercase tracking-widest text-text-secondary mb-6">Package Manager</h4>
          <div className="flex items-center gap-4 mb-8">
            <div className="size-12 rounded-2xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark flex items-center justify-center text-text-secondary">
              <span className="material-symbols-outlined text-2xl">person</span>
            </div>
            <div>
              <p className="text-sm font-black">Admin Coordinator</p>
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-tight">Academic Department</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs font-medium text-text-secondary">
              <span className="material-symbols-outlined text-base text-primary">mail</span>
              <span>support@dazzling.edu</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-text-secondary">
              <span className="material-symbols-outlined text-base text-primary">call</span>
              <span>+91 98765 43210</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(PackageOverviewTab);

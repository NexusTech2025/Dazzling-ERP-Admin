import React from 'react';
import { Link } from 'react-router-dom';

const PackageCard = ({ pkg, isSelected = false, onToggleSelect = null, isSelectionModeActive = false }) => {
  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-500 ${
      isSelected 
        ? 'border-primary ring-1 ring-primary/20 bg-primary/[0.02] dark:bg-primary/[0.01] shadow-lg' 
        : 'border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-sm hover:shadow-xl'
    }`}>
      {/* Visual Header */}
      <div className="h-28 w-full bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-6 flex items-start justify-between relative overflow-hidden">
        <div className="absolute -right-4 -top-4 size-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700"></div>

        {/* Dynamic Selection Overlay Icon / Checkbox */}
        <div className="relative z-10 flex items-center">
          {onToggleSelect && (
            <div className={`transition-all duration-200 ${isSelectionModeActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 absolute left-0 top-0'}`}>
              <input
                type="checkbox"
                className="size-6 rounded-lg border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary/20 cursor-pointer shadow-sm"
                checked={isSelected}
                onChange={onToggleSelect}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className={`rounded-xl bg-primary/10 p-2.5 text-primary border border-primary/20 backdrop-blur-sm transition-all duration-200 ${isSelectionModeActive ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-90'}`}>
            <span className="material-symbols-outlined font-black">inventory_2</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 z-10">
          <span className="rounded-full bg-rose-500 px-3 py-1 text-[10px] font-black text-white shadow-lg shadow-rose-500/20 uppercase tracking-widest animate-pulse">
            SAVE {pkg.discount_percent}%
          </span>
          <span className="text-[10px] font-black text-text-secondary dark:text-slate-400 uppercase tracking-widest font-mono bg-white/50 dark:bg-slate-800/50 px-2 py-0.5 rounded-lg border border-border-light dark:border-border-dark backdrop-blur-sm">
            {pkg.package_id}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 pt-2">
        <div className="mb-6">
          <h4 className="text-xl font-black text-text-main dark:text-white leading-tight mb-2 group-hover:text-primary transition-colors">
            {pkg.name}
          </h4>
          <p className="text-sm text-text-secondary font-medium line-clamp-2 italic mb-4">
            {pkg.description}
          </p>

          <div className="flex flex-wrap gap-2">
            {pkg.included_courses.map((course, idx) => (
              <span key={idx} className="inline-flex items-center px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-text-secondary border border-border-light dark:border-border-dark">
                {course}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-border-light dark:border-border-dark mb-6">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">calendar_month</span> Duration
            </span>
            <p className="text-sm font-black text-text-main dark:text-white">{pkg.month} Months</p>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest flex items-center justify-end gap-1">
              <span className="material-symbols-outlined text-xs">payments</span> Total Fee
            </span>
            <p className="text-sm font-black text-primary">₹{pkg.package_fee?.toLocaleString()}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto grid grid-cols-2 gap-3">
          <Link
            to={`/admin/packages/${pkg.package_id}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-border-light dark:border-border-dark bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-black text-text-secondary dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-lg">visibility</span>
            View
          </Link>
          <Link
            to={`/admin/packages/edit/${pkg.package_id}`}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary/10 px-3 py-2.5 text-xs font-black text-primary hover:bg-primary hover:text-white transition-all active:scale-95 shadow-lg shadow-primary/5 hover:shadow-primary/20"
          >
            <span className="material-symbols-outlined text-lg">edit</span>
            Edit
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;

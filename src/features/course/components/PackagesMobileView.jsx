import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ExpandableLowDensityCard from '../../../components/ui/v2/cards/ExpandableLowDensityCard';
import { Badge } from '../../../components/ui/v2/indicators';

const getPackageIcon = (name) => {
  const lower = name?.toLowerCase() || '';
  if (lower.includes('science') || lower.includes('phys') || lower.includes('chem') || lower.includes('bio')) {
    return {
      icon: 'science',
      colorClass: 'text-purple-400 bg-purple-500/10 border-purple-500/20 dark:bg-purple-500/15',
      textColorClass: 'text-purple-400 dark:text-purple-300'
    };
  }
  if (lower.includes('commerce') || lower.includes('business') || lower.includes('finance') || lower.includes('account')) {
    return {
      icon: 'account_balance',
      colorClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20 dark:bg-amber-500/15',
      textColorClass: 'text-amber-400 dark:text-amber-300'
    };
  }
  if (lower.includes('arts') || lower.includes('humanities') || lower.includes('social') || lower.includes('sociology') || lower.includes('history')) {
    return {
      icon: 'palette',
      colorClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20 dark:bg-rose-500/15',
      textColorClass: 'text-rose-400 dark:text-rose-300'
    };
  }
  if (lower.includes('literacy') || lower.includes('computer') || lower.includes('digital') || lower.includes('tech') || lower.includes('python') || lower.includes('code')) {
    return {
      icon: 'computer',
      colorClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 dark:bg-indigo-500/15',
      textColorClass: 'text-indigo-400 dark:text-indigo-300'
    };
  }
  return {
    icon: 'inventory_2',
    colorClass: 'text-slate-400 bg-slate-500/10 border-slate-500/20 dark:bg-slate-500/15',
    textColorClass: 'text-slate-400 dark:text-slate-400'
  };
};

/**
 * Renders a list of package cards optimized for mobile display with inline expandable bars.
 * @param {Object} props - Component properties.
 * @param {Array<Object>} props.packages - Filtered and sorted packages list.
 * @param {Object} props.selection - Selection control hook outputs.
 * @param {Array<string>} props.selection.selectedIds - List of checked row IDs.
 * @param {Function} props.selection.toggleSelect - Checkbox toggle callback.
 * @param {Function} props.onDelete - Deletion trigger callback.
 * @returns {React.JSX.Element} Low-density mobile-optimized package card list.
 */
export function PackagesMobileView({
  packages,
  selection,
  onDelete
}) {
  const navigate = useNavigate();
  const [expandedIds, setExpandedIds] = useState({});

  const toggleExpand = (e, id) => {
    e.stopPropagation();
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const selectedIds = selection?.selectedIds || [];
  const onSelectRow = selection?.toggleSelect;
  const isSelectionMode = selectedIds.length > 0;

  console.time('[Packages Mobile View] Render List');

  const content = (
    <div className="space-y-4">
      {packages.map((pkg) => {
        const isExpanded = !!expandedIds[pkg.package_id];
        const isChecked = selectedIds.includes(pkg.package_id);

        const name = pkg.name || 'Unnamed Package';
        const iconData = getPackageIcon(name);

        const boardVal = pkg.board;
        const classVal = pkg.target_class;
        const durationVal = pkg.month ? `${pkg.month} months` : '12 months';
        const coursesCount = pkg.courses?.length || 0;

        // Interactive avatar container that overlays checkbox when pressed or in selection mode
        const avatarSection = (
          <div 
            onClick={(e) => {
              if (onSelectRow) {
                e.stopPropagation();
                onSelectRow(pkg.package_id);
              }
            }}
            className="size-8 rounded-full flex-shrink-0 cursor-pointer relative flex items-center justify-center transition-all duration-200"
          >
            {isSelectionMode || isChecked ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full border-2 border-primary shadow-sm animate-in zoom-in duration-150">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onSelectRow && onSelectRow(pkg.package_id)}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded border-border-light dark:border-border-dark text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
              </div>
            ) : (
              <div className={`absolute inset-0 size-8 rounded-full ${iconData.colorClass} flex items-center justify-center transition-colors`}>
                <span className="material-symbols-outlined text-sm">{iconData.icon}</span>
              </div>
            )}
          </div>
        );

        const leftHeader = (
          <div className="flex items-center gap-3 min-w-0">
            {avatarSection}
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-text-main dark:text-white text-xs truncate">
                {name}
              </span>
              <div className="flex flex-wrap items-center gap-1 mt-0.5">
                {boardVal && (
                  <span className="flex-shrink-0 px-1 py-0.2 rounded text-[7.5px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    {boardVal}
                  </span>
                )}
                {classVal && (
                  <span className="flex-shrink-0 px-1 py-0.2 rounded text-[7.5px] font-black uppercase bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    Class {classVal}
                  </span>
                )}
                <span className="flex-shrink-0 px-1 py-0.2 rounded text-[7.5px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  {coursesCount} courses bundled
                </span>
              </div>
              <span className="text-[10px] text-text-secondary dark:text-on-surface-variant font-medium mt-0.5">
                {durationVal}
              </span>
            </div>
          </div>
        );

        const rightHeader = (
          <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
            <span className="font-mono text-[11px] font-black text-secondary">
              ₹{pkg.package_fee?.toLocaleString()}
            </span>
            {pkg.discount_percent > 0 && (
              <Badge
                variant="status"
                color="danger"
                content={`${pkg.discount_percent}% OFF`}
                size="sm"
                className="py-0 px-1 text-[8px] font-bold"
              />
            )}
          </div>
        );

        const expandedContent = (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-text-secondary dark:text-on-surface-variant text-[10px]">
              <div>
                <span className="font-bold block text-[8px] uppercase tracking-wider text-text-secondary/70">Package Identifier</span>
                <span className="font-semibold text-text-main dark:text-white font-mono">{pkg.package_id}</span>
              </div>
              <div>
                <span className="font-bold block text-[8px] uppercase tracking-wider text-text-secondary/70">Status</span>
                <span className="font-semibold text-text-main dark:text-white uppercase">{pkg.status || 'Active'}</span>
              </div>
              <div className="col-span-2">
                <span className="font-bold block text-[8px] uppercase tracking-wider text-text-secondary/70 mb-1">Included Courses</span>
                <div className="flex flex-wrap gap-1">
                  {pkg.courses && pkg.courses.length > 0 ? (
                    pkg.courses.map((c, index) => (
                      <span key={index} className="flex-shrink-0 px-1.5 py-0.5 rounded text-[8px] font-bold bg-primary/10 text-primary border border-primary/20">
                        {c.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-text-secondary font-medium">No courses bundled</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-light/50 dark:border-border-dark/50">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/packages/${pkg.package_id}`);
                }}
                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-text-main dark:text-white text-[10px] font-bold rounded transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">visibility</span>
                Details
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/admin/packages/edit/${pkg.package_id}`);
                }}
                className="px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold rounded transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">edit</span>
                Edit
              </button>
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(pkg.package_id, pkg.name);
                  }}
                  className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-bold rounded transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">delete</span>
                  Delete
                </button>
              )}
            </div>
          </>
        );

        return (
          <ExpandableLowDensityCard
            key={pkg.package_id}
            isChecked={isChecked}
            isExpanded={isExpanded}
            onToggleExpand={(e) => toggleExpand(e, pkg.package_id)}
            onCardClick={() => navigate(`/admin/packages/${pkg.package_id}`)}
            leftHeader={leftHeader}
            rightHeader={rightHeader}
            expandedContent={expandedContent}
          />
        );
      })}
    </div>
  );

  console.timeEnd('[Packages Mobile View] Render List');
  return content;
}

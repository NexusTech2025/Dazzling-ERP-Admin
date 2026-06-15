import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';
import { Tag } from '../../../components/ui/v2/indicators';
import MediumDensityCard from '../../../components/ui/v2/cards/MediumDensityCard';
import LowDensityCard from '../../../components/ui/v2/cards/LowDensityCard';

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

const PackageCardDesktopVariant = ({ pkg, isSelected, onToggleSelect, isSelectionModeActive, iconData, courseDisplayList }) => {
  return (
    <MediumDensityCard
      title={pkg.name}
      subtitle={`${pkg.target_class ? 'CLASS ' + pkg.target_class : 'K-12'} • ${pkg.board || 'STATE BOARD'}`}
      icon={
        <span className="material-symbols-outlined text-base leading-none">
          {iconData.icon}
        </span>
      }
      badgeText={
        <div className="flex items-center gap-2">
          {pkg.discount_percent > 0 && (
            <span className="rounded bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 text-[8px] font-black text-rose-400 uppercase tracking-wider">
              SAVE {pkg.discount_percent}%
            </span>
          )}
          <div className="flex items-center gap-1">
            <span className={`size-1.5 rounded-full ${pkg.status === 'active' ? 'bg-emerald-500' : pkg.status === 'draft' ? 'bg-amber-500' : 'bg-rose-500'
              }`} />
            <span className="text-[9px] font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider">
              {pkg.status || 'active'}
            </span>
          </div>
        </div>
      }
      badgeClass=""
      tags={[]}
      slotClasses={{
        container: `w-full hidden lg:flex  ${isSelected ? 'border-primary ring-1 ring-primary/20 bg-primary/[0.02] dark:bg-primary/[0.01]' : ''}`,
        avatar: `${iconData.colorClass} p-1.5`,
        title: 'group-hover:text-primary transition-colors text-sm font-bold',
        subtitle: `${iconData.textColorClass} font-bold text-[9px] uppercase tracking-widest font-mono mt-0.5`,
        body: 'hidden',
        footer: 'mt-0 w-full relative flex-1 flex flex-col'
      }}
    >
      <div className="flex flex-col justify-between flex-1">
        <div>
          {/* Divider 1 */}
          <hr className="border-border-light/10 dark:border-slate-800/80 my-2" />

          {/* Included Course Pills */}
          {courseDisplayList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 w-full my-2">
              {courseDisplayList.map((name, idx) => (
                <Tag
                  key={idx}
                  label={name}
                  color="primary"
                  variant="subtle"
                  size="sm"
                />
              ))}
            </div>
          )}

          {/* Description */}
          <p className="text-xs text-text-secondary font-medium line-clamp-2 mt-2">
            {pkg.description || 'No description provided.'}
          </p>
        </div>

        <div>
          {/* Divider 2 */}
          <hr className="border-border-light/10 dark:border-slate-800/80 my-3" />

          {/* Footer Section */}
          <div className="flex items-end justify-between w-full">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-black text-text-secondary dark:text-slate-400 uppercase tracking-widest font-mono">
                {pkg.month} MONTHS
              </span>
              <p className="text-base font-black text-text-main dark:text-white leading-none">
                ₹{pkg.package_fee?.toLocaleString()}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5">
              <Link
                to={`/admin/packages/${pkg.package_id}`}
                className="flex items-center justify-center p-1.5 rounded-xl border border-border-light dark:border-slate-800 bg-white dark:bg-slate-800 text-text-secondary dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-primary transition-all active:scale-95 shadow-sm"
                title="View Details"
              >
                <span className="material-symbols-outlined text-base leading-none">visibility</span>
              </Link>
              <Link
                to={`/admin/packages/edit/${pkg.package_id}`}
                className="flex items-center justify-center p-1.5 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all active:scale-95 shadow-md shadow-primary/5 hover:shadow-primary/20"
                title="Edit Package"
              >
                <span className="material-symbols-outlined text-base leading-none">edit</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Checkbox Overlay Floating */}
      {onToggleSelect && (
        <div className={`absolute left-3.5 top-3.5 z-20 transition-all duration-200 ${isSelectionModeActive ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'
          }`}>
          <input
            type="checkbox"
            className="size-4 rounded border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary/20 cursor-pointer shadow-sm"
            checked={isSelected}
            onChange={onToggleSelect}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </MediumDensityCard>
  );
};

const PackageCardMobileVariant = ({ pkg, isSelected, onToggleSelect, isSelectionModeActive, iconData }) => {
  const navigate = useNavigate();

  return (
    <LowDensityCard
      title={pkg.name}
      subtitle1={
        <span className={`text-[10px] font-bold uppercase ${iconData.textColorClass}`}>
          {pkg.target_class ? `Class ${pkg.target_class}` : 'K-12'} • {pkg.board || 'STATE BOARD'}
        </span>
      }
      subtitle2={
        <div className="flex items-center gap-1.5 mt-1">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/5 dark:bg-primary/[0.03] text-[8px] font-black text-primary border border-primary/10">
            {pkg.courses?.length || 0} Courses Bundled
          </span>
          {pkg.discount_percent > 0 && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-rose-500/10 text-[8px] font-black text-rose-400 border border-rose-500/10">
              {pkg.discount_percent}% OFF
            </span>
          )}
        </div>
      }
      icon={
        <span className="material-symbols-outlined text-base leading-none">
          {iconData.icon}
        </span>
      }
      bodyText={
        <div className="text-[10px] font-mono font-bold text-text-secondary dark:text-slate-400">
          {pkg.month} MONTHS | <span className="font-black text-text-main dark:text-white text-xs">₹{pkg.package_fee?.toLocaleString()}</span>
        </div>
      }
      actions={[
        {
          label: 'View',
          icon: 'visibility',
          onClick: () => navigate(`/admin/packages/${pkg.package_id}`),
          priority: 'secondary'
        },
        {
          label: 'Edit',
          icon: 'edit',
          onClick: () => navigate(`/admin/packages/edit/${pkg.package_id}`),
          priority: 'primary'
        }
      ]}
      slotClasses={{
        container: `w-full lg:hidden ${isSelected ? 'border-primary ring-1 ring-primary/20 bg-primary/[0.02] dark:bg-primary/[0.01]' : ''}`,
        avatar: `${iconData.colorClass} p-1.5 flex items-center justify-center`
      }}
    >
      {/* Mobile Checkbox Float overlay */}
      {onToggleSelect && isSelectionModeActive && (
        <div className="absolute left-2 top-2 z-20">
          <input
            type="checkbox"
            className="size-4 rounded border-slate-350 dark:border-slate-700 bg-white dark:bg-slate-800 text-primary focus:ring-primary/20 cursor-pointer shadow-sm"
            checked={isSelected}
            onChange={onToggleSelect}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </LowDensityCard>
  );
};

const PackageCard = ({ pkg, isSelected = false, onToggleSelect = null, isSelectionModeActive = false }) => {
  const iconData = getPackageIcon(pkg.name);
  const courseDisplayList = (pkg.courses || []).map(course => course.name);

  return (
    <>
      <PackageCardDesktopVariant
        pkg={pkg}
        isSelected={isSelected}
        onToggleSelect={onToggleSelect}
        isSelectionModeActive={isSelectionModeActive}
        iconData={iconData}
        courseDisplayList={courseDisplayList}
      />
      <PackageCardMobileVariant
        pkg={pkg}
        isSelected={isSelected}
        onToggleSelect={onToggleSelect}
        isSelectionModeActive={isSelectionModeActive}
        iconData={iconData}
      />
    </>
  );
};

export default PackageCard;

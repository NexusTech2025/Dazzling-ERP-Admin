import React from 'react';

/**
 * SlottedEntityCard component displaying structured details of a sub-entity with navigational triggers.
 * @param {Object} props - Component properties.
 * @param {string} props.icon - Material Symbol icon name.
 * @param {string} [props.iconColor="text-primary"] - Custom icon color Tailwind classes.
 * @param {string} props.title - Primary card title.
 * @param {string} props.subtitle - Secondary detail text.
 * @param {string} [props.metaText] - Additional metadata description line.
 * @param {React.ReactNode} [props.badge] - Optional status badge element.
 * @param {function} props.onClick - Navigation callback action.
 * @returns {React.ReactElement} Navigational list-style card element.
 */
export default function SlottedEntityCard({ icon, iconColor = 'text-primary', title, subtitle, metaText, badge, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors select-none group"
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Left Icon with subtle background wrapper */}
        <div className={`shrink-0 flex items-center justify-center size-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 ${iconColor}`}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>

        {/* Content stack */}
        <div className="space-y-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
              {title}
            </h4>
          </div>
          {subtitle && (
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 truncate">
              {subtitle}
            </p>
          )}
          {metaText && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              {metaText}
            </p>
          )}
        </div>
      </div>

      {/* Right chevron / Badge area */}
      <div className="flex items-center gap-2 shrink-0">
        {badge}
        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-lg">
          chevron_right
        </span>
      </div>
    </button>
  );
}

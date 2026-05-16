import React from 'react';

/**
 * TimelineItem: Individual event node for the Timeline component.
 */
export const TimelineItem = ({ 
  color = "bg-primary", 
  time, 
  title, 
  description,
  isLast = false 
}) => (
  <div className="relative group pb-8 last:pb-0">
    {/* Line connector - Improved visibility and centering */}
    {!isLast && (
      <div className="absolute left-[5.5px] top-4 bottom-0 w-[1px] bg-slate-200 dark:bg-slate-700 group-hover:bg-primary/30 transition-colors"></div>
    )}
    
    {/* Colored Dot */}
    <div className={`absolute left-0 top-1.5 h-3 w-3 rounded-full border-2 border-surface-light dark:border-surface-dark ${color} shadow-sm transition-transform group-hover:scale-125 z-10`}></div>
    
    {/* Content */}
    <div className="flex flex-col gap-1 pl-8">
      <span className="text-[10px] font-black text-text-secondary uppercase tracking-tighter">{time}</span>
      <p className="text-sm font-bold text-text-main dark:text-white leading-none">{title}</p>
      {description && (
        <p className="text-xs text-text-secondary leading-relaxed font-medium mt-1">
          {description}
        </p>
      )}
    </div>
  </div>
);

/**
 * Timeline: Foundational component for audit logs and histories.
 */
export const Timeline = ({ items = [], className = "" }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className={`relative ${className}`}>
      {items.map((item, index) => (
        <TimelineItem 
          key={index}
          {...item}
          isLast={index === items.length - 1}
        />
      ))}
    </div>
  );
};

import React from 'react';
import CardContainer from './CardContainer';
import Button from '../Button';
import { mergeSlotClasses } from './cardUtils';

const HighDensityCard = ({
  avatar,
  avatarText,
  icon,
  title,
  subtitle,
  idText,
  headerActions,
  metrics = [], // [{ label, value, colorClass }]
  description,
  checklist = [], // [{ label, checked, icon }]
  progress, // { value, max, label, colorClass } or percentage number
  footerActions = [], // [{ label, icon, onClick }]
  customFooter,
  className = '',
  slotClasses = {}
}) => {
  return (
    <CardContainer 
      hoverable={false} 
      density="high" 
      className={mergeSlotClasses("flex flex-col border border-border-light dark:border-border-dark", `${className} ${slotClasses.container || ''}`)}
    >
      {/* 1. Header Section */}
      <div className={mergeSlotClasses("p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/30 border-b border-border-light dark:border-border-dark flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", slotClasses.header)}>
        <div className="flex items-center gap-4 min-w-0">
          {avatar ? (
            <img 
              src={avatar} 
              alt={title} 
              className={`w-14 h-14 rounded-2xl object-cover bg-slate-100 dark:bg-slate-800 border border-border-light dark:border-border-dark flex-shrink-0 ${slotClasses.avatar || ''}`}
            />
          ) : avatarText ? (
            <div className={`w-14 h-14 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-lg flex-shrink-0 ${slotClasses.avatar || ''}`}>
              {avatarText}
            </div>
          ) : icon ? (
            <div className={`w-14 h-14 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-primary flex-shrink-0 ${slotClasses.avatar || ''}`}>
              {typeof icon === 'string' ? (
                <span className="material-symbols-outlined text-2xl">{icon}</span>
              ) : (
                icon
              )}
            </div>
          ) : null}

          <div className="min-w-0">
            <h3 className={`font-bold text-text-main dark:text-white text-lg tracking-tight truncate ${slotClasses.title || ''}`}>
              {title}
            </h3>
            <div className={mergeSlotClasses("flex items-center gap-2 flex-wrap mt-0.5 text-xs text-text-secondary dark:text-slate-400", slotClasses.subtitle)}>
              {subtitle && <span>{subtitle}</span>}
              {subtitle && idText && <span className="text-border-light dark:text-border-dark">•</span>}
              {idText && <span className="font-mono">{idText}</span>}
            </div>
          </div>
        </div>

        {headerActions && (
          <div className="flex items-center gap-2 flex-wrap sm:ml-auto">
            {headerActions}
          </div>
        )}
      </div>

      {/* 2. Body Section */}
      <div className={mergeSlotClasses("p-4 sm:p-6 space-y-5 flex-1", slotClasses.body)}>
        {/* Metrics Grid */}
        {metrics.length > 0 && (
          <div className={mergeSlotClasses("grid grid-cols-2 sm:grid-cols-3 gap-3", slotClasses.metricsGrid)}>
            {metrics.map((metric, idx) => (
              <div 
                key={idx} 
                className={mergeSlotClasses("bg-slate-50/80 dark:bg-slate-900/50 p-3 rounded-xl border border-border-light/40 dark:border-border-dark/40", slotClasses.metricItem)}
              >
                <p className="text-[10px] text-text-secondary dark:text-slate-400 font-bold uppercase tracking-wider mb-1">
                  {metric.label}
                </p>
                <p className={`font-semibold text-sm truncate ${metric.colorClass || 'text-text-main dark:text-white'}`}>
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Text Description */}
        {description && (
          <div className="space-y-2">
            <p className={`text-xs text-text-secondary dark:text-slate-400 leading-relaxed ${slotClasses.description || ''}`}>
              {description}
            </p>
          </div>
        )}

        {/* Checklist */}
        {checklist.length > 0 && (
          <ul className={mergeSlotClasses("space-y-2", slotClasses.checklist)}>
            {checklist.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2.5 text-xs text-text-main dark:text-white">
                <span className={`material-symbols-outlined text-sm ${
                  item.checked ? 'text-emerald-500' : 'text-primary'
                }`}>
                  {item.icon || (item.checked ? 'check_circle' : 'pending_actions')}
                </span>
                <span className="truncate">{item.label}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Progress bar */}
        {progress !== undefined && (
          <div className={mergeSlotClasses("pt-2", slotClasses.progress)}>
            {typeof progress === 'object' ? (
              <>
                <div className="flex justify-between items-end mb-1.5 text-xs">
                  <p className="text-text-secondary dark:text-slate-400 font-medium">
                    {progress.label || 'Progress'}
                  </p>
                  <p className={`font-mono font-bold ${progress.colorClass || 'text-primary'}`}>
                    {progress.value}
                  </p>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-border-light/20 dark:border-border-dark/20">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      progress.barColorClass || 'bg-primary'
                    }`} 
                    style={{ width: `${progress.percent || 0}%` }}
                  />
                </div>
              </>
            ) : (
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-border-light/20 dark:border-border-dark/20">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Footer Section */}
      {customFooter ? (
        customFooter
      ) : footerActions.length > 0 ? (
        <div className={mergeSlotClasses("p-3 bg-slate-50/50 dark:bg-slate-900/30 border-t border-border-light dark:border-border-dark grid grid-flow-col auto-cols-fr gap-2", slotClasses.footer)}>
          {footerActions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className="flex flex-col items-center justify-center py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group cursor-pointer active:scale-95 duration-100"
            >
              {action.icon && (
                <span className="material-symbols-outlined text-text-secondary dark:text-slate-400 group-hover:text-primary transition-colors text-lg">
                  {action.icon}
                </span>
              )}
              <span className="text-[10px] font-bold mt-1 text-text-secondary dark:text-slate-400 group-hover:text-primary transition-colors uppercase tracking-wider">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </CardContainer>
  );
};

export default HighDensityCard;

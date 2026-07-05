import React from 'react';
import CardContainer from './CardContainer';
import Button from '../Button';
import HorizontalStatMetrics from './HorizontalStatMetrics';
import { mergeSlotClasses } from './cardUtils';

const getPillClass = (variant) => {
  const maps = {
    primary: 'bg-primary/10 text-primary border border-primary/20',
    success: 'bg-secondary/10 text-emerald-500 border border-secondary/20',
    warning: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    error: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-text-secondary dark:text-slate-400 border border-border-light dark:border-border-dark',
  };
  return maps[variant] || maps.neutral;
};

const MediumDensityCard = ({
  icon,
  avatar,
  badgeText,
  badgeClass = 'bg-primary/10 text-primary border border-primary/20',
  title,
  subtitle,
  tags = [], // Can be strings or [{ label, variant }]
  metrics = [], // [{ label, value, colorClass }]
  metricsLayout = 'grid', // 'grid' | 'row'
  progress, // { value, max, label } or percentage number
  trend, // { value, direction: 'up' | 'down' | 'neutral' }
  headerAction,
  actionText,
  onAction,
  onClick,
  className = '',
  children,
  slotClasses = {} // New configuration prop
}) => {
  // Determine trend indicators
  const renderTrend = () => {
    if (!trend) return null;
    const { value, direction } = trend;
    const colorClass =
      direction === 'up' ? 'text-emerald-500' :
        direction === 'down' ? 'text-rose-500' : 'text-text-secondary dark:text-slate-400';
    const iconName =
      direction === 'up' ? 'trending_up' :
        direction === 'down' ? 'trending_down' : 'horizontal_rule';

    return (
      <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${colorClass}`}>
        <span className="material-symbols-outlined text-[12px]">{iconName}</span>
        {value}
      </span>
    );
  };

  return (
    <CardContainer
      onClick={onClick}
      density="medium"
      className={mergeSlotClasses("p-3.5 sm:p-5 flex flex-col justify-between min-h-[180px]", `${className} ${slotClasses.container || ''}`)}
    >
      {/* Header Row: Image & (Title, Subtitle) in horizontal alignment, Pills on the far right */}
      <div className={mergeSlotClasses("flex justify-between items-start gap-3 w-full", slotClasses.header)}>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {avatar ? (
            <img
              src={avatar}
              alt={title}
              className={`w-10 h-10 rounded-full object-cover bg-slate-100 dark:bg-slate-800 border border-border-light dark:border-border-dark flex-shrink-0 ${slotClasses.avatar || ''}`}
            />
          ) : icon ? (
            <div className={`p-2 bg-primary/10 rounded-lg text-primary border border-primary/15 flex items-center justify-center flex-shrink-0 ${slotClasses.avatar || ''}`}>
              {typeof icon === 'string' ? (
                <span className="material-symbols-outlined text-xl">{icon}</span>
              ) : (
                icon
              )}
            </div>
          ) : null}

          <div className="min-w-0 flex-1">
            <h3 className={`font-bold text-text-main dark:text-white leading-snug text-sm truncate ${slotClasses.title || ''}`}>
              {title}
            </h3>
            {subtitle && (
              <p className={`text-xs text-text-secondary dark:text-slate-400 mt-0.5 truncate ${slotClasses.subtitle || ''}`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 max-w-[45%]">
          {renderTrend()}
          {badgeText && (
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider truncate ${slotClasses.badge || badgeClass}`}>
              {badgeText}
            </span>
          )}
          {headerAction && (
            <div className="flex-shrink-0">
              {headerAction}
            </div>
          )}
        </div>
      </div>

      {/* Body Area (Tags, Metrics, Progress grouped) */}
      {(tags.length > 0 || metrics.length > 0 || progress !== undefined) && (
        <div className={mergeSlotClasses("flex flex-col flex-1 w-full mt-3", slotClasses.body)}>
          {/* Tags / Colorful Pills */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 w-full">
              {tags.map((tag, idx) => {
                const isObject = typeof tag === 'object';
                const label = isObject ? tag.label : tag;
                const customClass = isObject
                  ? getPillClass(tag.variant)
                  : 'bg-slate-100 dark:bg-slate-800 border border-border-light dark:border-border-dark text-text-secondary dark:text-slate-400';

                return (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${customClass}`}
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          )}

          {/* Metrics Grid or Row */}
          {metrics.length > 0 && (
            metricsLayout === 'row' ? (
              <div className="py-2 border-t border-b border-border-light/20 dark:border-border-dark/20 my-1 w-full shrink-0">
                <HorizontalStatMetrics items={metrics} columns={metrics.length} allowWrap={true} />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 py-2 border-t border-b border-border-light/20 dark:border-border-dark/20 my-1 w-full shrink-0">
                {metrics.map((metric, idx) => (
                  <div key={idx} className="min-w-0">
                    <p className="text-[9px] font-black text-text-secondary dark:text-slate-400 uppercase tracking-wider">
                      {metric.label}
                    </p>
                    <p className={`text-xs font-bold truncate mt-0.5 ${metric.colorClass || 'text-text-main dark:text-white'}`}>
                      {metric.value}
                    </p>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Progress Bar */}
          {progress !== undefined && (
            <div className="w-full">
              {typeof progress === 'object' ? (
                <>
                  <div className="flex justify-between text-[10px] text-text-secondary dark:text-slate-400 mb-1 font-medium">
                    <span>{progress.label || 'Progress'}</span>
                    <span>{progress.value}/{progress.max}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-border-light/20 dark:border-border-dark/20">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (progress.value / progress.max) * 100)}%` }}
                    />
                  </div>
                </>
              ) : (
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-border-light/20 dark:border-border-dark/20">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom Action Button or custom footer children */}
      {(children || actionText) && (
        <div className={mergeSlotClasses("mt-4 w-full", slotClasses.footer)}>
          {children ? (
            children
          ) : (
            <Button
              variant={onAction ? "contained" : "outlined"}
              size="sm"
              className="w-full text-xs font-semibold py-1.5"
              onClick={(e) => {
                if (onAction) {
                  e.stopPropagation();
                  onAction(e);
                }
              }}
            >
              {actionText}
            </Button>
          )}
        </div>
      )}
    </CardContainer>
  );
};

export default MediumDensityCard;

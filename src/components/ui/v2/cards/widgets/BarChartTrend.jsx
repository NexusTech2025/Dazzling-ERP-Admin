import React from 'react';
import CardContainer from '../CardContainer';

const BarChartTrend = ({
  title,
  trendBadge, // e.g. "+18%"
  data = [], // Array of numbers from 0 to 100 for height percent
  labels = [], // ['Start', 'End']
  tooltips = [], // ['Jan: 42', ...]
  className = ''
}) => {
  return (
    <CardContainer density="medium" className={`p-5 flex flex-col justify-between ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h5 className="text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider">
          {title}
        </h5>
        {trendBadge && (
          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/20">
            {trendBadge}
          </span>
        )}
      </div>

      {/* Bar Columns Container */}
      <div className="h-24 flex items-end gap-2 w-full px-1">
        {data.map((value, idx) => {
          const tooltip = tooltips[idx] || `${value}%`;
          const isLast = idx === data.length - 1;
          const bgClass = isLast 
            ? 'bg-primary shadow-[0_0_12px_rgba(19,127,236,0.3)]' 
            : 'bg-primary/20 hover:bg-primary/40 dark:bg-primary/10 dark:hover:bg-primary/30';

          return (
            <div 
              key={idx} 
              className={`flex-1 ${bgClass} rounded-t-md transition-all duration-300 cursor-help relative group`}
              style={{ height: `${Math.max(10, Math.min(100, value))}%` }}
              title={tooltip}
            >
              {/* Tooltip Hover Bubble */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 border border-slate-700">
                {tooltip}
              </div>
            </div>
          );
        })}
      </div>

      {/* Axis Labels */}
      {labels.length > 0 && (
        <div className="flex justify-between mt-3 text-[9px] text-text-secondary dark:text-slate-500 uppercase font-black tracking-wider">
          <span>{labels[0]}</span>
          <span>{labels[1]}</span>
        </div>
      )}
    </CardContainer>
  );
};

export default BarChartTrend;

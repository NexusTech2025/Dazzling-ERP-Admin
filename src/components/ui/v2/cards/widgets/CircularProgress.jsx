import React from 'react';
import CardContainer from '../CardContainer';

const CircularProgress = ({
  title,
  percent = 0,
  subtitle = 'Allocated',
  metrics = [], // [{ label, value }]
  className = ''
}) => {
  // SVG circular properties
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <CardContainer density="medium" className={`p-5 flex flex-col justify-between ${className}`}>
      {/* Title */}
      <div className="flex justify-between items-center mb-2">
        <h5 className="text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider">
          {title}
        </h5>
        <span className="material-symbols-outlined text-text-secondary dark:text-slate-500 cursor-pointer">
          more_horiz
        </span>
      </div>

      {/* SVG Radial Gauge */}
      <div className="flex justify-center py-4 relative">
        <svg className="w-28 h-28 transform -rotate-90">
          {/* Background track circle */}
          <circle 
            className="text-slate-100 dark:text-slate-800" 
            cx="56" 
            cy="56" 
            fill="transparent" 
            r={radius} 
            stroke="currentColor" 
            strokeWidth={strokeWidth} 
          />
          {/* Active progress circle */}
          <circle 
            className="text-primary transition-all duration-500 ease-out" 
            cx="56" 
            cy="56" 
            fill="transparent" 
            r={radius} 
            stroke="currentColor" 
            strokeWidth={strokeWidth} 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black text-text-main dark:text-white">
            {percent}%
          </span>
          <span className="text-[9px] text-text-secondary dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">
            {subtitle}
          </span>
        </div>
      </div>

      {/* Metric details */}
      {metrics.length > 0 && (
        <div className="mt-2 space-y-2 border-t border-border-light/40 dark:border-border-dark/40 pt-3">
          {metrics.map((metric, idx) => (
            <div key={idx} className="flex justify-between text-xs font-medium">
              <span className="text-text-secondary dark:text-slate-400">{metric.label}</span>
              <span className="font-mono text-text-main dark:text-white font-bold">{metric.value}</span>
            </div>
          ))}
        </div>
      )}
    </CardContainer>
  );
};

export default CircularProgress;

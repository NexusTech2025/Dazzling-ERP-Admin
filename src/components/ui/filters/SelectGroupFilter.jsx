import React from 'react';

/**
 * Reusable Styled Select Group Filter
 * @param {string} label - Uppercase tracking label
 * @param {any} value - Current selected value
 * @param {function} onChange - Returns the event or value
 * @param {Array} options - Array of { label, value } or strings/numbers
 * @param {string} defaultLabel - Label for the empty/all option
 */
const SelectGroupFilter = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  defaultLabel = "ALL" 
}) => {
  return (
    <div className="flex items-center gap-1.5 p-1 px-2 bg-primary/5 border border-primary/10 rounded-xl w-fit h-[28px] transition-all hover:border-primary/30">
      {label && <span className="text-[9px] font-extrabold text-primary uppercase tracking-wider pl-1.5 pr-0.5">{label}:</span>}
      <div className="relative">
        <select 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent border-none py-0 pl-1 pr-6 text-[9px] font-bold text-primary outline-none cursor-pointer appearance-none h-full"
          style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23137fec\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', 
            backgroundRepeat: 'no-repeat', 
            backgroundPosition: 'right center', 
            backgroundSize: '10px' 
          }}
        >
          <option value="">{defaultLabel.toUpperCase()}</option>
          {options.map((opt) => {
            const isObj = typeof opt === 'object';
            const val = isObj ? opt.value : opt;
            const lbl = isObj ? opt.label : String(opt).toUpperCase();
            return (
              <option key={val} value={val}>{lbl}</option>
            );
          })}
        </select>
      </div>
    </div>
  );
};

export default SelectGroupFilter;

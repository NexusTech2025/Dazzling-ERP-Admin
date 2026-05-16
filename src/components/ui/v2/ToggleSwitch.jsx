import React from 'react';

/**
 * ToggleSwitch: A modern toggle switch for boolean states.
 */
const ToggleSwitch = ({
  label,
  checked,
  onChange,
  name,
  disabled = false,
  className = ""
}) => {
  return (
    <label className={`relative inline-flex items-center cursor-pointer group ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input 
        type="checkbox" 
        name={name}
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        className="sr-only peer" 
        disabled={disabled}
      />
      <div className="
        w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer 
        peer-checked:after:translate-x-full peer-checked:after:border-white 
        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
        after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 
        after:transition-all peer-checked:bg-primary transition-colors
      "></div>
      {label && (
        <span className="ml-3 text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-text-main dark:group-hover:text-white transition-colors">
          {label}
        </span>
      )}
    </label>
  );
};

export default ToggleSwitch;

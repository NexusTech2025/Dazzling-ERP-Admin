import React from 'react';
import PropTypes from 'prop-types';

/**
 * StateSelector: A scalable, data-driven toggle button group.
 * Works for any N number of states.
 */
const StateSelector = React.memo(({ options, value, onChange }) => {
  return (
    <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-100 dark:bg-black/30 border border-border-light dark:border-white/5 rounded-xl w-fit mx-auto">
      {options.map((opt) => {
        const isActive = value === opt.value;
        
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`
              px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer 
              ${isActive 
                ? `${opt.activeClass} shadow-md scale-105` 
                : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/5'
              }
            `}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
});

StateSelector.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    activeClass: PropTypes.string.isRequired,
  })).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

StateSelector.displayName = 'StateSelector';

export default StateSelector;

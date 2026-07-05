import React from 'react';
import Button from './Button';

/**
 * Shared ActionFooter for mobile detail views.
 * Renders a sticky bottom layout action bar.
 * 
 * @component
 * @param {Object} props - Component properties.
 * @param {Array<Object>} props.actions - Actions to render.
 * @param {string} props.actions[].label - Button text label.
 * @param {string} [props.actions[].icon] - Material Symbol icon name.
 * @param {Function} props.actions[].onClick - Trigger callback.
 * @param {string} [props.actions[].variant="contained"] - Button variant (contained | outlined | danger | success).
 * @param {boolean} [props.actions[].disabled=false] - Button disabled state.
 * @param {boolean} [props.actions[].loading=false] - Button loading state.
 * @param {string} [props.className=""] - Optional class override.
 */
export const ActionFooter = ({ actions = [], className = '' }) => {
  if (actions.length === 0) return null;

  return (
    <div 
      className={`
        w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md 
        border-t border-border-light dark:border-border-dark 
        p-3.5 flex gap-3 shadow-lg justify-between items-center z-50
        ${className}
      `}
    >
      {actions.map((action, idx) => {
        // Map variants appropriately: default 'contained' if not specified
        const btnVariant = action.variant || 'contained';

        return (
          <Button
            key={idx}
            onClick={action.onClick}
            variant={btnVariant}
            startIcon={action.icon}
            disabled={action.disabled}
            loading={action.loading}
            className="flex-1 text-xs py-2 px-3 h-10 font-bold uppercase tracking-wider justify-center"
          >
            {action.label}
          </Button>
        );
      })}
    </div>
  );
};

export default ActionFooter;

import React from 'react';

/**
 * Styles Dictionary Configuration
 * Isolates layout and conditional theme definitions from the JSX structure.
 */
const tabStyles = {
  base: "px-5 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap cursor-pointer",
  active: "bg-primary text-white shadow-lg shadow-primary/20",
  inactive: "text-text-secondary hover:text-text-main hover:bg-slate-50 dark:hover:bg-slate-800"
};

const groupStyles = {
  container: "flex items-center gap-1.5 p-1 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl w-fit"
};

/**
 * TabButton Component
 * Renders an individual button representing a single tab target.
 * 
 * @param {object} props
 * @param {boolean} props.active - Active focus state
 * @param {string} [props.icon] - Optional material symbol icon name
 * @param {function} props.onClick - Focus callback handler
 * @param {React.ReactNode} props.children - Text label or content node
 */
export const TabButton = ({ active, icon, onClick, children }) => {
  const buttonClasses = `${tabStyles.base} ${active ? tabStyles.active : tabStyles.inactive}`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={buttonClasses}
    >
      {icon && <span className="material-symbols-outlined text-base">{icon}</span>}
      {children}
    </button>
  );
};

/**
 * TabGroup Component
 * Wrapper shell container matching modern dark-mode slate theme.
 * 
 * @param {object} props
 * @param {React.ReactNode} props.children - Nested TabButton components
 */
export const TabGroup = ({ children }) => {
  return (
    <div className={groupStyles.container}>
      {children}
    </div>
  );
};

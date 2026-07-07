import React from 'react';

/**
 * IconButton (Core V2): Lightweight wrapper for Material Symbol icons.
 * 
 * @param {Object} props - React props.
 * @param {string} props.icon - Material Symbols icon name.
 * @param {function} props.onClick - Click event callback.
 * @param {string} [props.type="button"] - Button element type.
 * @param {string} [props.className=""] - Optional custom styles.
 * @param {boolean} [props.disabled=false] - Disabled state constraint.
 * @param {string} [props.title] - Optional accessibility/hover tooltip.
 * @returns {React.ReactElement} Rounded button container element.
 */
const IconButton = ({
  icon,
  onClick,
  type = 'button',
  className = '',
  disabled = false,
  title,
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`size-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-text-secondary hover:text-text-main dark:hover:text-white transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-95 ${className}`}
      {...props}
    >
      <span className="material-symbols-outlined text-lg leading-none">{icon}</span>
    </button>
  );
};

export default IconButton;

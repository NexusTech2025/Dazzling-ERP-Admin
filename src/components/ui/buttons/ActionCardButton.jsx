import React from 'react';

/**
 * ActionCardButton - A reusable card-style button for empty states and grid additions.
 * @param {string} variant - 'dashed' (default) | 'solid' | 'ghost' | 'tinted'
 * @param {string} layout - 'centered' (wide) | 'grid' (card) | 'row' (horizontal)
 * @param {string} label - Primary button text
 * @param {string} description - Optional sub-text
 * @param {string} icon - Material symbol name
 * @param {function} onClick - Click handler
 */
const ActionCardButton = ({
  variant = 'dashed',
  layout = 'centered',
  label = 'Add Item',
  description = '',
  icon = 'add',
  onClick,
  className = ''
}) => {
  
  const getContainerStyles = () => {
    const base = "w-full transition-all group overflow-hidden flex ";
    
    // Layout Logic
    let layoutStyle = "";
    if (layout === 'centered') layoutStyle = "flex-col items-center justify-center py-10 px-6 text-center ";
    if (layout === 'grid') layoutStyle = "flex-col items-center justify-center p-4 min-h-[140px] text-center ";
    if (layout === 'row') layoutStyle = "flex-row items-center gap-4 p-4 text-left ";

    // Variant Logic
    let variantStyle = "";
    switch (variant) {
      case 'dashed':
        variantStyle = "border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary/50 hover:bg-primary/5 text-slate-500 hover:text-primary rounded-2xl ";
        break;
      case 'solid':
        variantStyle = "border border-slate-200 dark:border-slate-800 hover:border-primary bg-white dark:bg-slate-900 shadow-sm hover:shadow-md text-slate-600 hover:text-primary rounded-xl ";
        break;
      case 'tinted':
        variantStyle = "bg-primary/5 border border-primary/10 hover:bg-primary/10 text-primary rounded-xl ";
        break;
      case 'ghost':
        variantStyle = "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl ";
        break;
      default:
        variantStyle = "border border-slate-200 rounded-xl ";
    }

    return base + layoutStyle + variantStyle + className;
  };

  const iconContainerSize = layout === 'centered' ? 'size-12' : 'size-10';
  const iconSize = layout === 'centered' ? 'text-2xl' : 'text-xl';

  return (
    <button type="button" onClick={onClick} className={getContainerStyles()}>
      <div className={`${iconContainerSize} rounded-full flex items-center justify-center transition-colors ${
        variant === 'tinted' ? 'bg-primary/20' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/10'
      }`}>
        <span className={`material-symbols-outlined ${iconSize} group-hover:scale-110 transition-transform`}>
          {icon}
        </span>
      </div>
      
      <div className={layout === 'row' ? 'flex-1' : 'mt-3'}>
        <span className="block text-sm font-bold">{label}</span>
        {description && (
          <p className={`text-[11px] font-medium mt-1 leading-relaxed ${
            layout === 'centered' ? 'max-w-[260px] mx-auto' : ''
          } opacity-70`}>
            {description}
          </p>
        )}
      </div>
    </button>
  );
};

export default ActionCardButton;

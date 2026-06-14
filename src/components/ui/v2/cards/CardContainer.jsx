import React from 'react';

const CardContainer = ({ 
  children, 
  className = '', 
  onClick, 
  hoverable = true,
  density = 'medium',
  overflowVisible = false
}) => {
  const roundedClass = density === 'low' ? 'rounded-xl' : 'rounded-2xl';
  const overflowClass = overflowVisible ? 'overflow-visible' : 'overflow-hidden';
  const hoverClass = hoverable && onClick 
    ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:border-primary/40 active:scale-[0.99] duration-200' 
    : hoverable 
      ? 'hover:border-primary/20 duration-200'
      : '';

  return (
    <div 
      onClick={onClick}
      className={`
        bg-surface-light dark:bg-surface-dark 
        border border-border-light dark:border-border-dark 
        shadow-sm transition-all ${overflowClass}
        ${roundedClass} ${hoverClass} ${className}
        @container
      `}
    >
      {children}
    </div>
  );
};

export default CardContainer;

import React from 'react';

const Card = ({ children, className = '', variant = 'default', onClick }) => {
  const variants = {
    default: 'bg-surface-light dark:bg-surface-dark border-border-light dark:border-border-dark',
    primary: 'bg-primary/5 border-primary/20',
    background: 'bg-background-light dark:bg-background-dark border-border-light dark:border-border-dark',
  };

  return (
    <div 
      onClick={onClick}
      className={`rounded-xl border shadow-sm transition-all ${variants[variant]} ${onClick ? 'cursor-pointer hover:shadow-md' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

Card.Header = ({ children, className = '', border = true }) => (
  <div className={`px-6 py-4 ${border ? 'border-b border-border-light dark:border-border-dark' : ''} ${className}`}>
    {children}
  </div>
);

Card.Body = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '', bg = false }) => (
  <div className={`px-6 py-4 rounded-b-xl ${bg ? 'bg-slate-50 dark:bg-slate-800/50' : ''} ${className}`}>
    {children}
  </div>
);

export default Card;

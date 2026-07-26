import React, { useEffect } from 'react';

/**
 * Domain-agnostic abstract base Modal container built using the Composition Component Pattern.
 * Provides backdrop portal rendering, keyboard escape dismissal, and theme-compliant dark mode styling.
 *
 * @param {Object} props - Component properties.
 * @param {boolean} props.isOpen - Controls portal visibility.
 * @param {Function} props.onClose - Modal dismissal handler.
 * @param {('sm'|'md'|'lg'|'xl'|'2xl'|'full')} [props.size='md'] - Max width layout constraint.
 * @param {React.ReactNode} props.children - Compound subcomponents (Header, Body, Footer).
 * @param {string} [props.className] - Container style overrides.
 * @returns {React.JSX.Element|null} Rendered backdrop portal.
 */
export function Modal({ isOpen, onClose, size = 'md', children, className = '' }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-5xl'
  }[size] || 'max-w-md';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-150 overflow-y-auto">
      <div className={`bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full ${maxWidthClass} overflow-hidden flex flex-col ${className}`}>
        {children}
      </div>
    </div>
  );
}

/**
 * Modal.Header Sub-Component
 */
Modal.Header = function ModalHeader({
  title,
  subtitle,
  icon,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  onClose
}) {
  return (
    <div className="p-6 pb-4 flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
      <div className="flex items-start gap-3.5 min-w-0">
        {icon && (
          <div className={`size-10 rounded-2xl ${iconBg} flex items-center justify-center shrink-0`}>
            <span className={`material-symbols-outlined text-xl ${iconColor}`}>{icon}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{subtitle}</p>}
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      )}
    </div>
  );
};

/**
 * Modal.Body Sub-Component
 */
Modal.Body = function ModalBody({ children, className = '' }) {
  return <div className={`p-6 space-y-4 ${className}`}>{children}</div>;
};

/**
 * Modal.Footer Sub-Component
 */
Modal.Footer = function ModalFooter({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 ${className}`}>
      {children}
    </div>
  );
};

export default Modal;

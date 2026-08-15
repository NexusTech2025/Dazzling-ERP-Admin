import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

/**
 * Reusable right-side sliding drawer panel overlay with slide-in animation.
 * Renders via React Portal to document.body for z-index stacking above MainLayout.
 * 
 * @component
 * @param {object} props
 * @param {boolean} props.isOpen - Controls drawer visibility state.
 * @param {function} props.onClose - Callback function triggered to close the drawer.
 * @param {string} props.title - Drawer header title text.
 * @param {string} [props.subtitle] - Optional subtitle string displayed under the header.
 * @param {string} [props.icon] - Optional Material Symbols icon tag name.
 * @param {string} [props.iconColor="text-primary"] - Optional Tailwind text color class for the icon.
 * @param {React.ReactNode} props.children - Dynamic body content rendered inside scrollable panel.
 * @param {React.ReactNode} [props.footer] - Optional sticky action buttons footer block.
 * @param {string} [props.width="max-w-2xl"] - Tailwind max-width utility class for panel width.
 * @returns {React.ReactPortal|null}
 */
export default function RightDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  iconColor = 'text-primary',
  children,
  footer,
  width = 'max-w-2xl'
}) {
  // Handle ESC key press to close drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop overlay with blur */}
      <div
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/75 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sliding Panel */}
      <div
        className={`relative z-50 w-full ${width} h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-300 ease-in-out`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <span className={`material-symbols-outlined text-xl ${iconColor}`}>{icon}</span>
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Close Drawer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {children}
        </div>

        {/* Sticky Footer Action Bar */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

RightDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  icon: PropTypes.string,
  iconColor: PropTypes.string,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  width: PropTypes.string
};

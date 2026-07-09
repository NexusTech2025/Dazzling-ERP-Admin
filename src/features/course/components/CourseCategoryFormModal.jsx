import React from 'react';
import CourseCategoryForm from './CourseCategoryForm';

/**
 * CourseCategoryFormModal Component.
 * Wraps CourseCategoryForm in a conditionally open centered viewport modal.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {Function} props.onClose - Closure callback.
 * @param {Object|null} props.editingType - Category row values if editing, or null.
 * @param {Function} props.onSubmit - Submission submit handler.
 * @param {boolean} props.isPending - Indicates network operation state.
 * @param {Object} props.apiFeedback - Feedback object { error, success }.
 */
export const CourseCategoryFormModal = ({
  isOpen,
  onClose,
  editingType,
  onSubmit,
  isPending,
  apiFeedback
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl border border-border-light dark:border-border-dark w-full max-w-lg overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 text-left"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-background-light/30 dark:bg-background-dark/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">
                {editingType ? 'edit_square' : 'add_box'}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-lg text-text-main dark:text-white tracking-tight leading-none">
                {editingType ? 'Edit Category' : 'Create Category'}
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                {editingType ? 'Modify properties of the selected academic segment.' : 'Define a new curriculum segment segment designation.'}
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isPending}
            className="p-1.5 text-text-secondary hover:text-text-main dark:hover:text-white transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {apiFeedback.error && (
            <div className="mb-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 p-4 rounded-lg border border-rose-100 dark:border-rose-800 flex items-center gap-3 animate-in slide-in-from-top-2">
              <span className="material-symbols-outlined">error</span>
              <span className="text-sm font-bold">{apiFeedback.error}</span>
            </div>
          )}
          
          {apiFeedback.success && (
            <div className="mb-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800 flex items-center gap-3 animate-in slide-in-from-top-2">
              <span className="material-symbols-outlined">check_circle</span>
              <span className="text-sm font-bold">{apiFeedback.success}</span>
            </div>
          )}

          {/* Form */}
          <CourseCategoryForm
            key={editingType ? editingType.segment_id : 'create'}
            initialValues={editingType}
            onSubmit={onSubmit}
            isPending={isPending}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
};

export default CourseCategoryFormModal;

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContextCore';
import { executeAction } from '../../../services/apiClient';
import { ApiError } from '../../../services/ApiError';

const CreateCourseTypeModal = ({ isOpen, onClose, onSuccess }) => {
  const { token } = useAuth();
  
  const [formData, setFormData] = useState({
    segment_name: '',
    entity_label: 'Subject', 
    description: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.segment_name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await executeAction('ACADEMIC.CREATE_COURSE_TYPE', formData, token);
      if (response.success) {
        onSuccess?.(response.data);
        setFormData({ 
          segment_name: '', 
          entity_label: 'Subject', 
          description: '' 
        });
        onClose();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create course type');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-xl border border-border-light dark:border-border-dark w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in duration-200">
        <form onSubmit={handleSubmit}>
          <div className="p-6 text-left">
            <div className="flex items-center gap-4 mb-6">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">category</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-main dark:text-white leading-none">New Course Type</h3>
                <p className="text-sm text-text-secondary mt-1 tracking-tight">Define a new academic segment or category.</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* READ-ONLY ID FIELD */}
              <div>
                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1.5 ml-1">
                  System Generated ID
                </label>
                <div className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-[11px] font-mono font-bold text-primary/70 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">fingerprint</span>
                  Auto-assigned by database
                </div>
              </div>

              <div>
                <label htmlFor="segment_name" className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1.5 ml-1">
                  Segment Name
                </label>
                <input
                  id="segment_name"
                  type="text"
                  value={formData.segment_name}
                  onChange={handleChange}
                  placeholder="e.g., Academic, Computer"
                  className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-main dark:text-white"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label htmlFor="entity_label" className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1.5 ml-1">
                  Entity Label (Unit)
                </label>
                <input
                  id="entity_label"
                  type="text"
                  value={formData.entity_label}
                  onChange={handleChange}
                  placeholder="e.g., Subject, Course, Module"
                  className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-main dark:text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1.5 ml-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What is this segment for?"
                  rows={2}
                  className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-main dark:text-white resize-none"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-medium">
                  <span className="material-symbols-outlined text-sm">error</span>
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className="bg-background-light dark:bg-background-dark/50 px-6 py-4 flex items-center justify-end gap-3 border-t border-border-light dark:border-border-dark">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-text-secondary hover:text-text-main dark:hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.segment_name.trim()}
              className="px-6 py-2 text-sm font-bold bg-primary hover:bg-primary-dark text-white rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                'Create Type'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseTypeModal;

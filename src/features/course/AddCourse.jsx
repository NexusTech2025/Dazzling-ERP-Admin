import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateCourseMutation } from './hooks/useCourseQueries';

/**
 * Add Course Page
 * Handles the registration of new academic courses with financial settings.
 */
const AddCourse = () => {
  const navigate = useNavigate();
  const createMutation = useCreateCourseMutation();
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    base_fee: '',
    default_installment_count: 1,
    is_active: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleInstallmentChange = (delta) => {
    setFormData(prev => ({
      ...prev,
      default_installment_count: Math.max(1, Math.min(12, Number(prev.default_installment_count) + delta))
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.name || !formData.base_fee) {
      setError('Please fill in all required fields.');
      return;
    }

    createMutation.mutate({
      data: {
        ...formData,
        base_fee: Number(formData.base_fee),
        default_installment_count: Number(formData.default_installment_count),
        course_id: `CRS-${Date.now().toString().slice(-6)}` // Temporary client-side ID generation
      }
    }, {
      onSuccess: (res) => {
        if (res.success) {
          navigate('/admin/courses');
        } else {
          setError(res.error?.message || res.message || 'Failed to create course.');
        }
      },
      onError: (err) => {
        setError(err.message || 'An unexpected error occurred.');
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm font-medium text-text-secondary">
        <Link to="/admin/dashboard" className="hover:text-primary">Dashboard</Link>
        <span className="mx-2 text-xs">/</span>
        <Link to="/admin/courses" className="hover:text-primary">Courses</Link>
        <span className="mx-2 text-xs">/</span>
        <span className="text-text-main dark:text-white">Add Course</span>
      </nav>

      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black text-text-main dark:text-white tracking-tight">Create New Course</h1>
        <p className="text-text-secondary text-base">Register a new academic course with pricing and installment configurations.</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-2xl border border-red-100 dark:border-red-800 flex items-center gap-3 animate-in slide-in-from-top-2">
          <span className="material-symbols-outlined">error</span>
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-border-light dark:border-border-dark shadow-sm overflow-hidden">
        <div className="p-8 space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold text-text-main dark:text-white mb-1">Course Details</h3>
              <p className="text-sm text-text-secondary">General information about the academic offering.</p>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-text-main dark:text-white">Course Name <span className="text-red-500">*</span></label>
              <input 
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="e.g. Advanced Financial Accounting"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-text-main dark:text-white">Description</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                placeholder="Course objectives, content summary, and prerequisites..."
              />
            </div>
          </div>

          {/* Financials */}
          <div className="pt-8 border-t border-border-light dark:border-border-dark grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-lg font-bold text-text-main dark:text-white mb-1">Pricing & Billing</h3>
              <p className="text-sm text-text-secondary">Configure the fee structure and default payment plans.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main dark:text-white">Base Fee ($) <span className="text-red-500">*</span></label>
              <input 
                required
                type="number"
                name="base_fee"
                value={formData.base_fee}
                onChange={handleChange}
                className="w-full bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-text-main dark:text-white">Default Installments</label>
              <div className="flex items-center bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark rounded-xl w-32 overflow-hidden h-[46px]">
                <button 
                  type="button"
                  onClick={() => handleInstallmentChange(-1)}
                  className="flex-1 hover:bg-surface-dark/10 transition-colors text-text-secondary"
                >
                  <span className="material-symbols-outlined text-lg">remove</span>
                </button>
                <div className="flex-1 text-center font-bold text-sm text-text-main dark:text-white border-x border-border-light dark:border-border-dark py-2">
                  {formData.default_installment_count}
                </div>
                <button 
                  type="button"
                  onClick={() => handleInstallmentChange(1)}
                  className="flex-1 hover:bg-surface-dark/10 transition-colors text-text-secondary"
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                </button>
              </div>
            </div>

            <div className="md:col-span-2 flex items-center justify-between p-4 bg-background-light dark:bg-background-dark/50 rounded-2xl border border-border-light dark:border-border-dark">
              <div>
                <span className="block text-sm font-bold text-text-main dark:text-white">Active Status</span>
                <span className="text-xs text-text-secondary">Enable this course for student enrollment immediately.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 bg-background-light dark:bg-background-dark/50 flex items-center justify-end gap-3 border-t border-border-light dark:border-border-dark">
          <button 
            type="button"
            onClick={() => navigate('/admin/courses')}
            className="px-6 py-2.5 text-sm font-bold text-text-secondary hover:text-text-main transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={createMutation.isPending}
            className="px-8 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-70 flex items-center gap-2"
          >
            {createMutation.isPending ? (
              <>
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : 'Save Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCourse;

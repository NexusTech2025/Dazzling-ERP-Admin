import React, { useState, useEffect } from 'react';
import FormField from '../../../components/ui/v2/FormField';
import TextInput from '../../../components/ui/v2/TextInput';
import SelectInput from '../../../components/ui/v2/SelectInput';

/**
 * BranchFormModal: Handles both Add and Edit actions for Branches.
 */
const BranchFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isPending = false, error = null }) => {
  const [formData, setFormData] = useState({
    branch_name: '',
    location: '',
    status: 'active'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        branch_name: initialData.branch_name || '',
        location: initialData.location || '',
        status: initialData.status || 'active'
      });
    } else {
      setFormData({
        branch_name: '',
        location: '',
        status: 'active'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.branch_name.trim()) return;
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
        <header className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {initialData ? 'Edit Branch' : 'Add New Branch'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Configure branch details and status.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined text-slate-400">close</span>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 p-3 rounded-xl border border-red-100 dark:border-red-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
              <span className="material-symbols-outlined text-lg">error</span>
              <span className="text-xs font-bold">{error}</span>
            </div>
          )}

          <FormField label="Branch Name" name="branch_name" required>
            <TextInput 
              value={formData.branch_name}
              onChange={(e) => handleChange('branch_name', e.target.value)}
              placeholder="e.g. Downtown Campus"
              autoFocus
            />
          </FormField>

          <FormField label="Location" name="location">
            <TextInput 
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g. 5th Avenue, New York"
            />
          </FormField>

          <FormField label="Status" name="status">
            <SelectInput 
              value={formData.status}
              onChange={(val) => handleChange('status', val)}
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' }
              ]}
            />
          </FormField>

          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !formData.branch_name.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {isPending ? (
                <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined text-lg">check_circle</span>
              )}
              {initialData ? 'Save Changes' : 'Create Branch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BranchFormModal;

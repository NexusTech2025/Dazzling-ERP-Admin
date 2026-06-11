import React, { useState } from 'react';
import { 
  useExpenseCategoriesQuery, 
  useCreateExpenseCategoryMutation, 
  useUpdateExpenseCategoryMutation, 
  useDeleteExpenseCategoryMutation 
} from '../../hooks/useFinanceQueries';
import FormField from '../../../../components/ui/v2/FormField';
import TextInput from '../../../../components/ui/v2/TextInput';
import Button from '../../../../components/ui/v2/Button';

const CategoryManagerModal = ({ isOpen, onClose }) => {
  const { data: categories = [], isLoading, error: fetchError } = useExpenseCategoriesQuery();
  const createMutation = useCreateExpenseCategoryMutation();
  const updateMutation = useUpdateExpenseCategoryMutation();
  const deleteMutation = useDeleteExpenseCategoryMutation();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [type, setType] = useState('both'); // 'in', 'out', 'both'
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleEdit = (category) => {
    setEditingCategory(category);
    setName(category.name);
    setType(category.type || 'both');
    setDescription(category.description || '');
    setValidationError('');
    setErrorMessage('');
  };

  const handleReset = () => {
    setEditingCategory(null);
    setName('');
    setType('both');
    setDescription('');
    setValidationError('');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    setErrorMessage('');

    if (!name.trim()) {
      setValidationError('Category name is required');
      return;
    }

    const payload = {
      name: name.trim(),
      type,
      description: description.trim() || null
    };

    try {
      if (editingCategory) {
        const res = await updateMutation.mutateAsync({ 
          id: editingCategory.category_id, 
          data: payload 
        });
        if (res.success) {
          handleReset();
        } else {
          setErrorMessage(res.error?.message || res.message || 'Failed to update category');
        }
      } else {
        const res = await createMutation.mutateAsync(payload);
        if (res.success) {
          handleReset();
        } else {
          setErrorMessage(res.error?.message || res.message || 'Failed to create category');
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong');
    }
  };

  const handleDelete = async (categoryId, categoryName) => {
    setErrorMessage('');
    if (window.confirm(`Are you sure you want to delete category "${categoryName}"?`)) {
      try {
        const res = await deleteMutation.mutateAsync(categoryId);
        if (!res.success) {
          setErrorMessage(res.error?.message || res.message || `Cannot delete category "${categoryName}"`);
        }
      } catch (err) {
        setErrorMessage(err.message || `Cannot delete category "${categoryName}"`);
      }
    }
  };

  // Filter list
  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cat.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <header className="px-6 py-4 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-xl font-black text-text-main dark:text-white tracking-tight">Manage Categories</h2>
            <p className="text-xs text-text-secondary dark:text-on-surface-variant mt-0.5">Configure transaction categories and accounting directions</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-text-secondary hover:text-text-main dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Banner for Server Error */}
        {(errorMessage || fetchError) && (
          <div className="bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-900/50 px-6 py-3 flex items-start gap-3">
            <span className="material-symbols-outlined text-red-500 mt-0.5">report</span>
            <div className="flex-1 text-xs font-semibold text-red-800 dark:text-red-300">
              {errorMessage || fetchError.message || 'Error executing action.'}
            </div>
            <button 
              onClick={() => setErrorMessage('')} 
              className="text-red-500 hover:text-red-700 font-bold text-xs"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          
          {/* Left Column: Create Form */}
          <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-900/20 border border-border-light dark:border-border-dark rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary text-xl">
                {editingCategory ? 'edit_note' : 'add_circle'}
              </span>
              <h3 className="text-sm font-bold text-text-main dark:text-white uppercase tracking-wider">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label="Category Name" required error={validationError}>
                <TextInput 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tuition Fees, Rent" 
                  variant="default"
                />
              </FormField>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-text-secondary pl-1">
                  Direction
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-border-light dark:border-border-dark">
                  {[
                    { id: 'in', label: 'Received', icon: 'call_received' },
                    { id: 'out', label: 'Sent', icon: 'call_made' },
                    { id: 'both', label: 'Both', icon: 'swap_vert' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setType(btn.id)}
                      className={`flex flex-col items-center gap-1 py-2 rounded-md transition-all text-[10px] font-bold uppercase ${
                        type === btn.id
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-base">{btn.icon}</span>
                      <span>{btn.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <FormField label="Description">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="w-full rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-text-main dark:text-white placeholder:text-text-secondary/50 resize-none transition-all"
                  placeholder="What does this category cover?"
                />
              </FormField>

              <div className="flex gap-2 pt-2">
                <Button 
                  type="submit" 
                  variant="contained" 
                  className="flex-1"
                  loading={createMutation.isPending || updateMutation.isPending}
                >
                  Save
                </Button>
                {editingCategory && (
                  <Button 
                    onClick={handleReset} 
                    variant="outlined"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Right Column: Existing list */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-xs">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary text-sm">
                  search
                </span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search categories..."
                  className="w-full rounded-full border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark pl-9 pr-4 py-1.5 text-xs outline-none focus:border-primary text-text-main dark:text-white placeholder:text-text-secondary/50"
                />
              </div>
              <span className="text-[11px] font-bold text-text-secondary">
                {filteredCategories.length} Categories
              </span>
            </div>

            <div className="border border-border-light dark:border-border-dark rounded-xl overflow-hidden flex-1 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-border-light dark:border-border-dark text-[10px] font-black text-text-secondary uppercase tracking-widest">
                    <th className="px-4 py-3">Category Name</th>
                    <th className="px-4 py-3 text-center">Direction</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {isLoading ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-xs text-text-secondary">
                        Loading categories...
                      </td>
                    </tr>
                  ) : filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                      <tr key={cat.category_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                        <td className="px-4 py-3 font-semibold text-xs text-text-main dark:text-white">
                          {cat.name}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {cat.type === 'in' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                              <span className="material-symbols-outlined text-[10px]">arrow_downward</span>
                              Received
                            </span>
                          )}
                          {cat.type === 'out' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                              <span className="material-symbols-outlined text-[10px]">arrow_upward</span>
                              Sent
                            </span>
                          )}
                          {cat.type === 'both' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-900/40">
                              <span className="material-symbols-outlined text-[10px]">swap_vert</span>
                              Both
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-text-secondary truncate max-w-[200px]" title={cat.description}>
                          {cat.description || '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEdit(cat)}
                              className="p-1 hover:bg-primary/10 rounded text-text-secondary hover:text-primary transition-all"
                            >
                              <span className="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(cat.category_id, cat.name)}
                              className="p-1 hover:bg-red-500/10 rounded text-text-secondary hover:text-red-500 transition-all"
                            >
                              <span className="material-symbols-outlined text-base">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-xs text-text-secondary">
                        No categories found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CategoryManagerModal;

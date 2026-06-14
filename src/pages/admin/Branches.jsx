import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  useBranchesQuery, 
  useCreateBranchMutation, 
  useUpdateBranchMutation, 
  useDeleteBranchMutation 
} from '../../features/core/hooks/useBranchQueries';
import DataTable from '../../components/ui/DataTable';
import { SearchInput } from '../../components/ui/filters';
import { createBranchColumns } from './schemas/branchSchema';
import ConfirmModal from '../../components/ui/ConfirmModal';
import BranchFormModal from '../../features/core/components/BranchFormModal';
import RefreshButton from '../../components/ui/btn/RefreshButton';
import MainLayout from '../../components/layout/MainLayout';
import Breadcrumbs from '../../components/ui/Breadcrumbs';

const Branches = () => {
  const queryClient = useQueryClient();
  
  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [formModal, setFormModal] = useState({ isOpen: false, data: null, error: null });
  const [deleteModal, setDeleteModal] = useState({ 
    isOpen: false, 
    id: null, 
    name: '',
    status: 'idle',
    resultMessage: null
  });

  const [isSticky, setIsSticky] = useState(false);
  const handleBodyScroll = (e) => {
    setIsSticky(e.currentTarget.scrollTop > 80);
  };

  // Queries & Mutations
  const { data: branches = [], isLoading, error } = useBranchesQuery();
  const createMutation = useCreateBranchMutation();
  const updateMutation = useUpdateBranchMutation();
  const deleteMutation = useDeleteBranchMutation();

  // Filter Logic
  const filteredBranches = branches.filter(b => 
    b.branch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.branch_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handlers = {
    onEdit: (branch) => setFormModal({ isOpen: true, data: branch, error: null }),
    onDelete: (id, name) => setDeleteModal({ 
      isOpen: true, 
      id, 
      name,
      status: 'idle',
      resultMessage: null
    }),
  };

  const columns = createBranchColumns(handlers);

  const handleFormSubmit = (formData) => {
    setFormModal(prev => ({ ...prev, error: null }));
    
    const mutationOptions = {
      onSuccess: (response) => {
        if (response.success) {
          setFormModal({ isOpen: false, data: null, error: null });
        } else {
          setFormModal(prev => ({ ...prev, error: response.error?.message || response.message || 'Failed to save branch.' }));
        }
      },
      onError: (err) => {
        setFormModal(prev => ({ ...prev, error: err.message || 'Connection error. Please try again.' }));
      }
    };

    if (formModal.data) {
      updateMutation.mutate({ id: formModal.data.branch_id, data: formData }, mutationOptions);
    } else {
      createMutation.mutate(formData, mutationOptions);
    }
  };

  const handleDeleteConfirm = () => {
    setDeleteModal(prev => ({ ...prev, status: 'processing' }));
    
    deleteMutation.mutate(deleteModal.id, {
      onSuccess: (response) => {
        if (response.success) {
          setDeleteModal(prev => ({ 
            ...prev, 
            status: 'success',
            resultMessage: response.message || 'Branch has been successfully removed.'
          }));
        } else {
          setDeleteModal(prev => ({ 
            ...prev, 
            status: 'error',
            resultMessage: response.error?.message || response.message || 'Failed to delete branch.'
          }));
        }
      },
      onError: (err) => {
        setDeleteModal(prev => ({ 
          ...prev, 
          status: 'error',
          resultMessage: err.message || 'Connection error. Please try again.'
        }));
      }
    });
  };

  const filters = (
    <div className="md:col-span-12 relative">
      <SearchInput 
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search branches by name or ID..."
      />
    </div>
  );

  const crumbs = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Branches' }
  ];

  return (
    <MainLayout
      onBodyScroll={handleBodyScroll}
      header={
        <div
          className={`absolute top-0 left-0 right-0 z-50 transition-all duration-300 w-full ${
            isSticky
              ? 'opacity-100 translate-y-0 shadow-md pointer-events-auto'
              : 'opacity-0 -translate-y-4 pointer-events-none'
          }`}
        >
          <div className="bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur-md border-b border-border-light dark:border-border-dark px-4 lg:px-6 py-3 flex items-center justify-between rounded-b-xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">storefront</span>
              <span className="text-sm font-bold text-text-main dark:text-white">
                Branches
              </span>
            </div>
          </div>
        </div>
      }
      body={
        <div className="pt-6 lg:pt-10 pb-6 space-y-6">
          <Breadcrumbs items={crumbs} className="mb-4" />
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Branches</h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">Manage institution branches and locations.</p>
            </div>
            <div className="flex items-center gap-3">
              <RefreshButton 
                onClick={() => queryClient.invalidateQueries({ queryKey: ['branches'] })} 
                isLoading={isLoading} 
              />
              <button
                onClick={() => setFormModal({ isOpen: true, data: null, error: null })}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined text-lg">add_circle</span>
                Add Branch
              </button>
            </div>
          </div>

          <DataTable 
            columns={columns}
            data={filteredBranches}
            isLoading={isLoading}
            error={error}
            onRetry={() => queryClient.invalidateQueries({ queryKey: ['branches'] })}
            emptyMessage="No branches found."
            filters={filters}
          />

          {/* Add/Edit Modal */}
          <BranchFormModal 
            isOpen={formModal.isOpen}
            onClose={() => setFormModal({ isOpen: false, data: null, error: null })}
            onSubmit={handleFormSubmit}
            initialData={formModal.data}
            isPending={createMutation.isPending || updateMutation.isPending}
            error={formModal.error}
          />

          {/* Delete Confirmation */}
          <ConfirmModal 
            isOpen={deleteModal.isOpen}
            onClose={() => setDeleteModal({ isOpen: false, id: null, name: '', status: 'idle', resultMessage: null })}
            onConfirm={handleDeleteConfirm}
            title="Delete Branch"
            message={`Are you sure you want to delete "${deleteModal.name}"? This action cannot be undone.`}
            status={deleteModal.status}
            resultMessage={deleteModal.resultMessage}
            variant="danger"
          />
        </div>
      }
    />
  );
};

export default Branches;

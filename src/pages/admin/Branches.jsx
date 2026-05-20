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

  return (
    <>
      <div className="flex justify-between items-center mb-6 px-4 lg:px-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Branches</h1>
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
    </>
  );
};

export default Branches;

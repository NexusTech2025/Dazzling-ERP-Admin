import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useBatchDetailQuery, useUpdateBatchMutation } from './hooks/useBatchQueries';
import BatchForm from './components/BatchForm';
import APIErrorModal from '../../components/ui/APIErrorModal';
import ConfirmModal from '../../components/ui/ConfirmModal';

const EditBatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: batch, isLoading, error: fetchError } = useBatchDetailQuery(id);
  const updateMutation = useUpdateBatchMutation();
  const [modalState, setModalState] = useState({
    isOpen: false,
    status: 'idle', // 'success' | 'error'
    error: null,
    resultMessage: ''
  });

  const handleSubmit = (formData) => {
    updateMutation.mutate(
      { id, data: formData },
      {
        onSuccess: (res) => {
          if (res.success) {
            setModalState({
              isOpen: true,
              status: 'success',
              resultMessage: `Batch "${formData.batch_name}" successfully updated.`
            });
          } else {
            setModalState({
              isOpen: true,
              status: 'error',
              error: res.error || { message: res.message || 'Failed to update batch.' }
            });
          }
        },
        onError: (err) => {
          setModalState({
            isOpen: true,
            status: 'error',
            error: err
          });
        }
      }
    );
  };

  const handleDismissModals = () => {
    const isSuccess = modalState.status === 'success';
    setModalState({ isOpen: false, status: 'idle', error: null, resultMessage: '' });
    if (isSuccess) {
      navigate('/admin/batches');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const displayError = fetchError ? fetchError.message : null;

  return (
    <div className="max-w-7xl mx-auto pb-10">
      {displayError && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 p-4 rounded-lg border border-red-100 dark:border-red-800 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <span className="material-symbols-outlined">error</span>
          <span className="text-sm font-bold">{displayError}</span>
        </div>
      )}

      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-text-secondary font-medium mb-2">
          <Link to="/admin/batches" className="hover:text-primary transition-colors">Batches</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          {batch && (
            <>
              <Link to={`/admin/batches/${id}`} className="hover:text-primary transition-colors">
                {batch.batch_name}
              </Link>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </>
          )}
          <span className="text-text-main dark:text-white">Edit Batch</span>
        </nav>
        <h2 className="text-3xl font-bold text-text-main dark:text-white">Update Batch</h2>
        <p className="text-text-secondary mt-1">Configure existing batch details</p>
      </div>

      <BatchForm 
        initialData={batch}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/batches')}
        isSubmitting={updateMutation.isPending}
      />

      <ConfirmModal 
        isOpen={modalState.isOpen && modalState.status === 'success'}
        onClose={handleDismissModals}
        onConfirm={handleDismissModals}
        status="success"
        title="Batch Updated Successfully"
        resultMessage={modalState.resultMessage}
      />

      <APIErrorModal 
        isOpen={modalState.isOpen && modalState.status === 'error'}
        onClose={handleDismissModals}
        title="Batch Update Error"
        error={modalState.error}
      />
    </div>
  );
};

export default EditBatch;

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
    <>
      <BatchForm 
        initialData={batch}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/batches')}
        isSubmitting={updateMutation.isPending}
        error={displayError}
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
    </>
  );
};

export default EditBatch;

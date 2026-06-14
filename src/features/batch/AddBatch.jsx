import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateBatchMutation } from './hooks/useBatchQueries';
import BatchForm from './components/BatchForm';
import APIErrorModal from '../../components/ui/APIErrorModal';
import ConfirmModal from '../../components/ui/ConfirmModal';

const AddBatch = () => {
  const navigate = useNavigate();
  const createMutation = useCreateBatchMutation();
  const [modalState, setModalState] = useState({
    isOpen: false,
    status: 'idle', // 'success' | 'error'
    error: null,
    resultMessage: ''
  });

  const handleSubmit = (formData) => {
    createMutation.mutate(
      { data: formData },
      {
        onSuccess: (res) => {
          if (res.success) {
            setModalState({
              isOpen: true,
              status: 'success',
              resultMessage: `Batch "${formData.batch_name}" successfully created with ID: ${res.data?.batch_id || 'N/A'}`
            });
          } else {
            setModalState({
              isOpen: true,
              status: 'error',
              error: res.error || { message: res.message || 'Failed to create batch.' }
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

  return (
    <>
      <BatchForm 
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/batches')}
        isSubmitting={createMutation.isPending}
      />

      <ConfirmModal 
        isOpen={modalState.isOpen && modalState.status === 'success'}
        onClose={handleDismissModals}
        onConfirm={handleDismissModals}
        status="success"
        title="Batch Created Successfully"
        resultMessage={modalState.resultMessage}
      />

      <APIErrorModal 
        isOpen={modalState.isOpen && modalState.status === 'error'}
        onClose={handleDismissModals}
        title="Batch Creation Error"
        error={modalState.error}
      />
    </>
  );
};

export default AddBatch;

import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useBatchDetailQuery, useUpdateBatchMutation } from './hooks/useBatchQueries';
import BatchForm from './components/BatchForm';

const EditBatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: batch, isLoading, error: fetchError } = useBatchDetailQuery(id);
  const updateMutation = useUpdateBatchMutation();
  const [error, setError] = useState(null);

  const handleSubmit = (formData) => {
    setError(null);
    updateMutation.mutate({ id, data: formData }, {
      onSuccess: () => navigate('/admin/batches'),
      onError: (err) => setError(err.message || 'Failed to update batch.')
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const displayError = error || (fetchError ? fetchError.message : null);

  return (
    <div className="max-w-4xl mx-auto pb-10">
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
        error={displayError}
      />
    </div>
  );
};

export default EditBatch;

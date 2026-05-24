import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateBatchMutation } from './hooks/useBatchQueries';
import BatchForm from './components/BatchForm';

const AddBatch = () => {
  const navigate = useNavigate();
  const createMutation = useCreateBatchMutation();
  const [error, setError] = useState(null);

  const handleSubmit = (formData) => {
    setError(null);
    createMutation.mutate({ data: formData }, {
      onSuccess: () => navigate('/admin/batches'),
      onError: (err) => setError(err.message || 'Failed to create batch.')
    });
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-text-secondary font-medium mb-2">
          <Link to="/admin/batches" className="hover:text-primary transition-colors">Batches</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-text-main dark:text-white">New Batch</span>
        </nav>
        <h2 className="text-3xl font-bold text-text-main dark:text-white">Create Batch</h2>
        <p className="text-text-secondary mt-1">Configure a new batch for your institute</p>
      </div>

      <BatchForm 
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/batches')}
        isSubmitting={createMutation.isPending}
        error={error}
      />
    </div>
  );
};

export default AddBatch;

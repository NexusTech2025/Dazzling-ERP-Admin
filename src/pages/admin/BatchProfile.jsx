import React from 'react';
import { useBatchProfile } from '../../features/batch/hooks/useBatchProfile';
import DesktopBatchProfile from './components/DesktopBatchProfile';
import MobileBatchProfile from './components/MobileBatchProfile';

const BatchProfile = () => {
  const { isMobile, isBatchLoading, batchError, navigate, ...profileProps } = useBatchProfile();

  if (isBatchLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (batchError || !profileProps.batch) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-text-main dark:text-white">Batch not found</h2>
        <button 
          onClick={() => navigate('/admin/batches')} 
          className="mt-4 text-primary hover:underline"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  return isMobile ? (
    <MobileBatchProfile {...profileProps} />
  ) : (
    <DesktopBatchProfile {...profileProps} />
  );
};

export default BatchProfile;

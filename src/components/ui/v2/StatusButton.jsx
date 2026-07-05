import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from './Button'; // V2 Core Button component
import ConfirmModal from '../ConfirmModal'; // Reusable ConfirmModal component

/**
 * StatusButton (V2): A reusable button component to toggle entity active/inactive status.
 * Renders a small button (size="sm").
 * - Displays success (green) variant when active, prompting to deactivate.
 * - Displays danger (red) variant when inactive, prompting to activate.
 */
const StatusButton = ({
  currentStatus,
  entityName,
  onStatusToggle,
  isLoading = false,
  ...buttonProps
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState('idle'); // 'idle' | 'processing' | 'success' | 'error'
  const [resultMessage, setResultMessage] = useState(null);
  const isActive = currentStatus === 'active';

  const handleTriggerModal = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent parent row selection clicks
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    // Add a tiny timeout to avoid showing state transition as modal fades out
    setTimeout(() => {
      setModalStatus('idle');
      setResultMessage(null);
    }, 200);
  };

  const handleConfirm = async () => {
    setModalStatus('processing');
    const nextStatus = isActive ? 'inactive' : 'active';
    try {
      const response = await onStatusToggle(nextStatus);
      if (response && response.success) {
        setModalStatus('success');
        setResultMessage(response.data?._presentation?.toast_message || `${entityName} status updated successfully.`);
      } else {
        setModalStatus('error');
        setResultMessage(response?.error?.message || `Failed to update ${entityName.toLowerCase()} status.`);
      }
    } catch (err) {
      setModalStatus('error');
      setResultMessage(err.message || 'An unexpected error occurred.');
    }
  };

  // Compute label text and confirm modal themes
  const actionText = isActive ? 'Deactivate' : 'Activate';
  const targetStatus = isActive ? 'inactive' : 'active';

  return (
    <>
      <Button
        variant={isActive ? 'success' : 'danger'}
        size="sm"
        loading={isLoading || modalStatus === 'processing'}
        onClick={handleTriggerModal}
        {...buttonProps}
      >
        {isActive ? 'Active' : 'Inactive'}
      </Button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={`${actionText} ${entityName}?`}
        message={`Are you sure you want to change the status of this ${entityName.toLowerCase()} to ${targetStatus}?`}
        confirmText={actionText}
        cancelText="Cancel"
        isProcessing={isLoading || modalStatus === 'processing'}
        status={modalStatus}
        resultMessage={resultMessage}
      />
    </>
  );
};

StatusButton.propTypes = {
  currentStatus: PropTypes.oneOf(['active', 'inactive', 'draft', 'pending']).isRequired,
  entityName: PropTypes.string.isRequired,
  onStatusToggle: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default StatusButton;

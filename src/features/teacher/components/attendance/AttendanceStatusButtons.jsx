import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import StateSelector from '../../../../components/ui/v2/StateSelector';

const ATTENDANCE_CONFIG = [
  { label: 'P', value: 'P', activeClass: 'bg-emerald-500 text-white shadow-emerald-500/20' },
  { label: 'A', value: 'A', activeClass: 'bg-rose-500 text-white shadow-rose-500/20' },
  { label: 'L', value: 'L', activeClass: 'bg-amber-500 text-white shadow-amber-500/20' }
];

/**
 * AttendanceStatusButtons: Wrapper around StateSelector to maintain local toggle state 
 * and styling consistency across teacher registry layouts.
 */
export const AttendanceStatusButtons = ({ row, isEditingDisabled, onStatusChange }) => {
  const handleChange = useCallback((val) => {
    if (isEditingDisabled) return;
    onStatusChange(row.id, val);
  }, [row.id, isEditingDisabled, onStatusChange]);

  return (
    <div className={isEditingDisabled ? 'opacity-60 pointer-events-none' : ''}>
      <StateSelector
        options={ATTENDANCE_CONFIG}
        value={row.status}
        onChange={handleChange}
      />
    </div>
  );
};

AttendanceStatusButtons.propTypes = {
  row: PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }).isRequired,
  isEditingDisabled: PropTypes.bool.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  isMobile: PropTypes.bool
};

export default AttendanceStatusButtons;

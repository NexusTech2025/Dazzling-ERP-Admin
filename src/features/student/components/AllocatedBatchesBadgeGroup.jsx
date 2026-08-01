import React from 'react';
import PropTypes from 'prop-types';
import Badge from '../../../components/ui/Badge';

/**
 * Renders batch allocation badge pills with a compact "+N More" interactive overflow button.
 * Triggers the parent view modal callback to display full allocation breakdown.
 * 
 * @component
 * @param {Object} props - Component properties.
 * @param {Array<Object>} props.allocations - List of allocation objects [{ allocationId, batchName, courseName, status }].
 * @param {Function} [props.onOpenModal] - Callback to trigger parent allocation breakdown modal.
 * @param {string} [props.className] - Optional custom layout container classes.
 * @returns {React.JSX.Element} Batch allocation badge group.
 */
export default function AllocatedBatchesBadgeGroup({ allocations = [], onOpenModal, className = '' }) {
  if (!Array.isArray(allocations) || allocations.length === 0) {
    return <span className="text-xs text-text-secondary italic">Unassigned</span>;
  }

  const primaryAlloc = allocations[0];
  const overflowCount = allocations.length - 1;

  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      {/* Primary Batch Chip */}
      <Badge variant="info" className="text-[7px] py-0.5 px-2 max-w-[200px] truncate rounded-full">
        {primaryAlloc.batchName || primaryAlloc.courseName || 'Batch'}
      </Badge>

      {/* Overflow Chip Trigger */}
      {overflowCount > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onOpenModal) onOpenModal();
          }}
          className="inline-flex items-center gap-0.5 px-1.5 py-0.25 rounded-full text-[8px] font-black uppercase tracking-wider bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all cursor-pointer hover:scale-105"
        >
          <span>+{overflowCount} More</span>

        </button>
      )}
    </div>
  );
}

AllocatedBatchesBadgeGroup.propTypes = {
  allocations: PropTypes.arrayOf(
    PropTypes.shape({
      allocationId: PropTypes.string,
      batchId: PropTypes.string,
      batchName: PropTypes.string,
      courseId: PropTypes.string,
      courseName: PropTypes.string,
      status: PropTypes.string
    })
  ),
  onOpenModal: PropTypes.func,
  className: PropTypes.string
};

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import AttendanceRegisterMatrix from './AttendanceRegisterMatrix';
import AttendanceHistoryMatrix from './AttendanceHistoryMatrix';
import Button from '../../../../components/ui/v2/Button';

/**
 * AttendanceMatrix Component: Tab router managing daily registry updates and history views.
 */
const AttendanceMatrix = ({ batchId }) => {
  const [activeSubTab, setActiveSubTab] = useState('Registry'); // 'Registry' or 'Matrix'

  return (
    <div className="space-y-6 text-text-main dark:text-slate-100">
      {/* Sub-navigation for Attendance */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-[#122131] border border-border-light dark:border-white/8 rounded-xl w-fit backdrop-blur-md">
        <Button
          variant={activeSubTab === 'Registry' ? 'contained' : 'text'}
          size="sm"
          onClick={() => setActiveSubTab('Registry')}
          className={activeSubTab === 'Registry' ? 'bg-gradient-primary border-none text-white shadow-md shadow-indigo-500/20' : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white'}
        >
          Daily Registry
        </Button>
        <Button
          variant={activeSubTab === 'Matrix' ? 'contained' : 'text'}
          size="sm"
          onClick={() => setActiveSubTab('Matrix')}
          className={activeSubTab === 'Matrix' ? 'bg-gradient-primary border-none text-white shadow-md shadow-indigo-500/20' : 'text-text-secondary dark:text-slate-400 hover:text-text-main dark:hover:text-white'}
        >
          History Matrix
        </Button>
      </div>

      {activeSubTab === 'Registry' ? (
        <AttendanceRegisterMatrix batchId={batchId} />
      ) : (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
          <AttendanceHistoryMatrix batchId={batchId} />
        </div>
      )}
    </div>
  );
};

AttendanceMatrix.propTypes = {
  batchId: PropTypes.string.isRequired
};

export default AttendanceMatrix;

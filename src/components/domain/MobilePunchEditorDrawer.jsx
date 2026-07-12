import React, { useState, useEffect } from 'react';
import Button from '../ui/v2/Button';
import TextInput from '../ui/v2/TextInput';
import FormField from '../ui/v2/FormField';
import TimeFieldInput from '../../features/batch/components/FormField/TimeFieldInput';

export const MobilePunchEditorDrawer = ({ 
  row, 
  isEditingDisabled, 
  onTimeChange, 
  onRemarksChange, 
  onClose 
}) => {
  const [localRemarks, setLocalRemarks] = useState('');

  useEffect(() => {
    if (row) {
      setLocalRemarks(row.remarks || '');
    }
  }, [row]);

  if (!row) return null;

  const entityId = row.student_id || row.id;
  const displayName = row.student_name || row.full_name || row.teacher_name || '';
  const isStudent = !!row.student_id;
  const inLabel = isStudent ? "Check-In Time" : "Punch In Time";
  const outLabel = isStudent ? "Check-Out Time" : "Punch Out Time";

  const handleRemarksChange = (e) => {
    const val = e.target.value;
    setLocalRemarks(val);
    onRemarksChange(entityId, val);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center animate-in fade-in duration-200">
      <div className="bg-surface-light dark:bg-[#122131] w-[90%] max-w-md rounded-2xl p-6 space-y-4 shadow-2xl border border-border-light dark:border-white/10 animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center border-b border-border-light dark:border-white/10 pb-3">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-text-main dark:text-white">Configure Shift Parameters</h3>
            <p className="text-[10px] text-text-secondary mt-0.5">{displayName}</p>
          </div>
          <button onClick={onClose} className="material-symbols-outlined text-text-secondary p-1">close</button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label={inLabel} name="entry_time_input">
            <TimeFieldInput
              value={row.entry_time}
              onChange={(val) => onTimeChange(entityId, 'entry_time', val)}
              disabled={isEditingDisabled}
              is24Hour={false}
            />
          </FormField>
          
          <FormField label={outLabel} name="exit_time_input">
            <TimeFieldInput
              value={row.exit_time}
              onChange={(val) => onTimeChange(entityId, 'exit_time', val)}
              disabled={isEditingDisabled}
              is24Hour={false}
            />
          </FormField>
        </div>

        <FormField label="Remarks / Administration Notes" name="remarks_input">
          <TextInput
            disabled={isEditingDisabled}
            value={localRemarks}
            placeholder={isEditingDisabled ? "Entries Locked" : "Add internal remarks..."}
            onChange={handleRemarksChange}
            trim={false}
          />
        </FormField>

        <Button variant="contained" size="md" className="w-full uppercase tracking-wider font-bold" onClick={onClose}>
          Confirm Staged Updates
        </Button>
      </div>
    </div>
  );
};

export default MobilePunchEditorDrawer;

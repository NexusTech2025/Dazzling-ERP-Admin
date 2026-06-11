import React from 'react';
import FormField from '../../../../components/ui/v2/FormField';
import SelectInput from '../../../../components/ui/v2/SelectInput';
import SegmentedControl from '../../../../components/ui/v2/SegmentedControl';

/**
 * ProgramSelectionCard: Renders program and admission selection fields.
 */
const ProgramSelectionCard = ({ programType, admissionType, onChange }) => {
  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 shadow-sm border border-primary/5">
      <div className="flex items-center gap-3 mb-6">
        <span className="material-symbols-outlined text-primary">category</span>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Program Selection</h2>
      </div>

      <SegmentedControl 
        value={programType}
        onChange={(val) => onChange('programType', val)}
        options={[
          { label: 'Academic Package', value: 'academic' },
          { label: 'Single Course', value: 'single' }
        ]}
        className="w-full"
        containerClassName="mb-6"
      />

      <FormField label="Admission Type" name="admissionType">
        <SelectInput 
          value={admissionType}
          onChange={(val) => onChange('admissionType', val)}
          options={[
            { label: 'Regular Enrollment', value: 'direct' },
            { label: 'Merit Based', value: 'merit' },
            { label: 'Entrance Exam', value: 'entrance' }
          ]}
          placeholder="Select Type"
        />
      </FormField>
    </div>
  );
};

export default ProgramSelectionCard;

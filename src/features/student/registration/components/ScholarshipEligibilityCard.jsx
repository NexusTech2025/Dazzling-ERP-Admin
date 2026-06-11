import React from 'react';
import FormField from '../../../../components/ui/v2/FormField';
import TextInput from '../../../../components/ui/v2/TextInput';

/**
 * ScholarshipEligibilityCard: Renders entrance score input and scholarship display panel.
 */
const ScholarshipEligibilityCard = ({ entranceScore, applicableScholarship, onChange }) => {
  return (
    <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 animate-in zoom-in-95 duration-300">
      <h3 className="text-[11px] font-black text-primary uppercase tracking-widest mb-4">Scholarship Eligibility</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Entrance Score (%)">
          <TextInput 
            type="number"
            value={entranceScore}
            onChange={(e) => onChange('entranceScore', e.target.value)}
            placeholder="0-100"
          />
        </FormField>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-1">Applicable %</span>
          <div className="h-11 flex items-center px-4 bg-white dark:bg-slate-800 rounded-lg border border-primary/20">
            <span className="text-xl font-black text-primary">{applicableScholarship}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipEligibilityCard;

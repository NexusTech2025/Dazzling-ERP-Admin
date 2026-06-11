import React, { useState } from 'react';
import FormField from '../../../../components/ui/v2/FormField';
import TextInput from '../../../../components/ui/v2/TextInput';
import ToggleSwitch from '../../../../components/ui/v2/ToggleSwitch';

/**
 * BenefitsCard: Handles Coupon Code and Referral ID inputs.
 */
const BenefitsCard = ({ couponCode, referralId, onChange }) => {
  const [isBenefitsEnabled, setIsBenefitsEnabled] = useState(!!(couponCode || referralId));

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-2xl p-6 shadow-sm border border-primary/5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">redeem</span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Apply Benefits</h2>
        </div>
        <ToggleSwitch 
          checked={isBenefitsEnabled}
          onChange={setIsBenefitsEnabled}
          label={isBenefitsEnabled ? "Enabled" : "Disabled"}
        />
      </div>
      
      {isBenefitsEnabled && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <FormField label="Coupon Code">
                <TextInput 
                  value={couponCode}
                  onChange={(e) => onChange('couponCode', e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  className="uppercase"
                />
              </FormField>
            </div>
            <button 
              type="button"
              className="h-11 px-4 bg-slate-900 dark:bg-slate-700 text-white rounded-lg font-bold text-xs hover:bg-primary transition-colors mb-0.5"
            >
              Apply
            </button>
          </div>

          <FormField label="Referral ID">
            <TextInput 
              value={referralId}
              onChange={(e) => onChange('referralId', e.target.value)}
              placeholder="Optional"
            />
          </FormField>
        </div>
      )}
    </div>
  );
};

export default BenefitsCard;

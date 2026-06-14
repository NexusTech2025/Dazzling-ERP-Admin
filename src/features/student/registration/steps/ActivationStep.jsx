import React, { useState, useEffect } from 'react';

// V2 UI Components
import Avatar from '../../../../components/ui/v2/Avatar';
import KeyValuePair from '../../../../components/ui/v2/KeyValuePair';
import ToggleSwitch from '../../../../components/ui/v2/ToggleSwitch';
import RadioGroup from '../../../../components/ui/v2/RadioGroup';
import TextInput from '../../../../components/ui/v2/TextInput';
import DateInput from '../../../../components/ui/v2/DateInput';
import Button from '../../../../components/ui/v2/Button';
import HighlightBox from '../../../../components/ui/v2/HighlightBox';

/**
 * ActivationStep: Final Step (Step 4) of Student Registration Wizard.
 * Reviews all gathered inputs from Steps 1, 2, and 3, and processes optional initial payments.
 * Optimized with Slate Glassmorphism styling guidelines and V2 predefined components.
 * 
 * @param {object} props
 * @param {object} props.formData - Master wizard state object.
 * @param {function} props.setFormData - Wizard state mutator.
 * @param {function} props.onFinish - Completion callback.
 * @param {function} props.onBack - Wizard back callback.
 * @param {boolean} props.isPending - Loading state of registration mutation.
 */
const ActivationStep = ({ formData, setFormData, onFinish, onBack, isPending }) => {
  const [immediatePayment, setImmediatePayment] = useState(true);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Generate safe memory-leak-free object URL for profile photo preview
  useEffect(() => {
    if (formData.profilePhoto instanceof File || formData.profilePhoto instanceof Blob) {
      const url = URL.createObjectURL(formData.profilePhoto);
      setPhotoPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof formData.profilePhoto === 'string') {
      setPhotoPreview(formData.profilePhoto);
    } else {
      setPhotoPreview(null);
    }
  }, [formData.profilePhoto]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleComplete = (e) => {
    e.preventDefault();
    if (!immediatePayment) {
      // Deferred Payment Overrides
      onFinish({
        initialPaymentAmount: 0,
        paymentMethod: 'none',
        transactionRef: 'DEFERRED'
      });
    } else {
      onFinish();
    }
  };

  const paymentOptions = [
    { value: 'cash', label: 'Cash', icon: 'payments', description: 'Physical cash' },
    { value: 'upi', label: 'UPI / QR Code', icon: 'qr_code_2', description: 'Digital UPI app' },
    { value: 'bank', label: 'Bank Transfer', icon: 'account_balance', description: 'Direct bank/NEFT' }
  ];

  return (
    <div className="layout-content-container flex flex-col max-w-7xl px-4 lg:px-0 flex-1 gap-6 mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Header Title */}
      <div className="flex flex-col gap-2 px-4 mb-2">
        <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-black leading-tight tracking-tight">Review & Finalize</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm">Verify gathered records and configure registration activation.</p>
      </div>

      <div className="grid grid-cols-12 gap-6 md:gap-8 p-4 items-start">
        
        {/* Left Column: Comprehensive Reviews (Spans 7 cols on large screens) */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          
          {/* Card 1: Student Profile Verification */}
          <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm backdrop-blur-md">
            <h3 className="text-slate-900 dark:text-slate-100 text-base font-bold mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="material-symbols-outlined text-primary text-xl">account_circle</span>
              1. Profile Verification
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-6 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800/60">
              {/* Profile Photo Display */}
              <div className="flex flex-col items-center sm:items-start gap-2 flex-shrink-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block pl-1">Photo</span>
                <Avatar
                  src={photoPreview}
                  initials={formData.fullName}
                  alt="Student Photo"
                  size="xl"
                  variant="rounded"
                />
              </div>

              {/* Core Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm flex-grow">
                <KeyValuePair label="Full Name" value={formData.fullName} icon="person" />
                <KeyValuePair label="Gender & DOB" value={`${formData.gender || 'N/A'} • ${formData.dob || 'N/A'}`} icon="calendar_today" />
                <KeyValuePair label="Father's Name" value={formData.fatherName} icon="family_restroom" />
                <KeyValuePair label="Mother's Name" value={formData.motherName} icon="family_restroom" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6 text-sm">
              <KeyValuePair label="Contact Details" value={formData.mobile ? `${formData.mobile}\n${formData.email || 'No email'}` : null} fallback="N/A" icon="contact_phone" className="whitespace-pre-line" />
              <KeyValuePair 
                label="Emergency Linkage" 
                value={formData.emergencyContactName ? `${formData.emergencyContactName} (${formData.emergencyContactRelationship || 'N/A'})\nPhone: ${formData.emergencyContactPhone || 'N/A'}` : null} 
                fallback="N/A"
                icon="contact_emergency" 
                className="whitespace-pre-line" 
              />
              <KeyValuePair 
                label="Home Address" 
                value={formData.address1 ? `${formData.address1}${formData.address2 ? `, ${formData.address2}` : ''}\n${formData.city || ''}, ${formData.state || ''} - ${formData.pincode || ''}` : null} 
                fallback="N/A"
                icon="location_on" 
                className="sm:col-span-2 whitespace-pre-line" 
              />
              
              <div className="sm:col-span-2 border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3 pl-1">Education Background</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <KeyValuePair label="Highest Qualification" value={formData.highestQualification} icon="school" size="sm" />
                  <KeyValuePair label="Previous Institution" value={formData.previousInstitution} icon="history_edu" size="sm" />
                  <KeyValuePair label="Passing Year" value={formData.passingYear} icon="event" size="sm" />
                  <KeyValuePair label="Grade/Percentage" value={formData.grade} icon="grade" size="sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Academic Selections */}
          <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm backdrop-blur-md">
            <h3 className="text-slate-900 dark:text-slate-100 text-base font-bold mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="material-symbols-outlined text-primary text-xl">school</span>
              2. Academic Selections
            </h3>

            <div className="space-y-4">
              {(formData.enrollmentBasket || []).map((item) => (
                <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{item.name}</span>
                    <span className="text-xs font-semibold text-primary">₹{item.fee.toLocaleString()}</span>
                  </div>
                  
                  {item.type === 'package' ? (
                    <div className="space-y-1.5 pl-3 border-l-2 border-slate-200 dark:border-slate-800">
                      {(item.courses || []).map(c => {
                        const batchId = (formData.selectedBatches || {})[c.id];
                        const batch = c.batches?.find(b => b.id === batchId);
                        return (
                          <div key={c.id} className="text-xs text-slate-500 dark:text-slate-400 flex justify-between">
                            <span>{c.name}</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{batch ? batch.name.split('|')[0].trim() : 'No batch selected'}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex justify-between pl-3 border-l-2 border-slate-200 dark:border-slate-800">
                      <span>Assigned Batch:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {(() => {
                          const batchId = (formData.selectedBatches || {})[item.id];
                          const batch = item.batches?.find(b => b.id === batchId);
                          return batch ? batch.name.split('|')[0].trim() : 'No batch selected';
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {(!formData.enrollmentBasket || formData.enrollmentBasket.length === 0) && (
                <p className="text-sm text-slate-500 italic text-center">No program selected</p>
              )}
            </div>
          </div>

          {/* Card 3: Financial Schedule Timeline */}
          <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm backdrop-blur-md">
            <h3 className="text-slate-900 dark:text-slate-100 text-base font-bold mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="material-symbols-outlined text-primary text-xl">event_repeat</span>
              3. Installment Timelines
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/60 text-slate-400">
                    <th className="py-2.5 font-bold">Installment</th>
                    <th className="py-2.5 font-bold">Due Date</th>
                    <th className="py-2.5 font-bold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50 dark:divide-slate-800/20">
                  {(formData.installments || []).map((inst, idx) => (
                    <tr key={idx} className="text-slate-700 dark:text-slate-300">
                      <td className="py-3">{inst.label}</td>
                      <td className="py-3">
                        {(() => {
                          if (!inst.dueDate) return 'N/A';
                          try {
                            const d = new Date(inst.dueDate);
                            if (isNaN(d.getTime())) return inst.dueDate;
                            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                          } catch (e) {
                            return inst.dueDate;
                          }
                        })()}
                      </td>
                      <td className="py-3 font-semibold text-slate-900 dark:text-white text-right">₹ {inst.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  {(!formData.installments || formData.installments.length === 0) && (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-slate-400 italic">No installment plan configured.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Payments, Activation & Review CTA (Spans 5 cols on large screens) */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          
          {/* Card 4: Financial Summary */}
          <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm backdrop-blur-md space-y-4">
            <h3 className="text-slate-900 dark:text-slate-100 text-base font-bold flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="material-symbols-outlined text-primary text-xl">price_check</span>
              Contract Valuation
            </h3>
            <div className="space-y-3 text-sm">
              <KeyValuePair label="Tuition Base Fee" value={`₹ ${(formData.baseFee || 0).toLocaleString()}`} layout="horizontal" />
              {formData.registrationFee > 0 && (
                <KeyValuePair label="Registration Fee" value={`₹ ${(formData.registrationFee || 0).toLocaleString()}`} layout="horizontal" />
              )}
              {formData.discountVal > 0 && (
                <KeyValuePair 
                  label={`Discount (${formData.discountReason || 'Manual Override'})`} 
                  value={`-₹ ${(formData.discountVal || 0).toLocaleString()}`} 
                  layout="horizontal" 
                  className="text-green-600 dark:text-green-400 font-medium" 
                />
              )}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <HighlightBox
                  label="Final Fee Amount"
                  value={`₹ ${(formData.finalFee || 0).toLocaleString()}`}
                  icon="payments"
                  variant="primary"
                />
              </div>
            </div>
          </div>

          {/* Card 5: Payment Configuration Toggle & Form */}
          <div className="bg-white dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-lg backdrop-blur-md space-y-6">
            
            {/* Immediate Payment Toggle Switch */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-primary/10 bg-slate-50 dark:bg-slate-900/80">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Immediate Payment</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Record initial deposit transaction now</span>
              </div>
              <ToggleSwitch
                checked={immediatePayment}
                onChange={setImmediatePayment}
              />
            </div>

            {/* Dynamic Rendering based on toggle state */}
            {immediatePayment ? (
              <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <TextInput 
                  type="number"
                  name="initialPaymentAmount"
                  label="Initial Payment Amount (INR)"
                  value={formData.initialPaymentAmount || ''}
                  onChange={(e) => handleChange('initialPaymentAmount', Number(e.target.value))}
                  leftIcon="currency_rupee"
                  helperText="Prepopulated with initial deposit installment amount"
                />

                <RadioGroup
                  label="Payment Channel"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={(val) => handleChange('paymentMethod', val)}
                  options={paymentOptions}
                  layout="grid"
                  columns={3}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <DateInput 
                    name="paymentDate"
                    label="Receipt Date"
                    value={formData.paymentDate || ''}
                    onChange={(e) => handleChange('paymentDate', e.target.value)}
                  />
                  <TextInput 
                    type="text"
                    name="transactionRef"
                    label="Transaction Ref"
                    value={formData.transactionRef || ''}
                    onChange={(e) => handleChange('transactionRef', e.target.value)}
                    placeholder="e.g. TXN-98234"
                    leftIcon="tag"
                  />
                </div>
              </div>
            ) : (
              <HighlightBox
                label="Deferred Payment Selection"
                value="No Deposit Collected"
                icon="info"
                variant="warning"
                className="text-xs"
                trailingNode={
                  <div className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold max-w-[200px] leading-snug">
                    Registration will proceed without payment. Remaining fees will be updated to student's ledger.
                  </div>
                }
              />
            )}

            {/* Complete CTAs */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <Button 
                onClick={handleComplete}
                disabled={isPending}
                loading={isPending}
                variant="contained"
                size="lg"
                startIcon="task_alt"
                className="w-full font-bold"
              >
                Complete & Activate
              </Button>
              
              <Button 
                onClick={onBack}
                variant="text"
                size="md"
                className="w-full text-slate-500"
              >
                Back to Finance Settings
              </Button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ActivationStep;

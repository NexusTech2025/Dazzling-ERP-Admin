import React, { useState } from 'react';
import { useRecordPaymentMutation } from './hooks/useFinanceQueries';

/**
 * Record Payment Modal
 * Allows admins to log transactions against specific fee installments.
 */
const RecordPaymentModal = ({ isOpen, onClose, installment }) => {
  const recordMutation = useRecordPaymentMutation();
  const [formData, setFormData] = useState({
    amount_paid: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_mode: '',
    transaction_ref: '',
    notes: ''
  });
  const [error, setError] = useState(null);

  // Reset form when installment changes
  React.useEffect(() => {
    if (installment) {
      const pending = Number(installment.amount) - Number(installment.paid_amount);
      setFormData(prev => ({ ...prev, amount_paid: pending.toString() }));
    }
  }, [installment]);

  if (!isOpen || !installment) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.amount_paid || !formData.payment_date || !formData.payment_mode) {
      setError('Please fill in all required fields.');
      return;
    }

    recordMutation.mutate({
      data: {
        installment_id: installment.installment_id,
        ...formData
      }
    }, {
      onSuccess: (res) => {
        if (res.success) {
          onClose();
        } else {
          setError(res.message || 'Failed to record payment');
        }
      },
      onError: (err) => {
        setError(err.message || 'An unexpected error occurred');
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-light dark:bg-surface-dark w-full max-w-lg rounded-2xl shadow-2xl border border-border-light dark:border-border-dark flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-border-light dark:border-border-dark flex items-center justify-between bg-background-light dark:bg-background-dark/50">
          <div>
            <h3 className="text-xl font-bold text-text-main dark:text-white">Record Payment</h3>
            <p className="text-sm text-text-secondary mt-1">Enter transaction details for this installment.</p>
          </div>
          <button onClick={onClose} className="text-text-secondary hover:text-text-main dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-100 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}

          <form id="payment-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-text-main dark:text-white">Installment ID</label>
              <div className="flex items-center px-3 py-2.5 rounded-xl bg-background-light dark:bg-background-dark border border-border-light dark:border-border-dark text-text-secondary cursor-not-allowed">
                <span className="material-symbols-outlined mr-2 text-lg">tag</span>
                <span className="text-sm font-medium">{installment.installment_id}</span>
                <span className="ml-auto text-xs font-bold text-text-main dark:text-white">
                  Pending: ${(Number(installment.amount) - Number(installment.paid_amount)).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-text-main dark:text-white">Amount Received <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
                    <span className="text-sm font-bold">$</span>
                  </div>
                  <input 
                    type="number" 
                    required
                    max={Number(installment.amount) - Number(installment.paid_amount)}
                    min={1}
                    step="0.01"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark focus:ring-2 focus:ring-primary/20 text-text-main dark:text-white text-sm outline-none transition-all" 
                    value={formData.amount_paid}
                    onChange={(e) => setFormData({...formData, amount_paid: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-text-main dark:text-white">Payment Date <span class="text-red-500">*</span></label>
                <input 
                  type="date" 
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark focus:ring-2 focus:ring-primary/20 text-text-main dark:text-white text-sm outline-none transition-all" 
                  value={formData.payment_date}
                  onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-text-main dark:text-white">Payment Mode <span class="text-red-500">*</span></label>
              <select 
                required
                className="w-full px-3 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark focus:ring-2 focus:ring-primary/20 text-text-main dark:text-white text-sm outline-none transition-all"
                value={formData.payment_mode}
                onChange={(e) => setFormData({...formData, payment_mode: e.target.value})}
              >
                <option value="" disabled>Select payment method</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer / NEFT</option>
                <option value="upi">UPI</option>
                <option value="card">Credit/Debit Card</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-text-main dark:text-white">Transaction Reference</label>
              <input 
                type="text" 
                className="w-full px-3 py-2.5 rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark focus:ring-2 focus:ring-primary/20 text-text-main dark:text-white text-sm outline-none transition-all" 
                placeholder="e.g. UPI-1234567890" 
                value={formData.transaction_ref}
                onChange={(e) => setFormData({...formData, transaction_ref: e.target.value})}
              />
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark/50 flex items-center justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 rounded-xl font-bold text-text-secondary hover:text-text-main transition-colors"
          >
            Cancel
          </button>
          <button 
            form="payment-form" 
            type="submit" 
            disabled={recordMutation.isPending}
            className="px-6 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2 disabled:opacity-70"
          >
            {recordMutation.isPending ? 'Processing...' : 'Record Payment'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default RecordPaymentModal;

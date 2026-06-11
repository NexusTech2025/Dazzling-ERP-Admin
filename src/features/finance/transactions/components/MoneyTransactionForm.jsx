import React, { useState, useEffect } from 'react';
import { useStudentsQuery } from '../../../student/hooks/useStudentQueries';
import { useTeachersQuery } from '../../../teacher/hooks/useTeacherQueries';
import { 
  useExpenseCategoriesQuery, 
  useStaffMembersQuery,
  useCreateMoneyTransactionMutation,
  useUpdateMoneyTransactionMutation
} from '../../hooks/useFinanceQueries';
import FormField from '../../../../components/ui/v2/FormField';
import TextInput from '../../../../components/ui/v2/TextInput';
import SelectInput from '../../../../components/ui/v2/SelectInput';
import DateInput from '../../../../components/ui/v2/DateInput';
import Button from '../../../../components/ui/v2/Button';

const PAYMENT_METHODS = [
  { label: 'Cash', value: 'cash' },
  { label: 'Paytm', value: 'paytm' },
  { label: 'PhonePe', value: 'phonepe' },
  { label: 'Bank Transfer', value: 'bank' },
  { label: 'Other', value: 'other' }
];

const MoneyTransactionForm = ({ isOpen, onClose, initialData }) => {
  const queryParams = { status: 'active' };
  const { data: students = [] } = useStudentsQuery(queryParams);
  const { data: teachers = [] } = useTeachersQuery(queryParams);
  const { data: staffMembers = [] } = useStaffMembersQuery(queryParams);
  const { data: categories = [] } = useExpenseCategoriesQuery();

  const createMutation = useCreateMoneyTransactionMutation();
  const updateMutation = useUpdateMoneyTransactionMutation();

  // Form State
  const [type, setType] = useState('in'); // 'in' (Received), 'out' (Sent)
  const [amount, setAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [notes, setNotes] = useState('');
  const [remarks, setRemarks] = useState('');

  // Polymorphic Party State
  const [partyType, setPartyType] = useState('student'); // 'student', 'teacher', 'staff', 'external'
  const [partyId, setPartyId] = useState('');
  const [partyName, setPartyName] = useState('');

  const [validationErrors, setValidationErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Populate form if editing
  useEffect(() => {
    if (initialData) {
      setType(initialData.type || 'in');
      setAmount(initialData.amount || '');
      setTransactionDate(initialData.transaction_date ? initialData.transaction_date.split('T')[0] : '');
      setCategoryId(initialData.category_id || '');
      setPaymentMethod(initialData.payment_method || 'cash');
      setPaymentReference(initialData.payment_reference || '');
      setNotes(initialData.notes || '');
      setRemarks(initialData.remarks || '');
      setPartyType(initialData.party_type || 'external');
      setPartyId(initialData.party_id || '');
      setPartyName(initialData.party_name || '');
    } else {
      setType('in');
      setAmount('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setCategoryId('');
      setPaymentMethod('cash');
      setPaymentReference('');
      setNotes('');
      setRemarks('');
      setPartyType('student');
      setPartyId('');
      setPartyName('');
    }
    setValidationErrors({});
    setSubmitError('');
  }, [initialData, isOpen]);

  // Restrict categories based on type
  const filteredCategories = categories.filter(cat => 
    cat.type === 'both' || cat.type === type
  );

  const categoryOptions = filteredCategories.map(cat => ({
    label: cat.name,
    value: cat.category_id
  }));

  // Party Options mapping
  const studentOptions = students.map(s => ({
    label: `${s.student_name} (${s.student_id})`,
    value: s.student_id
  }));

  const teacherOptions = teachers.map(t => ({
    label: `${t.full_name} (${t.teacher_id})`,
    value: t.teacher_id
  }));

  const staffOptions = staffMembers.map(st => ({
    label: `${st.name} (${st.staff_id})`,
    value: st.staff_id
  }));

  // Handle party selections
  const handleStudentChange = (val) => {
    setPartyId(val);
    const selected = students.find(s => s.student_id === val);
    setPartyName(selected ? selected.student_name : '');
  };

  const handleTeacherChange = (val) => {
    setPartyId(val);
    const selected = teachers.find(t => t.teacher_id === val);
    setPartyName(selected ? selected.full_name : '');
  };

  const handleStaffChange = (val) => {
    setPartyId(val);
    const selected = staffMembers.find(st => st.staff_id === val);
    setPartyName(selected ? selected.name : '');
  };

  const handlePartyTypeChange = (pType) => {
    setPartyType(pType);
    setPartyId('');
    setPartyName('');
  };

  const validate = () => {
    const errors = {};
    if (!amount || parseFloat(amount) <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }
    if (!transactionDate) {
      errors.transactionDate = 'Transaction date is required';
    }
    if (!categoryId) {
      errors.categoryId = 'Category is required';
    }
    if (partyType !== 'external' && !partyId) {
      errors.partyId = `Please select a ${partyType}`;
    }
    if (partyType === 'external' && !partyName.trim()) {
      errors.partyName = 'Counterparty name is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    const payload = {
      amount: parseFloat(amount),
      type,
      category_id: categoryId,
      payment_method: paymentMethod,
      payment_reference: paymentReference.trim() || null,
      party_type: partyType,
      party_id: partyType === 'external' ? null : partyId,
      party_name: partyName.trim(),
      transaction_date: transactionDate,
      notes: notes.trim() || null,
      remarks: remarks.trim() || null
    };

    try {
      if (initialData) {
        const res = await updateMutation.mutateAsync({
          id: initialData.transaction_id,
          data: payload
        });
        if (res.success) {
          onClose();
        } else {
          setSubmitError(res.error?.message || res.message || 'Failed to update transaction');
        }
      } else {
        const res = await createMutation.mutateAsync(payload);
        if (res.success) {
          onClose();
        } else {
          setSubmitError(res.error?.message || res.message || 'Failed to record transaction');
        }
      }
    } catch (err) {
      setSubmitError(err.message || 'Transaction submission failed');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex justify-end transition-all">
      <div className="w-full max-w-xl h-full bg-surface-light dark:bg-surface-dark border-l border-border-light dark:border-border-dark shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <header className="px-6 py-5 border-b border-border-light dark:border-border-dark flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div>
            <h2 className="text-lg font-black text-text-main dark:text-white tracking-tight">
              {initialData ? 'Edit Transaction' : 'Log Money Transaction'}
            </h2>
            <p className="text-xs text-text-secondary dark:text-on-surface-variant mt-0.5">
              Record institutional cash inflow or expense outflow
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-text-secondary hover:text-text-main dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        {/* Error Banner */}
        {submitError && (
          <div className="bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-900/50 px-6 py-3 flex items-start gap-3">
            <span className="material-symbols-outlined text-red-500 mt-0.5">report</span>
            <div className="flex-1 text-xs font-semibold text-red-800 dark:text-red-300">
              {submitError}
            </div>
          </div>
        )}

        {/* Scrollable Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Flow Type selector */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-border-light dark:border-border-dark">
            <label className="flex-1 cursor-pointer">
              <input 
                type="radio" 
                name="tx_type" 
                checked={type === 'in'} 
                onChange={() => { setType('in'); setCategoryId(''); }}
                className="hidden peer"
              />
              <div className="flex items-center justify-center py-2.5 rounded-lg transition-all peer-checked:bg-emerald-500 peer-checked:text-white text-text-secondary dark:text-on-surface-variant font-bold text-xs uppercase">
                <span className="material-symbols-outlined mr-2 text-[18px]">arrow_downward</span>
                Received
              </div>
            </label>
            <label className="flex-1 cursor-pointer">
              <input 
                type="radio" 
                name="tx_type" 
                checked={type === 'out'} 
                onChange={() => { setType('out'); setCategoryId(''); }}
                className="hidden peer"
              />
              <div className="flex items-center justify-center py-2.5 rounded-lg transition-all peer-checked:bg-red-500 peer-checked:text-white text-text-secondary dark:text-on-surface-variant font-bold text-xs uppercase">
                <span className="material-symbols-outlined mr-2 text-[18px]">arrow_upward</span>
                Sent
              </div>
            </label>
          </div>

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Amount ($)" required error={validationErrors.amount}>
              <TextInput 
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                leftIcon="payments"
              />
            </FormField>

            <FormField label="Transaction Date" required error={validationErrors.transactionDate}>
              <DateInput 
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
              />
            </FormField>
          </div>

          {/* Category & Payment Method Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Category" required error={validationErrors.categoryId}>
              <SelectInput 
                options={categoryOptions}
                value={categoryId}
                onChange={setCategoryId}
                placeholder="Select category..."
                searchable={categoryOptions.length > 5}
              />
            </FormField>

            <FormField label="Payment Method">
              <SelectInput 
                options={PAYMENT_METHODS}
                value={paymentMethod}
                onChange={setPaymentMethod}
              />
            </FormField>
          </div>

          {/* Counterparty section */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-text-secondary pl-1">
              Counterparty Information
            </label>

            {/* Tabs */}
            <div className="flex space-x-1 p-1 bg-slate-100 dark:bg-slate-900 border border-border-light dark:border-border-dark rounded-xl overflow-x-auto">
              {[
                { id: 'student', label: 'Student' },
                { id: 'teacher', label: 'Teacher' },
                { id: 'staff', label: 'Staff' },
                { id: 'external', label: 'External' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handlePartyTypeChange(tab.id)}
                  className={`flex-1 min-w-[70px] py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${
                    partyType === tab.id
                      ? 'bg-primary text-white shadow-sm font-black'
                      : 'text-text-secondary hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sub-inputs based on Tab selection */}
            <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/10 border border-dashed border-border-light dark:border-border-dark">
              {partyType === 'student' && (
                <FormField label="Select Student" required error={validationErrors.partyId}>
                  <SelectInput 
                    options={studentOptions}
                    value={partyId}
                    onChange={handleStudentChange}
                    placeholder="Search students..."
                    searchable
                  />
                </FormField>
              )}

              {partyType === 'teacher' && (
                <FormField label="Select Teacher" required error={validationErrors.partyId}>
                  <SelectInput 
                    options={teacherOptions}
                    value={partyId}
                    onChange={handleTeacherChange}
                    placeholder="Search teachers..."
                    searchable
                  />
                </FormField>
              )}

              {partyType === 'staff' && (
                <FormField label="Select Staff Member" required error={validationErrors.partyId}>
                  <SelectInput 
                    options={staffOptions}
                    value={partyId}
                    onChange={handleStaffChange}
                    placeholder="Search staff members..."
                    searchable
                  />
                </FormField>
              )}

              {partyType === 'external' && (
                <FormField label="Payer/Payee Name" required error={validationErrors.partyName}>
                  <TextInput 
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    placeholder="Enter vendor, company, or individual name..."
                  />
                </FormField>
              )}

              {partyType !== 'external' && partyName && (
                <div className="mt-2 text-xs font-semibold text-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">person</span>
                  Selected Name: {partyName} (ID: {partyId})
                </div>
              )}
            </div>
          </div>

          {/* Reference # and Remarks */}
          <div className="grid grid-cols-1 gap-4">
            <FormField label="Reference / Check #">
              <TextInput 
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g. TXN-8274110"
              />
            </FormField>

            <FormField label="Notes / Remarks">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows="2"
                className="w-full rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-text-main dark:text-white placeholder:text-text-secondary/50 resize-none transition-all"
                placeholder="Details of the payment flow..."
              />
            </FormField>

            <FormField label="Internal Accounting Remarks">
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows="2"
                className="w-full rounded-lg border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark px-4 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 text-text-main dark:text-white placeholder:text-text-secondary/50 resize-none transition-all"
                placeholder="Auditor comments, adjustments, corrections..."
              />
            </FormField>
          </div>

        </form>

        {/* Footer Actions */}
        <footer className="px-6 py-4 border-t border-border-light dark:border-border-dark bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
          <Button 
            onClick={onClose} 
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            loading={createMutation.isPending || updateMutation.isPending}
            startIcon="check_circle"
          >
            Save Transaction
          </Button>
        </footer>

      </div>
    </div>
  );
};

export default MoneyTransactionForm;

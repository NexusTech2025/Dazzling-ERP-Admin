import React, { useState } from 'react';
import { MoneyTransactionsMobileView } from '../../features/finance/transactions/components/MoneyTransactionsMobileView';
import { TransactionDetailsDrawer } from '../../features/finance/transactions/components/TransactionDetailsDrawer';

// Mock categories for testing
const MOCK_CATEGORIES = [
  { category_id: 'cat-001', name: 'Tuition Fees', type: 'in' },
  { category_id: 'cat-002', name: 'Office Supplies', type: 'out' },
  { category_id: 'cat-003', name: 'Salary / Payout', type: 'out' },
  { category_id: 'cat-004', name: 'Admissions', type: 'in' },
  { category_id: 'cat-005', name: 'Vendor Payments', type: 'out' }
];

// 10 Mock transactions covering all variations
const MOCK_TRANSACTIONS = [
  {
    transaction_id: 'MTX-M001',
    amount: 15000,
    type: 'in',
    by: 'admin_moni',
    created_by: 'admin_moni',
    from_to: 'Leo Sterling',
    category_id: 'cat-001',
    payment_method: 'phonepe',
    payment_reference: 'UPI9028108420',
    reconciliation_status: 'matched',
    party_type: 'student',
    party_id: 'STU-001',
    party_name: 'Leo Sterling',
    transaction_date: '2026-06-26',
    notes: 'Received first installment for the Advanced CS track.',
    remarks: 'Reconciliation verified against PhonePe UPI merchant logs.',
    attachment_drive_id: '1A2b3C4d5E6f7G8h9i0j'
  },
  {
    transaction_id: 'MTX-M002',
    amount: 2500,
    type: 'out',
    by: 'superadmin',
    created_by: 'superadmin',
    from_to: 'S.S Computer Solutions',
    category_id: 'cat-002',
    payment_method: 'cash',
    payment_reference: null,
    reconciliation_status: 'unreconciled',
    party_type: 'external',
    party_id: null,
    party_name: 'S.S Computer Solutions',
    transaction_date: '2026-06-25',
    notes: 'Office stationery and printer ink cartridges.',
    remarks: 'Awaiting submission of physical receipt scans.',
    attachment_drive_id: null
  },
  {
    transaction_id: 'MTX-M003',
    amount: 45000,
    type: 'out',
    by: 'admin_moni',
    created_by: 'system',
    from_to: 'Dr. Silas Vane',
    category_id: 'cat-003',
    payment_method: 'bank',
    payment_reference: 'TXN-BARC99120',
    reconciliation_status: 'matched',
    party_type: 'teacher',
    party_id: 'TCH-882',
    party_name: 'Dr. Silas Vane',
    transaction_date: '2026-06-24',
    notes: 'Faculty monthly payroll settlement.',
    remarks: 'Automated batch payout committed via HDFC bank gateway.',
    attachment_drive_id: '8h9i0j1A2b3C4d5E6f7G'
  },
  {
    transaction_id: 'MTX-M004',
    amount: 8500,
    type: 'in',
    by: 'admin_moni',
    created_by: 'admin_moni',
    from_to: 'Arthur Sterling',
    category_id: 'cat-004',
    payment_method: 'paytm',
    payment_reference: 'PAYTM8829104',
    reconciliation_status: 'discrepancy',
    party_type: 'student',
    party_id: 'STU-003',
    party_name: 'Arthur Sterling',
    transaction_date: '2026-06-23',
    notes: 'Registration fee deposit for Physics crash course.',
    remarks: 'Amount mismatch identified: Received ₹8500 but invoice indicates ₹9000.',
    attachment_drive_id: 'drive-discrepancy-id'
  },
  {
    transaction_id: 'MTX-M005',
    amount: 1200,
    type: 'out',
    by: '',
    created_by: 'receptionist_user',
    from_to: 'Acme Cleaners',
    category_id: 'cat-005',
    payment_method: 'cash',
    payment_reference: null,
    reconciliation_status: 'unreconciled',
    party_type: 'external',
    party_id: null,
    party_name: 'Acme Cleaners',
    transaction_date: '2026-06-22',
    notes: 'Sanitation supply purchases.',
    remarks: null,
    attachment_drive_id: null
  },
  {
    transaction_id: 'MTX-M006',
    amount: 18500,
    type: 'in',
    by: 'superadmin',
    created_by: 'superadmin',
    from_to: 'Sarah Connor',
    category_id: 'cat-001',
    payment_method: 'bank',
    payment_reference: 'IMPS-90281-229',
    reconciliation_status: 'matched',
    party_type: 'staff',
    party_id: 'STF-102',
    party_name: 'Sarah Connor',
    transaction_date: '2026-06-21',
    notes: 'Quarterly training enrollment ledger payment.',
    remarks: null,
    attachment_drive_id: 'attachment-sarah-connor'
  },
  {
    transaction_id: 'MTX-M007',
    amount: 3200,
    type: 'out',
    by: 'admin_moni',
    created_by: 'admin_moni',
    from_to: 'Local Milk Vendor',
    category_id: 'cat-005',
    payment_method: 'cash',
    payment_reference: null,
    reconciliation_status: 'unreconciled',
    party_type: 'external',
    party_id: null,
    party_name: 'Local Milk Vendor',
    transaction_date: '2026-06-20',
    notes: 'Pantry supplies and daily refreshments.',
    remarks: null,
    attachment_drive_id: null
  },
  {
    transaction_id: 'MTX-M008',
    amount: 9000,
    type: 'in',
    by: '',
    created_by: 'admin_moni',
    from_to: 'John Doe',
    category_id: 'cat-004',
    payment_method: 'paytm',
    payment_reference: 'PYTM-902819',
    reconciliation_status: 'matched',
    party_type: 'student',
    party_id: 'STU-009',
    party_name: 'John Doe',
    transaction_date: '2026-06-19',
    notes: 'Bootcamp enrollment processing deposit.',
    remarks: 'Verified during weekly reconciliation audits.',
    attachment_drive_id: 'attachment-john-doe'
  },
  {
    transaction_id: 'MTX-M009',
    amount: 1500,
    type: 'out',
    by: 'superadmin',
    created_by: 'superadmin',
    from_to: 'Electrician Services',
    category_id: 'cat-002',
    payment_method: 'other',
    payment_reference: 'UPI-ELECT-992',
    reconciliation_status: 'matched',
    party_type: 'external',
    party_id: null,
    party_name: 'Electrician Services',
    transaction_date: '2026-06-18',
    notes: 'Emergency circuit repairs in Room 102.',
    remarks: 'UPI reference matches the vendor transaction receipt.',
    attachment_drive_id: 'attachment-electrician'
  },
  {
    transaction_id: 'MTX-M010',
    amount: 22000,
    type: 'in',
    by: 'admin_moni',
    created_by: 'admin_moni',
    from_to: 'Alice Smith',
    category_id: 'cat-001',
    payment_method: 'phonepe',
    payment_reference: 'UPI-ALICE-SMITH-22',
    reconciliation_status: 'matched',
    party_type: 'teacher',
    party_id: 'TCH-901',
    party_name: 'Alice Smith',
    transaction_date: '2026-06-17',
    notes: 'Seminar entry fee receipts collection.',
    remarks: 'Reconciled automatically against PhonePe UPI gateway transactions.',
    attachment_drive_id: 'attachment-alice'
  }
];

const TestMoneyTransactionsMobile = () => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeDetailTx, setActiveDetailTx] = useState(null);

  // Helper mapping category IDs to names
  const getCategoryName = (id) => {
    const category = MOCK_CATEGORIES.find(c => c.category_id === id);
    return category ? category.name : 'Uncategorized';
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="pt-6 lg:pt-10 pb-6 px-4 max-w-md mx-auto space-y-6">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-text-main dark:text-white tracking-tight">Mobile Showcase</h1>
        <p className="text-text-secondary dark:text-slate-400 mt-1 text-xs">
          MoneyTransactionsMobileView isolation screen showcasing 10 mockup entries with expandable logs and theme integrations.
        </p>
      </div>

      {/* Showcase controls */}
      <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/40 border border-border-light dark:border-border-dark p-3 rounded-xl text-xs">
        <span className="font-bold text-text-secondary">Selected: {selectedIds.length}</span>
        {selectedIds.length > 0 && (
          <button 
            onClick={() => setSelectedIds([])}
            className="text-primary font-bold hover:underline"
          >
            Clear Checked
          </button>
        )}
      </div>

      {/* Mobile View Component Under Test */}
      <MoneyTransactionsMobileView 
        transactions={MOCK_TRANSACTIONS}
        selectedIds={selectedIds}
        onSelectRow={handleSelectRow}
        getCategoryName={getCategoryName}
        onRowClick={setActiveDetailTx}
        onEdit={(tx) => alert(`Edit requested for transaction #${tx.transaction_id}`)}
        onDelete={(id) => alert(`Delete requested for transaction #${id}`)}
      />

      {/* Details Slide-Over Drawer */}
      <TransactionDetailsDrawer 
        transaction={activeDetailTx} 
        isOpen={activeDetailTx !== null} 
        onClose={() => setActiveDetailTx(null)} 
        onEdit={(tx) => {
          setActiveDetailTx(null);
          alert(`Edit requested for transaction #${tx.transaction_id}`);
        }}
        getCategoryName={getCategoryName}
      />

    </div>
  );
};

export default TestMoneyTransactionsMobile;

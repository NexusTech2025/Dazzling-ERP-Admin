/**
 * @file rescheduleValidator.js
 * Client-side validation logic for Installment Rescheduler state.
 * Validates schedule rows against total fee invariants, payment protections, date ordering, and receipt alignments.
 */

import { parseISO, compareAsc } from 'date-fns';

/**
 * Validates the current working schedule draft against accounting invariants and payment protections.
 * 
 * @param {Object} feeAccount - Master Student Fee Account details ({ final_fee, amount_paid, ... }).
 * @param {Array<Object>} installments - Working draft list of installments (existing modified + new draft - deleted).
 * @param {Array<Object>} [originalInstallments=[]] - Original database snapshot for comparison.
 * @returns {Object} Validation summary object
 */
export function validateRescheduleState(feeAccount, installments = [], originalInstallments = []) {
  const expectedFee = Number(feeAccount?.final_fee || 0);
  
  // Active non-deleted rows
  const activeRows = installments.filter(row => !row.isDeleted);
  
  // 1. Calculate Total Due Amount across active rows
  const totalDue = activeRows.reduce((sum, row) => sum + (Number(row.due_amount) || 0), 0);
  const difference = Math.round((totalDue - expectedFee) * 100) / 100;
  const feeMatches = Math.abs(difference) < 0.01;

  // Row error collector map
  const rowErrors = {};
  const addRowError = (id, message) => {
    if (!rowErrors[id]) rowErrors[id] = [];
    rowErrors[id].push(message);
  };

  // 2. Check Paid Installment Deletion Violations
  let noPaidDeleted = true;
  installments.forEach(row => {
    if (row.isDeleted) {
      const orig = originalInstallments.find(o => o.installment_id === row.installment_id);
      const paidAmt = Number(orig?.paid_amount || row.paid_amount || 0);
      if (paidAmt > 0 || (orig?.status && orig.status.toLowerCase() === 'paid')) {
        noPaidDeleted = false;
        addRowError(row.installment_id || row.tempId, `Cannot delete installment with collected payments (₹${paidAmt}).`);
      }
    }
  });

  // 3. Check Minimum Due Amount against Paid Amount on active rows
  let dueGtePaid = true;
  activeRows.forEach(row => {
    const paidAmt = Number(row.paid_amount || 0);
    const dueAmt = Number(row.due_amount || 0);
    if (dueAmt < paidAmt) {
      dueGtePaid = false;
      addRowError(row.installment_id || row.tempId, `Due amount (₹${dueAmt}) cannot be less than collected payment (₹${paidAmt}).`);
    }
  });

  // 4. Check Chronological Date Sequence and Duplicates
  let datesChronological = true;
  const sortedByDate = [...activeRows]
    .filter(row => row.due_date)
    .sort((a, b) => compareAsc(parseISO(a.due_date), parseISO(b.due_date)));

  for (let i = 0; i < activeRows.length; i++) {
    const row = activeRows[i];
    if (!row.due_date) {
      addRowError(row.installment_id || row.tempId, 'Due date is required.');
      datesChronological = false;
      continue;
    }
    
    if (sortedByDate[i] && sortedByDate[i] !== row) {
      datesChronological = false;
    }
  }

  // Check duplicate dates
  const dateCounts = {};
  activeRows.forEach(row => {
    if (row.due_date) {
      dateCounts[row.due_date] = (dateCounts[row.due_date] || 0) + 1;
    }
  });
  activeRows.forEach(row => {
    if (row.due_date && dateCounts[row.due_date] > 1) {
      addRowError(row.installment_id || row.tempId, `Duplicate due date ${row.due_date}. Dates should be unique.`);
    }
  });

  const checks = {
    feeMatches,
    datesChronological,
    noPaidDeleted,
    dueGtePaid
  };

  const isValid = feeMatches && datesChronological && noPaidDeleted && dueGtePaid && Object.keys(rowErrors).length === 0;

  return {
    isValid,
    totalDue,
    expectedFee,
    difference,
    totalInstallmentsCount: activeRows.length,
    checks,
    rowErrors
  };
}

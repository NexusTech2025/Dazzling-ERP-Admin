/**
 * @file feeStatusGuards.js
 * Centralized evaluation utility for StudentFeeAccount and StudentInstallment payment eligibility.
 */

/**
 * Evaluates whether a StudentFeeAccount and its associated installment can accept new payment transactions.
 *
 * @param {Object|null} feeAccount - Target StudentFeeAccount entity record (SFA-xxx).
 * @param {Object|null} [installment=null] - Target StudentInstallment entity record (INS-xxx).
 * @returns {{ isPayable: boolean, reason: string|null, isAccountActive: boolean, isInstallmentCancelled: boolean }} State evaluation.
 */
export function evaluatePaymentEligibility(feeAccount, installment = null) {
  if (!feeAccount) {
    return {
      isPayable: false,
      reason: 'No fee account linked',
      isAccountActive: false,
      isInstallmentCancelled: false
    };
  }

  const accountStatus = (feeAccount.status || 'active').toLowerCase();
  const isAccountActive = accountStatus === 'active';

  if (!isAccountActive) {
    const displayStatus = accountStatus === 'completed' ? 'SETTLED' : accountStatus.toUpperCase();
    return {
      isPayable: false,
      reason: `Account is ${displayStatus}`,
      isAccountActive: false,
      isInstallmentCancelled: false
    };
  }

  if (installment) {
    const instStatus = (installment.status || 'pending').toLowerCase();
    if (instStatus === 'paid') {
      return {
        isPayable: false,
        reason: 'Installment already paid',
        isAccountActive: true,
        isInstallmentCancelled: false
      };
    }
    if (instStatus === 'cancelled') {
      return {
        isPayable: false,
        reason: 'Installment cancelled',
        isAccountActive: true,
        isInstallmentCancelled: true
      };
    }
  }

  return {
    isPayable: true,
    reason: null,
    isAccountActive: true,
    isInstallmentCancelled: false
  };
}

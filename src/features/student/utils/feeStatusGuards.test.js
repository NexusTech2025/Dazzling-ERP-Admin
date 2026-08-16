/**
 * @file feeStatusGuards.test.js
 * @description Unit tests for evaluatePaymentEligibility logic.
 */

import { evaluatePaymentEligibility } from './feeStatusGuards.js';

function test(testName, fn) {
  try {
    fn();
    console.log(`  ✓ PASSED: ${testName}`);
  } catch (err) {
    console.error(`  ✗ FAILED: ${testName}`);
    console.error(err);
    process.exitCode = 1;
  }
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`${msg} | Expected: ${JSON.stringify(expected)}, Received: ${JSON.stringify(actual)}`);
  }
}

console.log('🧪 Running evaluatePaymentEligibility Test Suite...\n');

test('1. Allows payment on active fee account with pending installment', () => {
  const feeAccount = { student_fee_id: 'SFA-100', status: 'active', balance_due: 5000 };
  const installment = { installment_id: 'INS-01', status: 'pending', due_amount: 5000, paid_amount: 0 };

  const res = evaluatePaymentEligibility(feeAccount, installment);
  assertEqual(res.isPayable, true, 'isPayable flag');
  assertEqual(res.isAccountActive, true, 'isAccountActive flag');
  assertEqual(res.reason, null, 'reason field');
});

test('2. Disables payment on completed / settled fee account', () => {
  const feeAccount = { student_fee_id: 'SFA-101', status: 'completed', balance_due: 0 };
  const installment = { installment_id: 'INS-02', status: 'pending', due_amount: 0, paid_amount: 0 };

  const res = evaluatePaymentEligibility(feeAccount, installment);
  assertEqual(res.isPayable, false, 'isPayable flag');
  assertEqual(res.isAccountActive, false, 'isAccountActive flag');
  assertEqual(res.reason, 'Account is SETTLED', 'reason message');
});

test('3. Disables payment on cancelled / refunded fee account', () => {
  const feeAccount = { student_fee_id: 'SFA-102', status: 'cancelled', balance_due: 0 };

  const res = evaluatePaymentEligibility(feeAccount, null);
  assertEqual(res.isPayable, false, 'isPayable flag');
  assertEqual(res.isAccountActive, false, 'isAccountActive flag');
  assertEqual(res.reason, 'Account is CANCELLED', 'reason message');
});

test('4. Disables payment on cancelled installment under active account', () => {
  const feeAccount = { student_fee_id: 'SFA-103', status: 'active', balance_due: 0 };
  const installment = { installment_id: 'INS-03', status: 'cancelled', due_amount: 0 };

  const res = evaluatePaymentEligibility(feeAccount, installment);
  assertEqual(res.isPayable, false, 'isPayable flag');
  assertEqual(res.isAccountActive, true, 'isAccountActive flag');
  assertEqual(res.isInstallmentCancelled, true, 'isInstallmentCancelled flag');
  assertEqual(res.reason, 'Installment cancelled', 'reason message');
});

test('5. Disables payment on already paid installment', () => {
  const feeAccount = { student_fee_id: 'SFA-104', status: 'active', balance_due: 0 };
  const installment = { installment_id: 'INS-04', status: 'paid', due_amount: 5000, paid_amount: 5000 };

  const res = evaluatePaymentEligibility(feeAccount, installment);
  assertEqual(res.isPayable, false, 'isPayable flag');
  assertEqual(res.reason, 'Installment already paid', 'reason message');
});

test('6. Handles null feeAccount safely', () => {
  const res = evaluatePaymentEligibility(null, null);
  assertEqual(res.isPayable, false, 'isPayable flag');
  assertEqual(res.isAccountActive, false, 'isAccountActive flag');
});

console.log('\n✅ All evaluatePaymentEligibility tests passed.\n');

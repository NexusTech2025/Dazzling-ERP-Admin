import test from 'node:test';
import assert from 'node:assert';
import { enrollmentRepo } from '../features/student/utils/enrollmentCacheHelper.js';
import { enrichStudentWithKpi } from '../features/student/utils/studentKpiHelper.js';

function formatCurrency(value, fallback = 'N/A') {
  if (value == null || value === '' || isNaN(Number(value))) {
    return fallback;
  }
  return `₹${Number(value).toLocaleString()}`;
}

test('Student KPI Fee Extraction & Schema Resolution Suite', async (t) => {

  await t.test('1. Canonical Schema Resolution (final_fee, amount_paid, balance_due, installments)', () => {
    const mockStudent = {
      student_id: 'STU-CFF573D5',
      student_name: 'Jane Doe',
      status: 'active',
      enrollments: [
        {
          enrollment_id: 'ENR-938112AF',
          enrollment_type: 'package',
          item_id: 'PKG-8E7F42CE',
          enrollment_date: '2026-06-25',
          status: 'active',
          studentfeeaccounts: [
            {
              student_fee_id: 'SFA-45791402',
              enrollment_id: 'ENR-938112AF',
              total_fee: 110000,
              final_fee: 110000,
              amount_paid: 27500,
              balance_due: 82500,
              next_due_date: null,
              status: 'active',
              installments: [
                {
                  installment_id: 'INS-1',
                  installment_number: 1,
                  due_amount: 27500,
                  paid_amount: 27500,
                  due_date: '2026-07-01',
                  status: 'paid'
                },
                {
                  installment_id: 'INS-2',
                  installment_number: 2,
                  due_amount: 27500,
                  paid_amount: 0,
                  due_date: '2026-08-01',
                  status: 'pending'
                },
                {
                  installment_id: 'INS-3',
                  installment_number: 3,
                  due_amount: 27500,
                  paid_amount: 0,
                  due_date: '2026-09-01',
                  status: 'pending'
                }
              ]
            }
          ]
        }
      ]
    };

    const summary = enrollmentRepo.extractFeeSummary(mockStudent);

    assert.strictEqual(summary.totalFees, 110000, 'Total fees should resolve to 110000 from final_fee');
    assert.strictEqual(summary.paidAmount, 27500, 'Paid amount should resolve to 27500 from amount_paid');
    assert.strictEqual(summary.balanceDue, 82500, 'Balance due should resolve to 82500 from balance_due');
    assert.strictEqual(summary.nextDueDate, '2026-08-01', 'Next due date should resolve to earliest pending installment');
    assert.strictEqual(summary.nextDueAmount, 27500, 'Next due amount should resolve to earliest pending installment due_amount');
    assert.strictEqual(summary.isFeeDue, true, 'isFeeDue should be true');
    assert.strictEqual(summary.isPaidFull, false, 'isPaidFull should be false');

    // Test UI currency formatters
    assert.strictEqual(formatCurrency(summary.totalFees), '₹1,10,000', 'Total fee currency should format to ₹1,10,000');
    assert.strictEqual(formatCurrency(summary.paidAmount), '₹27,500', 'Paid amount currency should format to ₹27,500');
    assert.strictEqual(formatCurrency(summary.balanceDue), '₹82,500', 'Due balance currency should format to ₹82,500');
  });

  await t.test('2. O(1) In-Memory Cache Lookup via enrollmentRepo.normalize', () => {
    const cachedEnrollments = [
      {
        enrollment_id: 'ENR-CACHED-01',
        student_id: 'STU-002',
        studentfeeaccounts: [
          {
            student_fee_id: 'SFA-CACHED-01',
            final_fee: 50000,
            amount_paid: 50000,
            balance_due: 0,
            status: 'active'
          }
        ]
      }
    ];

    enrollmentRepo.normalize(cachedEnrollments);

    const shallowStudent = {
      student_id: 'STU-002',
      enrollments: [
        {
          enrollment_id: 'ENR-CACHED-01'
        }
      ]
    };

    const summary = enrollmentRepo.extractFeeSummary(shallowStudent);
    assert.strictEqual(summary.totalFees, 50000, 'Should hydrate from enrollmentMap and resolve totalFees 50000');
    assert.strictEqual(summary.paidAmount, 50000, 'Should hydrate from enrollmentMap and resolve paidAmount 50000');
    assert.strictEqual(summary.balanceDue, 0, 'Balance due should be 0');
    assert.strictEqual(summary.isPaidFull, true, 'isPaidFull should be true');
    assert.strictEqual(summary.isFeeDue, false, 'isFeeDue should be false');
  });

  await t.test('3. Legacy Property Fallbacks (total_amount, agreed_amount, paid_amount)', () => {
    const legacyStudent = {
      student_id: 'STU-LEGACY',
      enrollments: [
        {
          enrollment_id: 'ENR-LEGACY',
          studentfeeaccounts: [
            {
              student_fee_id: 'SFA-LEGACY',
              agreed_amount: 35000,
              paid_amount: 15000,
              balance_amount: 20000,
              status: 'active'
            }
          ]
        }
      ]
    };

    const summary = enrollmentRepo.extractFeeSummary(legacyStudent);
    assert.strictEqual(summary.totalFees, 35000, 'Legacy agreed_amount should resolve to 35000');
    assert.strictEqual(summary.paidAmount, 15000, 'Legacy paid_amount should resolve to 15000');
    assert.strictEqual(summary.balanceDue, 20000, 'Legacy balance_amount should resolve to 20000');
    assert.strictEqual(summary.isFeeDue, true);
  });

  await t.test('4. Poison Inputs & Empty Records Robustness', () => {
    assert.deepStrictEqual(
      enrollmentRepo.extractFeeSummary(null),
      { totalFees: null, paidAmount: null, balanceDue: 0, nextDueDate: null, nextDueAmount: null, isOverdue: false, isPaidFull: false, isFeeDue: false }
    );
    assert.deepStrictEqual(
      enrollmentRepo.extractFeeSummary({}),
      { totalFees: null, paidAmount: null, balanceDue: 0, nextDueDate: null, nextDueAmount: null, isOverdue: false, isPaidFull: false, isFeeDue: false }
    );
    assert.strictEqual(formatCurrency(null), 'N/A');
    assert.strictEqual(formatCurrency(undefined), 'N/A');
    assert.strictEqual(formatCurrency(''), 'N/A');
    assert.strictEqual(formatCurrency(0), '₹0');
  });

  await t.test('5. enrichStudentWithKpi Integration & Performance Benchmark', () => {
    const student = {
      student_id: 'STU-BENCH',
      student_name: 'Bench Student',
      status: 'active',
      enrollments: [
        {
          enrollment_id: 'ENR-BENCH',
          enrollment_date: '2026-08-01',
          studentfeeaccounts: [
            {
              student_fee_id: 'SFA-BENCH',
              final_fee: 60000,
              amount_paid: 20000,
              balance_due: 40000
            }
          ]
        }
      ]
    };

    const enriched = enrichStudentWithKpi(student);
    assert.strictEqual(enriched._kpi.isFeeDue, true);
    assert.strictEqual(enriched._kpi.feeSummary.totalFees, 60000);
    assert.strictEqual(enriched._kpi.feeSummary.paidAmount, 20000);
    assert.strictEqual(enriched._kpi.feeSummary.balanceDue, 40000);

    // Benchmark 1,000 executions
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      enrollmentRepo.extractFeeSummary(student);
    }
    const elapsed = performance.now() - start;
    console.log(`⏱️ 1,000 extractFeeSummary executions completed in ${elapsed.toFixed(3)}ms`);
    assert.ok(elapsed < 20, `Execution time ${elapsed}ms should be under 20ms`);
  });
});

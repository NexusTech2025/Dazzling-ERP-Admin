/**
 * @file enrollmentCacheHelper.js
 * Normalized Enrollment Repository utility with O(1) Hashmaps (enrollmentMap, feeAccountMap).
 * Provides fast lookups, direct RAM cache updates on queryKeys.enrollment.list, and
 * background query invalidation.
 */

import { queryKeys, EMPTY_FILTER } from '../../../lib/react-query/queryKeys';

/**
 * Enterprise Repository for Hydrated Enrollment Cache wrangling and O(1) Hashmap lookups.
 */
export class EnrollmentRepo {
  constructor() {
    /** @type {Map<string, Object>} Map of enrollment_id -> hydrated Enrollment record */
    this.enrollmentMap = new Map();

    /** @type {Map<string, Object>} Map of student_fee_id -> { feeAccount, enrollmentId, parentEnrollment } */
    this.feeAccountMap = new Map();
  }

  /**
   * Normalizes an array of hydrated enrollments into O(1) lookup maps.
   * @param {Array<Object>} enrollments - List of hydrated enrollment records.
   * @returns {Object} Hashmaps reference { enrollmentMap, feeAccountMap }.
   */
  normalize(enrollments = []) {
    this.enrollmentMap.clear();
    this.feeAccountMap.clear();

    if (!Array.isArray(enrollments)) return { enrollmentMap: this.enrollmentMap, feeAccountMap: this.feeAccountMap };

    for (let i = 0; i < enrollments.length; i++) {
      const enr = enrollments[i];
      const enrId = enr.enrollment_id || enr.id;

      if (enrId) {
        this.enrollmentMap.set(enrId, enr);
      }

      if (Array.isArray(enr.studentfeeaccounts)) {
        for (let j = 0; j < enr.studentfeeaccounts.length; j++) {
          const sfa = enr.studentfeeaccounts[j];
          if (sfa?.student_fee_id) {
            this.feeAccountMap.set(sfa.student_fee_id, {
              feeAccount: sfa,
              enrollmentId: enrId,
              parentEnrollment: enr
            });
          }
        }
      }
    }

    return { enrollmentMap: this.enrollmentMap, feeAccountMap: this.feeAccountMap };
  }

  /**
   * O(1) Lookup: Get enrollment by enrollment_id.
   * @param {string} enrollmentId - Target enrollment identifier.
   * @returns {Object|null} Hydrated enrollment record or null.
   */
  getByEnrollmentId(enrollmentId) {
    return this.enrollmentMap.get(enrollmentId) || null;
  }

  /**
   * O(1) Lookup: Get fee account & parent enrollment by student_fee_id.
   * @param {string} studentFeeId - Target fee account identifier ("SFA-xxx").
   * @returns {Object|null} Hash mapping { feeAccount, enrollmentId, parentEnrollment } or null.
   */
  getByFeeAccountId(studentFeeId) {
    return this.feeAccountMap.get(studentFeeId) || null;
  }

  /**
   * O(1) Lookup: Get installments array for a specific student_fee_id.
   * @param {string} studentFeeId - Target fee account identifier.
   * @returns {Array<Object>} List of installment objects.
   */
  getInstallmentsByFeeId(studentFeeId) {
    const entry = this.getByFeeAccountId(studentFeeId);
    return entry?.feeAccount?.installments || [];
  }

  /**
   * Performs an O(1) targeted mutation on queryKeys.enrollment.list(EMPTY_FILTER) in React Query RAM cache.
   * 
   * @param {import('@tanstack/react-query').QueryClient} queryClient - Active QueryClient instance.
   * @param {string} studentFeeId - Target student_fee_id ("SFA-xxx").
   * @param {Object} updateData - Updated attributes { balance_due, next_due_date, account_status, status }.
   */
  updateFeeAccountCache(queryClient, studentFeeId, updateData = {}) {
    const listKey = queryKeys.enrollment.list(EMPTY_FILTER);
    const cachedList = queryClient.getQueryData(listKey) || [];

    // Ensure maps are primed
    this.normalize(cachedList);

    const targetEntry = this.getByFeeAccountId(studentFeeId);
    if (!targetEntry) {
      console.warn(`[EnrollmentRepo] Fee Account ${studentFeeId} not found in cache for fast update.`);
      return;
    }

    // Direct object mutation in cached list
    const { feeAccount } = targetEntry;
    if (updateData.balance_due !== undefined) feeAccount.balance_due = updateData.balance_due;
    if (updateData.next_due_date !== undefined) feeAccount.next_due_date = updateData.next_due_date;
    if (updateData.account_status || updateData.status) {
      feeAccount.status = updateData.account_status || updateData.status;
    }

    // Write back updated dataset & re-prime maps
    queryClient.setQueryData(listKey, [...cachedList]);
    this.normalize(cachedList);
  }

  /**
   * Triggers silent background invalidation of enrollment & finance queries.
   * @param {import('@tanstack/react-query').QueryClient} queryClient - Active QueryClient instance.
   */
  invalidate(queryClient) {
    queryClient.invalidateQueries({ queryKey: queryKeys.enrollment.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.finance.all });
  }
}

// Export singleton instance
export const enrollmentRepo = new EnrollmentRepo();

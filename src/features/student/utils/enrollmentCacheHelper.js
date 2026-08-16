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
    if (updateData.total_fee !== undefined) feeAccount.total_fee = Number(updateData.total_fee);
    if (updateData.discount !== undefined) feeAccount.discount = Number(updateData.discount);
    if (updateData.final_fee !== undefined) feeAccount.final_fee = Number(updateData.final_fee);
    if (updateData.amount_paid !== undefined) feeAccount.amount_paid = Number(updateData.amount_paid);
    if (updateData.balance_due !== undefined) feeAccount.balance_due = Number(updateData.balance_due);
    if (updateData.next_due_date !== undefined) feeAccount.next_due_date = updateData.next_due_date;
    if (updateData.account_status || updateData.status) {
      feeAccount.status = updateData.account_status || updateData.status;
    }
    if (updateData.adjustment_type !== undefined) feeAccount.adjustment_type = updateData.adjustment_type;
    if (updateData.coupon_code !== undefined) feeAccount.coupon_code = updateData.coupon_code;
    if (updateData.remarks !== undefined) feeAccount.remarks = updateData.remarks;
    if (Array.isArray(updateData.installments)) feeAccount.installments = updateData.installments;

    // Write back updated dataset & re-prime maps
    queryClient.setQueryData(listKey, [...cachedList]);
    this.normalize(cachedList);
  }

  /**
   * Performs an O(1) targeted mutation on queryKeys.enrollment.list(EMPTY_FILTER) in React Query RAM cache
   * for updated enrollment, allocation fields, and fee account updates.
   * 
   * @param {import('@tanstack/react-query').QueryClient} queryClient - Active QueryClient instance.
   * @param {string} enrollmentId - Target enrollment primary key ("ENR-xxx").
   * @param {Object} updatedData - Updated fields { roll_number, enrollment_date, status, academic_status, metadata }.
   * @param {Array<Object>} [updatedAllocations=[]] - Updated allocations array.
   * @param {Object} [feeAccountUpdate=null] - Updated fee account data from API response.
   */
  updateEnrollmentCache(queryClient, enrollmentId, updatedData = {}, updatedAllocations = [], feeAccountUpdate = null) {
    const listKey = queryKeys.enrollment.list(EMPTY_FILTER);
    const cachedList = queryClient.getQueryData(listKey) || [];

    this.normalize(cachedList);

    const targetEnrollment = this.getByEnrollmentId(enrollmentId);
    if (!targetEnrollment) {
      console.warn(`[EnrollmentRepo] Enrollment ${enrollmentId} not found in cache for fast update.`);
      return;
    }

    if (updatedData.roll_number !== undefined) targetEnrollment.roll_number = updatedData.roll_number;
    if (updatedData.enrollment_date !== undefined) targetEnrollment.enrollment_date = updatedData.enrollment_date;
    if (updatedData.status !== undefined) targetEnrollment.status = updatedData.status;
    if (updatedData.academic_status !== undefined) targetEnrollment.academic_status = updatedData.academic_status;
    if (updatedData.metadata !== undefined) targetEnrollment.metadata = updatedData.metadata;

    if (Array.isArray(updatedAllocations) && updatedAllocations.length > 0 && Array.isArray(targetEnrollment.allocations)) {
      const allocMap = new Map(updatedAllocations.map(a => [a.allocation_id || a.id, a]));
      targetEnrollment.allocations = targetEnrollment.allocations.map(alloc => {
        const allocId = alloc.allocation_id || alloc.id;
        const updatedAlloc = allocMap.get(allocId);
        return updatedAlloc ? { ...alloc, ...updatedAlloc } : alloc;
      });
    }

    if (feeAccountUpdate) {
      const accounts = Array.isArray(targetEnrollment.studentfeeaccounts)
        ? targetEnrollment.studentfeeaccounts
        : (Array.isArray(targetEnrollment.StudentFeeAccount) ? targetEnrollment.StudentFeeAccount : []);
      const sfa = accounts[0];
      if (sfa) {
        if (feeAccountUpdate.final_fee !== undefined) sfa.final_fee = Number(feeAccountUpdate.final_fee);
        if (feeAccountUpdate.total_fee !== undefined) sfa.total_fee = Number(feeAccountUpdate.total_fee);
        if (feeAccountUpdate.amount_paid !== undefined) sfa.amount_paid = Number(feeAccountUpdate.amount_paid);
        if (feeAccountUpdate.balance_due !== undefined) sfa.balance_due = Number(feeAccountUpdate.balance_due);
        if (feeAccountUpdate.status !== undefined) sfa.status = feeAccountUpdate.status;
        if (feeAccountUpdate.remarks !== undefined) sfa.remarks = feeAccountUpdate.remarks;
      }
    }

    queryClient.setQueryData(listKey, [...cachedList]);
    this.normalize(cachedList);
  }


  /**
   * Repository method to extract allocation view models from a hydrated Enrollment entity (Legacy / Direct Enrollment views).
   * 
   * @param {Object} enrollment - Hydrated Enrollment record.
   * @returns {Array<Object>} List of allocation view models [{ allocationId, batchId, batchName, courseId, courseName, status }].
   */
  getAllocationsViewModel(enrollment) {
    if (!enrollment || !Array.isArray(enrollment.allocations) || enrollment.allocations.length === 0) {
      return [];
    }
    return enrollment.allocations.map(alloc => ({
      allocationId: alloc.allocation_id,
      batchId: alloc.batch?.batch_id || alloc.batch_id,
      batchName: alloc.batch?.batch_name || alloc.batch_name || 'Unassigned Batch',
      courseId: alloc.course?.course_id || alloc.course_id,
      courseName: alloc.course?.name || alloc.course_name || 'Unassigned Course',
      status: (alloc.status || 'active').toLowerCase()
    }));
  }

  /**
   * Safely extracts fee accounting metrics for a student by querying embedded fee accounts or enrollmentRepo O(1) cache.
   * 
   * @param {Object} student - Student entity record.
   * @returns {{ totalFees: number|null, paidAmount: number|null, balanceDue: number, nextDueDate: string|null, isOverdue: boolean, isPaidFull: boolean, isFeeDue: boolean }}
   */
  extractFeeSummary(student) {
    if (!student || typeof student !== 'object') {
      return { totalFees: null, paidAmount: null, balanceDue: 0, nextDueDate: null, isOverdue: false, isPaidFull: false, isFeeDue: false };
    }

    try {
      const enrollments = Array.isArray(student.enrollments) 
        ? student.enrollments 
        : (Array.isArray(student.Enrollment) ? student.Enrollment : []);
      
      let feeAcc = null;
      let enr = enrollments[0];

      for (const rawEnr of enrollments) {
        const enrId = rawEnr?.enrollment_id || rawEnr?.id;
        const hydrated = enrId ? this.getByEnrollmentId(enrId) : null;
        const targetEnr = hydrated || rawEnr;

        const feeAccounts = Array.isArray(targetEnr?.studentfeeaccounts)
          ? targetEnr.studentfeeaccounts
          : (Array.isArray(targetEnr?.StudentFeeAccount) ? targetEnr.StudentFeeAccount : []);
        
        if (feeAccounts.length > 0) {
          feeAcc = feeAccounts[0];
          enr = targetEnr;
          break;
        }
      }

      if (!feeAcc && enr) {
        const feeAccounts = Array.isArray(enr?.studentfeeaccounts)
          ? enr.studentfeeaccounts
          : (Array.isArray(enr?.StudentFeeAccount) ? enr.StudentFeeAccount : []);
        feeAcc = feeAccounts[0] || enr?.feeAccount || enr?.student_fee_account || null;
      }

      const totalFees = feeAcc?.total_amount != null ? Number(feeAcc.total_amount) : (feeAcc?.agreed_amount != null ? Number(feeAcc.agreed_amount) : null);
      const paidAmount = feeAcc?.paid_amount != null ? Number(feeAcc.paid_amount) : null;
      const balanceDue = feeAcc?.balance_due != null
        ? Number(feeAcc.balance_due)
        : (feeAcc?.balance_amount != null
          ? Number(feeAcc.balance_amount)
          : (totalFees != null && paidAmount != null ? Math.max(0, totalFees - paidAmount) : 0));

      let nextDueDate = feeAcc?.next_due_date || null;

      if (Array.isArray(feeAcc?.installments) && feeAcc.installments.length > 0) {
        const pending = feeAcc.installments
          .filter(i => i.status === 'pending' || i.status === 'partially_paid')
          .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
        if (pending.length > 0) {
          nextDueDate = pending[0].due_date || nextDueDate;
        }
      }

      const isFeeDue = balanceDue > 0;
      const isOverdue = !!(nextDueDate && new Date(nextDueDate) < new Date() && isFeeDue);
      const isPaidFull = balanceDue === 0 && enrollments.length > 0;

      return { totalFees, paidAmount, balanceDue, nextDueDate, isOverdue, isPaidFull, isFeeDue };
    } catch (err) {
      console.warn('[EnrollmentRepo:extractFeeSummary] Error:', err);
      return { totalFees: null, paidAmount: null, balanceDue: 0, nextDueDate: null, isOverdue: false, isPaidFull: false, isFeeDue: false };
    }
  }

  /**
   * Evaluates student enrollment date against lookback threshold.
   * 
   * @param {Object} student - Student entity record.
   * @param {number} [daysThreshold=30] - Lookback window in days.
   * @returns {{ isNewAdmission: boolean, admissionDate: string|null }}
   */
  evaluateAdmissionDate(student, daysThreshold = 30) {
    if (!student || typeof student !== 'object') {
      return { isNewAdmission: false, admissionDate: null };
    }
    try {
      const enrollments = Array.isArray(student.enrollments) ? student.enrollments : (Array.isArray(student.Enrollment) ? student.Enrollment : []);
      const enrDate = enrollments[0]?.enrollment_date || null;
      if (!enrDate) return { isNewAdmission: false, admissionDate: null };

      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);
      const parsed = new Date(enrDate);
      const isNewAdmission = !isNaN(parsed.getTime()) && parsed >= thresholdDate;

      return { isNewAdmission, admissionDate: enrDate };
    } catch (err) {
      console.warn('[EnrollmentRepo:evaluateAdmissionDate] Error:', err);
      return { isNewAdmission: false, admissionDate: null };
    }
  }

  /**
   * Performs an O(1) targeted mutation on queryKeys.enrollment.list(EMPTY_FILTER) in React Query RAM cache
   * for a discarded enrollment contract.
   * 
   * @param {import('@tanstack/react-query').QueryClient} queryClient - Active QueryClient instance.
   * @param {string} enrollmentId - Target enrollment primary key ("ENR-xxx").
   * @param {string} [discardMode="refund"] - Settlement strategy ("refund" | "no_refund").
   */
  discardEnrollmentCache(queryClient, enrollmentId, discardMode = 'refund') {
    const listKey = queryKeys.enrollment.list(EMPTY_FILTER);
    const cachedList = queryClient.getQueryData(listKey) || [];

    this.normalize(cachedList);

    const targetEnrollment = this.getByEnrollmentId(enrollmentId);
    if (!targetEnrollment) {
      console.warn(`[EnrollmentRepo] Enrollment ${enrollmentId} not found in cache for discard.`);
      return;
    }

    targetEnrollment.status = 'discarded';
    targetEnrollment.academic_status = 'withdrawn';

    if (Array.isArray(targetEnrollment.allocations)) {
      targetEnrollment.allocations.forEach(alloc => {
        alloc.status = 'dropped';
        alloc.dropped_at = new Date().toISOString();
      });
    }

    if (Array.isArray(targetEnrollment.studentfeeaccounts)) {
      targetEnrollment.studentfeeaccounts.forEach(sfa => {
        sfa.status = discardMode === 'refund' ? 'refunded' : 'cancelled';
        sfa.balance_due = 0;
        if (discardMode === 'refund') sfa.amount_paid = 0;
      });
    }

    queryClient.setQueryData(listKey, [...cachedList]);
    this.normalize(cachedList);
  }

  /**
   * Performs an O(1) targeted mutation on queryKeys.enrollment.list(EMPTY_FILTER) in React Query RAM cache
   * for a migrated enrollment contract.
   * 
   * @param {import('@tanstack/react-query').QueryClient} queryClient - Active QueryClient instance.
   * @param {string} oldEnrollmentId - Source enrollment primary key ("ENR-xxx").
   * @param {Object} [newContract={}] - Hydrated new enrollment record returned by API response.
   */
  migrateEnrollmentCache(queryClient, oldEnrollmentId, newContract = {}) {
    const listKey = queryKeys.enrollment.list(EMPTY_FILTER);
    const cachedList = queryClient.getQueryData(listKey) || [];

    this.normalize(cachedList);

    const oldEnrollment = this.getByEnrollmentId(oldEnrollmentId);
    if (oldEnrollment) {
      oldEnrollment.status = 'withdrawn';
      oldEnrollment.academic_status = 'withdrawn';
    }

    if (newContract && (newContract.enrollment_id || newContract.id)) {
      cachedList.unshift(newContract);
    }

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

  /**
   * Resolves and normalizes an academic item (Course or Package) for a given enrollment entity.
   * @param {Object} enrollment - Target enrollment contract record.
   * @param {Array<Object>} [items=[]] - Cached list of Courses or Packages.
   * @param {string|null} [itemType=null] - Explicit domain discriminator ('course' | 'package' | 'subject').
   * @returns {{ itemName: string, itemType: string, itemCode: string, item: Object|null }} Standardized item view model.
   */
  resolveItem(enrollment, items = [], itemType = null) {
    return resolveEnrollmentItem(enrollment, items, itemType);
  }
}

import { batchRepo } from '../../batch/utils/batchCacheHelper';

/**
 * Resolves and normalizes an enrollment's linked academic item (Course or Package) 
 * from cached collections into a standardized View Model contract.
 *
 * @param {Object} enrollment - Target enrollment record containing { item_id, enrollment_type }.
 * @param {Array<Object>} [items=[]] - Array of cached Course or Package records matching the target domain.
 * @param {('course'|'package'|'subject'|null)} [itemType=null] - Explicit domain discriminator. If omitted, inferred from enrollment.enrollment_type or item_id prefix.
 * @returns {{ itemName: string, itemType: string, itemCode: string, item: Object|null }} Standardized item descriptor contract.
 */
export function resolveEnrollmentItem(enrollment, items = [], itemType = null) {
  if (!enrollment) {
    return {
      itemName: 'Academic Program',
      itemType: 'Course',
      itemCode: 'N/A',
      item: null
    };
  }

  const rawItemId = enrollment.item_id || enrollment.course_id || enrollment.package_id || '';
  const resolvedType = (
    itemType ||
    enrollment.enrollment_type ||
    (rawItemId.startsWith('PKG') ? 'package' : 'course')
  ).toLowerCase();

  const isPackage = resolvedType === 'package' || rawItemId.startsWith('PKG');
  const normalizedDisplayType = isPackage ? 'Package' : (resolvedType === 'subject' ? 'Subject' : 'Course');

  if (!rawItemId || !Array.isArray(items) || items.length === 0) {
    return {
      itemName: enrollment.item_name || enrollment.package_name || enrollment.course_name || (isPackage ? 'Academic Package' : 'Academic Course'),
      itemType: normalizedDisplayType,
      itemCode: rawItemId || 'N/A',
      item: null
    };
  }

  const matched = items.find(item => {
    if (!item) return false;
    const id = item.package_id || item.course_id || item.id;
    return String(id).trim() === String(rawItemId).trim();
  });

  if (!matched) {
    return {
      itemName: enrollment.item_name || enrollment.package_name || enrollment.course_name || (isPackage ? 'Academic Package' : 'Academic Course'),
      itemType: normalizedDisplayType,
      itemCode: rawItemId || 'N/A',
      item: null
    };
  }

  const itemName = isPackage
    ? (matched.package_name || matched.name || 'Academic Package')
    : (matched.name || matched.course_name || 'Academic Course');

  const itemCode = isPackage
    ? (matched.package_code || matched.code || rawItemId)
    : (matched.course_code || matched.code || rawItemId);

  return {
    itemName,
    itemType: normalizedDisplayType,
    itemCode,
    item: matched
  };
}

/**
 * Extracts normalized batch allocation view models directly from a hydrated Student object (useStudentsQuery),
 * delegating relational joining of BatchAllocation junction records to batchRepo.
 * 
 * @param {Object} student - Hydrated student record from useStudentsQuery.
 * @param {Array<Object>|Map<string, Object>} [batches=[]] - Cached batches list or lookup map.
 * @param {Array<Object>|Map<string, Object>} [courses=[]] - Cached courses list or lookup map.
 * @returns {Array<Object>} List of allocation view models [{ allocationId, batchId, batchName, courseId, courseName, status }].
 */
export function getStudentAllocationsViewModel(student, batches = [], courses = [], courseTypes = []) {
  return batchRepo.getStudentAllocations(student, batches, courses, courseTypes);
}

/**
 * Computes frequency counts of CourseTypes across a student's allocations.
 * Sorts categories from highest to lowest count and prepares badge models.
 * 
 * @param {Array<Object>} allocations - Array of allocation objects from BatchRepo/getStudentAllocationsViewModel.
 * @returns {{ badges: Array<{ type: string, count: number, label: string }>, overflowCount: number }}
 */
export function getCourseTypeSummary(allocations = []) {
  if (!Array.isArray(allocations) || allocations.length === 0) {
    return { badges: [], overflowCount: 0 };
  }

  const freqMap = new Map();
  allocations.forEach(alloc => {
    const type = alloc.courseTypeName || 'REGULAR';
    freqMap.set(type, (freqMap.get(type) || 0) + 1);
  });

  const sorted = Array.from(freqMap.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  const totalCategories = sorted.length;

  if (totalCategories > 3) {
    const visible = sorted.slice(0, 2).map(item => ({
      ...item,
      label: item.count > 1 ? `${item.type} (${item.count})` : item.type
    }));
    const overflowCount = totalCategories - 2;
    return { badges: visible, overflowCount };
  }

  const visible = sorted.map(item => ({
    ...item,
    label: item.count > 1 ? `${item.type} (${item.count})` : item.type
  }));

  return { badges: visible, overflowCount: 0 };
}

// Export singleton instance
export const enrollmentRepo = new EnrollmentRepo();

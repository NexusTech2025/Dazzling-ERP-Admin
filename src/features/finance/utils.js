/**
 * Generic utility to map relational connections between lists of entities.
 * Supporting hasOne and hasMany mapping rules.
 * 
 * @param {Array} sourceList - The list of entities to be enriched (e.g., StudentFeeAccount).
 * @param {Array} targetList - The list containing related records to map in (e.g., Enrollment).
 * @param {string} sourceKey - Foreign key or ID key on the source record.
 * @param {string} targetKey - Matching key on the target record.
 * @param {string} relationProp - Property key to inject the result into on source records.
 * @param {string} [type='hasMany'] - Mapping cardinality: 'hasOne' or 'hasMany'.
 * @returns {Array} Enriched source list with resolved relational mappings.
 */
export const mapRelation = (sourceList = [], targetList = [], sourceKey, targetKey, relationProp, type = 'hasMany') => {
  if (type === 'hasOne') {
    const targetMap = new Map(targetList.map(item => [item[targetKey], item]));
    return sourceList.map(src => ({
      ...src,
      [relationProp]: targetMap.get(src[sourceKey]) || null
    }));
  } else {
    // hasMany mapping
    const targetMap = new Map();
    targetList.forEach(item => {
      const keyVal = item[targetKey];
      if (keyVal !== undefined && keyVal !== null) {
        if (!targetMap.has(keyVal)) {
          targetMap.set(keyVal, []);
        }
        targetMap.get(keyVal).push(item);
      }
    });
    return sourceList.map(src => ({
      ...src,
      [relationProp]: targetMap.get(src[sourceKey]) || []
    }));
  }
};

/**
 * Hydrates StudentFeeAccounts by nesting Enrollments, which are in turn enriched with
 * their corresponding student, course/package details, and batch allocations.
 * 
 * @param {Object} datasets - The source collection arrays.
 * @param {Array} datasets.studentFeeAccounts
 * @param {Array} datasets.enrollments
 * @param {Array} datasets.students
 * @param {Array} datasets.courses
 * @param {Array} datasets.packages
 * @param {Array} datasets.batchAllocations
 * @returns {Array} Fully hydrated StudentFeeAccount entities.
 */
export const hydrateStudentFeeAccounts = ({
  studentFeeAccounts = [],
  enrollments = [],
  students = [],
  courses = [],
  packages = [],
  batchAllocations = []
}) => {
  // Step 1: Enrich Enrollments with Students
  let enrichedEnrollments = mapRelation(enrollments, students, 'student_id', 'student_id', 'student', 'hasOne');

  // Step 2: Enrich Enrollments with Batch Allocations
  enrichedEnrollments = mapRelation(enrichedEnrollments, batchAllocations, 'enrollment_id', 'enrollment_id', 'allocations', 'hasMany');

  // Step 3: Enrich Enrollments with Polymorphic item (Course or Package)
  const courseMap = new Map(courses.map(c => [c.course_id, c]));
  const packageMap = new Map(packages.map(p => [p.package_id, p]));

  enrichedEnrollments = enrichedEnrollments.map(enr => {
    let itemDetails = null;
    if (enr.enrollment_type === 'course' || enr.enrollment_type === 'subject') {
      itemDetails = courseMap.get(enr.item_id) || null;
    } else if (enr.enrollment_type === 'package') {
      itemDetails = packageMap.get(enr.item_id) || null;
    }
    return {
      ...enr,
      item: itemDetails
    };
  });

  // Step 4: Inject Enriched Enrollments into StudentFeeAccounts
  const hydratedAccounts = mapRelation(studentFeeAccounts, enrichedEnrollments, 'enrollment_id', 'enrollment_id', 'enrollment', 'hasOne');

  return hydratedAccounts;
};

/**
 * Aggregates a list of hydrated student fee accounts by student ID.
 * Collapses multiple program records per student into a single record with summed values.
 * 
 * @param {Array} mappedAccounts - Hydrated student fee accounts list.
 * @returns {Array} List of aggregated student billing records.
 */
export const aggregateBillingAccountsByStudent = (mappedAccounts = []) => {
  const studentMap = new Map();

  mappedAccounts.forEach(acc => {
    const studentId = acc.student_id;
    if (!studentId) return;

    if (!studentMap.has(studentId)) {
      studentMap.set(studentId, {
        student_id: studentId,
        studentName: acc.studentName || 'Unknown Student',
        accounts: [],
        total_fee: 0,
        amount_paid: 0,
        balance_due: 0,
        statuses: new Set(),
        classes: new Set()
      });
    }

    const record = studentMap.get(studentId);
    record.accounts.push(acc);
    if (acc.studentClass) {
      record.classes.add(acc.studentClass);
    }
    
    const fee = Number(acc.final_fee !== undefined ? acc.final_fee : (acc.total_fee - (acc.discount || 0)));
    record.total_fee += fee;
    record.amount_paid += Number(acc.amount_paid || 0);
    record.balance_due += Number(acc.balance_due || 0);
    if (acc.status) {
      record.statuses.add(acc.status.toLowerCase());
    }
  });

  return Array.from(studentMap.values()).map(record => {
    // Determine aggregated status priority:
    // 1. overdue / defaulted -> overdue
    // 2. partially_paid -> partially_paid
    // 3. paid / completed -> completed (only if all accounts are completed)
    // 4. default to active
    let status = 'active';
    if (record.statuses.has('overdue') || record.statuses.has('defaulted')) {
      status = 'overdue';
    } else if (record.statuses.has('partially_paid')) {
      status = 'partially_paid';
    } else if (record.statuses.has('paid') || record.statuses.has('completed')) {
      const allCompleted = Array.from(record.statuses).every(s => s === 'paid' || s === 'completed');
      status = allCompleted ? 'completed' : 'active';
    }

    return {
      student_id: record.student_id,
      studentName: record.studentName,
      total_fee: record.total_fee,
      amount_paid: record.amount_paid,
      balance_due: record.balance_due,
      status: status,
      studentClass: Array.from(record.classes).filter(Boolean).join(', ') || 'N/A',
      accounts: record.accounts
    };
  });
};

/**
 * Scans General Ledger MoneyTransactions to find outflows for a specific teacher without a linked TPT record.
 * 
 * @param {Array<Object>} moneyTransactions - Collection of General Ledger MoneyTransaction objects.
 * @param {string} teacherId - Target teacher primary identifier (e.g., 'TCH-00001').
 * @returns {Array<Object>} List of unlinked teacher GL outflow records.
 */
export const findUnlinkedTeacherGlOutflows = (moneyTransactions = [], teacherId = '') => {
  if (!teacherId || !Array.isArray(moneyTransactions)) return [];

  return moneyTransactions.filter(mt => {
    // 1. Must be an outflow (expense transaction, DEBIT, or type === 'out')
    const isOutflow = mt.type === 'out' || mt.transaction_type === 'expense' || mt.type === 'DEBIT';
    if (!isOutflow) return false;

    // 2. Check party association (party_id matches teacherId, OR party_type === 'teacher')
    const hasMatchingPartyId = mt.party_id && String(mt.party_id) === String(teacherId);
    const isTeacherPartyType = mt.party_type && String(mt.party_type).toLowerCase() === 'teacher';
    
    // If party_id exists and points to a DIFFERENT teacher, exclude it
    if (mt.party_id && String(mt.party_id) !== String(teacherId)) {
      return false;
    }

    if (!hasMatchingPartyId && !isTeacherPartyType) {
      return false;
    }

    // 3. Must lack a linked TPT reference key and not be marked non-salary
    const hasTptKey = mt.payment_reference && (mt.payment_reference.includes('TPT-') || mt.payment_reference.includes('tpt-'));
    const isNonSalary = mt.payment_reference === 'NON_SALARY_REIMBURSEMENT';
    return !hasTptKey && !isNonSalary;
  });
};

/**
 * Utility helper to identify candidate matching General Ledger transactions for an unlinked Teacher Payment.
 * 
 * @param {Object} tptRecord - Unsynced TeacherPaymentTransaction record.
 * @param {Array<Object>} unlinkedGlOutflows - List of unlinked GL MoneyTransactions.
 * @returns {Object|null} Matching MoneyTransaction candidate or null if no match found within 7-day window.
 */
export const findSmartGlMatch = (tptRecord, unlinkedGlOutflows = []) => {
  if (!tptRecord || !tptRecord.amount || !Array.isArray(unlinkedGlOutflows)) return null;

  return unlinkedGlOutflows.find(mt => {
    // Exact amount match check
    const isAmountEqual = Math.abs(Number(mt.amount || 0) - Number(tptRecord.amount || 0)) < 0.01;
    if (!isAmountEqual) return false;

    // Date proximity heuristic: Math.abs(diffDays) <= 7
    try {
      const tptDate = new Date(tptRecord.transaction_date).getTime();
      const mtDate = new Date(mt.transaction_date).getTime();
      if (isNaN(tptDate) || isNaN(mtDate)) return false;
      const diffDays = Math.abs(tptDate - mtDate) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    } catch {
      return false;
    }
  }) || null;
};

/**
 * Verifies reconciliation match between a General Ledger MoneyTransaction and a Teacher Payment.
 * 
 * @param {Object} glRecord - General Ledger MoneyTransaction object.
 * @param {Object} tptRecord - Sub-Ledger TeacherPaymentTransaction object.
 * @returns {Object} Reconciliation audit report { isReconciled, isAmountEqual, isLinked, glAmount, tptAmount, compositeKey, delta }.
 */
export const verifyGlSubledgerLink = (glRecord = {}, tptRecord = {}) => {
  const glAmount = Number(glRecord?.amount || 0);
  const tptAmount = Number(tptRecord?.amount || 0);
  const isAmountEqual = Math.abs(glAmount - tptAmount) < 0.01;

  const teacherId = tptRecord?.teacher_id || glRecord?.party_id;
  const salaryMonth = tptRecord?.salary_month || (glRecord?.transaction_date ? glRecord.transaction_date.slice(0, 7) : '');
  const tptId = tptRecord?.transaction_id || tptRecord?.id;
  const compositeKey = `${teacherId}_${salaryMonth}_${tptId}`;

  const isLinked = glRecord?.payment_reference === compositeKey || 
                  (glRecord?.payment_reference && glRecord.payment_reference.includes(tptId));

  return {
    isReconciled: isAmountEqual && isLinked,
    isAmountEqual,
    isLinked,
    glAmount,
    tptAmount,
    compositeKey,
    delta: Math.abs(glAmount - tptAmount)
  };
};



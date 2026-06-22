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

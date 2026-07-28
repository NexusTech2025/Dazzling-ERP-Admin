/**
 * @file marksheetCalculators.js
 * @module BatchMarksheetCalculators
 * @description In-memory calculation engine for consolidated batch test marksheets, cumulative averages, per-test class averages, and batch rankings.
 */

/**
 * Computes consolidated multi-test performance matrix, cumulative averages, and batch ranks for all enrolled students.
 * Handles edge cases such as missing marks, un-evaluated tests, absent statuses, zero totals, and score ties.
 * 
 * @param {Array<Object>} tests - Array of batch test records (each with an attached `marks` array).
 * @param {Array<Object>} students - Array of student allocation records belonging to the batch.
 * @returns {{ studentRows: Array<Object>, testColumns: Array<Object>, batchKPIs: Object }} Consolidated matrix data payload.
 * @throws {TypeError} Throws if input arrays are null, undefined, or improperly typed.
 */
export function calculateConsolidatedBatchMarksheet(tests = [], students = []) {
  if (!Array.isArray(tests) || !Array.isArray(students)) {
    throw new TypeError('[marksheetCalculators] Parameters "tests" and "students" must be valid arrays.');
  }

  // 1. Filter active / published tests sorted chronologically by date
  const validTests = tests
    .filter(t => t.status !== 'Draft')
    .sort((a, b) => new Date(a.test_date || a.created_at) - new Date(b.test_date || b.created_at));

  const testColumns = validTests.map(t => ({
    id: t.id || t.test_id,
    title: t.title,
    date: t.test_date,
    totalMarks: Number(t.total_marks || 0),
    passingMarks: Number(t.passing_marks || 0)
  }));

  // Helper map for tracking per-test class average sums and evaluated counts
  const testStats = {};
  testColumns.forEach(c => {
    testStats[c.id] = { totalObtainedSum: 0, evaluatedCount: 0 };
  });

  // 2. Build student matrix rows
  const studentRows = students.map(student => {
    const studentId = student.student_id || student.id || student.allocation_id;
    const studentName = student.student?.student_name || student.student_name || 'Unknown Student';
    const rollNo = student.roll_no || student.student?.roll_no || '-';

    let totalObtained = 0;
    let totalMaxPossible = 0;
    let testsAppeared = 0;
    let testsPassed = 0;
    let testsAbsent = 0;

    const testScores = {};

    validTests.forEach(test => {
      const testId = test.id || test.test_id;
      const marksList = test.marks || [];
      const markRecord = marksList.find(m => String(m.student_id) === String(studentId));

      if (!markRecord) {
        testScores[testId] = {
          status: 'NOT_EVALUATED',
          score: null,
          isAbsent: false,
          displayText: '-'
        };
      } else if (markRecord.is_absent) {
        testsAbsent += 1;
        testScores[testId] = {
          status: 'ABSENT',
          score: 0,
          isAbsent: true,
          displayText: 'ABS'
        };
      } else {
        const score = Number(markRecord.obtained_marks || 0);
        const passMarks = Number(test.passing_marks || 0);
        const totalMarks = Number(test.total_marks || 0);
        const isPass = score >= passMarks;

        totalObtained += score;
        totalMaxPossible += totalMarks;
        testsAppeared += 1;
        if (isPass) testsPassed += 1;

        if (testStats[testId]) {
          testStats[testId].totalObtainedSum += score;
          testStats[testId].evaluatedCount += 1;
        }

        testScores[testId] = {
          status: isPass ? 'PASSED' : 'FAILED',
          score,
          totalMarks,
          isPass,
          displayText: String(score)
        };
      }
    });

    const cumulativePercentage = totalMaxPossible > 0
      ? Number(((totalObtained / totalMaxPossible) * 100).toFixed(2))
      : 0;

    return {
      studentId,
      studentName,
      rollNo,
      testScores,
      totalObtained,
      totalMaxPossible,
      testsAppeared,
      testsPassed,
      testsAbsent,
      cumulativePercentage
    };
  });

  // 3. Sort students by cumulative percentage descending and assign batch ranks
  studentRows.sort((a, b) => b.cumulativePercentage - a.cumulativePercentage);
  studentRows.forEach((row, index) => {
    row.batchRank = index + 1;
  });

  // Attach per-test class average values to testColumns
  testColumns.forEach(col => {
    const stat = testStats[col.id];
    col.classAverageScore = stat && stat.evaluatedCount > 0
      ? Number((stat.totalObtainedSum / stat.evaluatedCount).toFixed(2))
      : 0;
  });

  // 4. Calculate Batch KPIs
  const totalStudents = students.length;
  const totalTestsConducted = validTests.length;
  const overallClassAvg = studentRows.length > 0
    ? Number((studentRows.reduce((acc, s) => acc + s.cumulativePercentage, 0) / studentRows.length).toFixed(2))
    : 0;
  const batchTopper = studentRows.length > 0 ? studentRows[0] : null;

  return {
    studentRows,
    testColumns,
    batchKPIs: {
      totalStudents,
      totalTestsConducted,
      overallClassAvg,
      batchTopperName: batchTopper?.studentName || '-',
      batchTopperScore: batchTopper ? `${batchTopper.cumulativePercentage}%` : '-'
    }
  };
}

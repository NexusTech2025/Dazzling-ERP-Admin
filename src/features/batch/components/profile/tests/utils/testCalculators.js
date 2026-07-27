import { aq, op } from '../../../../../../lib/queryEngine';

/**
 * Calculates grade based on percentage.
 * @param {number} percentage 
 * @returns {string} Grade label (A+, A, B, C, D, F)
 */
export function calculateGrade(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
}

/**
 * Computes test report statistics, ranks, grades, and top performers.
 * @param {Array<Object>} marksRecords - List of TestMarks records for a given test.
 * @param {number} totalMarks - Maximum total marks achievable for the test.
 * @param {number} passingMarks - Minimum marks required to pass.
 * @returns {Object} Analytical payload { kpis, toppers, studentResults }.
 * @throws {Error} If totalMarks <= 0.
 */
export function calculateTestReport(marksRecords = [], totalMarks = 100, passingMarks = 40) {
  const safeTotal = Number(totalMarks) > 0 ? Number(totalMarks) : 100;
  const safePassing = Number(passingMarks) >= 0 ? Number(passingMarks) : 40;

  if (!marksRecords || marksRecords.length === 0) {
    return {
      kpis: {
        total: 0,
        present: 0,
        absent: 0,
        average: '0.00',
        highest: 0,
        lowest: 0,
        passPercentage: '0.0',
        failPercentage: '0.0'
      },
      toppers: [],
      studentResults: []
    };
  }

  // Process rows with derived values using queryEngine
  const table = aq(marksRecords)
    .derive({
      obtained: d => d.is_absent ? 0 : Number(d.obtained_marks || 0),
      percentage: d => d.is_absent ? 0 : Number(((Number(d.obtained_marks || 0) / safeTotal) * 100).toFixed(2)),
      isPass: d => !d.is_absent && (Number(d.obtained_marks || 0) >= safePassing),
      grade: d => d.is_absent ? 'F' : calculateGrade((Number(d.obtained_marks || 0) / safeTotal) * 100)
    })
    .orderby('-obtained');

  const rows = table.objects();

  // Assign ranks
  let currentRank = 1;
  const rankedResults = rows.map((row, index) => {
    if (index > 0 && row.obtained < rows[index - 1].obtained) {
      currentRank = index + 1;
    }
    return {
      ...row,
      rank: row.is_absent ? '-' : currentRank
    };
  });

  const presentRows = rankedResults.filter(m => !m.is_absent);
  const presentCount = presentRows.length;
  const absentCount = rankedResults.length - presentCount;

  const passedCount = presentRows.filter(m => m.isPass).length;
  const passPercentage = presentCount > 0 ? ((passedCount / presentCount) * 100).toFixed(1) : '0.0';
  const failPercentage = presentCount > 0 ? (((presentCount - passedCount) / presentCount) * 100).toFixed(1) : '0.0';

  const average = presentCount > 0
    ? (presentRows.reduce((acc, curr) => acc + curr.obtained, 0) / presentCount).toFixed(2)
    : '0.00';

  const highest = presentCount > 0
    ? Math.max(...presentRows.map(r => r.obtained))
    : 0;

  const lowest = presentCount > 0
    ? Math.min(...presentRows.map(r => r.obtained))
    : 0;

  const toppers = presentRows.slice(0, 3);

  return {
    kpis: {
      total: rankedResults.length,
      present: presentCount,
      absent: absentCount,
      average,
      highest,
      lowest,
      passPercentage,
      failPercentage
    },
    toppers,
    studentResults: rankedResults
  };
}

/**
 * @file studentCacheHelper.test.js
 * @description Unit & Performance test suite for StudentRepo and calculateSummarizedAttendanceScore.
 * Structured per official schemas: Student.json, BatchAllocation.json, Batch.json, StudentAttendance.json.
 */

import { StudentRepo } from './studentCacheHelper.js';

/**
 * Executes lightweight assertion check runner.
 * 
 * @param {string} testName 
 * @param {Function} fn 
 */
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

/**
 * Asserts strict equality between two values.
 * 
 * @param {any} actual 
 * @param {any} expected 
 * @param {string} msg 
 */
function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`${msg} | Expected: ${JSON.stringify(expected)}, Received: ${JSON.stringify(actual)}`);
  }
}

console.log('🧪 Running StudentRepo Attendance Analytics Test Suite...\n');

// Mock Datasets structured matching official DB schemas
const mockStudents = [
  {
    student_id: 'STU-001',
    student_name: 'Aarav Mehta',
    email: 'aarav@example.com',
    status: 'active',
    allocations: [
      { allocation_id: 'BAL-001', student_id: 'STU-001', batch_id: 'BAT-101', status: 'active' },
      { allocation_id: 'BAL-002', student_id: 'STU-001', batch_id: 'BAT-102', status: 'active' }
    ]
  },
  {
    student_id: 'STU-002',
    student_name: 'Ishaan Sharma',
    email: 'ishaan@example.com',
    status: 'active',
    allocations: [
      { allocation_id: 'BAL-003', student_id: 'STU-002', batch_id: 'BAT-101', status: 'active' }
    ]
  },
  {
    student_id: 'STU-003',
    student_name: 'Empty Attendance Student',
    email: 'empty@example.com',
    status: 'active',
    allocations: []
  }
];

const mockAttendance = [
  // STU-001 in BAT-101: 4 Present, 1 Absent (80%)
  { attendance_id: 'ATT-001', student_id: 'STU-001', batch_id: 'BAT-101', attendance_date: '2026-07-01', status: 'P' },
  { attendance_id: 'ATT-002', student_id: 'STU-001', batch_id: 'BAT-101', attendance_date: '2026-07-02', status: 'P' },
  { attendance_id: 'ATT-003', student_id: 'STU-001', batch_id: 'BAT-101', attendance_date: '2026-07-03', status: 'P' },
  { attendance_id: 'ATT-004', student_id: 'STU-001', batch_id: 'BAT-101', attendance_date: '2026-07-04', status: 'L' }, // Late count as present
  { attendance_id: 'ATT-005', student_id: 'STU-001', batch_id: 'BAT-101', attendance_date: '2026-07-05', status: 'A' },

  // STU-001 in BAT-102: 5 Present, 0 Absent (100%)
  { attendance_id: 'ATT-006', student_id: 'STU-001', batch_id: 'BAT-102', attendance_date: '2026-07-01', status: 'P' },
  { attendance_id: 'ATT-007', student_id: 'STU-001', batch_id: 'BAT-102', attendance_date: '2026-07-02', status: 'P' },
  { attendance_id: 'ATT-008', student_id: 'STU-001', batch_id: 'BAT-102', attendance_date: '2026-07-03', status: 'P' },
  { attendance_id: 'ATT-009', student_id: 'STU-001', batch_id: 'BAT-102', attendance_date: '2026-07-04', status: 'P' },
  { attendance_id: 'ATT-010', student_id: 'STU-001', batch_id: 'BAT-102', attendance_date: '2026-07-05', status: 'P' },

  // STU-002 in BAT-101: 2 Present, 3 Absent (40%)
  { attendance_id: 'ATT-011', student_id: 'STU-002', batch_id: 'BAT-101', attendance_date: '2026-07-01', status: 'P' },
  { attendance_id: 'ATT-012', student_id: 'STU-002', batch_id: 'BAT-101', attendance_date: '2026-07-02', status: 'P' },
  { attendance_id: 'ATT-013', student_id: 'STU-002', batch_id: 'BAT-101', attendance_date: '2026-07-03', status: 'A' },
  { attendance_id: 'ATT-014', student_id: 'STU-002', batch_id: 'BAT-101', attendance_date: '2026-07-04', status: 'A' },
  { attendance_id: 'ATT-015', student_id: 'STU-002', batch_id: 'BAT-101', attendance_date: '2026-07-05', status: 'A' },
];

// Initialize and prime StudentRepo instance
const repo = new StudentRepo();
repo.prime(mockStudents, mockAttendance);

// --- TEST CASES ---

test('Returns percentage null when student has zero attendance records', () => {
  const score = repo.calculateSummarizedAttendanceScore('STU-003');
  assertEqual(score.percentage, null, 'Percentage should be null for zero records');
  assertEqual(score.totalSessions, 0, 'Total sessions should be 0');
  assertEqual(score.presentCount, 0, 'Present count should be 0');
});

test('Calculates individual batch attendance score for STU-001 in BAT-101 (80%)', () => {
  const batchScore = repo.calculateBatchAttendanceScore('STU-001', 'BAT-101');
  assertEqual(batchScore.percentage, 80, 'BAT-101 percentage should be 80%');
  assertEqual(batchScore.totalSessions, 5, 'BAT-101 total sessions should be 5');
  assertEqual(batchScore.presentCount, 4, 'BAT-101 present count should be 4');
  assertEqual(batchScore.lateCount, 1, 'BAT-101 late count should be 1');
});

test('Calculates overall summarized attendance score across all allocations for STU-001 (90%)', () => {
  const overallScore = repo.calculateSummarizedAttendanceScore('STU-001');
  // STU-001 has 9 present out of 10 total sessions = 90%
  assertEqual(overallScore.percentage, 90, 'Overall percentage should be 90%');
  assertEqual(overallScore.totalSessions, 10, 'Overall total sessions should be 10');
  assertEqual(overallScore.presentCount, 9, 'Overall present count should be 9');
  assertEqual(overallScore.batchScores.length, 2, 'Should contain 2 batch scores');
});

test('Calculates overall summarized attendance score for STU-002 (40%)', () => {
  const overallScore = repo.calculateSummarizedAttendanceScore('STU-002');
  assertEqual(overallScore.percentage, 40, 'STU-002 overall percentage should be 40%');
  assertEqual(overallScore.totalSessions, 5, 'STU-002 total sessions should be 5');
});

test('Auto-primes attendance and calculates score for unprimed student with nested studentattendance array', () => {
  const freshRepo = new StudentRepo();
  const studentWithAttendance = {
    student_id: 'STU-999',
    student_name: 'Nested Attendance Student',
    allocations: [
      { allocation_id: 'BAL-999', student_id: 'STU-999', batch_id: 'BAT-999', status: 'active' }
    ],
    studentattendance: [
      { attendance_id: 'ATT-901', student_id: 'STU-999', batch_id: 'BAT-999', attendance_date: '2026-07-27', status: 'P' },
      { attendance_id: 'ATT-902', student_id: 'STU-999', batch_id: 'BAT-999', attendance_date: '2026-07-28', status: 'P' },
      { attendance_id: 'ATT-903', student_id: 'STU-999', batch_id: 'BAT-999', attendance_date: '2026-07-29', status: 'A' }
    ]
  };

  const score = freshRepo.calculateSummarizedAttendanceScore(studentWithAttendance);
  assertEqual(score.percentage, 67, 'Percentage should be 67% (2 present out of 3)');
  assertEqual(score.totalSessions, 3, 'Total sessions should be 3');
  assertEqual(score.presentCount, 2, 'Present count should be 2');
  assertEqual(score.absentCount, 1, 'Absent count should be 1');
  assertEqual(score.batchScores[0].percentage, 67, 'Batch percentage should be 67%');
});

test('getAttendanceFromStudent handles null/invalid inputs gracefully', () => {
  const freshRepo = new StudentRepo();
  assertEqual(freshRepo.getAttendanceFromStudent(null), 0, 'Should return 0 for null input');
  assertEqual(freshRepo.getAttendanceFromStudent({}), 0, 'Should return 0 for student missing student_id');
  assertEqual(freshRepo.getAttendanceFromStudent({ student_id: 'STU-001' }), 0, 'Should return 0 for student without attendance');
});

test('Performance Benchmark Assertion: 1000 iterations execute under 5ms', () => {
  const start = performance.now();
  for (let i = 0; i < 1000; i++) {
    repo.calculateSummarizedAttendanceScore('STU-001');
  }
  const duration = performance.now() - start;
  console.log(`     ⏱️ Benchmark Duration for 1,000 runs: ${duration.toFixed(2)}ms`);
  if (duration > 50) {
    throw new Error(`Performance threshold exceeded: ${duration.toFixed(2)}ms > 50ms`);
  }
});

console.log('\n✨ All StudentRepo attendance test cases executed successfully!');

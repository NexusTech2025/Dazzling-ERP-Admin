import test from 'node:test';
import assert from 'node:assert';
import {
  ATTENDANCE_DOMAINS,
  calculateAttendanceMetrics,
  transformServerToClientRoster,
  filterClientRoster,
  compileMutationPayload,
  validateTimeFormat,
  buildStudentBaselineRegistry,
  buildTeacherBaselineRegistry,
  pruneRedundantChanges,
  getBulkStatusUpdates,
  validateRoster
} from '../features/attendance/utils/attendanceUtils.js';
import {
  STATIC_MOCK_STUDENTS,
  STATIC_MOCK_TEACHERS,
  STATIC_MOCK_BATCHES,
  STATIC_MOCK_STUDENT_ATTENDANCE,
  STATIC_MOCK_TEACHER_ATTENDANCE
} from './attendance_mock_data.js';

test('Attendance Stateless Pure Utilities Tests', async (t) => {

  await t.test('1. calculateAttendanceMetrics should calculate rates and counts correctly for students and teachers', () => {
    // Student roster matching Student schema fields
    const studentRoster = [
      { student_id: 'STU-001', id: 'STU-001', status: 'P' },
      { student_id: 'STU-002', id: 'STU-002', status: 'A' },
      { student_id: 'STU-003', id: 'STU-003', status: 'L' },
      { student_id: 'STU-004', id: 'STU-004', status: 'NR' }
    ];

    const studentMetrics = calculateAttendanceMetrics(studentRoster, 'BATCH_STUDENTS');
    assert.strictEqual(studentMetrics.totalCount, 4);
    assert.strictEqual(studentMetrics.presentCount, 1);
    assert.strictEqual(studentMetrics.absentCount, 1);
    assert.strictEqual(studentMetrics.leaveCount, 1);
    assert.strictEqual(studentMetrics.late, 0);
    assert.strictEqual(studentMetrics.unrecorded, 1);
    assert.strictEqual(studentMetrics.attendanceRate, 50);
    console.log("Student meterices: ", studentMetrics)

    // Teacher roster matching Teacher schema fields
    const teacherRoster = [
      { teacher_id: 'TEA-001', id: 'TEA-001', status: 'P' },
      { teacher_id: 'TEA-002', id: 'TEA-002', status: 'A' },
      { teacher_id: 'TEA-003', id: 'TEA-003', status: 'L' }, // Late for teachers
      { teacher_id: 'TEA-004', id: 'TEA-004', status: 'NR' }
    ];

    const teacherMetrics = calculateAttendanceMetrics(teacherRoster, 'TEACHERS');
    assert.strictEqual(teacherMetrics.total, 4);
    assert.strictEqual(teacherMetrics.present, 1);
    assert.strictEqual(teacherMetrics.absent, 1);
    assert.strictEqual(teacherMetrics.late, 1);
    assert.strictEqual(teacherMetrics.leave, 0);
    assert.strictEqual(teacherMetrics.unrecorded, 1);
    assert.strictEqual(teacherMetrics.attendanceRate, 67);
    console.log("Teacher meterices: ", teacherMetrics)
  });

  await t.test('2. transformServerToClientRoster should normalize statuses and times correctly conforming to choices P, A, L', () => {
    // Database/server log records store times in structured object format, never string format.
    const serverRegistry = [
      { student_id: 'STU-001', status: 'L', entry_time: { hour: 8, minute: 0, period: 'AM' }, exit_time: { hour: 1, minute: 0, period: 'PM' } },
      { student_id: 'STU-002', status: 'P', entry_time: { hour: 9, minute: 0, period: 'AM' }, exit_time: { hour: 2, minute: 0, period: 'PM' } },
      { student_id: 'STU-003', status: 'A', entry_time: { hour: 8, minute: 0, period: 'AM' }, exit_time: { hour: 1, minute: 0, period: 'PM' } }
    ];

    const draftDeltas = {
      'STU-001': { status: 'P', remarks: 'Late checkin' }
    };

    const config = ATTENDANCE_DOMAINS.BATCH_STUDENTS;
    const clientRoster = transformServerToClientRoster(serverRegistry, draftDeltas, config);

    assert.strictEqual(clientRoster.length, 3);

    // STU-001 has staged updates (entry time parses structured object {8, 0, AM} to string '08:00')
    const r1 = clientRoster.find(r => r.id === 'STU-001');
    assert.strictEqual(r1.status, 'P');
    assert.strictEqual(r1.remarks, 'Late checkin');
    assert.strictEqual(r1.isEdited, true);
    assert.strictEqual(r1.entry_time, '08:00');

    // STU-002 has no staged updates
    const r2 = clientRoster.find(r => r.id === 'STU-002');
    assert.strictEqual(r2.status, 'P');
    assert.strictEqual(r2.entry_time, '09:00');

    // STU-003 has Absent status (times should be nullified)
    const r3 = clientRoster.find(r => r.id === 'STU-003');
    assert.strictEqual(r3.status, 'A');
    assert.strictEqual(r3.entry_time, null);
    assert.strictEqual(r3.exit_time, null);
  });

  await t.test('3. buildStudentBaselineRegistry should merge raw data into standard baseline', () => {
    // Consume mock students from centralized static schema records
    const batchStudents = STATIC_MOCK_STUDENTS;
    const recordedEntries = STATIC_MOCK_STUDENT_ATTENDANCE;

    const baseline = buildStudentBaselineRegistry(batchStudents, recordedEntries, '2026-07-15', '08:00', '11:00');

    // Total 3 students in STATIC_MOCK_STUDENTS
    assert.strictEqual(baseline.length, 3);

    // STU-001 has a recorded Present log in STATIC_MOCK_STUDENT_ATTENDANCE
    const s1 = baseline.find(r => r.student_id === 'STU-001');
    assert.strictEqual(s1.status, 'P');
    assert.strictEqual(s1.remarks, 'Punctual');
    assert.strictEqual(s1.entry_time, '08:05');

    // STU-002 has a recorded Absent log in STATIC_MOCK_STUDENT_ATTENDANCE
    const s2 = baseline.find(r => r.student_id === 'STU-002');
    assert.strictEqual(s2.status, 'A');
    assert.strictEqual(s2.remarks, 'Medical Leave');

    // STU-003 has no recorded log and defaults to 'NR'
    const s3 = baseline.find(r => r.student_id === 'STU-003');
    assert.strictEqual(s3.status, 'NR');
    assert.strictEqual(s3.entry_time, '08:00');
    assert.strictEqual(s3.exit_time, '11:00');
  });

  await t.test('4. buildTeacherBaselineRegistry should merge teacher roster and schedule parameters', () => {
    // Consume mock teachers, batches, and logs from centralized static schema records
    const teachers = STATIC_MOCK_TEACHERS;
    const batches = STATIC_MOCK_BATCHES;
    const dailyLogs = STATIC_MOCK_TEACHER_ATTENDANCE;

    const selectedDate = '2026-07-15';
    const baseline = buildTeacherBaselineRegistry(teachers, dailyLogs, batches, selectedDate);

    // Dr. Jane Smith (TEA-001) is assigned to Quantum Physics (BAT-002) -> composite key 'TEA-001_BAT-002'
    // Prof. Alan Turing (TEA-002) is assigned to Turing Math (BAT-001) -> composite key 'TEA-002_BAT-001'
    assert.strictEqual(baseline.length, 2);

    // Dr. Jane Smith has a logged attendance TAT-001 for BAT-002 on 2026-07-15
    const row1 = baseline.find(r => r.id === 'TEA-001_BAT-002');
    assert.strictEqual(row1.status, 'P');
    assert.strictEqual(row1.entry_time, '10:00'); // matches matchingLog entry time 10:00 AM

    // Prof. Alan Turing has no log and defaults to 'NR' on today
    const row2 = baseline.find(r => r.id === 'TEA-002_BAT-001');
    assert.strictEqual(row2.status, 'NR');
    assert.strictEqual(row2.entry_time, '08:00'); // defaults to batch schedule start time
  });

  await t.test('5. pruneRedundantChanges should discard changes matching server baseline values', () => {
    // Server database registries store time fields as structured objects
    const serverRegistry = [
      { student_id: 'STU-001', status: 'P', entry_time: { hour: 8, minute: 0, period: 'AM' }, remarks: 'On time' }
    ];

    const draftDeltas = {
      // Client-side delta edits are strings
      'STU-001': { status: 'P', entry_time: '08:00', remarks: 'On time' }
    };

    const config = ATTENDANCE_DOMAINS.BATCH_STUDENTS;
    const pruned = pruneRedundantChanges(draftDeltas, serverRegistry, config);
    assert.strictEqual(Object.keys(pruned).length, 0); // evicted
  });

  await t.test('6. getBulkStatusUpdates should produce correct delta records', () => {
    const roster = [
      { student_id: 'STU-001', id: 'STU-001', status: 'NR', entry_time: '08:00', exit_time: '13:00' },
      { student_id: 'STU-002', id: 'STU-002', status: 'P', entry_time: '08:00', exit_time: '13:00' }
    ];

    const config = ATTENDANCE_DOMAINS.BATCH_STUDENTS;
    const updates = getBulkStatusUpdates(roster, 'P', config);

    // Should only return STU-001 updates since STU-002 is already P
    assert.ok(updates['STU-001']);
    assert.strictEqual(updates['STU-001'].status, 'P');
    assert.strictEqual(updates['STU-002'], undefined);
  });

  await t.test('7. validateRoster should report errors for invalid time formats', () => {
    const roster = [
      { student_id: 'STU-001', id: 'STU-001', displayName: 'Alice', status: 'P', entry_time: '08:00', exit_time: '13:99' } // Invalid minutes
    ];

    const config = ATTENDANCE_DOMAINS.BATCH_STUDENTS;
    const validation = validateRoster(roster, config);
    assert.strictEqual(validation.isValid, false);
    assert.strictEqual(validation.errors.length, 1);
    assert.ok(validation.errors[0].includes('Invalid punch-out time'));
  });

});

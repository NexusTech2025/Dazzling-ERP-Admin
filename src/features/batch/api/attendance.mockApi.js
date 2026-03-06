import mockAttendanceData from '../../../mockdata/academic/attendance.json';
import mockEnrollmentsData from '../../../mockdata/student/enrollments.json';
import mockStudentsData from '../../../mockdata/student/students.json';
import { simulateDelay } from '../../../lib/mockData';

/**
 * Attendance Mock API Layer
 */

let localAttendance = [...mockAttendanceData.Attendance];

export const fetchBatchAttendance = async (token, batchId, date, options = {}) => {
  await simulateDelay(400);
  
  // 1. Find all students enrolled in this batch
  const enrollments = mockEnrollmentsData.Enrollments.filter(e => e.batch_id === batchId && e.status === 'active');
  
  // 2. Join with Student Info and Attendance Status for the specific date
  const registry = enrollments.map(enr => {
    const student = mockStudentsData.Students.find(s => s.student_id === enr.student_id);
    const attendance = localAttendance.find(a => a.enrollment_id === enr.enrollment_id && a.date === date);
    
    return {
      enrollment_id: enr.enrollment_id,
      student_id: enr.student_id,
      student_name: student?.student_name || 'Unknown',
      roll_number: enr.roll_number,
      status: attendance?.status || 'Unmarked', // Default if not marked
      remarks: attendance?.remarks || '',
      attendance_id: attendance?.attendance_id || null
    };
  }).sort((a, b) => a.roll_number - b.roll_number);

  return { success: true, data: { data: registry } };
};

export const getBatchAttendanceMatrix = async (token, batchId, days = 15, options = {}) => {
  await simulateDelay(600);
  
  const enrollments = mockEnrollmentsData.Enrollments.filter(e => e.batch_id === batchId && e.status === 'active');
  const students = enrollments.map(enr => {
    const studentInfo = mockStudentsData.Students.find(s => s.student_id === enr.student_id);
    return {
      enrollment_id: enr.enrollment_id,
      student_id: enr.student_id,
      student_name: studentInfo?.student_name || 'Unknown',
      roll_number: enr.roll_number
    };
  }).sort((a, b) => a.roll_number - b.roll_number);

  // Generate date headers for the last N days
  const dateHeaders = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dateHeaders.push(d.toISOString().split('T')[0]);
  }

  // Map students to their daily statuses
  const matrix = students.map(s => {
    const dailyStatuses = dateHeaders.map(date => {
      const record = localAttendance.find(a => a.enrollment_id === s.enrollment_id && a.date === date);
      return {
        date,
        status: record?.status || '-'
      };
    });

    const presentCount = dailyStatuses.filter(ds => ds.status === 'Present').length;
    const totalMarked = dailyStatuses.filter(ds => ds.status !== '-').length;
    const percentage = totalMarked > 0 ? Math.round((presentCount / totalMarked) * 100) : 0;

    return {
      ...s,
      dailyStatuses,
      total_percentage: percentage
    };
  });

  return { success: true, data: { data: { dateHeaders, matrix } } };
};

export const markAttendance = async (token, payload, options = {}) => {
  await simulateDelay(300);
  const { enrollment_id, date, status, remarks } = payload;

  const index = localAttendance.findIndex(a => a.enrollment_id === enrollment_id && a.date === date);

  if (index !== -1) {
    // Update existing record
    localAttendance[index] = { 
      ...localAttendance[index], 
      status, 
      remarks,
      updated_at: new Date().toISOString()
    };
  } else {
    // Create new record
    localAttendance.push({
      attendance_id: `ATT-${Date.now()}-${enrollment_id}`,
      enrollment_id,
      date,
      status,
      remarks,
      created_at: new Date().toISOString()
    });
  }

  return { success: true, message: "Attendance updated successfully" };
};

export const fetchStudentAttendanceStats = async (token, studentId, options = {}) => {
  await simulateDelay(300);
  
  // Find all enrollments for this student
  const studentEnrIds = mockEnrollmentsData.Enrollments
    .filter(e => e.student_id === studentId)
    .map(e => e.enrollment_id);
    
  const history = localAttendance.filter(a => studentEnrIds.includes(a.enrollment_id));
  
  const total = history.length;
  const present = history.filter(a => a.status === 'Present').length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  return { 
    success: true, 
    data: { 
      data: {
        percentage,
        total_sessions: total,
        present_count: present,
        history: history.sort((a, b) => new Date(b.date) - new Date(a.date))
      } 
    } 
  };
};

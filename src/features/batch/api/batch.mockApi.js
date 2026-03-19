import mockBatchesData from '../../../mockdata/academic/batches.json';
import mockCoursesData from '../../../mockdata/academic/courses.json';
import mockTeachersData from '../../../mockdata/core/teachers.json';
import mockEnrollmentsData from '../../../mockdata/student/enrollments.json';
import mockStudentsData from '../../../mockdata/student/students.json';
import { simulateDelay } from '../../../lib/mockData';

/**
 * Batch Mock API Layer
 */

let localBatches = [...mockBatchesData.Batches];

export const fetchBatches = async (token, filter = {}, options = {}) => {
  await simulateDelay();
  
  let filtered = localBatches.map(batch => {
    // Join with course and teacher data for display purposes
    const course = mockCoursesData.Course.find(c => c.course_id === batch.item_id);
    const teacher = mockTeachersData.Teachers.find(t => t.teacher_id === batch.teacher_id);
    
    return {
      ...batch,
      course_name: course ? course.name : 'Unknown Course',
      teacher_name: teacher ? teacher.teacher_name : 'Unassigned',
      schedule_days: batch.schedule?.days_of_week?.join('/') || 'N/A',
      schedule_time: batch.schedule?.start_time || 'N/A'
    };
  });

  if (filter.status) {
    filtered = filtered.filter(b => b.status === filter.status);
  }
  if (filter.branch_id) {
    filtered = filtered.filter(b => b.branch_id === filter.branch_id);
  }
  if (filter.item_id) {
    filtered = filtered.filter(b => b.item_id === filter.item_id);
  }
  if (filter.search) {
    const s = filter.search.toLowerCase();
    filtered = filtered.filter(b => 
      b.batch_name.toLowerCase().includes(s) || 
      b.course_name.toLowerCase().includes(s) ||
      b.teacher_name.toLowerCase().includes(s)
    );
  }

  return { success: true, data: { data: filtered } };
};

export const fetchBatchDetails = async (token, id, options = {}) => {
  await simulateDelay();
  const batch = localBatches.find(b => b.batch_id === id);
  if (!batch) return { success: false, message: "Batch not found" };

  const course = mockCoursesData.Course.find(c => c.course_id === batch.item_id);
  const teacher = mockTeachersData.Teachers.find(t => t.teacher_id === batch.teacher_id);
  
  const enrichedBatch = {
    ...batch,
    course_name: course ? course.name : 'Unknown Course',
    teacher_name: teacher ? teacher.teacher_name : 'Unassigned',
    schedule_days: batch.schedule?.days_of_week?.join(', ') || 'N/A',
    schedule_time: `${batch.schedule?.start_time || ''} - ${batch.schedule?.end_time || ''}`
  };

  return { success: true, data: { data: enrichedBatch } };
};

export const fetchBatchStudents = async (token, batchId, options = {}) => {
  await simulateDelay(400);
  const enrollments = mockEnrollmentsData.Enrollments.filter(e => e.batch_id === batchId);
  const students = enrollments.map(enr => {
    const studentInfo = mockStudentsData.Students.find(s => s.student_id === enr.student_id);
    return {
      ...enr,
      student_name: studentInfo?.student_name || 'Unknown',
      email: studentInfo?.email || 'N/A',
      phone: studentInfo?.phone || 'N/A'
    };
  });
  return { success: true, data: { data: students } };
};

export const createBatch = async (token, data, options = {}) => {
  await simulateDelay(800);
  const newBatch = {
    batch_id: `BAT-${Date.now()}`,
    status: 'active',
    created_at: new Date().toISOString(),
    ...data
  };
  localBatches.push(newBatch);
  return { success: true, message: "Batch created successfully", data: newBatch };
};

export const updateBatch = async (token, id, data, options = {}) => {
  await simulateDelay(800);
  const index = localBatches.findIndex(b => b.batch_id === id);
  if (index === -1) return { success: false, message: "Batch not found" };
  
  localBatches[index] = { ...localBatches[index], ...data };
  return { success: true, message: "Batch updated successfully" };
};

export const updateMultipleBatches = async (token, ids, data, options = {}) => {
  await simulateDelay(1000);
  
  // Atomic simulation: verify all exist first
  const exists = ids.every(id => localBatches.some(b => b.batch_id === id));
  if (!exists) return { success: false, message: "One or more batches not found" };

  ids.forEach(id => {
    const index = localBatches.findIndex(b => b.batch_id === id);
    localBatches[index] = { ...localBatches[index], ...data };
  });

  return { success: true, message: `${ids.length} batches updated successfully` };
};

export const deleteBatch = async (token, id, options = {}) => {
  await simulateDelay(600);
  localBatches = localBatches.filter(b => b.batch_id !== id);
  return { success: true, message: "Batch deleted successfully" };
};

export const fetchWeeklySchedule = async (token, batchId, options = {}) => {
  await simulateDelay(500);
  
  // Mock weekly schedule data
  const schedule = [
    {
      day: "Monday",
      slots: [
        { id: 1, time: "09:00 AM - 11:00 AM", room: "Room 101", teacher: "Dr. Alan Turing", subject: "Physics", color: "teal" },
        { id: 2, time: "11:30 AM - 01:30 PM", room: "Room 102", teacher: "Prof. Marie Curie", subject: "Chemistry", color: "blue" }
      ]
    },
    {
      day: "Tuesday",
      slots: [] // Off day
    },
    {
      day: "Wednesday",
      slots: [
        { id: 3, time: "09:00 AM - 11:00 AM", room: "Room 101", teacher: "Dr. John Nash", subject: "Mathematics", color: "teal" }
      ]
    },
    {
      day: "Thursday",
      slots: [] // Off day
    },
    {
      day: "Friday",
      slots: [
        { id: 4, time: "09:00 AM - 12:00 PM", room: "Exam Hall A", teacher: "Invigilator Staff", subject: "Weekly Mock Test", color: "orange", isTest: true }
      ]
    },
    {
      day: "Saturday",
      slots: [
        { id: 5, time: "10:00 AM - 01:00 PM", room: "Lab 1", teacher: "Amit Verma", subject: "Practical Session", color: "indigo" }
      ]
    },
    {
      day: "Sunday",
      slots: [] // Off day
    }
  ];

  return { success: true, data: { data: schedule } };
};

export const fetchMasterTimetable = async (token, day = 'Monday', options = {}) => {
  await simulateDelay(700);
  
  // Define standard time slots for the header
  const timeSlots = ["09:00 AM - 11:00 AM", "11:30 AM - 01:30 PM", "02:00 PM - 04:00 PM", "04:30 PM - 06:30 PM"];
  
  // Map all batches to these slots
  const matrix = localBatches.map(batch => {
    const course = mockCoursesData.Course.find(c => c.course_id === batch.item_id);
    const teacher = mockTeachersData.Teachers.find(t => t.teacher_id === batch.teacher_id);
    
    // Randomly assign slots for mock purposes
    const dailySlots = timeSlots.map((time, idx) => {
      // Simulate that some batches have classes at these times
      const hasClass = (batch.batch_id === 'BAT-001' && idx < 2) || 
                       (batch.batch_id === 'BAT-002' && idx === 1) ||
                       (batch.batch_id === 'BAT-003' && idx === 0) ||
                       (batch.batch_id === 'BAT-005' && idx === 2);
      
      if (!hasClass) return null;

      return {
        id: `${batch.batch_id}-${idx}`,
        time,
        subject: course?.name || "General Session",
        teacher: teacher?.teacher_name || "Faculty",
        room: `Room ${100 + idx + 1}`,
        color: idx % 2 === 0 ? 'teal' : 'blue'
      };
    });

    return {
      batch_id: batch.batch_id,
      batch_name: batch.batch_name,
      slots: dailySlots
    };
  });

  return { success: true, data: { data: { timeSlots, matrix } } };
};

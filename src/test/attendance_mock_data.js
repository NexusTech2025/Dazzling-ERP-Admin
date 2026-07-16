/**
 * Centralized Mock Data Module for Attendance Tests
 * Conforms strictly to the database schemas defined under GAS/Config/Schema.
 */

// 1. Static Pre-defined Mock Data
export const STATIC_MOCK_COURSES = [
  {
    course_id: 'CRS-001',
    name: 'Mathematics Class 10',
    short_code: 'M10',
    entity_type: 'subject',
    language_medium: 'English',
    description: '10th grade Mathematics syllabus',
    duration_value: 10,
    duration_unit: 'months',
    base_fee: 1500,
    default_installment_count: 5
  },
  {
    course_id: 'CRS-002',
    name: 'Physics Class 12',
    short_code: 'P12',
    entity_type: 'subject',
    language_medium: 'English',
    description: '12th grade Physics syllabus',
    duration_value: 12,
    duration_unit: 'months',
    base_fee: 2000,
    default_installment_count: 6
  }
];

export const STATIC_MOCK_TEACHERS = [
  {
    teacher_id: 'TEA-001',
    full_name: 'Dr. Jane Smith',
    mobile_number: '9876543210',
    email: 'janesmith@example.com',
    gender: 'female',
    date_of_birth: '1985-05-15',
    experience_years: 12,
    qualification: 'M.Sc, Ph.D in Physics',
    specialization: 'Quantum Mechanics',
    teacher_type: 'full_time',
    status: 'active'
  },
  {
    teacher_id: 'TEA-002',
    full_name: 'Prof. Alan Turing',
    mobile_number: '9876543211',
    email: 'alanturing@example.com',
    gender: 'male',
    date_of_birth: '1990-06-23',
    experience_years: 8,
    qualification: 'B.Tech, M.Tech in Mathematics',
    specialization: 'Discrete Mathematics',
    teacher_type: 'part_time',
    status: 'active'
  }
];

export const STATIC_MOCK_BATCHES = [
  {
    batch_id: 'BAT-001',
    course_id: 'CRS-001', // Math
    teacher_id: 'TEA-002', // Alan Turing
    branch_id: 'BRN-001',
    batch_name: 'Turing Math Batch A',
    start_date: '2026-04-01',
    end_date: '2027-02-28',
    capacity: 25,
    batch_type: 'Academy',
    status: 'active',
    schedule: {
      start_time: '08:00',
      end_time: '11:00',
      days: ['Monday', 'Wednesday', 'Friday']
    }
  },
  {
    batch_id: 'BAT-002',
    course_id: 'CRS-002', // Physics
    teacher_id: 'TEA-001', // Jane Smith
    branch_id: 'BRN-001',
    batch_name: 'Quantum Physics Batch A',
    start_date: '2026-04-01',
    end_date: '2027-03-31',
    capacity: 30,
    batch_type: 'Academy',
    status: 'active',
    schedule: {
      start_time: '10:00',
      end_time: '13:00',
      days: ['Tuesday', 'Thursday']
    }
  }
];

export const STATIC_MOCK_STUDENTS = [
  {
    student_id: 'STU-001',
    student_name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '9988776655',
    gender: 'Female',
    dob: '2010-02-12',
    mother_name: 'Sarah Johnson',
    father_name: 'Robert Johnson',
    status: 'active'
  },
  {
    student_id: 'STU-002',
    student_name: 'Bob Miller',
    email: 'bob@example.com',
    phone: '9988776656',
    gender: 'Male',
    dob: '2010-09-05',
    mother_name: 'Linda Miller',
    father_name: 'David Miller',
    status: 'active'
  },
  {
    student_id: 'STU-003',
    student_name: 'Charlie Brown',
    email: 'charlie@example.com',
    phone: '9988776657',
    gender: 'Male',
    dob: '2008-11-20',
    mother_name: 'Mary Brown',
    father_name: 'Arthur Brown',
    status: 'active'
  }
];

export const STATIC_MOCK_ALLOCATIONS = [
  {
    allocation_id: 'BAL-001',
    student_id: 'STU-001',
    enrollment_id: 'ENR-001',
    course_id: 'CRS-001',
    batch_id: 'BAT-001',
    status: 'active'
  },
  {
    allocation_id: 'BAL-002',
    student_id: 'STU-002',
    enrollment_id: 'ENR-002',
    course_id: 'CRS-001',
    batch_id: 'BAT-001',
    status: 'active'
  },
  {
    allocation_id: 'BAL-003',
    student_id: 'STU-003',
    enrollment_id: 'ENR-003',
    course_id: 'CRS-002',
    batch_id: 'BAT-002',
    status: 'active'
  }
];

export const STATIC_MOCK_STUDENT_ATTENDANCE = [
  {
    attendance_id: 'ATT-001',
    student_id: 'STU-001',
    batch_id: 'BAT-001',
    attendance_date: '2026-07-15',
    status: 'P',
    entry_time: { hour: 8, minute: 5, period: 'AM' },
    exit_time: { hour: 11, minute: 0, period: 'AM' },
    attendance_mode: 'Manual',
    remarks: 'Punctual'
  },
  {
    attendance_id: 'ATT-002',
    student_id: 'STU-002',
    batch_id: 'BAT-001',
    attendance_date: '2026-07-15',
    status: 'A',
    entry_time: null,
    exit_time: null,
    attendance_mode: 'Manual',
    remarks: 'Medical Leave'
  }
];

export const STATIC_MOCK_TEACHER_ATTENDANCE = [
  {
    attendance_id: 'TAT-001',
    teacher_id: 'TEA-001',
    batch_id: 'BAT-002',
    attendance_date: '2026-07-15',
    status: 'P',
    entry_time: { hour: 10, minute: 0, period: 'AM' },
    exit_time: { hour: 1, minute: 0, period: 'PM' },
    attendance_mode: 'Manual',
    remarks: ''
  }
];

// 2. Dynamic Generator Functions
export function generateMockStudents(count) {
  const list = [];
  for (let i = 1; i <= count; i++) {
    const padded = String(i).padStart(3, '0');
    list.push({
      student_id: `STU-${padded}`,
      student_name: `Student Name ${padded}`,
      email: `student${padded}@example.com`,
      phone: `9900000${padded}`,
      gender: i % 2 === 0 ? 'Female' : 'Male',
      dob: '2010-01-01',
      mother_name: 'Mother Name',
      father_name: 'Father Name',
      status: 'active'
    });
  }
  return list;
}

export function generateMockTeachers(count) {
  const list = [];
  for (let i = 1; i <= count; i++) {
    const padded = String(i).padStart(3, '0');
    list.push({
      teacher_id: `TEA-${padded}`,
      full_name: `Teacher Name ${padded}`,
      mobile_number: `9800000${padded}`,
      email: `teacher${padded}@example.com`,
      gender: i % 2 === 0 ? 'female' : 'male',
      date_of_birth: '1980-01-01',
      experience_years: 5 + (i % 10),
      qualification: 'M.Sc Graduate',
      specialization: 'General Studies',
      teacher_type: 'full_time',
      status: 'active'
    });
  }
  return list;
}

export function generateMockCourses(count) {
  const list = [];
  for (let i = 1; i <= count; i++) {
    const padded = String(i).padStart(3, '0');
    list.push({
      course_id: `CRS-${padded}`,
      name: `Subject Course ${padded}`,
      short_code: `SC${padded}`,
      entity_type: 'subject',
      language_medium: 'English',
      description: `Course description for ${padded}`,
      duration_value: 6,
      duration_unit: 'months',
      base_fee: 1000 + i * 100,
      default_installment_count: 3
    });
  }
  return list;
}

export function generateMockBatches(teachers, courses) {
  const list = [];
  const count = Math.min(teachers.length, courses.length);
  for (let i = 0; i < count; i++) {
    const teacher = teachers[i];
    const course = courses[i];
    const padded = String(i + 1).padStart(3, '0');
    list.push({
      batch_id: `BAT-${padded}`,
      course_id: course.course_id,
      teacher_id: teacher.teacher_id,
      branch_id: 'BRN-001',
      batch_name: `Batch Group ${padded}`,
      start_date: '2026-05-01',
      end_date: '2026-11-30',
      capacity: 30,
      batch_type: 'Academy',
      status: 'active',
      schedule: {
        start_time: '09:00',
        end_time: '12:00',
        days: ['Monday', 'Tuesday', 'Wednesday']
      }
    });
  }
  return list;
}

export function generateMockAllocations(students, batches) {
  const list = [];
  students.forEach((student, index) => {
    // Round-robin assign students to batches
    const batch = batches[index % batches.length];
    const padded = String(index + 1).padStart(3, '0');
    list.push({
      allocation_id: `BAL-${padded}`,
      student_id: student.student_id,
      enrollment_id: `ENR-${padded}`,
      course_id: batch.course_id,
      batch_id: batch.batch_id,
      status: 'active'
    });
  });
  return list;
}

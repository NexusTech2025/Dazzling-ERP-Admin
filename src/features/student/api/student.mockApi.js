import mockStudentsData from '../../../mockdata/student/students.json';
import { simulateDelay } from '../../../lib/mockData';

/**
 * Student Mock API Layer
 */

let localStudents = [...mockStudentsData.Students];

export const fetchStudents = async (token, filter = {}, options = {}) => {
  await simulateDelay();
  
  let filtered = [...localStudents];
  
  if (filter.student_id) {
    filtered = filtered.filter(s => s.student_id === filter.student_id);
  }
  
  if (filter.status) {
    filtered = filtered.filter(s => s.status === filter.status);
  }
  if (filter.search) {
    const s = filter.search.toLowerCase();
    filtered = filtered.filter(s => 
      s.student_name.toLowerCase().includes(s) || 
      s.student_id.toLowerCase().includes(s)
    );
  }

  return { success: true, data: { data: filtered } };
};

export const createStudent = async (token, userData, profileData, options = {}) => {
  await simulateDelay(1000);
  const newStudent = {
    student_id: `STU-${Date.now()}`,
    student_name: userData.name,
    email: userData.email,
    phone: userData.phone,
    status: 'active',
    ...profileData
  };
  localStudents.push(newStudent);
  return { success: true, message: "Student created successfully", data: newStudent };
};

export const modifyStudent = async (token, id, data, options = {}) => {
  await simulateDelay(800);
  const index = localStudents.findIndex(s => s.student_id === id);
  if (index === -1) return { success: false, message: "Student not found" };
  
  localStudents[index] = { ...localStudents[index], ...data };
  return { success: true, message: "Student updated successfully", data: localStudents[index] };
};

export const removeStudent = async (token, id, options = {}) => {
  await simulateDelay(800);
  localStudents = localStudents.filter(s => s.student_id !== id);
  return { success: true, message: "Student removed successfully" };
};

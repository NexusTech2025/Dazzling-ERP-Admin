import mockTeachers from '../../../mockdata/core/teachers.json';
import { simulateDelay } from '../../../lib/mockData';

/**
 * Teacher Mock API Layer
 */

let localTeachers = [...mockTeachers.Teachers];

export const fetchTeachers = async (token, filter = {}, options = {}) => {
  await simulateDelay();
  
  let filtered = [...localTeachers];
  if (filter.status) {
    filtered = filtered.filter(t => t.status === filter.status);
  }
  if (filter.search) {
    const s = filter.search.toLowerCase();
    filtered = filtered.filter(t => 
      t.teacher_name.toLowerCase().includes(s) || 
      t.teacher_id.toLowerCase().includes(s) ||
      t.email?.toLowerCase().includes(s)
    );
  }

  return { success: true, data: { data: filtered } };
};

export const fetchTeacherDetail = async (token, id, options = {}) => {
  await simulateDelay();
  const teacher = localTeachers.find(t => t.teacher_id === id);
  if (!teacher) return { success: false, message: "Teacher not found" };
  return { success: true, data: { data: teacher } };
};

export const createTeacher = async (token, userData, profileData, options = {}) => {
  await simulateDelay(1000);
  const newTeacher = {
    teacher_id: `TCH-${Date.now().toString().slice(-4)}`,
    username: userData.username,
    teacher_name: profileData.name,
    email: userData.email,
    status: 'active',
    ...profileData,
    created_at: new Date().toISOString()
  };
  localTeachers.push(newTeacher);
  return { success: true, message: "Teacher registered successfully", data: newTeacher };
};

export const updateTeacher = async (token, id, data, options = {}) => {
  await simulateDelay(800);
  const index = localTeachers.findIndex(t => t.teacher_id === id);
  if (index === -1) return { success: false, message: "Teacher not found" };
  
  localTeachers[index] = { ...localTeachers[index], ...data, updated_at: new Date().toISOString() };
  return { success: true, message: "Teacher profile updated successfully", data: localTeachers[index] };
};

export const removeTeacher = async (token, id, options = {}) => {
  await simulateDelay(800);
  localTeachers = localTeachers.filter(t => t.teacher_id !== id);
  return { success: true, message: "Teacher removed successfully" };
};

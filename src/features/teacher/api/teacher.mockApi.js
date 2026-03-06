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

export const createTeacher = async (token, userData, profileData, options = {}) => {
  await simulateDelay(1000);
  const newTeacher = {
    teacher_id: `TCH-${Date.now()}`,
    teacher_name: userData.name,
    email: userData.email,
    mobile: userData.phone,
    status: 'active',
    ...profileData
  };
  localTeachers.push(newTeacher);
  return { success: true, message: "Teacher created successfully", data: newTeacher };
};

export const removeTeacher = async (token, id, options = {}) => {
  await simulateDelay(800);
  localTeachers = localTeachers.filter(t => t.teacher_id !== id);
  return { success: true, message: "Teacher removed successfully" };
};

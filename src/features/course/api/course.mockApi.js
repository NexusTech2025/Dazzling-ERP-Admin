import { mockCourses, simulateDelay } from '../../../lib/mockData';

/**
 * Course Mock API Layer
 * Replaces actual GAS calls with local mock data for testing UI.
 */

export const fetchCourses = async (token, filter = {}, options = {}) => {
  await simulateDelay();
  
  let filtered = [...mockCourses];
  if (filter.status === 'Active') filtered = filtered.filter(c => c.is_active);
  if (filter.status === 'Inactive') filtered = filtered.filter(c => !c.is_active);
  if (filter.search) {
    const s = filter.search.toLowerCase();
    filtered = filtered.filter(c => c.name.toLowerCase().includes(s) || c.course_id.toLowerCase().includes(s));
  }

  return { success: true, data: { data: filtered } };
};

export const fetchCourseDetail = async (token, id, options = {}) => {
  await simulateDelay();
  const course = mockCourses.find(c => c.course_id === id);
  if (!course) return { success: false, message: "Course not found" };
  return { success: true, data: { data: [course] } };
};

export const createCourse = async (token, data, options = {}) => {
  await simulateDelay(800);
  const newCourse = {
    ...data,
    created_at: new Date().toISOString()
  };
  mockCourses.push(newCourse);
  return { success: true, message: "Course created successfully", data: newCourse };
};

export const updateCourse = async (token, id, data, options = {}) => {
  await simulateDelay(800);
  const index = mockCourses.findIndex(c => c.course_id === id);
  if (index === -1) return { success: false, message: "Course not found" };
  
  // Note: in a real environment we wouldn't mutate the export directly like this,
  // but for a mock development setup it works to simulate state.
  Object.assign(mockCourses[index], data);
  return { success: true, message: "Course updated successfully" };
};

export const deleteCourse = async (token, id, options = {}) => {
  await simulateDelay(800);
  const index = mockCourses.findIndex(c => c.course_id === id);
  if (index === -1) return { success: false, message: "Course not found" };
  
  mockCourses.splice(index, 1);
  return { success: true, message: "Course deleted successfully" };
};

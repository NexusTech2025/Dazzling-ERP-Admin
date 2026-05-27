import { executeAction } from '../../../services/apiClient';

/**
 * Course API Layer
 * Fully migrated to the new unified DATA and ACADEMIC registry actions.
 */

// --- COURSE TYPES (SEGMENTS) ---

export const fetchCourseTypes = (token, options = {}) => 
  executeAction('DATA.QUERY', { 
    target: 'CourseType', 
    where: { status: 'active' } 
  }, token);

export const createCourseType = (token, data, options = {}) => 
  executeAction('ACADEMIC.CREATE_COURSE_TYPE', data, token);

// --- COURSES (SUBJECTS) ---

export const fetchCourses = (token, filter = {}, options = {}) => 
  executeAction('DATA.QUERY', { 
    target: 'Course', 
    where: { status: 'active', ...filter },
    include: {
      coursetype: {} // Hydrates the linked Segment
    }
  }, token);

export const fetchCourseDetail = (token, id, options = {}) => 
  executeAction('DATA.QUERY', { 
    target: 'Course', 
    where: { course_id: id },
    include: {
      coursetype: {}
    }
  }, token);

export const createCourse = (token, data, options = {}) => 
  executeAction('ACADEMIC.CREATE_COURSE', data, token);

export const updateCourse = (token, id, data, options = {}) => 
  executeAction('DATA.UPDATE', { 
    table: 'Course', 
    id: id, 
    data 
  }, token);

export const deleteCourse = (token, id, options = {}) => 
  executeAction('DATA.DELETE', { 
    table: 'Course', 
    id: id 
  }, token);

export const updateCourseType = (token, id, data, options = {}) => 
  executeAction('DATA.UPDATE', { 
    table: 'CourseType', 
    id: id, 
    data 
  }, token);

export const deleteCourseType = (token, id, options = {}) => 
  executeAction('DATA.DELETE', { 
    table: 'CourseType', 
    id: id 
  }, token);

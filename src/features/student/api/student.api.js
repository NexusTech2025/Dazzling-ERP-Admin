import { query, addStudent, updateStudent, deleteStudent } from '../../../services/api';

/**
 * Student API Layer
 * Pure functions for interacting with student data via GAS
 */

export const fetchStudents = (token, filter = {}, options = {}) => 
  query(token, 'Student', filter, options);

export const createStudent = (token, userData, profileData, options = {}) => 
  addStudent(token, userData, profileData, options);

export const modifyStudent = (token, id, data, options = {}) => 
  updateStudent(token, id, data, options);

export const removeStudent = (token, id, options = {}) => 
  deleteStudent(token, id, options);

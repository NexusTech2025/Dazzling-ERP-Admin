import { query, addStudent, updateStudent, deleteStudent } from '../../../services/api';
import { executeAction } from '../../../services/apiClient';

/**
 * Student API Layer
 * Pure functions for interacting with student data via GAS
 */

export const fetchStudents = (token, filter = {}, options = {}) => 
  query(token, 'Student', filter, options);

export const createStudent = (token, userData, profileData, options = {}) => 
  addStudent(token, userData, profileData, options);

export const createStudentLead = (token, leadData, options = {}) => 
  executeAction('STUDENT.ADD_LEAD', { leadData }, token, options);

export const registerStudentTransaction = (token, registrationData, options = {}) => 
  executeAction('STUDENT.REGISTER', registrationData, token, options);

export const modifyStudent = (token, id, data, options = {}) => 
  updateStudent(token, id, data, options);

export const removeStudent = (token, id, options = {}) => 
  deleteStudent(token, id, options);

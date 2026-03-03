import { query, addTeacher, updateTeacher, deleteTeacher } from '../../../services/api';

/**
 * Teacher API Layer
 */

export const fetchTeachers = (token, filter = {}, options = {}) => 
  query(token, 'Teacher', filter, options);

export const createTeacher = (token, userData, profileData, options = {}) => 
  addTeacher(token, userData, profileData, options);

export const modifyTeacher = (token, id, data, options = {}) => 
  updateTeacher(token, id, data, options);

export const removeTeacher = (token, id, options = {}) => 
  deleteTeacher(token, id, options);

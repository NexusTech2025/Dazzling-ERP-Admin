/**
 * @file teacher.api.js
 * @module TeacherAPI
 * @description API service layer for teacher directories, staff profiling, 
 * salary assignments, and active course linking configurations.
 */

import { executeAction } from '../../../services/apiClient';
import { API_REGISTRY } from '../../../services/apiRegistry';

/**
 * Fetches all teacher records matching optional filters (e.g. status, branch_id).
 * 
 * @async
 * @function fetchTeachers
 * @param {string} token - The active user authorization session token.
 * @param {object} [filter={}] - Target search matching database columns.
 * @param {object} [options={}] - HTTP fetch configuration options (e.g. AbortController signal).
 * @returns {Promise<object>} Standard response envelope with an array of matching teacher records.
 */
export const fetchTeachers = (token, filter = {}, options = {}) => 
  executeAction(API_REGISTRY.DATA.QUERY, { target: 'Teacher', where: filter }, token, options);

/**
 * Registers a new teacher profile in the database system (Onboarding).
 * 
 * @async
 * @function createTeacher
 * @param {string} token - The active user authorization session token.
 * @param {object} userData - System login credentials and security role (e.g., password, role).
 * @param {object} profileData - General biological profile (e.g., full_name, mobile_number, email).
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Standard response envelope with the onboarded Teacher ID.
 */
export const createTeacher = (token, userData, profileData, options = {}) => 
  executeAction(API_REGISTRY.STAFF.ONBOARD_TEACHER, { userData, profileData }, token, options);

/**
 * Performs a differential update of columns in a specific teacher profile.
 * 
 * @async
 * @function modifyTeacher
 * @param {string} token - The active user authorization session token.
 * @param {string} id - The unique teacher identifier to update (prefix: TCH-).
 * @param {object} data - Key-value map of column updates.
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Standard response envelope confirming modification state.
 */
export const modifyTeacher = (token, id, data, options = {}) => 
  executeAction(API_REGISTRY.STAFF.UPDATE_TEACHER, { teacher_id: id, data }, token, options);

/**
 * Permanently deletes a specific teacher record from the database.
 * 
 * @async
 * @function removeTeacher
 * @param {string} token - The active user authorization session token.
 * @param {string} id - The unique teacher identifier to delete.
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Standard response envelope confirming database removal status.
 */
export const removeTeacher = (token, id, options = {}) => 
  executeAction(API_REGISTRY.DATA.DELETE, { table: 'Teacher', id }, token, options);

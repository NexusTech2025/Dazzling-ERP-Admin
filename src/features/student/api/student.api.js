/**
 * @file student.api.js
 * @module StudentAPI
 * @description API service layer for student directories, CRM target leads (prospects), 
 * and full multi-step relational registration transactions.
 */

import { executeAction } from '../../../services/apiClient';
import { API_REGISTRY } from '../../../services/apiRegistry';

/**
 * Fetches all student records matching optional filters (e.g. status, target student_id).
 * 
 * @async
 * @function fetchStudents
 * @param {string} token - The active user authorization session token.
 * @param {object} [filter={}] - Target search matching database columns.
 * @param {object} [options={}] - HTTP fetch configuration options (e.g. AbortController signal).
 * @returns {Promise<object>} Standard response envelope with an array of matching student records.
 */
export const fetchStudents = (token, filter = {}, options = {}) => 
  executeAction(API_REGISTRY.DATA.QUERY, { target: 'Student', where: filter }, token, options);

/**
 * Registers a student with basic profile credentials under the legacy single-row model.
 * 
 * @async
 * @function createStudent
 * @param {string} token - The active user authorization session token.
 * @param {object} userData - System login account fields (e.g. password, username).
 * @param {object} profileData - General biological data (e.g. student_name, dob, gender).
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Standard response envelope confirming registration status.
 */
export const createStudent = (token, userData, profileData, options = {}) => 
  executeAction(API_REGISTRY.STUDENT.ADD, { userData, profileData }, token, options);

/**
 * Captures a new flat CRM marketing lead/prospect (Quick Add).
 * Decoupled from full registration tables on the database.
 * 
 * @async
 * @function createStudentLead
 * @param {string} token - The active user authorization session token.
 * @param {object} leadData - CRM lead parameters.
 * @param {string} leadData.student_name - Full name of the target prospect.
 * @param {string} leadData.phone - Sanitized 10-digit mobile number.
 * @param {string} [leadData.email] - Contact email address.
 * @param {string} leadData.batch_id - Target batch identifier target (BAT- prefix).
 * @param {string} [leadData.status='prospect'] - Lead lifecycle tracking category.
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Standard response envelope with the recorded Lead ID.
 */
export const createStudentLead = (token, leadData, options = {}) => 
  executeAction(API_REGISTRY.STUDENT.ADD_LEAD, { leadData }, token, options);

/**
 * Initiates the standard 5-step relational registration wizard transaction.
 * Creates records in Student, Address, ContactInfo, and Education tables atomically on the backend.
 * 
 * @async
 * @function registerStudentTransaction
 * @param {string} token - The active user authorization session token.
 * @param {object} registrationData - Relational tables compilation payload.
 * @param {object} registrationData.profile - Biological profile attributes.
 * @param {object} registrationData.address - Home residency address columns.
 * @param {object} registrationData.contact - emergency emails and mobile linkages.
 * @param {Array<object>} registrationData.education - Historical qualifications list.
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Standard response envelope indicating transaction success.
 */
export const registerStudentTransaction = (token, registrationData, options = {}) => 
  executeAction(API_REGISTRY.STUDENT.REGISTER, registrationData, token, options);

/**
 * Performs a differential update of columns in a specific student profile.
 * 
 * @async
 * @function modifyStudent
 * @param {string} token - The active user authorization session token.
 * @param {string} id - The unique student identifier to modify.
 * @param {object} data - Key-value map of column updates.
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Standard response envelope confirming modification state.
 */
export const modifyStudent = (token, id, data, options = {}) => 
  executeAction(API_REGISTRY.STUDENT.UPDATE, { id, data }, token, options);

/**
 * Deletes a student and cleans up related address, contact, and enrollment rows.
 * Uses a specific relational deletion controller to prevent orphan rows.
 * 
 * @async
 * @function removeStudent
 * @param {string} token - The active user authorization session token.
 * @param {string} id - The unique student identifier to delete.
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Standard response envelope verifying cascade deletion outcomes.
 */
export const removeStudent = (token, id, options = {}) => {
  const { dryRun = false, ...fetchOptions } = options;
  return executeAction(
    API_REGISTRY.STUDENT.DELETE,
    { student_id: id, dryRun },
    token,
    fetchOptions
  );
};

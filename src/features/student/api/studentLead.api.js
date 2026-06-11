/**
 * @file studentLead.api.js
 * @module StudentLeadAPI
 * @description API service layer for StudentLead CRM operations.
 */

import { executeAction } from '../../../services/apiClient';
import { API_REGISTRY } from '../../../services/apiRegistry';

/**
 * Fetches all student leads matching optional filters.
 * 
 * @async
 * @function fetchStudentLeads
 * @param {string} token - Authorization token.
 * @param {object} [filter={}] - Query search conditions.
 * @param {object} [options={}] - Request options.
 * @returns {Promise<object>}
 */
export const fetchStudentLeads = (token, filter = {}, options = {}) =>
  executeAction(API_REGISTRY.LEAD.QUERY, { target: 'StudentLead', where: filter }, token, options);

/**
 * Fetches a single student lead details.
 * 
 * @async
 * @function fetchStudentLeadDetail
 * @param {string} token - Authorization token.
 * @param {string} id - Lead ID.
 * @param {object} [options={}] - Request options.
 * @returns {Promise<object>}
 */
export const fetchStudentLeadDetail = (token, id, options = {}) =>
  executeAction(API_REGISTRY.LEAD.QUERY, { target: 'StudentLead', where: { lead_id: id } }, token, options);

/**
 * Updates columns for a specific student lead.
 * 
 * @async
 * @function updateStudentLead
 * @param {string} token - Authorization token.
 * @param {string} id - Lead ID.
 * @param {object} data - Column updates map.
 * @param {object} [options={}] - Request options.
 * @returns {Promise<object>}
 */
export const updateStudentLead = (token, id, data, options = {}) =>
  executeAction(API_REGISTRY.LEAD.UPDATE, { target: 'StudentLead', id, data }, token, options);

/**
 * Deletes a student lead from the database.
 * 
 * @async
 * @function deleteStudentLead
 * @param {string} token - Authorization token.
 * @param {string} id - Lead ID.
 * @param {object} [options={}] - Request options.
 * @returns {Promise<object>}
 */
export const deleteStudentLead = (token, id, options = {}) =>
  executeAction(API_REGISTRY.LEAD.DELETE, { target: 'StudentLead', table: 'StudentLead', id }, token, options);

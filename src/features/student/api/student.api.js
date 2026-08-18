/**
 * @file student.api.js
 * @module StudentAPI
 * @description API service layer for student directories, CRM target leads (prospects), 
 * and full multi-step relational registration transactions.
 */

import { executeAction } from '../../../services/apiClient.js';
import { API_REGISTRY } from '../../../services/apiRegistry.js';

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
  executeAction(
    API_REGISTRY.DATA.QUERY,
    {
      target: 'Student',
      where: filter,
      include: {
        address: {},
        contact: {},
        education: {},
        allocations: {},
        enrollments: {},
        studentattendance: {}
      }
    },
    token,
    { timeout: 'HYDRATED_QUERY', ...options }
  );

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
  executeAction(API_REGISTRY.STUDENT.ADD, { userData, profileData }, token, { timeout: 'DATA_MUTATION', ...options });

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
  executeAction(API_REGISTRY.STUDENT.ADD_LEAD, { leadData }, token, { timeout: 'DATA_MUTATION', ...options });

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
  executeAction(API_REGISTRY.STUDENT.REGISTER, registrationData, token, { timeout: 'DATA_MUTATION', ...options });

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
  executeAction(API_REGISTRY.STUDENT.UPDATE, { id, data }, token, { timeout: 'DATA_MUTATION', ...options });

/**
 * Updates a student profile composite payload (profile, address, contact, education)
 * using the student_update_profile backend RPC endpoint.
 *
 * @async
 * @function updateStudentProfile
 * @param {string} token - The active user authorization session token.
 * @param {object} payload - Composite payload envelope containing { student_id, profile, contact, address, education }.
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Standard response envelope confirming modification state.
 */
export const updateStudentProfile = (token, payload, options = {}) =>
  executeAction(API_REGISTRY.STUDENT.UPDATE_PROFILE, payload, token, options);

/**
 * Deletes a student via the unified student_delete backend endpoint.
 * Supports soft-delete with financial settlement, untouched clean purge, or superadmin force purge.
 * 
 * @async
 * @function removeStudent
 * @param {string} token - The active user authorization session token.
 * @param {string|object} payloadOrId - Target student ID string or composite payload object.
 * @param {string} payloadOrId.student_id - Target student ID ("STU-xxx").
 * @param {string} [payloadOrId.mode="soft"] - Deletion mode: "soft" | "hard" | "untouched".
 * @param {boolean} [payloadOrId.force=false] - Force purge switch (superadmin only).
 * @param {string} [payloadOrId.reason] - Administrative reason for soft delete.
 * @param {object} [payloadOrId.financial_settlement] - Financial settlement configuration.
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Standard response envelope with deletion manifest.
 */
export const removeStudent = (token, payloadOrId, options = {}) => {
  const { ...fetchOptions } = options;
  const payload = typeof payloadOrId === 'string'
    ? { student_id: payloadOrId, mode: 'soft' }
    : {
        student_id: payloadOrId.student_id || payloadOrId.id,
        mode: payloadOrId.mode || 'soft',
        force: Boolean(payloadOrId.force),
        reason: payloadOrId.reason || undefined,
        financial_settlement: payloadOrId.financial_settlement || undefined
      };

  return executeAction(
    API_REGISTRY.STUDENT.DELETE,
    payload,
    token,
    { timeout: 'DATA_MUTATION', ...fetchOptions }
  );
};

/**
 * Fetches enrollment records from backend, including nested student fee accounts, fee plans, Adjustments, installments, and payment logs.
 * 
 * @async
 * @function fetchEnrollments
 * @param {string} token - The active user authorization session token.
 * @param {object} [filter={}] - Target search matching database columns (e.g. enrollment_id).
 * @param {object} [options={}] - HTTP fetch and query configuration options.
 * @param {number} [options.limit=3] - Target pagination batch size limit.
 * @param {number} [options.offset=0] - Target pagination offset.
 * @param {AbortSignal} [options.signal] - Abort signal to cancel request.
 * @returns {Promise<object>} Standard response envelope with an array of matching enrollment records.
 */
export const fetchEnrollments = (token, filter = {}, options = {}) => {
  const { limit = 200, offset = 0, signal } = options;
  const payload = {
    target: 'Enrollment',
    where: filter,
    pagination: {
      limit,
      offset
    },
    include: {
      studentfeeaccounts: {
        include: {
          feeplan: {},
          feeadjustments: {},
          installments: {
            include: ['payments']
          }
        }
      }
    }
  };
  return executeAction(API_REGISTRY.DATA.QUERY, payload, token, { timeout: 'HYDRATED_QUERY', signal, ...options });
};

/**
 * Updates an enrollment contract and its child batch seating allocations
 * using the academic_update_enrollment backend action controller.
 * 
 * @async
 * @function updateEnrollment
 * @param {string} token - Active user authorization session token.
 * @param {object} payload - Action parameters { enrollment_id, roll_number, enrollment_date, status, academic_status, metadata, allocations }.
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Standard response envelope with updated enrollment and allocations.
 */
export const updateEnrollment = (token, payload, options = {}) =>
  executeAction(API_REGISTRY.ACADEMIC.UPDATE_ENROLLMENT, payload, token, options);

/**
 * Discards an enrollment contract and settles the financial account.
 * 
 * @async
 * @function discardEnrollment
 * @param {string} token - Active user authorization session token.
 * @param {object} payload - Action parameters { enrollment_id, discard_mode: "refund"|"no_refund", remarks }.
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Standard response envelope with discard outcome data.
 */
export const discardEnrollment = (token, payload, options = {}) =>
  executeAction(API_REGISTRY.ACADEMIC.DISCARD_ENROLLMENT, payload, token, options);

/**
 * Migrates a student from one enrollment to a new course/package contract.
 * 
 * @async
 * @function migrateEnrollment
 * @param {string} token - Active user authorization session token.
 * @param {object} payload - Action parameters { enrollment_id, target_type, target_id, rollover_payments, new_fee, batch_assignments, installment_plan, remarks }.
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Standard response envelope with old_contract and new_contract data.
 */
export const migrateEnrollment = (token, payload, options = {}) =>
  executeAction(API_REGISTRY.ACADEMIC.MIGRATE_ENROLLMENT, payload, token, options);



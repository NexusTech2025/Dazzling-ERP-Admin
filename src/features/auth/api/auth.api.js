/**
 * @file auth.api.js
 * @module AuthAPI
 * @description API service layer for system authentication and user account management.
 */

import { executeAction } from '../../../services/apiClient';

/**
 * Registers a new system user in the database.
 * @param {string} token - The active user authorization session token (superadmin's token).
 * @param {object} payload - The registration data payload.
 * @param {string} payload.username - The username for the new account.
 * @param {string} payload.password - The plain-text password for the new account.
 * @param {string} payload.role - The security role (e.g. 'admin', 'superadmin', 'teacher', 'student', 'staff', 'guest').
 * @param {object} [options={}] - HTTP fetch configuration options (e.g. AbortController signal).
 * @returns {Promise<object>} Standard response envelope with created user details.
 * @throws {ApiError} If backend returns success: false or validation fails.
 */
export const registerUser = (token, payload, options = {}) => {
  return executeAction('AUTH.REGISTER', payload, token, options);
};

/**
 * Queries users in the database (restricted to superadmin).
 * @param {string} token - The active user authorization session token.
 * @param {object} [payload={}] - Query DSL criteria (where, sort, pagination).
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Standard response envelope with user data count and matching list.
 */
export const fetchUsers = (token, payload = {}, options = {}) => {
  return executeAction('USER.QUERY', payload, token, options);
};

/**
 * Updates user metadata or password credentials (restricted to superadmin).
 * @param {string} token - The active user authorization session token.
 * @param {string} userId - The unique USR- prefix identifier of target account.
 * @param {object} data - Key-value map of parameters to modify (username, role, status, password).
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Standard response envelope confirming update status and target record.
 */
export const updateUser = (token, userId, data, options = {}) => {
  return executeAction('USER.UPDATE', { user_id: userId, data }, token, options);
};

/**
 * Deletes a user account and invalidates active session tokens (restricted to superadmin).
 * @param {string} token - The active user authorization session token.
 * @param {string} userId - The unique USR- prefix identifier of target account.
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Standard response envelope confirming deletion status.
 */
export const deleteUser = (token, userId, options = {}) => {
  return executeAction('USER.DELETE', { user_id: userId }, token, options);
};

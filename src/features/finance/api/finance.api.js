/**
 * @file finance.api.js
 * @module FinanceAPI
 * @description API service layer for financial transactions, billing ledgers, installments, and payment schedules.
 * Communicates with the DazzlingDB Google Apps Script financial backend using fetch-driven action routing.
 */

import { executeAction } from '../../../services/apiClient';
import { API_REGISTRY } from '../../../services/apiRegistry';

/**
 * Fetches all student fee installment schedules matching optional filters.
 * Utilizes the central database query tool.
 * 
 * @async
 * @function fetchInstallments
 * @param {string} token - The active user authorization session token.
 * @param {object} [filter={}] - Filter mappings matching database columns (e.g. status, student_fee_id).
 * @param {object} [options={}] - HTTP fetch configuration options (e.g. AbortController signal).
 * @returns {Promise<object>} Standard response envelope with an array of installment schedules.
 */
export const fetchInstallments = (token, filter = {}, options = {}) =>
  executeAction(API_REGISTRY.DATA.QUERY, { target: 'Installments', where: filter }, token, { timeout: 'STANDARD', ...options });

/**
 * Retrieves the aggregated financial revenue overview numbers (total fees, amount paid, balance due).
 * 
 * @async
 * @function fetchRevenueSummary
 * @param {string} token - The active user authorization session token.
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Standard response envelope containing a single summary details object.
 */
export const fetchRevenueSummary = (token, options = {}) =>
  executeAction(API_REGISTRY.DATA.QUERY, { target: 'RevenueSummary', where: {} }, token, { timeout: 'STANDARD', ...options });

/**
 * Retrieves all outstanding installments that have passed their due dates without being settled.
 * 
 * @async
 * @function fetchOverdueAccounts
 * @param {string} token - The active user authorization session token.
 * @param {object} [filter={}] - Secondary column filters to overlay on top of the overdue criteria.
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Standard response envelope containing the active overdue installment lists.
 */
export const fetchOverdueAccounts = (token, filter = {}, options = {}) =>
  executeAction(API_REGISTRY.DATA.QUERY, { target: 'Installments', where: { ...filter, status: 'Overdue' } }, token, { timeout: 'STANDARD', ...options });

/**
 * Retrieves the comprehensive personal financial ledger (plans, balances, payments) for a single student.
 * 
 * @async
 * @function fetchStudentFeeOverview
 * @param {string} token - The active user authorization session token.
 * @param {string} studentId - The unique primary student identifier (prefix: STU-).
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Standard response envelope containing the compiled student ledger data.
 */
export const fetchStudentFeeOverview = (token, studentId, options = {}) =>
  executeAction(API_REGISTRY.FINANCE.GET_STUDENT_FEES, { studentId }, token, { timeout: 'HYDRATED_QUERY', ...options });

/**
 * Logs a payment transaction inside the database ledger, updating installment states automatically.
 * 
 * @async
 * @function recordPayment
 * @param {string} token - The active user authorization session token.
 * @param {object} data - Transaction parameters for the payment entry.
 * @param {string} data.installment_id - The installment ID to credit the payment against.
 * @param {string} data.student_fee_id - The student's overall fee account ID.
 * @param {number} data.amount_paid - The physical currency amount deposited.
 * @param {string} data.payment_method - Method of transaction (cash, upi, bank_transfer, cheque).
 * @param {string} [data.transaction_reference] - External transaction ID or bank receipt reference.
 * @param {string} [data.remarks] - Administrative comments regarding this transaction.
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Standard response envelope confirming ledger state post-transaction.
 */
export const recordPayment = (token, data, options = {}) =>
  executeAction(API_REGISTRY.FINANCE.STUDENT_PAYMENT_TRANSACTION, data, token, { timeout: 'DATA_MUTATION', ...options });

/**
 * Creates and inserts a binding fee schedule structure (installments and due dates) for a student's enrollment.
 * 
 * @async
 * @function generateFeePlan
 * @param {string} token - The active user authorization session token.
 * @param {object} data - Configuration parameters for generating the fee plan.
 * @param {string} data.enrollment_id - The target student enrollment identifier.
 * @param {string} data.fee_plan_id - The master fee template template plan ID to load.
 * @param {number} data.total_fee - Base catalog fee for this course or package.
 * @param {number} [data.discount=0] - Numerical discount amount to subtract.
 * @param {string} [data.adjustment_type] - Discount type context (scholarship, coupon, referral).
 * @param {number} [data.installments=1] - Number of monthly cycles to spread payments across.
 * @param {object} [options={}] - HTTP fetch configuration options.
 * @returns {Promise<object>} Standard response envelope indicating structural generation success.
 */
export const generateFeePlan = (token, data, options = {}) =>
  executeAction(API_REGISTRY.FINANCE.GENERATE_FEE_PLAN, { data }, token, { timeout: 'DATA_MUTATION', ...options });

// ==========================================
// --- MONEY TRANSACTIONS SERVICE LAYER ---
// ==========================================

/**
 * Fetches all Money Transactions matching optional filters.
 */
export const fetchMoneyTransactions = (token, filter = {}, options = {}) =>
  executeAction(API_REGISTRY.DATA.QUERY, { target: 'MoneyTransaction', where: filter }, token, { timeout: 'STANDARD', ...options });

/**
 * Creates a new Money Transaction record.
 */
export const createMoneyTransaction = (token, data, options = {}) =>
  executeAction(API_REGISTRY.DATA.CREATE, { table: 'MoneyTransaction', data }, token, { timeout: 'DATA_MUTATION', ...options });

/**
 * Updates an existing Money Transaction record.
 */
export const updateMoneyTransaction = (token, id, data, options = {}) =>
  executeAction(API_REGISTRY.DATA.UPDATE, { table: 'MoneyTransaction', id, data }, token, { timeout: 'DATA_MUTATION', ...options });

/**
 * Deletes a Money Transaction record.
 */
export const deleteMoneyTransaction = (token, id, options = {}) =>
  executeAction(API_REGISTRY.DATA.DELETE, { table: 'MoneyTransaction', id }, token, { timeout: 'DATA_MUTATION', ...options });

// ==========================================
// --- EXPENSE CATEGORIES SERVICE LAYER ---
// ==========================================

/**
 * Fetches all Expense Categories.
 */
export const fetchExpenseCategories = (token, filter = {}, options = {}) =>
  executeAction(API_REGISTRY.DATA.QUERY, { target: 'ExpenseCategory', where: filter }, token, { timeout: 'STANDARD', ...options });

/**
 * Creates a new Expense Category.
 */
export const createExpenseCategory = (token, data, options = {}) =>
  executeAction(API_REGISTRY.DATA.CREATE, { table: 'ExpenseCategory', data }, token, { timeout: 'DATA_MUTATION', ...options });

/**
 * Updates an existing Expense Category.
 */
export const updateExpenseCategory = (token, id, data, options = {}) =>
  executeAction(API_REGISTRY.DATA.UPDATE, { table: 'ExpenseCategory', id, data }, token, { timeout: 'DATA_MUTATION', ...options });

/**
 * Deletes an Expense Category.
 */
export const deleteExpenseCategory = (token, id, options = {}) =>
  executeAction(API_REGISTRY.DATA.DELETE, { table: 'ExpenseCategory', id }, token, { timeout: 'DATA_MUTATION', ...options });

// ==========================================
// --- STAFF MEMBERS SERVICE LAYER ---
// ==========================================

/**
 * Fetches all support Staff Members.
 */
export const fetchStaffMembers = (token, filter = {}, options = {}) =>
  executeAction(API_REGISTRY.DATA.QUERY, { target: 'StaffMember', where: filter }, token, { timeout: 'STANDARD', ...options });

/**
 * Fetches all student financial ledger tables at once from the transactional accounting endpoint.
 * 
 * @async
 * @function fetchAccountingData
 * @param {string} token - Active authorization session token.
 * @param {Object} [options={}] - HTTP configuration options (AbortController signal).
 * @returns {Promise<Object>} Standard response containing studentFeeAccounts, installments, payments, and feeAdjustments.
 */
export const fetchAccountingData = (token, options = {}) =>
  executeAction(API_REGISTRY.FINANCE.GET_ACCOUNTING_DATA, {}, token, { timeout: 'SHEET_BATCH', ...options });

/**
 * Submits an atomic schedule restructuring payload for a target Student Fee Account.
 * 
 * @async
 * @function rescheduleInstallments
 * @param {string} token - Active authorization session token.
 * @param {Object} payload - Enveloped action arguments ({ student_fee_id, update_installments, delete_installment_ids, add_installments, remarks }).
 * @param {Object} [options={}] - HTTP configuration options (AbortController signal).
 * @returns {Promise<Object>} Standard response containing updated fee account and schedule counts.
 */
export const rescheduleInstallments = (token, payload, options = {}) =>
  executeAction(API_REGISTRY.FINANCE.RESCHEDULE_INSTALLMENTS, payload, token, { timeout: 'DATA_MUTATION', ...options });

/**
 * Updates a Student Fee Account's baseline tuition fee, discount, coupon code, or remarks.
 * 
 * @async
 * @function updateFeeAccount
 * @param {string} token - Active authorization session token.
 * @param {Object} payload - Action arguments ({ student_fee_id, total_fee, discount, adjustment_type, coupon_code, remarks, adjustment }).
 * @param {Object} [options={}] - HTTP configuration options.
 * @returns {Promise<Object>} Standard response containing recalculated fee account fields.
 */
export const updateFeeAccount = (token, payload, options = {}) =>
  executeAction(API_REGISTRY.FINANCE.UPDATE_FEE_ACCOUNT, payload, token, options);

/**
 * Applies a post-enrollment fee adjustment (scholarship, coupon, referral, manual) to a Student Fee Account.
 * 
 * @async
 * @function adjustFee
 * @param {string} token - Active authorization session token.
 * @param {Object} payload - Action arguments ({ student_fee_id, adjustment_type, amount, reason }).
 * @param {Object} [options={}] - HTTP configuration options.
 * @returns {Promise<Object>} Standard response containing audit record and updated account values.
 */
export const adjustFee = (token, payload, options = {}) =>
  executeAction(API_REGISTRY.FINANCE.ADJUST_FEE, payload, token, options);





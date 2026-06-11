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
  executeAction(API_REGISTRY.DATA.QUERY, { target: 'Installments', where: filter }, token, options);

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
  executeAction(API_REGISTRY.DATA.QUERY, { target: 'RevenueSummary', where: {} }, token, options);

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
  executeAction(API_REGISTRY.DATA.QUERY, { target: 'Installments', where: { ...filter, status: 'Overdue' } }, token, options);

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
  executeAction(API_REGISTRY.FINANCE.GET_STUDENT_FEES, { studentId }, token, options);

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
  executeAction(API_REGISTRY.FINANCE.RECORD_PAYMENT, { data }, token, options);

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
  executeAction(API_REGISTRY.FINANCE.GENERATE_FEE_PLAN, { data }, token, options);

// ==========================================
// --- MONEY TRANSACTIONS SERVICE LAYER ---
// ==========================================

/**
 * Fetches all Money Transactions matching optional filters.
 */
export const fetchMoneyTransactions = (token, filter = {}, options = {}) =>
  executeAction(API_REGISTRY.DATA.QUERY, { target: 'MoneyTransaction', where: filter }, token, options);

/**
 * Creates a new Money Transaction record.
 */
export const createMoneyTransaction = (token, data, options = {}) =>
  executeAction(API_REGISTRY.DATA.CREATE, { table: 'MoneyTransaction', data }, token, options);

/**
 * Updates an existing Money Transaction record.
 */
export const updateMoneyTransaction = (token, id, data, options = {}) =>
  executeAction(API_REGISTRY.DATA.UPDATE, { table: 'MoneyTransaction', id, data }, token, options);

/**
 * Deletes a Money Transaction record.
 */
export const deleteMoneyTransaction = (token, id, options = {}) =>
  executeAction(API_REGISTRY.DATA.DELETE, { table: 'MoneyTransaction', id }, token, options);

// ==========================================
// --- EXPENSE CATEGORIES SERVICE LAYER ---
// ==========================================

/**
 * Fetches all Expense Categories.
 */
export const fetchExpenseCategories = (token, filter = {}, options = {}) =>
  executeAction(API_REGISTRY.DATA.QUERY, { target: 'ExpenseCategory', where: filter }, token, options);

/**
 * Creates a new Expense Category.
 */
export const createExpenseCategory = (token, data, options = {}) =>
  executeAction(API_REGISTRY.DATA.CREATE, { table: 'ExpenseCategory', data }, token, options);

/**
 * Updates an existing Expense Category.
 */
export const updateExpenseCategory = (token, id, data, options = {}) =>
  executeAction(API_REGISTRY.DATA.UPDATE, { table: 'ExpenseCategory', id, data }, token, options);

/**
 * Deletes an Expense Category.
 */
export const deleteExpenseCategory = (token, id, options = {}) =>
  executeAction(API_REGISTRY.DATA.DELETE, { table: 'ExpenseCategory', id }, token, options);

// ==========================================
// --- STAFF MEMBERS SERVICE LAYER ---
// ==========================================

/**
 * Fetches all support Staff Members.
 */
export const fetchStaffMembers = (token, filter = {}, options = {}) =>
  executeAction(API_REGISTRY.DATA.QUERY, { target: 'StaffMember', where: filter }, token, options);


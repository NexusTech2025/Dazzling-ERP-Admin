import { query, postToGoogleScript } from '../../../services/api';

/**
 * Finance API Layer
 */

const createAdminPayload = (action, token, extraData = {}) => ({
  action,
  token,
  ...extraData
});

export const fetchInstallments = (token, filter = {}, options = {}) => 
  query(token, 'Installments', filter, options);

export const fetchRevenueSummary = (token, options = {}) => 
  query(token, 'RevenueSummary', {}, options);

export const fetchDelinquentAccounts = (token, filter = {}, options = {}) => 
  query(token, 'Installments', { ...filter, status: 'Overdue' }, options);

export const fetchStudentFeeOverview = (token, studentId, options = {}) => 
  postToGoogleScript(createAdminPayload('getstudentfees', token, { studentId }), options);

export const recordPayment = (token, data, options = {}) => 
  postToGoogleScript(createAdminPayload('recordpayment', token, { data }), options);

export const generateFeePlan = (token, data, options = {}) => 
  postToGoogleScript(createAdminPayload('generatefeeplan', token, { data }), options);

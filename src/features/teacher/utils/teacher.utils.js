import { parseISO, format, differenceInMonths } from 'date-fns';

/**
 * Filter active salary contract entries
 * @param {Array} configs - The raw salary configurations.
 * @returns {Array} Active configurations.
 */
export const getActiveConfigs = (configs = []) => 
  configs.filter(c => c.contract_status === 'active');

/**
 * Compute budget total contract obligation valuations
 * @param {Array} configs - The raw salary configurations.
 * @returns {number} Sum of contract values.
 */
export const calculateTotalAmountToPay = (configs = []) => {
  if (!configs.length) return 0;
  const activeConfigs = getActiveConfigs(configs);
  
  return activeConfigs.reduce((sum, c) => {
    const contractVal = Number(c.total_contract_value);
    if (!isNaN(contractVal) && contractVal > 0) return sum + contractVal;

    const base = Number(c.base_value || 0);
    if (!c.effective_to || !c.effective_from) return sum + base;
    const months = differenceInMonths(parseISO(c.effective_to), parseISO(c.effective_from));
    return sum + (base > 0 && months > 0 ? base * months : base);
  }, 0);
};

/**
 * Compute operational base pay structures
 * @param {Array} configs - The raw salary configurations.
 * @returns {number} Active base rate.
 */
export const calculateActiveBaseRate = (configs = []) => {
  if (!configs.length) return 0;
  return getActiveConfigs(configs).reduce((sum, c) => {
    const base = Number(c.base_value || 0);
    if (base > 0) return sum + base;
    
    const contractVal = Number(c.total_contract_value || 0);
    if (contractVal > 0) {
      if (!c.effective_from || !c.effective_to) return sum + contractVal;
      const months = differenceInMonths(parseISO(c.effective_to), parseISO(c.effective_from)) || 1;
      return sum + (contractVal / months);
    }
    return sum;
  }, 0);
};

/**
 * Determine logical baseline expectations vs percentage overrides
 * @param {Array} configs - The raw salary configurations.
 * @returns {number} Expected average monthly pay.
 */
export const calculateAverageMonthlyPay = (configs = []) => {
  if (!configs.length) return 0;
  return getActiveConfigs(configs).reduce((acc, c) => {
    if (c.rate_type === 'revenue_percentage') return acc;
    
    const base = Number(c.base_value || 0);
    if (base > 0) return acc + base;

    const contractVal = Number(c.total_contract_value || 0);
    if (contractVal > 0) {
      if (c.rate_type === 'yearly') return acc + (contractVal / 12);
      if (!c.effective_from || !c.effective_to) return acc + contractVal;
      const months = differenceInMonths(parseISO(c.effective_to), parseISO(c.effective_from)) || 1;
      return acc + (contractVal / months);
    }
    return acc;
  }, 0);
};

/**
 * Extracted parsing logic for handling dynamic metadata configurations
 * Cleans up inline try/catch statements inside render passes
 * @param {string} scopeType - Scope type of configuration.
 * @param {string|Object} scopeId - JSON weight string or batch ID or parsed object.
 * @returns {string} Human readable label.
 */
export const parseScopeDisplay = (scopeType, scopeId) => {
  let display = scopeType || 'global';
  if (scopeType === 'single_batch') {
    return `Single: ${scopeId}`;
  } 
  if (scopeType === 'batch_group' && scopeId) {
    try {
      const weights = typeof scopeId === 'string' ? JSON.parse(scopeId) : scopeId;
      display = `Group (${Object.keys(weights).length} batches)`;
    } catch {
      display = 'Group';
    }
  }
  return display;
};

/**
 * Financial Formatting Utilities
 * @param {number} num - Value to format.
 * @returns {string} Lakh format string.
 */
export const formatFinancialLakh = (num) => {
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
  return `₹${num.toLocaleString()}`;
};

/**
 * Financial Formatting Utilities
 * @param {number} num - Value to format.
 * @returns {string} K format string.
 */
export const formatFinancialK = (num) => {
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toLocaleString()}`;
};

/**
 * Format date bounds
 * @param {string} dateStr - Date string.
 * @param {string} [fallback='N/A'] - Fallback label.
 * @returns {string} Date label.
 */
export const formatDateBounds = (dateStr, fallback = 'N/A') => {
  if (!dateStr) return fallback;
  return format(parseISO(dateStr), 'MMM d, yyyy');
};

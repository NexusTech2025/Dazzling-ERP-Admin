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
    if (c.rate_type === 'revenue_percentage') return sum;

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
    if (c.rate_type === 'revenue_percentage') return sum;

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

/**
 * Formats a raw salary month string ('2026-07', '2026-07-01', or full ISO string) into 'July 2026' format.
 * Robustly extracts year and month to prevent timezone drift or ISO parse failures.
 * 
 * @param {string|Date} salaryMonthVal - Raw month string or date object.
 * @param {string} [fallback='N/A'] - Fallback display label.
 * @returns {string} Formatted salary month label (e.g., 'July 2026').
 */
export const formatSalaryMonth = (salaryMonthVal, fallback = 'N/A') => {
  if (!salaryMonthVal) return fallback;

  const str = String(salaryMonthVal).trim();
  if (!str) return fallback;

  try {
    // 1. Direct YYYY-MM regex extraction (handles "2026-07", "2026-07-26", "2026-07-01T00:00:00.000Z")
    const yyyyMmMatch = str.match(/^(\d{4})-(\d{2})/);
    if (yyyyMmMatch) {
      const year = parseInt(yyyyMmMatch[1], 10);
      const monthIndex = parseInt(yyyyMmMatch[2], 10) - 1; // 0-indexed month for Date
      if (year > 1900 && monthIndex >= 0 && monthIndex < 12) {
        // Construct local date on the 15th to eliminate timezone boundary shifts
        const localDate = new Date(year, monthIndex, 15);
        return format(localDate, 'MMMM yyyy');
      }
    }

    // 2. Fallback parseISO for non-standard ISO date strings
    const parsedDate = parseISO(str);
    if (!isNaN(parsedDate.getTime())) {
      return format(parsedDate, 'MMMM yyyy');
    }
  } catch (err) {
    console.error('formatSalaryMonth error:', err);
  }

  return str || fallback;
};



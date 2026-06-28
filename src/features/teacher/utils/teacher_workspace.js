/**
 * teacher_workspace.js
 * Pure domain service for tracking and processing teacher attendance matrices.
 */

/**
 * Formats full dates to standard text display.
 * @param {string} dateString - ISO date string from server payload.
 * @returns {string} Formatted localized date (e.g. "1 Jan 2026"), or fallback empty string.
 */
export const formatProfileDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString.split('T')[0]);
  return isNaN(date.getTime()) ? '' : date.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};


/**
 * Normalizes an ISO string from the server to a localized date object.
 * Accounts for intentional server-side offset shifts.
 * @param {string} isoString - e.g., "2026-06-25T18:30:00.000Z"
 * @returns {Date|null} Localized JavaScript Date object or null if invalid
 */
export const toLocalDate = (isoString) => {
  if (!isoString) return null;
  const date = new Date(isoString);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Formats a local Date object into a standard YYYY-MM-DD key.
 * @param {Date} dateObj 
 * @returns {string} "YYYY-MM-DD"
 */
export const formatToKey = (dateObj) => {
  if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) return '';
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Direct structural comparison tool for two local date streams.
 * @param {Date|string} date1 
 * @param {Date|string} date2 
 * @returns {boolean}
 */
export const isSameLocalDate = (date1, date2) => {
  const d1 = date1 instanceof Date ? date1 : new Date(date1);
  const d2 = date2 instanceof Date ? date2 : new Date(date2);
  
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return false;
  
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

/**
 * Transforms a raw flat attendance history array into an O(1) indexed lookup map
 * while handling timezone re-evaluations uniformly.
 * @param {Array} attendanceArray - Raw array from useTeacherAttendanceQuery
 * @returns {Object} Mapped lookup reference: { "YYYY-MM-DD": record }
 */
export const normalizeAttendanceList = (attendanceArray) => {
  if (!Array.isArray(attendanceArray)) return {};
  
  return attendanceArray.reduce((acc, record) => {
    if (!record?.attendance_date) return acc;
    
    // Re-evaluate the ISO string into local browser space
    const localDate = toLocalDate(record.attendance_date);
    const dateKey = formatToKey(localDate);
    
    if (dateKey) {
      acc[dateKey] = {
        ...record,
        _localDateInstance: localDate // Attached for seamless direct comparisons
      };
    }
    
    return acc;
  }, {});
};

/**
 * Pure metrics formulation engine computing monthly operational metrics.
 * @param {Object} indexedData - The normalized O(1) hash map
 * @param {number} currentYear 
 * @param {number} currentMonth - (0-indexed: 0 = January, 11 = December)
 * @returns {Object} Calculated stats envelope
 */
export const calculateMonthlyStats = (indexedData, currentYear, currentMonth) => {
  let presentDays = 0;
  let lateDays = 0;
  let absentDays = 0;
  let totalHours = 0;

  // Scan through the indexed map items directly
  Object.keys(indexedData).forEach((dateKey) => {
    const record = indexedData[dateKey];
    const recordDate = record._localDateInstance;
    
    // Boundary filter check matching the target workspace dimensions
    if (recordDate && recordDate.getFullYear() === currentYear && recordDate.getMonth() === currentMonth) {
      const status = record.status?.toUpperCase();
      
      if (status === 'P' || status === 'PRESENT') presentDays++;
      else if (status === 'L' || status === 'LATE') lateDays++;
      else if (status === 'A' || status === 'ABSENT') absentDays++;
      
      totalHours += record.duration || 0;
    }
  });

  const activeWorkedCount = presentDays + lateDays;
  const avgHours = activeWorkedCount > 0 ? (totalHours / activeWorkedCount).toFixed(1) : '0.0';

  return {
    presentDays,
    lateDays,
    absentDays,
    totalWorkingDays: presentDays + lateDays + absentDays || 22,
    totalHours: totalHours.toFixed(1),
    avgHours
  };
};

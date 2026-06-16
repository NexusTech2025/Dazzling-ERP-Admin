/**
 * Checks if a target date (in YYYY-MM-DD format) is in the past compared to local system date.
 * Timezone-safe by parsing date components directly to local midnight boundary.
 * 
 * @param {string} dateStr - Target date in YYYY-MM-DD format.
 * @returns {boolean} True if target date is in the past.
 */
export const isPastLocalDate = (dateStr) => {
  if (!dateStr) return false;
  
  const [year, month, day] = dateStr.split('-').map(Number);
  const target = new Date(year, month - 1, day, 0, 0, 0, 0);
  
  const today = new Date();
  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
  
  return target.getTime() < localToday.getTime();
};

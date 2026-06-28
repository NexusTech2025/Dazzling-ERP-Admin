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

/**
 * Formats weekly schedule days array into short initials (e.g. ["Monday", "Wednesday"] -> "M, W").
 * @param {string[]} days - Array of days of the week.
 * @returns {string} Mapped day initials or "TBD".
 */
export const formatDays = (days) => {
  if (!days || days.length === 0) return 'TBD';
  const shortDaysMap = {
    'Monday': 'M',
    'Tuesday': 'T',
    'Wednesday': 'W',
    'Thursday': 'Th',
    'Friday': 'F',
    'Saturday': 'Sa',
    'Sunday': 'Su'
  };
  return days.map(d => shortDaysMap[d] || d.substring(0, 2)).join(', ');
};

/**
 * Formats a 24-hour time string into a 12-hour formatted time (e.g. "14:30" -> "2:30 PM").
 * @param {string} timeStr - Time string in HH:MM format.
 * @returns {string} Formatted 12-hour time string or fallback string.
 */
export const formatTime = (timeStr) => {
  if (!timeStr) return '';
  try {
    const [hourStr, minuteStr] = timeStr.split(':');
    const hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minuteStr} ${ampm}`;
  } catch {
    return timeStr;
  }
};


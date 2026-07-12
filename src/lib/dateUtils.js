import { parse, parseISO, format, isValid, getUnixTime, getTime } from 'date-fns';

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

/**
 * Parses a "HH:MM" 24-hour string into a structured time metadata object.
 * @param {string} timeStr - The raw string representation of time (e.g., "14:30")
 * @returns {Object|null} Structured time or null
 */
export const parseTimeToStructured = (timeStr) => {
  if (!timeStr) return null;
  const [hourStr, minStr] = timeStr.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minStr, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  
  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;
  
  return { hour, minute, period };
};

/**
 * Formats a structured time metadata object back into a "HH:MM" 24-hour string.
 * @param {Object} structTime - Object containing { hour, minute, period }
 * @returns {string} 24-hour formatted string (e.g., "16:00")
 */
export const formatStructuredToTime = (structTime) => {
  if (!structTime || typeof structTime !== 'object') return '';
  let { hour, minute, period } = structTime;
  
  if (period === 'PM' && hour < 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

// -------------------------------------------------------------
// HEADLESS DATE/DATETIME SYSTEM PARSING STRATEGY PATTERN
// -------------------------------------------------------------

const PARSING_STRATEGIES = [
  {
    name: 'dateObject',
    match: (val) => val instanceof Date,
    parse: (val) => new Date(val.getTime())
  },
  {
    name: 'customFormat',
    match: (val, options) => typeof val === 'string' && !!options?.inputFormat,
    parse: (val, options) => parse(val.trim(), options.inputFormat, new Date(), { locale: options?.locale })
  },
  {
    name: 'isoString',
    match: (val) => typeof val === 'string' && (val.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(val)),
    parse: (val) => parseISO(val.trim())
  },
  {
    name: 'numericString',
    match: (val) => typeof val === 'string' && /^\d+$/.test(val.trim()),
    parse: (val) => new Date(Number(val.trim()))
  },
  {
    name: 'numericTimestamp',
    match: (val) => typeof val === 'number',
    parse: (val) => new Date(val)
  },
  {
    name: 'stringFallback',
    match: (val) => typeof val === 'string',
    parse: (val) => new Date(val.trim())
  }
];

/**
 * Normalizes, validates, and formats date payloads using the Strategy Pattern.
 * Pure Javascript function (non-React) for absolute portability.
 * @param {unknown} value - Raw incoming date representation (String, Number, Date, null).
 * @param {Object} options - Formatting and parsing options.
 * @param {string} [options.inputFormat] - Optional explicit pattern to parse tokenized strings.
 * @param {string} options.outputFormat - The target pattern applied during string serialization.
 * @param {string} [options.fallback='--'] - Character sequence returned when values are empty or invalid.
 * @param {Object} [options.locale] - Date-fns compatible language locale descriptor object.
 * @returns {Object} Structured client-side representation envelope of the parsed date state.
 */
export const formatDateState = (value, { inputFormat, outputFormat, fallback = '--', locale } = {}) => {
  const state = {
    rawValue: value,
    date: null,
    formatted: fallback,
    isValid: false,
    isEmpty: false,
    error: null,
    timestamp: null,
    unix: null,
    iso: null
  };

  if (value === null || value === undefined || value === '') {
    state.isEmpty = true;
    return state;
  }

  if (typeof value === 'string' && value.trim() === '') {
    state.isEmpty = true;
    return state;
  }

  try {
    const strategy = PARSING_STRATEGIES.find(s => s.match(value, { inputFormat, locale }));
    if (!strategy) {
      state.error = 'Unsupported variable data type specification';
      return state;
    }

    const parsedDate = strategy.parse(value, { inputFormat, locale });

    if (!parsedDate || !isValid(parsedDate)) {
      state.error = 'Invalid date computation bounds reached';
      return state;
    }

    state.date = parsedDate;
    state.isValid = true;
    state.timestamp = getTime(parsedDate);
    state.unix = getUnixTime(parsedDate);
    
    try {
      state.iso = parsedDate.toISOString();
    } catch {
      state.iso = null;
    }

    state.formatted = format(parsedDate, outputFormat, { locale });

  } catch (err) {
    state.isValid = false;
    state.date = null;
    state.formatted = fallback;
    state.error = err instanceof Error ? err.message : String(err);
  }

  return state;
};

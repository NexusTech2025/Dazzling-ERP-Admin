import { parseISO, format } from 'date-fns';

/**
 * Parses "HH:MM" time string to structured time object.
 * @param {string} timeStr - Time string in "HH:MM" format
 * @returns {object|null} Structured time object or null
 */
export const parseTimeToStructured = (timeStr) => {
  if (!timeStr) return null;
  const [hourStr, minStr] = timeStr.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minStr, 10);
  const period = hour >= 12 ? 'PM' : 'AM';
  if (hour > 12) hour = hour - 12;
  if (hour === 0) hour = 12;
  return { hour, minute, period };
};

/**
 * Formats structured time object into "HH:MM" string.
 * @param {object} structTime - Structured time object
 * @returns {string} Time string in "HH:MM" format
 */
export const formatStructuredToTime = (structTime) => {
  if (!structTime || typeof structTime !== 'object') return '';
  let { hour, minute, period } = structTime;
  if (period === 'PM' && hour < 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

/**
 * Normalizes flat array of student attendance records into a hierarchical month/date lookup bucket.
 * Signature: { months: { [yearMonth]: [records] }, dates: { [isoDate]: [records] } }
 * @param {Array} records - Raw API response records
 * @returns {Object} Normalized hierarchical lookup buckets
 */
export const normalizeAttendanceData = (records) => {
  const result = {
    months: {},
    dates: {}
  };

  if (!Array.isArray(records)) return result;

  records.forEach((record) => {
    if (!record.attendance_date) return;

    try {
      // Safely parse and format using date-fns to avoid timezone bugs
      const parsedDate = parseISO(record.attendance_date);
      const isoDate = format(parsedDate, 'yyyy-MM-dd');
      const yearMonth = format(parsedDate, 'yyyy-MM');

      // Map status strings to short code
      let statusVal = record.status || 'NR';
      if (statusVal === 'Absent') statusVal = 'A';
      else if (statusVal === 'Late') statusVal = 'L';
      else if (statusVal === 'Present') statusVal = 'P';

      const normalizedRecord = {
        ...record,
        status: statusVal,
        entry_time: record.entry_time || null,
        exit_time: record.exit_time || null,
        remarks: record.remarks || record.remark || "",
        
        // Backwards compatibility mappings
        check_in: record.check_in || (record.entry_time ? formatStructuredToTime(record.entry_time) : null),
        check_out: record.check_out || (record.exit_time ? formatStructuredToTime(record.exit_time) : null),
        remark: record.remark || record.remarks || ""
      };

      // 1. Group by Month
      if (!result.months[yearMonth]) {
        result.months[yearMonth] = [];
      }
      result.months[yearMonth].push(normalizedRecord);

      // 2. Group by Date
      if (!result.dates[isoDate]) {
        result.dates[isoDate] = [];
      }
      result.dates[isoDate].push(normalizedRecord);
    } catch (error) {
      console.error("[normalizeAttendanceData] Failed to parse date:", record.attendance_date, error);
    }
  });

  return result;
};

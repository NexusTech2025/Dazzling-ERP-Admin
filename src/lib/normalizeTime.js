/**
 * Normalizes polymorphic time input formats into a standardized 24-hour structure.
 * @param {string|Date|Object|null} value - Ingested time configuration
 * @returns {Object} Unified internal TimeValue object: { hour: number, minute: number, second: number, isValid: boolean }
 */
export const normalizeTime = (value) => {
  // Defensive fallback default assignment for empty or nullish parameters
  if (!value) {
    return { hour: 0, minute: 0, second: 0, isValid: false };
  }

  // Case A: Native JavaScript Date Object Ingestion
  if (value instanceof Date) {
    return {
      hour: value.getHours(),
      minute: value.getMinutes(),
      second: value.getSeconds(),
      isValid: !isNaN(value.getTime())
    };
  }

  // Case B: Pre-parsed Structural Time Objects
  if (typeof value === 'object' && value !== null) {
    const hour = parseInt(value.hour ?? value.hours, 10);
    const minute = parseInt(value.minute ?? value.minutes, 10);
    const second = parseInt(value.second ?? value.seconds, 10) || 0;
    
    return {
      hour: isNaN(hour) ? 0 : hour,
      minute: isNaN(minute) ? 0 : minute,
      second: isNaN(second) ? 0 : second,
      isValid: !isNaN(hour) && !isNaN(minute)
    };
  }

  // Case C: Standard Time String Ingestion (e.g., "14:30", "09:15:45", "2:30 PM")
  if (typeof value === 'string') {
    const cleanStr = value.trim();
    if (!cleanStr) return { hour: 0, minute: 0, second: 0, isValid: false };

    // Handle string format containing AM/PM markers
    const hasPeriod = /[ap]m/i.test(cleanStr);
    let isPM = /pm/i.test(cleanStr);
    
    // Extract base digits ignoring literal text indicators
    const timeParts = cleanStr.replace(/[^\d:]/g, '').split(':');
    let hour = parseInt(timeParts[0], 10);
    const minute = parseInt(timeParts[1], 10);
    const second = parseInt(timeParts[2], 10) || 0;

    if (isNaN(hour) || isNaN(minute)) {
      return { hour: 0, minute: 0, second: 0, isValid: false };
    }

    if (hasPeriod) {
      if (isPM && hour < 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;
    }

    return { hour, minute, second, isValid: true };
  }

  return { hour: 0, minute: 0, second: 0, isValid: false };
};

export default normalizeTime;

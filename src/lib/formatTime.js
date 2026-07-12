import { normalizeTime } from './normalizeTime';

/**
 * Ingests normalized variables and outputs localized formatted time presentations.
 * Uses Intl.DateTimeFormat with a static date anchor to completely isolate time calculations.
 */
export const formatTime = (value, options = {}) => {
  const { 
    locale = 'en-US', 
    format = '12h', 
    showSeconds = false 
  } = options;

  const normalized = normalizeTime(value);
  if (!normalized.isValid) return null;

  // Build an absolute timezone-insulated epoch anchor Date instance
  const dateAnchor = new Date(1970, 0, 1, normalized.hour, normalized.minute, normalized.second);

  // Initialize Intl parameters configuration matrix dynamically
  let intlOptions = {};

  switch (format) {
    case '12h':
      intlOptions = {
        hour: 'numeric',
        minute: '2-digit',
        second: showSeconds ? '2-digit' : undefined,
        hour12: true
      };
      break;
    case '24h':
      intlOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: showSeconds ? '2-digit' : undefined,
        hour12: false
      };
      break;
    case 'short':
      intlOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
      break;
    case 'medium':
      intlOptions = { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true };
      break;
    case 'long':
      intlOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
      break;
    case 'iso':
      const pad = (n) => String(n).padStart(2, '0');
      return showSeconds 
        ? `${pad(normalized.hour)}:${pad(normalized.minute)}:${pad(normalized.second)}`
        : `${pad(normalized.hour)}:${pad(normalized.minute)}`;
      default:
      intlOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
  }

  try {
    return new Intl.DateTimeFormat(locale, intlOptions).format(dateAnchor);
  } catch (e) {
    // Fallback display format layout string if locale system exceptions occur
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(normalized.hour)}:${pad(normalized.minute)}`;
  }
};

export default formatTime;

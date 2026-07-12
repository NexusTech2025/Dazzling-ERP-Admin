import { useDateFormatter } from '../shared/useDateFormatter';
import { DATETIME_DEFAULTS } from './datetime-utils';

/**
 * Domain-specific headless execution hook for timestamped chronological timelines.
 * @param {Object} props
 * @returns {Object} Structured data presentation token envelope.
 */
export const useDateTime = ({
  value,
  inputFormat = DATETIME_DEFAULTS.INPUT_FORMAT,
  outputFormat = DATETIME_DEFAULTS.OUTPUT_FORMAT,
  fallback = DATETIME_DEFAULTS.FALLBACK,
  locale
} = {}) => {
  return useDateFormatter({
    value,
    inputFormat,
    outputFormat,
    fallback,
    locale
  });
};

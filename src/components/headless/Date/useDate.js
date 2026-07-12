import { useDateFormatter } from '../shared/useDateFormatter';
import { DATE_DEFAULTS } from './date-utils';

/**
 * Domain-specific headless execution hook for generic calendar date formatting.
 * @param {Object} props
 * @returns {Object} Structured data presentation token envelope.
 */
export const useDate = ({
  value,
  inputFormat = DATE_DEFAULTS.INPUT_FORMAT,
  outputFormat = DATE_DEFAULTS.OUTPUT_FORMAT,
  fallback = DATE_DEFAULTS.FALLBACK,
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

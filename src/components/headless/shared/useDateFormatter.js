import { useMemo } from 'react';
import { formatDateState } from '../../../lib/dateUtils';

/**
 * Headless React hook wrapper for the formatDateState core logic.
 * Enforces absolute memoization to prevent rendering degradation.
 * @param {Object} params
 * @param {unknown} params.value - Raw incoming date representation.
 * @param {string} [params.inputFormat] - Parsing layout pattern.
 * @param {string} params.outputFormat - Target serialization pattern.
 * @param {string} [params.fallback] - Output fallback sequence.
 * @param {Object} [params.locale] - Date-fns language descriptor.
 * @returns {Object} Normalization state mapping.
 */
export const useDateFormatter = ({
  value,
  inputFormat,
  outputFormat,
  fallback,
  locale
}) => {
  return useMemo(() => {
    return formatDateState(value, { inputFormat, outputFormat, fallback, locale });
  }, [value, inputFormat, outputFormat, fallback, locale]);
};

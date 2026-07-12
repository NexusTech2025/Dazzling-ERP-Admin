/**
 * Increments a segment value within its boundaries, wrapping if necessary.
 * @param {string} type - Segment type ('hour' | 'minute' | 'second' | 'dayPeriod')
 * @param {number|string|null} currentValue - Current segment value
 * @param {number} min - Minimum limit
 * @param {number} max - Maximum limit
 * @returns {number|string} The next incremented value
 */
export const incrementSegment = (type, currentValue, min, max) => {
  if (type === 'dayPeriod') {
    return currentValue === 'AM' ? 'PM' : 'AM';
  }
  const baseVal = currentValue === null ? min : currentValue;
  let nextVal = baseVal + 1;
  if (nextVal > max) nextVal = min;
  return nextVal;
};

/**
 * Decrements a segment value within its boundaries, wrapping if necessary.
 * @param {string} type - Segment type ('hour' | 'minute' | 'second' | 'dayPeriod')
 * @param {number|string|null} currentValue - Current segment value
 * @param {number} min - Minimum limit
 * @param {number} max - Maximum limit
 * @returns {number|string} The next decremented value
 */
export const decrementSegment = (type, currentValue, min, max) => {
  if (type === 'dayPeriod') {
    return currentValue === 'AM' ? 'PM' : 'AM';
  }
  const baseVal = currentValue === null ? max : currentValue;
  let nextVal = baseVal - 1;
  if (nextVal < min) nextVal = max;
  return nextVal;
};

/**
 * Processes numeric key input for segments, returning the next value, buffer state, and focus behavior.
 * @param {string} charKey - Keyboard character (e.g. '3')
 * @param {string} currentBuffer - Current buffer string
 * @param {number} max - Maximum segment limit
 * @returns {Object|null} { nextValue, nextBuffer, shouldFocusNext }
 */
export const processSegmentKeyPress = (charKey, currentBuffer, max) => {
  if (!/^[0-9]$/.test(charKey)) {
    return null;
  }
  const nextBuffer = currentBuffer + charKey;
  const combinedNumeric = parseInt(nextBuffer, 10);

  if (combinedNumeric <= max) {
    const shouldFocusNext = nextBuffer.length >= String(max).length || combinedNumeric * 10 > max;
    return {
      nextValue: combinedNumeric,
      nextBuffer: shouldFocusNext ? '' : nextBuffer,
      shouldFocusNext
    };
  } else {
    const cleanSingleDigit = parseInt(charKey, 10);
    if (cleanSingleDigit <= max) {
      return {
        nextValue: cleanSingleDigit,
        nextBuffer: charKey,
        shouldFocusNext: false
      };
    }
  }
  return null;
};

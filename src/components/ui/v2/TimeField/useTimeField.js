import { useState, useMemo, useCallback, useRef } from 'react';
import { normalizeTime } from '../../../../lib/normalizeTime';
import { formatTime } from '../../../../lib/formatTime';
import { incrementSegment, decrementSegment, processSegmentKeyPress } from '../../../../lib/timeSegmentUtils';

const EDITABLE_SEGMENTS = ['hour', 'minute', 'second', 'dayPeriod'];

/**
 * Headless state engine managing segment values, input buffers, and validation bounds.
 */
export const useTimeField = ({
  value,
  onChange,
  is24Hour = false,
  hideSeconds = true,
  disabled = false,
  readOnly = false,
  maxTime = '23:59:59',
  minTime = '00:00:00'
}) => {
  // Parse internal structural time state from incoming polymorphic values
  const parsedValue = useMemo(() => {
    const normalized = normalizeTime(value);
    
    let hour = normalized.hour;
    let dayPeriod = 'AM';
    
    if (!is24Hour) {
      dayPeriod = normalized.hour >= 12 ? 'PM' : 'AM';
      hour = normalized.hour % 12;
      if (hour === 0) hour = 12;
    }
    
    return {
      hour: normalized.isValid ? hour : null,
      minute: normalized.isValid ? normalized.minute : null,
      second: normalized.isValid ? normalized.second : null,
      dayPeriod
    };
  }, [value, is24Hour]);

  const [inputBuffer, setInputBuffer] = useState('');
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(-1);
  const segmentRefs = useRef([]);

  // Generate localized sequence configuration array dynamically
  const segments = useMemo(() => {
    const list = [];
    
    // Hour Segment Block
    list.push({
      type: 'hour',
      text: parsedValue.hour === null ? '--' : String(parsedValue.hour).padStart(2, '0'),
      value: parsedValue.hour,
      min: is24Hour ? 0 : 1,
      max: is24Hour ? 23 : 12,
      editable: !disabled && !readOnly
    });
    
    // Separator literal literal
    list.push({ type: 'literal', text: ':', editable: false });
    
    // Minute Segment Block
    list.push({
      type: 'minute',
      text: parsedValue.minute === null ? '--' : String(parsedValue.minute).padStart(2, '0'),
      value: parsedValue.minute,
      min: 0,
      max: 59,
      editable: !disabled && !readOnly
    });

    if (!hideSeconds) {
      list.push({ type: 'literal', text: ':', editable: false });
      list.push({
        type: 'second',
        text: parsedValue.second === null ? '--' : String(parsedValue.second).padStart(2, '0'),
        value: parsedValue.second,
        min: 0,
        max: 59,
        editable: !disabled && !readOnly
      });
    }

    if (!is24Hour) {
      list.push({ type: 'literal', text: ' ', editable: false });
      list.push({
        type: 'dayPeriod',
        text: parsedValue.dayPeriod,
        value: parsedValue.dayPeriod,
        editable: !disabled && !readOnly
      });
    }

    return list;
  }, [parsedValue, is24Hour, hideSeconds, disabled, readOnly]);

  // Helper pipeline to transmit standard 24-hour string format back to parent container
  const triggerParentChange = useCallback((updatedTime) => {
    if (!onChange) return;
    let { hour, minute, second, dayPeriod } = updatedTime;
    
    // Fallback default assignments if fields are partially incomplete
    if (hour === null) hour = 0;
    if (minute === null) minute = 0;
    if (second === null) second = 0;

    let hour24 = hour;
    if (!is24Hour) {
      if (dayPeriod === 'PM' && hour < 12) hour24 += 12;
      if (dayPeriod === 'AM' && hour === 12) hour24 = 0;
    }

    const outString = formatTime(
      { hour: hour24, minute, second }, 
      { format: 'iso', showSeconds: !hideSeconds }
    );
      
    onChange(outString);
  }, [onChange, is24Hour, hideSeconds]);

  const updateSegmentValue = useCallback((type, nextVal) => {
    const nextTimeState = { ...parsedValue, [type]: nextVal };
    triggerParentChange(nextTimeState);
  }, [parsedValue, triggerParentChange]);

  const focusNext = useCallback(() => {
    const currentIdx = activeSegmentIndex;
    if (currentIdx < segmentRefs.current.length - 1) {
      let nextTarget = currentIdx + 1;
      // Skip structural presentational literal nodes automatically
      while (nextTarget < segmentRefs.current.length && !segments[nextTarget]?.editable) {
        nextTarget++;
      }
      if (segmentRefs.current[nextTarget]) {
        segmentRefs.current[nextTarget].focus();
        setInputBuffer('');
      }
    }
  }, [activeSegmentIndex, segments]);

  const focusPrevious = useCallback(() => {
    const currentIdx = activeSegmentIndex;
    if (currentIdx > 0) {
      let prevTarget = currentIdx - 1;
      while (prevTarget >= 0 && !segments[prevTarget]?.editable) {
        prevTarget--;
      }
      if (segmentRefs.current[prevTarget]) {
        segmentRefs.current[prevTarget].focus();
        setInputBuffer('');
      }
    }
  }, [activeSegmentIndex, segments]);

  const increment = useCallback((type) => {
    if (disabled || readOnly) return;
    const target = segments.find(s => s.type === type);
    if (!target) return;

    const nextVal = incrementSegment(type, parsedValue[type], target.min, target.max);
    updateSegmentValue(type, nextVal);
  }, [parsedValue, segments, updateSegmentValue, disabled, readOnly]);

  const decrement = useCallback((type) => {
    if (disabled || readOnly) return;
    const target = segments.find(s => s.type === type);
    if (!target) return;

    const nextVal = decrementSegment(type, parsedValue[type], target.min, target.max);
    updateSegmentValue(type, nextVal);
  }, [parsedValue, segments, updateSegmentValue, disabled, readOnly]);

  const handleKeyPress = useCallback((type, charKey) => {
    if (disabled || readOnly || type === 'dayPeriod') return;
    const target = segments.find(s => s.type === type);
    if (!target) return;

    const res = processSegmentKeyPress(charKey, inputBuffer, target.max);
    if (res) {
      updateSegmentValue(type, res.nextValue);
      setInputBuffer(res.nextBuffer);
      if (res.shouldFocusNext) {
        focusNext();
      }
    }
  }, [segments, inputBuffer, focusNext, updateSegmentValue, disabled, readOnly]);

  const clearSegment = useCallback((type) => {
    if (disabled || readOnly) return;
    setInputBuffer('');
    updateSegmentValue(type, null);
  }, [updateSegmentValue, disabled, readOnly]);

  return {
    segments,
    activeSegmentIndex,
    setActiveSegmentIndex,
    segmentRefs,
    increment,
    decrement,
    focusNext,
    focusPrevious,
    handleKeyPress,
    clearSegment,
    updateSegmentValue
  };
};

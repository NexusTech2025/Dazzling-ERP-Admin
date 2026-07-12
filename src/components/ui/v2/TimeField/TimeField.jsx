import React, { createContext, useContext, useRef } from 'react';
import { useTimeField } from './useTimeField';
import { useIsMobile } from '../../../../hooks/useIsMobile'; // Utilizing our centralized breakpoint hook

const TimeFieldContext = createContext(null);

/**
 * Main Orchestrator Provider Component
 */
export const TimeField = ({
  children,
  value,
  onChange,
  is24Hour = false,
  hideSeconds = true,
  disabled = false,
  readOnly = false,
  error = '',
  required = false
}) => {
  const headlessEngine = useTimeField({
    value,
    onChange,
    is24Hour,
    hideSeconds,
    disabled,
    readOnly
  });

  // JS-Conditional device tracking to alter interactive behavior
  const isMobile = useIsMobile(768);

  return (
    <TimeFieldContext.Provider value={{
      ...headlessEngine,
      value,
      onChange,
      disabled,
      readOnly,
      error,
      required,
      isMobile
    }}>
      <div className="flex flex-col space-y-1 w-full">
        {children}
      </div>
    </TimeFieldContext.Provider>
  );
};

/**
 * Component Label Module
 */
const Label = ({ children }) => {
  const { required } = useContext(TimeFieldContext);
  return (
    <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary dark:text-slate-400">
      {children}
      {required && <span className="text-rose-500 ml-0.5">*</span>}
    </span>
  );
};

/**
 * Input Wrapper Box - Layers the hidden mobile trigger over segments
 */
const Input = ({ children }) => {
  const { error, disabled, readOnly, isMobile, value, onChange } = useContext(TimeFieldContext);
  const nativeInputRef = useRef(null);

  return (
    <div className={`flex items-center bg-white dark:bg-[#0a1420] border rounded-lg px-3 py-1.5 transition-all duration-200 relative focus-within:ring-2 focus-within:ring-indigo-500/20 ${error
        ? 'border-rose-500 focus-within:border-rose-500'
        : 'border-border-light dark:border-white/8 focus-within:border-indigo-500'
      } ${disabled ? 'opacity-50 bg-slate-50 pointer-events-none' : ''}`}>

      <span className="material-symbols-outlined text-text-secondary text-xs mr-2 select-none">schedule</span>

      {/* Visual Formatted Segment Layer */}
      <div className="flex items-center select-none font-mono text-xs font-bold text-text-main dark:text-white z-10">
        {children}
      </div>

      {/* Progressive Enhancement Overlay:
        This native field is absolutely stretched over the text container, completely transparent, 
        and only active on mobile touch viewports to trigger native picker wheels smoothly.
      */}
      {isMobile && !disabled && !readOnly && (
        <input
          ref={nativeInputRef}
          type="time"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 text-base"
          style={{ fontSize: '16px' }} // Forces iOS Safari to block unwanted viewport auto-zooming
        />
      )}
    </div>
  );
};

/**
 * Sub-Segment Element
 */
const Segment = ({ type }) => {
  const context = useContext(TimeFieldContext);
  if (!context) return null;

  const {
    segments,
    segmentRefs,
    setActiveSegmentIndex,
    increment,
    decrement,
    focusNext,
    focusPrevious,
    handleKeyPress,
    clearSegment,
    isMobile
  } = context;

  const segmentIndex = segments.findIndex(s => s.type === type);
  const segmentData = segments[segmentIndex];

  if (!segmentData) return null;

  const handleKeyDown = (e) => {
    if (!segmentData.editable) return;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        increment(type);
        break;
      case 'ArrowDown':
        e.preventDefault();
        decrement(type);
        break;
      case 'ArrowRight':
        e.preventDefault();
        focusNext();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        focusPrevious();
        break;
      case 'Backspace':
      case 'Delete':
        e.preventDefault();
        clearSegment(type);
        break;
      default:
        if (/^[0-9]$/.test(e.key)) {
          e.preventDefault();
          handleKeyPress(type, e.key);
        } else if (/^[aApP]$/.test(e.key) && type === 'dayPeriod') {
          e.preventDefault();
          context.updateSegmentValue('dayPeriod', e.key.toUpperCase() + 'M');
        }
        break;
    }
  };

  return (
    <div
      ref={(el) => (segmentRefs.current[segmentIndex] = el)}
      // Deactivate tab-focus on mobile viewports since the native overlay manages interaction
      tabIndex={segmentData.editable && !isMobile ? 0 : -1}
      role={type === 'dayPeriod' ? 'listbox' : 'spinbutton'}
      aria-valuenow={typeof segmentData.value === 'number' ? segmentData.value : undefined}
      aria-valuemin={segmentData.min}
      aria-valuemax={segmentData.max}
      aria-valuetext={segmentData.text}
      onFocus={() => !isMobile && setActiveSegmentIndex(segmentIndex)}
      onKeyDown={handleKeyDown}
      className={`px-0.5 rounded outline-none select-none transition-colors tabular-nums min-w-[14px] text-center focus:bg-indigo-500 focus:text-white ${segmentData.editable && !isMobile ? 'cursor-text focus:z-30' : 'cursor-default text-text-secondary'
        }`}
    >
      {segmentData.text}
    </div>
  );
};

const Separator = ({ children = ':' }) => (
  <span aria-hidden="true" className="text-text-secondary px-0.5 select-none font-medium">
    {children}
  </span>
);

const Description = ({ children }) => (
  <p className="text-[10px] text-text-secondary dark:text-slate-400 mt-0.5">{children}</p>
);

const ErrorMessage = () => {
  const { error } = useContext(TimeFieldContext);
  if (!error) return null;
  return (
    <p className="text-[10px] text-rose-500 font-bold mt-0.5 flex items-center gap-1 animate-in fade-in duration-200">
      <span className="material-symbols-outlined text-xs">error</span>
      {error}
    </p>
  );
};

// Bind elements to the Compound Component Wrapper
TimeField.Label = Label;
TimeField.Input = Input;
TimeField.Segment = Segment;
TimeField.Separator = Separator;
TimeField.Description = Description;
TimeField.Error = ErrorMessage;

export default TimeField;

import React, { useRef, useState, useEffect } from 'react';
import { formatNumberWithDots, parseRupiah } from '../../utils/currencyUtils';

export interface RupiahInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'prefix' | 'min' | 'max'> {
  value: number;
  onChange: (value: number) => void;
  prefix?: string | null;
  className?: string;
  allowZero?: boolean;
  min?: number;
  max?: number;
}

export const RupiahInput: React.FC<RupiahInputProps> = ({
  value,
  onChange,
  prefix = 'Rp',
  className = '',
  placeholder = '0',
  allowZero = true,
  disabled = false,
  required = false,
  id,
  name,
  min,
  max,
  ...restProps
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [displayValue, setDisplayValue] = useState<string>(() => {
    if (!value && !allowZero) return '';
    return value ? formatNumberWithDots(value) : (allowZero ? '0' : '');
  });
  const [isFocused, setIsFocused] = useState(false);

  // Sync internal display when external value changes and not actively focused
  useEffect(() => {
    if (!isFocused) {
      if (!value && !allowZero) {
        setDisplayValue('');
      } else {
        setDisplayValue(value ? formatNumberWithDots(value) : (allowZero ? '0' : ''));
      }
    }
  }, [value, isFocused, allowZero]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const inputElement = e.target;
    const oldCursor = inputElement.selectionStart || 0;

    // Count how many numeric digits were before the cursor before reformat
    const digitsBeforeCursor = raw.slice(0, oldCursor).replace(/\D/g, '').length;

    // Extract all digits
    const cleanDigits = raw.replace(/\D/g, '');
    let numeric = cleanDigits ? parseInt(cleanDigits, 10) : 0;

    if (min !== undefined && numeric < min) {
      // Allow user to continue typing if numeric is below min during edit
    }
    if (max !== undefined && numeric > max) {
      numeric = max;
    }

    onChange(numeric);

    // Format new display value with dots
    const newDisplay = cleanDigits ? formatNumberWithDots(numeric) : '';
    setDisplayValue(newDisplay);

    // Restore cursor position based on digit count
    requestAnimationFrame(() => {
      if (inputRef.current) {
        let newCursor = 0;
        let count = 0;
        for (let i = 0; i < newDisplay.length; i++) {
          if (/\d/.test(newDisplay[i])) {
            count++;
          }
          if (count === digitsBeforeCursor) {
            newCursor = i + 1;
            break;
          }
        }
        if (count < digitsBeforeCursor) {
          newCursor = newDisplay.length;
        }
        inputRef.current.setSelectionRange(newCursor, newCursor);
      }
    });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // If current value is 0, clear display so user can type cleanly
    if (value === 0 && !allowZero) {
      setDisplayValue('');
    } else if (value === 0 && displayValue === '0') {
      setDisplayValue('');
    }
    restProps.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (!value && !allowZero) {
      setDisplayValue('');
    } else {
      setDisplayValue(value ? formatNumberWithDots(value) : (allowZero ? '0' : ''));
    }
    restProps.onBlur?.(e);
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      {prefix && (
        <span className="absolute left-3 text-xs font-bold text-slate-400 dark:text-slate-500 pointer-events-none select-none z-10">
          {prefix}
        </span>
      )}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        id={id}
        name={name}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`w-full ${
          prefix ? 'pl-9' : 'pl-3'
        } pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-colors ${
          disabled ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-900' : ''
        }`}
        {...restProps}
      />
    </div>
  );
};

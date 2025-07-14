import React from 'react';
import { useConfig } from '../../contexts/ConfigContext';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  required?: boolean;
  recommended?: boolean;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  defaultValue?: string | null;
  className?: string;
  labelClassName?: string;
}

const Select: React.FC<SelectProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  required = false,
  recommended = false,
  disabled = false,
  error,
  helpText,
  defaultValue,
  className = '',
  labelClassName = '',
}) => {
  const { prototypeSettings } = useConfig();
  const themeColor = prototypeSettings.themeColor;

  return (
    <div className="mb-4">
      <label htmlFor={id} className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {recommended && !required && <span className="ml-1 font-normal" style={{ color: themeColor }}>(Recommended)</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-64 pl-3 pr-10 py-2 border appearance-none ${
            error ? 'border-red-500' : 'border-gray-300'
          } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            disabled ? 'bg-gray-100 text-gray-500' : 'bg-white'
          } ${className}`}
          style={{
            '--tw-ring-color': themeColor,
          } as React.CSSProperties}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {(helpText || (defaultValue && defaultValue !== '(none)' && defaultValue !== '(required)')) && !error && (
        <p className="mt-1 text-sm text-gray-500">
          {helpText && defaultValue && defaultValue !== '(none)' && defaultValue !== '(required)' ? (
            <span>
              {helpText} (Default: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">{defaultValue}</code>)
            </span>
          ) : helpText ? (
            helpText
          ) : defaultValue && defaultValue !== '(none)' && defaultValue !== '(required)' ? (
            <span>
              (Default: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">{defaultValue}</code>)
            </span>
          ) : null}
        </p>
      )}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Select;
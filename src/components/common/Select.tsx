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
  defaultValue?: string;
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
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full px-3 py-2 border ${
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
      {defaultValue && (
        <p className="mt-1 text-sm text-gray-500">
          Default: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">{defaultValue}</code>
        </p>
      )}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {helpText && !error && <p className="mt-1 text-sm text-gray-500">{helpText}</p>}
    </div>
  );
};

export default Select;
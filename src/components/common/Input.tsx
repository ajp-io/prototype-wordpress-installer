import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useConfig } from '../../contexts/ConfigContext';

interface InputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  required?: boolean;
  recommended?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  helpText?: string;
  defaultValue?: string | null;
  className?: string;
  labelClassName?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onKeyDown,
  placeholder = '',
  required = false,
  recommended = false,
  disabled = false,
  readOnly = false,
  error,
  helpText,
  defaultValue,
  className = '',
  labelClassName = '',
  icon,
}) => {
  const { prototypeSettings } = useConfig();
  const [showPassword, setShowPassword] = React.useState(false);
  const themeColor = prototypeSettings.themeColor;

  const isPasswordField = type === 'password';
  const inputType = isPasswordField && showPassword ? 'text' : type;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="mb-4">
      <label htmlFor={id} className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {recommended && !required && <span className="ml-1 font-normal" style={{ color: themeColor }}>(Recommended)</span>}
      </label>
      <div className={`relative ${className || 'w-80'}`}>
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full px-3 py-2 ${icon ? 'pl-10' : ''} ${isPasswordField ? 'pr-10' : ''} border ${
            error ? 'border-red-500' : 'border-gray-300'
          } rounded-md shadow-sm ${
            readOnly ? 'bg-gray-50 text-gray-700 cursor-default' : 
            disabled ? 'bg-gray-100 text-gray-500' : 'bg-white focus:outline-none focus:ring-2 focus:ring-offset-2'
          }`}
          style={{
            '--tw-ring-color': readOnly ? 'transparent' : themeColor,
          } as React.CSSProperties}
          readOnly={readOnly}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {(helpText || (defaultValue && defaultValue !== '(none)' && defaultValue !== '(required)')) && (
        <p className="mt-1 text-sm text-gray-500">
          {helpText && defaultValue && defaultValue !== '(none)' && defaultValue !== '(required)' ? (
            <span>
              {helpText}{'\u00A0\u00A0\u00A0\u00A0'}<span className="font-semibold">Default:</span> <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">{defaultValue}</code>
            </span>
          ) : helpText ? (
            helpText
          ) : defaultValue && defaultValue !== '(none)' && defaultValue !== '(required)' ? (
            <span>
              <span className="font-semibold">Default:</span> <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">{defaultValue}</code>
            </span>
          ) : null}
        </p>
      )}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
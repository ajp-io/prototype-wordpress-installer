import React, { useRef } from 'react';
import Input from '../../../common/Input';
import Button from '../../../common/Button';
import { ClusterConfig } from '../../../../contexts/ConfigContext';
import { ValidationErrors } from '../utils/validationUtils';
import { Upload, FileText, CheckCircle, X } from 'lucide-react';

interface AdminConfigTabProps {
  config: ClusterConfig;
  errors: ValidationErrors;
  skipValidation: boolean;
  isReadOnly?: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: () => void;
}

const AdminConfigTab: React.FC<AdminConfigTabProps> = ({
  config,
  errors,
  skipValidation,
  isReadOnly = false,
  onInputChange,
  onFileChange,
  onFileRemove
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileRemove = () => {
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemove();
  };
  return (
    <div className="space-y-6">
      <Input
        id="adminUsername"
        label="Admin Username"
        value={config.adminUsername}
        onChange={onInputChange}
        placeholder="wordpressadmin"
        required={true}
        error={errors.adminUsername}
        helpText="Username for the administrator account"
        defaultValue="wordpressadmin"
        readOnly={isReadOnly}
      />

      <Input
        id="adminEmail"
        label="Admin Email"
        type="email"
        value={config.adminEmail}
        onChange={onInputChange}
        placeholder="admin@example.com"
        required={true}
        error={errors.adminEmail}
        helpText="Email address for the administrator"
        defaultValue="admin@localhost"
        readOnly={isReadOnly}
      />

      <Input
        id="adminPassword"
        label="Admin Password"
        type="password"
        value={config.adminPassword}
        onChange={onInputChange}
        placeholder="••••••••••••"
        required={true}
        error={errors.adminPassword}
        helpText="Password must be at least 8 characters"
        defaultValue="(randomly generated)"
        readOnly={isReadOnly}
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          License Key File
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="mt-1 flex items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            accept=".key,.txt"
            className="hidden"
            disabled={isReadOnly}
          />
          {!isReadOnly && (
            <Button
              variant="outline"
              onClick={handleFileSelect}
              icon={<Upload className="w-4 h-4" />}
              className="w-80"
            >
              Upload File
            </Button>
          )}
          {isReadOnly && (
            <div className="w-80 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 text-sm">
              {config.licenseFileName || 'No license file uploaded'}
            </div>
          )}
          {config.licenseFileName && (
            <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 border border-green-200 rounded-md group ml-3">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <FileText className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">{config.licenseFileName}</span>
              {!isReadOnly && (
                <button
                  onClick={handleFileRemove}
                  className="ml-2 p-1 rounded-full hover:bg-green-100 transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove file"
                >
                  <X className="w-3 h-3 text-green-600 hover:text-green-800" />
                </button>
              )}
            </div>
          )}
        </div>
        {errors.licenseKey && (
          <p className="text-sm text-red-500">{errors.licenseKey}</p>
        )}
        <p className="text-sm text-gray-500">
          {config.licenseFileName 
            ? 'License key file uploaded successfully' 
            : 'Upload your WordPress Enterprise license key'}
        </p>
      </div>
    </div>
  );
};

export default AdminConfigTab;
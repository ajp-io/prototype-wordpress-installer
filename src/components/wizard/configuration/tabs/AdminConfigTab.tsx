import React, { useRef } from 'react';
import Input from '../../../common/Input';
import Button from '../../../common/Button';
import { ClusterConfig } from '../../../../contexts/ConfigContext';
import { ValidationErrors } from '../utils/validationUtils';
import { Upload } from 'lucide-react';

interface AdminConfigTabProps {
  config: ClusterConfig;
  errors: ValidationErrors;
  skipValidation: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AdminConfigTab: React.FC<AdminConfigTabProps> = ({
  config,
  errors,
  skipValidation,
  onInputChange,
  onFileChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      <Input
        id="adminUsername"
        label="Admin Username"
        value={config.adminUsername}
        onChange={onInputChange}
        placeholder="wordpressadmin"
        required={!skipValidation}
        error={errors.adminUsername}
        helpText="Username for the administrator account"
      />

      <Input
        id="adminEmail"
        label="Admin Email"
        type="email"
        value={config.adminEmail}
        onChange={onInputChange}
        placeholder="admin@example.com"
        required={!skipValidation}
        error={errors.adminEmail}
        helpText="Email address for the administrator"
      />

      <Input
        id="adminPassword"
        label="Admin Password"
        type="password"
        value={config.adminPassword}
        onChange={onInputChange}
        placeholder="••••••••••••"
        required={!skipValidation}
        error={errors.adminPassword}
        helpText="Password must be at least 8 characters"
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          License Key File
          {!skipValidation && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="mt-1 flex items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            accept=".key,.txt"
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            icon={<Upload className="w-4 h-4" />}
          >
            Upload License Key
          </Button>
        </div>
        {errors.licenseKey && (
          <p className="text-sm text-red-500">{errors.licenseKey}</p>
        )}
        <p className="text-sm text-gray-500">Upload your WordPress Enterprise license key</p>
      </div>
    </div>
  );
};

export default AdminConfigTab;
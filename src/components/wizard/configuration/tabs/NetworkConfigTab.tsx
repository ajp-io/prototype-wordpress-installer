import React from 'react';
import Input from '../../../common/Input';
import { ClusterConfig } from '../../../../contexts/ConfigContext';
import { ValidationErrors } from '../utils/validationUtils';

interface NetworkConfigTabProps {
  config: ClusterConfig;
  errors: ValidationErrors;
  skipValidation: boolean;
  themeColor: string;
  isReadOnly?: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const NetworkConfigTab: React.FC<NetworkConfigTabProps> = ({
  config,
  errors,
  skipValidation,
  themeColor,
  isReadOnly = false,
  onInputChange,
  onCheckboxChange
}) => {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Network</h3>
        <p className="text-gray-600">
          Configure network settings including domain, proxy settings, and HTTPS options for your WordPress Enterprise installation.
        </p>
      </div>

      <Input
        id="domain"
        label="Domain"
        value={config.domain}
        onChange={onInputChange}
        placeholder="wordpress.example.com"
        required={true}
        error={errors.domain}
        helpText="Domain name for accessing WordPress"
        defaultValue="localhost"
        readOnly={isReadOnly}
      />

      <Input
        id="httpProxy"
        label="HTTP Proxy"
        value={config.httpProxy || ''}
        onChange={onInputChange}
        placeholder="http://proxy.example.com:3128"
        helpText="HTTP proxy server URL"
        readOnly={isReadOnly}
      />

      <Input
        id="httpsProxy"
        label="HTTPS Proxy"
        value={config.httpsProxy || ''}
        onChange={onInputChange}
        placeholder="https://proxy.example.com:3128"
        helpText="HTTPS proxy server URL"
        readOnly={isReadOnly}
      />

      <div className="flex items-center space-x-3">
        <input
          id="useHttps"
          type="checkbox"
          checked={config.useHttps}
          onChange={onCheckboxChange}
          disabled={isReadOnly}
          className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
          style={{
            accentColor: themeColor,
            '--tw-ring-color': themeColor,
          } as React.CSSProperties}
        />
        <label htmlFor="useHttps" className={`text-sm ${isReadOnly ? 'text-gray-500' : 'text-gray-700'}`}>
          Enable HTTPS
        </label>
      </div>
    </div>
  );
};

export default NetworkConfigTab;
import React from 'react';
import Input from '../../../common/Input';
import { ClusterConfig } from '../../../../contexts/ConfigContext';
import { ValidationErrors } from '../utils/validationUtils';

interface NetworkConfigTabProps {
  config: ClusterConfig;
  errors: ValidationErrors;
  skipValidation: boolean;
  themeColor: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const NetworkConfigTab: React.FC<NetworkConfigTabProps> = ({
  config,
  errors,
  skipValidation,
  themeColor,
  onInputChange,
  onCheckboxChange
}) => {
  return (
    <div className="space-y-6">
      <Input
        id="domain"
        label="Domain"
        value={config.domain}
        onChange={onInputChange}
        placeholder="wordpress.example.com"
        required={!skipValidation}
        error={errors.domain}
        helpText="Domain name for accessing WordPress"
        defaultValue="localhost"
      />

      <Input
        id="httpProxy"
        label="HTTP Proxy"
        value={config.httpProxy || ''}
        onChange={onInputChange}
        placeholder="http://proxy.example.com:3128"
        recommended={true}
        className="w-96"
        defaultValue="(none)"
      />

      <Input
        id="httpsProxy"
        label="HTTPS Proxy"
        value={config.httpsProxy || ''}
        onChange={onInputChange}
        placeholder="https://proxy.example.com:3128"
        helpText="HTTPS proxy server URL (optional)"
        className="w-96"
        defaultValue="(none)"
      />

      <div className="flex items-center space-x-3">
        <input
          id="useHttps"
          type="checkbox"
          checked={config.useHttps}
          onChange={onCheckboxChange}
          className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
          style={{
            accentColor: themeColor,
            '--tw-ring-color': themeColor,
          } as React.CSSProperties}
        />
        <label htmlFor="useHttps" className="text-sm text-gray-700">
          Enable HTTPS
        </label>
      </div>
    </div>
  );
};

export default NetworkConfigTab;
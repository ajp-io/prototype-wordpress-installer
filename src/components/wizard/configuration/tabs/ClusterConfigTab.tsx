import React from 'react';
import Input from '../../../common/Input';
import Select from '../../../common/Select';
import { ClusterConfig } from '../../../../contexts/ConfigContext';
import { ValidationErrors } from '../utils/validationUtils';

interface ClusterConfigTabProps {
  config: ClusterConfig;
  errors: ValidationErrors;
  skipValidation: boolean;
  themeColor: string;
  isReadOnly?: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onRadioChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ClusterConfigTab: React.FC<ClusterConfigTabProps> = ({
  config,
  errors,
  skipValidation,
  themeColor,
  isReadOnly = false,
  onInputChange,
  onSelectChange,
  onRadioChange
}) => {
  return (
    <div className="space-y-6">
      <p className="text-gray-600 mb-6">
        Configure the basic settings for your WordPress Enterprise installation. These settings define how your application will be deployed and identified within your environment.
      </p>

      <Input
        id="installationId"
        label="Installation ID"
        value={config.installationId}
        onChange={onInputChange}
        readOnly={true}
        helpText="Auto-generated unique identifier for this installation"
      />

      <Input
        id="clusterName"
        label="Cluster Name"
        value={config.clusterName}
        onChange={onInputChange}
        placeholder="Enter cluster name"
        required={true}
        error={errors.clusterName}
        helpText="A unique name for your WordPress Enterprise installation"
        defaultValue="my-wordpress"
        readOnly={isReadOnly}
      />

      <Input
        id="storageClass"
        label="Storage Class"
        value={config.storageClass}
        onChange={onInputChange}
        placeholder="Enter storage class name"
        required={true}
        error={errors.storageClass}
        defaultValue="standard"
        readOnly={isReadOnly}
      />

      <Select
        id="environment"
        label="Environment"
        value={config.environment || 'production'}
        onChange={onSelectChange}
        required={true}
        error={errors.environment}
        options={[
          { value: 'development', label: 'Development' },
          { value: 'staging', label: 'Staging' },
          { value: 'production', label: 'Production' },
        ]}
        helpText="Select the deployment environment"
        defaultValue="production"
        disabled={isReadOnly}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Deployment Mode
          {!skipValidation && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="radio"
              id="mode-standard"
              name="deploymentMode"
              value="standard"
              checked={(config.deploymentMode || 'standard') === 'standard'}
              onChange={onRadioChange}
              disabled={isReadOnly}
              className="h-4 w-4 border-gray-300 focus:ring-2 focus:ring-offset-2"
              style={{
                accentColor: themeColor,
                '--tw-ring-color': themeColor
              } as React.CSSProperties}
            />
            <label htmlFor="mode-standard" className={`ml-2 text-sm ${isReadOnly ? 'text-gray-500' : 'text-gray-700'}`}>
              Standard
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="mode-ha"
              name="deploymentMode"
              value="ha"
              checked={(config.deploymentMode || 'standard') === 'ha'}
              onChange={onRadioChange}
              disabled={isReadOnly}
              className="h-4 w-4 border-gray-300 focus:ring-2 focus:ring-offset-2"
              style={{
                accentColor: themeColor,
                '--tw-ring-color': themeColor
              } as React.CSSProperties}
            />
            <label htmlFor="mode-ha" className={`ml-2 text-sm ${isReadOnly ? 'text-gray-500' : 'text-gray-700'}`}>
              High Availability
            </label>
          </div>
        </div>
        {errors.deploymentMode && (
          <p className="text-sm text-red-500">{errors.deploymentMode}</p>
        )}
        <p className="text-sm text-gray-500">
          Choose your deployment configuration (<span className="font-semibold">Default:</span> <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">standard</code>)
        </p>
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
          {!skipValidation && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          id="description"
          value={config.description}
          onChange={onInputChange}
          rows={4}
          readOnly={isReadOnly}
          className={`w-full max-w-2xl px-3 py-2 border ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isReadOnly ? 'bg-gray-50 text-gray-700 cursor-default' : ''
          }`}
          style={{
            '--tw-ring-color': themeColor,
            '--tw-ring-offset-color': themeColor,
          } as React.CSSProperties}
          placeholder="Describe the purpose of this WordPress Enterprise installation"
          required
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
      </div>
    </div>
  );
};

export default ClusterConfigTab;
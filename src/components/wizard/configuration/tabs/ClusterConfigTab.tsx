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
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onRadioChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ClusterConfigTab: React.FC<ClusterConfigTabProps> = ({
  config,
  errors,
  skipValidation,
  themeColor,
  onInputChange,
  onSelectChange,
  onRadioChange
}) => {
  return (
    <div className="space-y-6">
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">
          Configure the basic settings for your WordPress Enterprise installation. These settings define how your application will be deployed and identified within your environment.
        </p>
      </div>

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
        placeholder="my-wordpress"
        required={!skipValidation}
        error={errors.clusterName}
        helpText="A unique name for your WordPress Enterprise installation"
      />

      <Select
        id="environment"
        label="Environment"
        value={config.environment}
        onChange={onSelectChange}
        required={!skipValidation}
        error={errors.environment}
        options={[
          { value: '', label: 'Select an option' },
          { value: 'development', label: 'Development' },
          { value: 'staging', label: 'Staging' },
          { value: 'production', label: 'Production' },
        ]}
        helpText="Select the deployment environment"
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
              checked={config.deploymentMode === 'standard'}
              onChange={onRadioChange}
              className="h-4 w-4 border-gray-300 focus:ring-2 focus:ring-offset-2"
              style={{
                accentColor: themeColor,
                '--tw-ring-color': themeColor
              } as React.CSSProperties}
            />
            <label htmlFor="mode-standard" className="ml-2 text-sm text-gray-700">
              Standard
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="mode-ha"
              name="deploymentMode"
              value="ha"
              checked={config.deploymentMode === 'ha'}
              onChange={onRadioChange}
              className="h-4 w-4 border-gray-300 focus:ring-2 focus:ring-offset-2"
              style={{
                accentColor: themeColor,
                '--tw-ring-color': themeColor
              } as React.CSSProperties}
            />
            <label htmlFor="mode-ha" className="ml-2 text-sm text-gray-700">
              High Availability
            </label>
          </div>
        </div>
        {errors.deploymentMode && (
          <p className="text-sm text-red-500">{errors.deploymentMode}</p>
        )}
        <p className="text-sm text-gray-500">Choose your deployment configuration</p>
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
          className={`w-full px-3 py-2 border ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2`}
          style={{
            '--tw-ring-color': themeColor,
            '--tw-ring-offset-color': themeColor,
          } as React.CSSProperties}
          placeholder="Describe the purpose of this WordPress Enterprise installation"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description}</p>
        )}
        <p className="text-sm text-gray-500">Describe the purpose of this WordPress Enterprise installation</p>
      </div>
    </div>
  );
};

export default ClusterConfigTab;
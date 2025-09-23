import React from 'react';
import Input from '../../../common/Input';
import Select from '../../../common/Select';
import { ClusterConfig } from '../../../../contexts/ConfigContext';
import { ValidationErrors } from '../utils/validationUtils';

interface ExtendedConfigTabProps {
  config: ClusterConfig;
  errors: ValidationErrors;
  skipValidation: boolean;
  themeColor: string;
  isReadOnly?: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MonitoringConfigTab: React.FC<ExtendedConfigTabProps> = ({
  config,
  errors,
  skipValidation,
  themeColor,
  isReadOnly = false,
  onInputChange,
  onSelectChange,
  onCheckboxChange
}) => {
  return (
    <div className="space-y-6">
      <p className="text-gray-600 mb-6">
        Configure monitoring and observability settings for your WordPress Enterprise installation.
      </p>

      <Select
        id="monitoringLevel"
        label="Monitoring Level"
        value="standard"
        onChange={onSelectChange}
        options={[
          { value: 'basic', label: 'Basic' },
          { value: 'standard', label: 'Standard' },
          { value: 'advanced', label: 'Advanced' },
        ]}
        helpText="Choose the level of monitoring detail"
        defaultValue="standard"
        disabled={isReadOnly}
      />

      <div className="flex items-center space-x-3">
        <input
          id="enableMetrics"
          type="checkbox"
          checked={true}
          onChange={onCheckboxChange}
          disabled={isReadOnly}
          className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
          style={{
            accentColor: themeColor,
            '--tw-ring-color': themeColor,
          } as React.CSSProperties}
        />
        <label htmlFor="enableMetrics" className={`text-sm ${isReadOnly ? 'text-gray-500' : 'text-gray-700'}`}>
          Enable metrics collection
        </label>
      </div>
    </div>
  );
};

export const LoggingConfigTab: React.FC<ExtendedConfigTabProps> = ({
  config,
  errors,
  skipValidation,
  themeColor,
  isReadOnly = false,
  onInputChange,
  onSelectChange
}) => {
  return (
    <div className="space-y-6">
      <p className="text-gray-600 mb-6">
        Configure logging settings and log retention policies.
      </p>

      <Select
        id="logLevel"
        label="Log Level"
        value="info"
        onChange={onSelectChange}
        options={[
          { value: 'debug', label: 'Debug' },
          { value: 'info', label: 'Info' },
          { value: 'warn', label: 'Warning' },
          { value: 'error', label: 'Error' },
        ]}
        helpText="Set the minimum log level"
        defaultValue="info"
        disabled={isReadOnly}
      />

      <Input
        id="logRetentionDays"
        label="Log Retention (Days)"
        type="number"
        value="30"
        onChange={onInputChange}
        placeholder="30"
        helpText="Number of days to retain logs"
        defaultValue="30"
        readOnly={isReadOnly}
      />
    </div>
  );
};

export const BackupConfigTab: React.FC<ExtendedConfigTabProps> = ({
  config,
  errors,
  skipValidation,
  themeColor,
  isReadOnly = false,
  onInputChange,
  onSelectChange
}) => {
  return (
    <div className="space-y-6">
      <p className="text-gray-600 mb-6">
        Configure backup schedules and retention policies for your WordPress data.
      </p>

      <Select
        id="backupFrequency"
        label="Backup Frequency"
        value="daily"
        onChange={onSelectChange}
        options={[
          { value: 'hourly', label: 'Hourly' },
          { value: 'daily', label: 'Daily' },
          { value: 'weekly', label: 'Weekly' },
        ]}
        helpText="How often to create backups"
        defaultValue="daily"
        disabled={isReadOnly}
      />

      <Input
        id="backupRetentionDays"
        label="Backup Retention (Days)"
        type="number"
        value="90"
        onChange={onInputChange}
        placeholder="90"
        helpText="Number of days to retain backups"
        defaultValue="90"
        readOnly={isReadOnly}
      />
    </div>
  );
};

export const SecurityConfigTab: React.FC<ExtendedConfigTabProps> = ({
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
      <p className="text-gray-600 mb-6">
        Configure security settings including authentication and access controls.
      </p>

      <div className="flex items-center space-x-3">
        <input
          id="enableTwoFactor"
          type="checkbox"
          checked={true}
          onChange={onCheckboxChange}
          disabled={isReadOnly}
          className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
          style={{
            accentColor: themeColor,
            '--tw-ring-color': themeColor,
          } as React.CSSProperties}
        />
        <label htmlFor="enableTwoFactor" className={`text-sm ${isReadOnly ? 'text-gray-500' : 'text-gray-700'}`}>
          Enable two-factor authentication
        </label>
      </div>

      <Input
        id="sessionTimeout"
        label="Session Timeout (Minutes)"
        type="number"
        value="60"
        onChange={onInputChange}
        placeholder="60"
        helpText="Session timeout in minutes"
        defaultValue="60"
        readOnly={isReadOnly}
      />
    </div>
  );
};

export const PerformanceConfigTab: React.FC<ExtendedConfigTabProps> = ({
  config,
  errors,
  skipValidation,
  themeColor,
  isReadOnly = false,
  onInputChange,
  onSelectChange
}) => {
  return (
    <div className="space-y-6">
      <p className="text-gray-600 mb-6">
        Configure performance optimization settings and resource limits.
      </p>

      <Input
        id="maxMemoryLimit"
        label="Memory Limit (GB)"
        type="number"
        value="4"
        onChange={onInputChange}
        placeholder="4"
        helpText="Maximum memory allocation"
        defaultValue="4"
        readOnly={isReadOnly}
      />

      <Select
        id="cacheStrategy"
        label="Cache Strategy"
        value="redis"
        onChange={onSelectChange}
        options={[
          { value: 'none', label: 'No Caching' },
          { value: 'memory', label: 'In-Memory' },
          { value: 'redis', label: 'Redis' },
        ]}
        helpText="Choose caching strategy"
        defaultValue="redis"
        disabled={isReadOnly}
      />
    </div>
  );
};

export const IntegrationsConfigTab: React.FC<ExtendedConfigTabProps> = ({
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
      <p className="text-gray-600 mb-6">
        Configure third-party integrations and external services.
      </p>

      <div className="flex items-center space-x-3">
        <input
          id="enableSlackIntegration"
          type="checkbox"
          checked={false}
          onChange={onCheckboxChange}
          disabled={isReadOnly}
          className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
          style={{
            accentColor: themeColor,
            '--tw-ring-color': themeColor,
          } as React.CSSProperties}
        />
        <label htmlFor="enableSlackIntegration" className={`text-sm ${isReadOnly ? 'text-gray-500' : 'text-gray-700'}`}>
          Enable Slack integration
        </label>
      </div>

      <Input
        id="webhookUrl"
        label="Webhook URL"
        value=""
        onChange={onInputChange}
        placeholder="https://hooks.slack.com/..."
        helpText="Webhook URL for notifications"
        readOnly={isReadOnly}
      />
    </div>
  );
};

export const NotificationsConfigTab: React.FC<ExtendedConfigTabProps> = ({
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
      <p className="text-gray-600 mb-6">
        Configure notification preferences and alert settings.
      </p>

      <div className="flex items-center space-x-3">
        <input
          id="enableEmailNotifications"
          type="checkbox"
          checked={true}
          onChange={onCheckboxChange}
          disabled={isReadOnly}
          className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
          style={{
            accentColor: themeColor,
            '--tw-ring-color': themeColor,
          } as React.CSSProperties}
        />
        <label htmlFor="enableEmailNotifications" className={`text-sm ${isReadOnly ? 'text-gray-500' : 'text-gray-700'}`}>
          Enable email notifications
        </label>
      </div>

      <Input
        id="notificationEmail"
        label="Notification Email"
        type="email"
        value=""
        onChange={onInputChange}
        placeholder="admin@example.com"
        helpText="Email address for system notifications"
        readOnly={isReadOnly}
      />
    </div>
  );
};

export const CustomizationConfigTab: React.FC<ExtendedConfigTabProps> = ({
  config,
  errors,
  skipValidation,
  themeColor,
  isReadOnly = false,
  onInputChange,
  onSelectChange
}) => {
  return (
    <div className="space-y-6">
      <p className="text-gray-600 mb-6">
        Configure custom themes, branding, and user interface preferences.
      </p>

      <Select
        id="theme"
        label="Theme"
        value="default"
        onChange={onSelectChange}
        options={[
          { value: 'default', label: 'Default' },
          { value: 'dark', label: 'Dark' },
          { value: 'light', label: 'Light' },
          { value: 'custom', label: 'Custom' },
        ]}
        helpText="Choose the UI theme"
        defaultValue="default"
        disabled={isReadOnly}
      />

      <Input
        id="customLogo"
        label="Custom Logo URL"
        value=""
        onChange={onInputChange}
        placeholder="https://example.com/logo.png"
        helpText="URL to your custom logo"
        readOnly={isReadOnly}
      />
    </div>
  );
};
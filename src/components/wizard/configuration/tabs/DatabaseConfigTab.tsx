import React from 'react';
import Input from '../../../common/Input';
import Select from '../../../common/Select';
import { ClusterConfig } from '../../../../contexts/ConfigContext';
import { ValidationErrors } from '../utils/validationUtils';

interface DatabaseConfigTabProps {
  config: ClusterConfig;
  errors: ValidationErrors;
  skipValidation: boolean;
  isReadOnly?: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const DatabaseConfigTab: React.FC<DatabaseConfigTabProps> = ({
  config,
  errors,
  skipValidation,
  isReadOnly = false,
  onInputChange,
  onSelectChange
}) => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Database</h2>
        <p className="text-gray-600 mt-1">
          Configure database settings for your WordPress Enterprise installation.
        </p>
      </div>

      <Select
        id="databaseType"
        label="Database Type"
        value={config.databaseType || 'internal'}
        onChange={onSelectChange}
        options={[
          { value: 'internal', label: 'Internal (PostgreSQL)' },
          { value: 'external', label: 'External Database' },
        ]}
        required={!skipValidation}
        helpText="Choose between managed internal database or connect to your existing database"
        defaultValue="internal"
        disabled={isReadOnly}
      />

      {config.databaseType === 'external' && (
        <>
          <p className="text-sm text-gray-600 mb-6 font-medium">
            Configure your existing PostgreSQL database connection. Ensure your database server is accessible from the WordPress cluster and has the required permissions configured.
          </p>

          <Input
            id="databaseConfig.host"
            label="Database Host"
            value={config.databaseConfig?.host || ''}
            onChange={onInputChange}
            placeholder="db.example.com"
            required={true}
            error={errors['databaseConfig.host']}
            helpText="Database server hostname or IP address"
            defaultValue="localhost"
            readOnly={isReadOnly}
          />

          <Input
            id="databaseConfig.port"
            label="Database Port"
            type="number"
            value={config.databaseConfig?.port?.toString() || '5432'}
            onChange={onInputChange}
            placeholder="5432"
            required={true}
            helpText="Database server port"
            defaultValue="5432"
            readOnly={isReadOnly}
          />

          <Input
            id="databaseConfig.username"
            label="Database Username"
            value={config.databaseConfig?.username || ''}
            onChange={onInputChange}
            placeholder="postgres"
            required={true}
            error={errors['databaseConfig.username']}
            helpText="Database username for authentication"
            defaultValue="postgres"
            readOnly={isReadOnly}
          />

          <Input
            id="databaseConfig.password"
            label="Database Password"
            type="password"
            value={config.databaseConfig?.password || ''}
            onChange={onInputChange}
            placeholder="••••••••••••"
            required={true}
            error={errors['databaseConfig.password']}
            helpText="Database password for authentication"
            defaultValue="(required)"
            readOnly={isReadOnly}
          />

          <Input
            id="databaseConfig.database"
            label="Database Name"
            value={config.databaseConfig?.database || ''}
            onChange={onInputChange}
            placeholder="wordpress"
            required={true}
            error={errors['databaseConfig.database']}
            helpText="Name of the database to use"
            defaultValue="wordpress"
            readOnly={isReadOnly}
          />
        </>
      )}
    </div>
  );
};

export default DatabaseConfigTab;
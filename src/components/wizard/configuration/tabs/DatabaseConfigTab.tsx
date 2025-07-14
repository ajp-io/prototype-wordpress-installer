import React from 'react';
import Input from '../../../common/Input';
import Select from '../../../common/Select';
import { ClusterConfig } from '../../../../contexts/ConfigContext';
import { ValidationErrors } from '../utils/validationUtils';

interface DatabaseConfigTabProps {
  config: ClusterConfig;
  errors: ValidationErrors;
  skipValidation: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const DatabaseConfigTab: React.FC<DatabaseConfigTabProps> = ({
  config,
  errors,
  skipValidation,
  onInputChange,
  onSelectChange
}) => {
  return (
    <div className="space-y-6">
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
            required={!skipValidation}
            error={errors['databaseConfig.host']}
            helpText="Database server hostname or IP address"
            defaultValue="localhost"
          />

          <Input
            id="databaseConfig.port"
            label="Database Port"
            type="number"
            value={config.databaseConfig?.port?.toString() || '5432'}
            onChange={onInputChange}
            placeholder="5432"
            required={!skipValidation}
            helpText="Database server port"
            defaultValue="5432"
          />

          <Input
            id="databaseConfig.username"
            label="Database Username"
            value={config.databaseConfig?.username || ''}
            onChange={onInputChange}
            placeholder="postgres"
            required={!skipValidation}
            error={errors['databaseConfig.username']}
            helpText="Database username for authentication"
            defaultValue="postgres"
          />

          <Input
            id="databaseConfig.password"
            label="Database Password"
            type="password"
            value={config.databaseConfig?.password || ''}
            onChange={onInputChange}
            placeholder="••••••••••••"
            required={!skipValidation}
            error={errors['databaseConfig.password']}
            helpText="Database password for authentication"
            defaultValue="(required)"
          />

          <Input
            id="databaseConfig.database"
            label="Database Name"
            value={config.databaseConfig?.database || ''}
            onChange={onInputChange}
            placeholder="wordpress"
            required={!skipValidation}
            error={errors['databaseConfig.database']}
            helpText="Name of the database to use"
            defaultValue="wordpress"
          />
        </>
      )}
    </div>
  );
};

export default DatabaseConfigTab;
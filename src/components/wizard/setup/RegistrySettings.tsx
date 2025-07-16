import React from 'react';
import Input from '../../common/Input';
import Button from '../../common/Button';
import { CheckCircle, XCircle, Loader2, Wifi } from 'lucide-react';
import { ImagePushStatus } from './types';

interface RegistrySettingsProps {
  registryUrl: string;
  registryUsername: string;
  registryPassword: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTestConnection: () => void;
  connectionStatus: 'idle' | 'testing' | 'success' | 'error';
  connectionError: string | null;
  validationErrors?: {[key: string]: string};
  isUpgrade?: boolean;
}

const RegistrySettings: React.FC<RegistrySettingsProps> = ({
  registryUrl,
  registryUsername,
  registryPassword,
  onInputChange,
  onTestConnection,
  connectionStatus,
  connectionError,
  validationErrors = {},
  isUpgrade
}) => (
  <div className="space-y-4 pt-4">
    <Input
      id="registryUrl"
      label="Registry URL"
      value={registryUrl}
      onChange={onInputChange}
      placeholder="registry.example.com"
      required
      helpText="The URL of your private container registry"
      error={validationErrors.registryUrl}
    />

    <Input
      id="registryUsername"
      label="Registry Username"
      value={registryUsername}
      onChange={onInputChange}
      placeholder="username"
      required
      helpText="Username for registry authentication"
      error={validationErrors.registryUsername}
    />

    <Input
      id="registryPassword"
      label="Registry Password"
      type="password"
      value={registryPassword}
      onChange={onInputChange}
      placeholder="••••••••••••"
      required
      helpText="Password or access token for registry authentication"
      error={validationErrors.registryPassword}
    />

    <div className="flex items-center space-x-3">
      <Button
        variant="outline"
        onClick={onTestConnection}
        disabled={!registryUrl || !registryUsername || !registryPassword || connectionStatus === 'testing'}
        icon={connectionStatus === 'testing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wifi className="w-4 h-4" />}
      >
        {connectionStatus === 'testing' ? 'Testing Connection...' : 'Test Connection'}
      </Button>
    </div>

    {connectionError && (
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
            <p className="text-sm text-red-700 mt-1">{connectionError}</p>
          </div>
        </div>
      </div>
    )}

    {connectionStatus === 'success' && (
      <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Connection successful</h3>
            <p className="text-sm text-green-700 mt-1">
              Successfully connected to your private registry.
            </p>
          </div>
        </div>
      </div>
    )}
  </div>
);

export default RegistrySettings;
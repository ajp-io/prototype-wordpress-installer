import React, { useEffect } from 'react';
import Input from '../../common/Input';
import RegistryChoice from './RegistryChoice';
import RegistrySettings from './RegistrySettings';

interface KubernetesSetupProps {
  config: {
    usePrivateRegistry: boolean;
    registryUrl?: string;
    registryUsername?: string;
    registryPassword?: string;
    httpProxy?: string;
    httpsProxy?: string;
    noProxy?: string;
  };
  prototypeSettings: {
    isAirgap?: boolean;
  };
  onRegistryChange: (usePrivate: boolean) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTestConnection: () => void;
  connectionStatus: 'idle' | 'testing' | 'success' | 'error';
  connectionError: string | null;
  validationErrors?: {[key: string]: string};
  isUpgrade?: boolean;
}

const KubernetesSetup: React.FC<KubernetesSetupProps> = ({
  config,
  prototypeSettings,
  onRegistryChange,
  onInputChange,
  onTestConnection,
  connectionStatus,
  connectionError,
  validationErrors = {},
  isUpgrade
}) => {
  const isAirgap = prototypeSettings.isAirgap;

  useEffect(() => {
    if (isAirgap && !config.usePrivateRegistry) {
      onRegistryChange(true);
    }
  }, [isAirgap]);

  return (
    <div className="space-y-6">
      {!isAirgap && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Proxy Configuration</h2>
          <div className="space-y-4">
            <Input
              id="httpProxy"
              label="HTTP Proxy"
              value={config.httpProxy || ''}
              onChange={onInputChange}
              placeholder="http://proxy.example.com:3128"
              helpText="HTTP proxy server URL (optional)"
            />

            <Input
              id="httpsProxy"
              label="HTTPS Proxy"
              value={config.httpsProxy || ''}
              onChange={onInputChange}
              placeholder="https://proxy.example.com:3128"
              helpText="HTTPS proxy server URL (optional)"
            />

            <Input
              id="noProxy"
              label="Proxy Bypass List"
              value={config.noProxy || ''}
              onChange={onInputChange}
              placeholder="localhost,127.0.0.1,.example.com"
              helpText="Comma-separated list of hosts to bypass the proxy"
              defaultValue="localhost,127.0.0.1"
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Image Registry</h2>

        {isAirgap ? (
          <>
            <p className="text-sm text-gray-600">
              A private container registry is required for air-gapped installations.
              Provide the credentials for your registry below.
            </p>
            <RegistrySettings
              registryUrl={config.registryUrl || ''}
              registryUsername={config.registryUsername || ''}
              registryPassword={config.registryPassword || ''}
              onInputChange={onInputChange}
              onTestConnection={onTestConnection}
              connectionStatus={connectionStatus}
              connectionError={connectionError}
              validationErrors={validationErrors}
              isUpgrade={isUpgrade}
            />
          </>
        ) : (
          <>
            <RegistryChoice
              usePrivateRegistry={config.usePrivateRegistry}
              onRegistryChange={onRegistryChange}
            />

            {config.usePrivateRegistry && (
              <RegistrySettings
                registryUrl={config.registryUrl || ''}
                registryUsername={config.registryUsername || ''}
                registryPassword={config.registryPassword || ''}
                onInputChange={onInputChange}
                onTestConnection={onTestConnection}
                connectionStatus={connectionStatus}
                connectionError={connectionError}
                validationErrors={validationErrors}
                isUpgrade={isUpgrade}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default KubernetesSetup;
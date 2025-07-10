import React from 'react';
import Input from '../../common/Input';
import RegistryChoice from './RegistryChoice';
import RegistrySettings from './RegistrySettings';
import { ImagePushStatus } from './types';

interface KubernetesSetupProps {
  config: {
    usePrivateRegistry: boolean;
    registryUrl?: string;
    registryUsername?: string;
    registryPassword?: string;
    httpProxy?: string;
    httpsProxy?: string;
    noProxy?: string;
    adminConsolePort?: number;
  };
  onRegistryChange: (usePrivate: boolean) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  authError: string | null;
  pushStatus: ImagePushStatus[];
  currentMessage: string;
  pushComplete: boolean;
  isUpgrade?: boolean;
}

const KubernetesSetup: React.FC<KubernetesSetupProps> = ({
  config,
  onRegistryChange,
  onInputChange,
  authError,
  pushStatus,
  currentMessage,
  pushComplete,
  isUpgrade
}) => (
  <div className="space-y-6">
    <Input
      id="adminConsolePort"
      label="Admin Console Port"
      type="number"
      value={config.adminConsolePort?.toString() || '8080'}
      onChange={onInputChange}
      placeholder="8080"
      helpText="Port for the WordPress admin console"
      defaultValue="8080"
    />

    <Input
      id="httpProxy"
      label="HTTP Proxy"
      value={config.httpProxy || ''}
      onChange={onInputChange}
      placeholder="http://proxy.example.com:3128"
      helpText="HTTP proxy server URL (optional)"
      defaultValue="(none)"
    />

    <Input
      id="httpsProxy"
      label="HTTPS Proxy"
      value={config.httpsProxy || ''}
      onChange={onInputChange}
      placeholder="https://proxy.example.com:3128"
      helpText="HTTPS proxy server URL (optional)"
      defaultValue="(none)"
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
        authError={authError}
        pushStatus={pushStatus}
        currentMessage={currentMessage}
        pushComplete={pushComplete}
        isUpgrade={isUpgrade}
      />
    )}
  </div>
);

export default KubernetesSetup;
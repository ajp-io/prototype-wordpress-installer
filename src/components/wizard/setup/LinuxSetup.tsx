import React from 'react';
import Input from '../../common/Input';
import Select from '../../common/Select';
import { ChevronDown, ChevronUp } from 'lucide-react';
import RegistryChoice from './RegistryChoice';
import RegistrySettings from './RegistrySettings';

interface LinuxSetupProps {
  config: {
    dataDirectory?: string;
    httpProxy?: string;
    httpsProxy?: string;
    noProxy?: string;
    networkInterface?: string;
    networkCIDR?: string;
    usePrivateRegistry: boolean;
    registryUrl?: string;
    registryUsername?: string;
    registryPassword?: string;
  };
  prototypeSettings: {
    availableNetworkInterfaces?: Array<{
      name: string;
      description: string;
    }>;
    isAirgap?: boolean;
  };
  showAdvanced: boolean;
  onShowAdvancedChange: (show: boolean) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onRegistryChange: (usePrivate: boolean) => void;
  onTestConnection: () => void;
  connectionStatus: 'idle' | 'testing' | 'success' | 'error';
  connectionError: string | null;
  validationErrors?: {[key: string]: string};
  isUpgrade?: boolean;
}

const LinuxSetup: React.FC<LinuxSetupProps> = ({
  config,
  prototypeSettings,
  showAdvanced,
  onShowAdvancedChange,
  onInputChange,
  onSelectChange,
  onRegistryChange,
  onTestConnection,
  connectionStatus,
  connectionError,
  validationErrors = {},
  isUpgrade
}) => (
  <div className="space-y-6">
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-900">System Configuration</h2>
      <Input
        id="dataDirectory"
        label="Data Directory"
        value={config.dataDirectory || ''}
        onChange={onInputChange}
        placeholder="/var/lib/wordpress"
        helpText="Directory where WordPress will store its data"
        defaultValue="/var/lib/wordpress"
        readOnly={isUpgrade}
      />
    </div>

    {!prototypeSettings.isAirgap && (
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Proxy Configuration</h2>
        <div className="space-y-4">
          <Input
            id="httpProxy"
            label="HTTP Proxy"
            value={config.httpProxy || ''}
            onChange={onInputChange}
            placeholder="http://proxy.example.com:3128"
            helpText="HTTP proxy server URL"
          />

          <Input
            id="httpsProxy"
            label="HTTPS Proxy"
            value={config.httpsProxy || ''}
            onChange={onInputChange}
            placeholder="https://proxy.example.com:3128"
            helpText="HTTPS proxy server URL"
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

    <div className="pt-4">
      <button
        type="button"
        className="flex items-center text-lg font-medium text-gray-900 mb-4"
        onClick={() => onShowAdvancedChange(!showAdvanced)}
      >
        {showAdvanced ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronUp className="w-4 h-4 mr-1" />}
        Advanced Settings
      </button>

      {showAdvanced && (
        <div className="space-y-6">
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

          <Select
            id="networkInterface"
            label="Network Interface"
            value={config.networkInterface || 'eth0'}
            onChange={onSelectChange}
            options={[
              ...(prototypeSettings.availableNetworkInterfaces || []).map(iface => ({
                value: iface.name,
                label: iface.name
              }))
            ]}
            helpText="Network interface to use for WordPress"
            defaultValue="eth0"
            disabled={isUpgrade}
          />
          
          <Input
            id="networkCIDR"
            label="Reserved Network Range (CIDR)"
            value={config.networkCIDR || ''}
            onChange={onInputChange}
            placeholder="10.244.0.0/16"
            helpText="CIDR notation for the reserved network range (must be /16 or larger)"
            defaultValue="10.244.0.0/16"
            readOnly={isUpgrade}
          />
        </div>
      )}
    </div>
  </div>
);

export default LinuxSetup;
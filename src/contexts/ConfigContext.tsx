import React, { createContext, useContext, useState, useEffect } from 'react';

export interface ClusterConfig {
  installationId: string;
  clusterName: string;
  namespace: string;
  storageClass: string;
  domain: string;
  useHttps: boolean;
  adminUsername: string;
  adminPassword: string;
  adminEmail: string;
  databaseType: 'internal' | 'external';
  usePrivateRegistry: boolean;
  registryUrl?: string;
  registryUsername?: string;
  registryPassword?: string;
  dataDirectory?: string;
  useProxy?: boolean;
  httpProxy?: string;
  httpsProxy?: string;
  noProxy?: string;
  networkInterface?: string;
  networkCIDR?: string;
  databaseConfig?: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  description: string;
  environment: string;
  deploymentMode: string;
  licenseKey?: string;
  licenseFileName?: string;
}

interface PrototypeSettings {
  skipValidation: boolean;
  failPreflights: boolean;
  failInstallation: boolean;
  failRegistryAuth: boolean;
  failHostPreflights: boolean;
  blockOnAppPreflights: boolean;
  makePreflightsStrict: boolean;
  clusterMode: 'existing' | 'embedded';
  themeColor: string;
  enableMultiNode: boolean;
  skipHostPreflights: boolean;
  configFormat: 'helm-values' | 'config-values';
  availableNetworkInterfaces: Array<{
    name: string;
    description: string;
  }>;
  enableManyConfigGroups: boolean;
  isAirgap: boolean;
}

interface ConfigContextType {
  config: ClusterConfig;
  prototypeSettings: PrototypeSettings;
  updateConfig: (newConfig: Partial<ClusterConfig>) => void;
  updatePrototypeSettings: (newSettings: Partial<PrototypeSettings>) => void;
  resetConfig: () => void;
}

// Generate a unique installation ID
const generateInstallationId = () => {
  return 'wp-' + Math.random().toString(36).substr(2, 9);
};

const defaultConfig: ClusterConfig = {
  installationId: generateInstallationId(),
  clusterName: '',
  namespace: 'wordpress',
  storageClass: 'standard',
  domain: '',
  useHttps: true,
  adminUsername: 'wordpressadmin',
  adminPassword: '',
  adminEmail: '',
  databaseType: 'internal' as 'internal' | 'external',
  usePrivateRegistry: false,
  description: '',
  environment: 'production',
  deploymentMode: 'standard',
};

const defaultPrototypeSettings: PrototypeSettings = {
  skipValidation: false,
  failPreflights: false,
  failInstallation: false,
  failRegistryAuth: false,
  failHostPreflights: false,
  blockOnAppPreflights: false,
  makePreflightsStrict: false,
  clusterMode: 'existing',
  themeColor: '#316DE6',
  enableMultiNode: true,
  skipHostPreflights: false,
  configFormat: 'config-values',
  availableNetworkInterfaces: [
    { name: 'eth0', description: 'Primary Network Interface' },
    { name: 'eth1', description: 'Secondary Network Interface' },
    { name: 'wlan0', description: 'Wireless Interface' },
    { name: 'docker0', description: 'Docker Bridge Interface' }
  ],
  enableManyConfigGroups: false,
  isAirgap: false
};

const PROTOTYPE_SETTINGS_KEY = 'wordpress-prototype-settings';

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<ClusterConfig>(defaultConfig);
  const [prototypeSettings, setPrototypeSettings] = useState<PrototypeSettings>(() => {
    const saved = localStorage.getItem(PROTOTYPE_SETTINGS_KEY);
    const settings = saved ? JSON.parse(saved) : defaultPrototypeSettings;
    // Use default theme color if themeColor is empty
    if (!settings.themeColor) {
      settings.themeColor = defaultPrototypeSettings.themeColor;
    }
    // Add configFormat if it doesn't exist
    if (!settings.configFormat) {
      settings.configFormat = defaultPrototypeSettings.configFormat;
    }
    return settings;
  });

  useEffect(() => {
    localStorage.setItem(PROTOTYPE_SETTINGS_KEY, JSON.stringify(prototypeSettings));
  }, [prototypeSettings]);

  const updateConfig = (newConfig: Partial<ClusterConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const updatePrototypeSettings = (newSettings: Partial<PrototypeSettings>) => {
    setPrototypeSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      // Use default theme color if themeColor is empty
      if (!updated.themeColor) {
        updated.themeColor = defaultPrototypeSettings.themeColor;
      }
      return updated;
    });
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
  };

  return (
    <ConfigContext.Provider value={{ config, prototypeSettings, updateConfig, updatePrototypeSettings, resetConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
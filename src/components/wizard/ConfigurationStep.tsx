import React, { useState, useRef } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { useConfig } from '../../contexts/ConfigContext';
import { useWizardMode } from '../../contexts/WizardModeContext';
import { ChevronLeft, ChevronRight, Upload, Save, Terminal, Copy, ClipboardCheck, CheckCircle, X } from 'lucide-react';

interface ConfigurationStepProps {
  onNext: () => void;
  onBack: () => void;
}

interface ValidationErrors {
  clusterName?: string;
  namespace?: string;
  storageClass?: string;
  domain?: string;
  adminUsername?: string;
  adminPassword?: string;
  adminEmail?: string;
  description?: string;
  [key: string]: string | undefined;
}

type TabName = 'cluster' | 'network' | 'admin' | 'database';

const ConfigurationStep: React.FC<ConfigurationStepProps> = ({ onNext, onBack }) => {
  const { config, updateConfig, prototypeSettings } = useConfig();
  const { text, mode } = useWizardMode();
  const [activeTab, setActiveTab] = useState<TabName>('cluster');
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [configSaved, setConfigSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [allTabsValidated, setAllTabsValidated] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const themeColor = prototypeSettings.themeColor;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    updateConfig({ [id]: value });
    if (!prototypeSettings.skipValidation && allTabsValidated) {
      setErrors(prev => ({ ...prev, [id]: undefined }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    updateConfig({ [id]: value });
    if (!prototypeSettings.skipValidation && allTabsValidated && value) {
      setErrors(prev => ({ ...prev, [id]: undefined }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    updateConfig({ [id]: checked });
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateConfig({ [name]: value });
    if (!prototypeSettings.skipValidation && allTabsValidated && value) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        updateConfig({ licenseKey: content as string });
        if (!prototypeSettings.skipValidation && allTabsValidated) {
          setErrors(prev => ({ ...prev, licenseKey: undefined }));
        }
      };
      reader.readAsText(file);
    } else {
      setUploadedFileName('');
    }
  };

  const validateTab = (tab: TabName): boolean => {
    if (prototypeSettings.skipValidation) return true;

    const newErrors: ValidationErrors = {};

    switch (tab) {
      case 'cluster':
        if (!config.clusterName) newErrors.clusterName = 'Cluster name is required';
        if (!config.namespace) newErrors.namespace = 'Namespace is required';
        if (!config.storageClass) newErrors.storageClass = 'Storage class is required';
        if (!config.description) newErrors.description = 'Description is required';
        if (!config.deploymentMode) newErrors.deploymentMode = 'Deployment mode is required';
        if (!config.environment) newErrors.environment = 'Environment is required';
        break;
      case 'network':
        if (!config.domain) newErrors.domain = 'Domain is required';
        break;
      case 'admin':
        if (!config.adminUsername) newErrors.adminUsername = 'Admin username is required';
        if (!config.adminPassword) newErrors.adminPassword = 'Admin password is required';
        if (!config.adminEmail) newErrors.adminEmail = 'Admin email is required';
        if (!config.licenseKey) newErrors.licenseKey = 'License key is required';
        break;
      case 'database':
        if (config.databaseType === 'external') {
          if (!config.databaseConfig?.host) newErrors['databaseConfig.host'] = 'Database host is required';
          if (!config.databaseConfig?.username) newErrors['databaseConfig.username'] = 'Database username is required';
          if (!config.databaseConfig?.password) newErrors['databaseConfig.password'] = 'Database password is required';
          if (!config.databaseConfig?.database) newErrors['databaseConfig.database'] = 'Database name is required';
        }
        break;
    }

    return Object.keys(newErrors).length === 0;
  };

  const validateAllTabs = (): { [key in TabName]: ValidationErrors } => {
    const tabs: TabName[] = ['cluster', 'network', 'admin', 'database'];
    const allErrors: { [key in TabName]: ValidationErrors } = {
      cluster: {},
      network: {},
      admin: {},
      database: {}
    };

    tabs.forEach(tab => {
      const tabErrors: ValidationErrors = {};
      
      switch (tab) {
        case 'cluster':
          if (!config.clusterName) tabErrors.clusterName = 'Cluster name is required';
          if (!config.namespace) tabErrors.namespace = 'Namespace is required';
          if (!config.storageClass) tabErrors.storageClass = 'Storage class is required';
          if (!config.description) tabErrors.description = 'Description is required';
          if (!config.deploymentMode) tabErrors.deploymentMode = 'Deployment mode is required';
          if (!config.environment) tabErrors.environment = 'Environment is required';
          break;
        case 'network':
          if (!config.domain) tabErrors.domain = 'Domain is required';
          break;
        case 'admin':
          if (!config.adminUsername) tabErrors.adminUsername = 'Admin username is required';
          if (!config.adminPassword) tabErrors.adminPassword = 'Admin password is required';
          if (!config.adminEmail) tabErrors.adminEmail = 'Admin email is required';
          if (!config.licenseKey) tabErrors.licenseKey = 'License key is required';
          break;
        case 'database':
          if (config.databaseType === 'external') {
            if (!config.databaseConfig?.host) tabErrors['databaseConfig.host'] = 'Database host is required';
            if (!config.databaseConfig?.username) tabErrors['databaseConfig.username'] = 'Database username is required';
            if (!config.databaseConfig?.password) tabErrors['databaseConfig.password'] = 'Database password is required';
            if (!config.databaseConfig?.database) tabErrors['databaseConfig.database'] = 'Database name is required';
          }
          break;
      }
      
      allErrors[tab] = tabErrors;
    });

    return allErrors;
  };

  const findFirstTabWithErrors = (): TabName | null => {
    if (prototypeSettings.skipValidation) return null;
    
    const allTabErrors = validateAllTabs();
    const tabs: TabName[] = ['cluster', 'network', 'admin', 'database'];
    
    for (const tab of tabs) {
      if (Object.keys(allTabErrors[tab]).length > 0) {
        return tab;
      }
    }
    return null;
  };

  const handleNext = () => {
    if (prototypeSettings.skipValidation) {
      onNext();
      return;
    }

    // Validate all tabs and set errors
    const allTabErrors = validateAllTabs();
    const flatErrors = Object.values(allTabErrors).reduce((acc, tabErrors) => ({ ...acc, ...tabErrors }), {});
    setErrors(flatErrors);
    setAllTabsValidated(true);

    // Check if current tab has errors
    const currentTabErrors = allTabErrors[activeTab];
    const hasCurrentTabErrors = Object.keys(currentTabErrors).length > 0;

    if (!hasCurrentTabErrors) {
      const nextTabWithErrors = findFirstTabWithErrors();
      if (nextTabWithErrors) {
        setActiveTab(nextTabWithErrors);
      } else {
        onNext();
      }
    }
  };

  const handleSaveConfig = () => {
    if (prototypeSettings.skipValidation) {
      setConfigSaved(true);
      return;
    }

    const allTabErrors = validateAllTabs();
    const flatErrors = Object.values(allTabErrors).reduce((acc, tabErrors) => ({ ...acc, ...tabErrors }), {});
    setErrors(flatErrors);
    setAllTabsValidated(true);

    const nextTabWithErrors = findFirstTabWithErrors();
    if (!nextTabWithErrors) {
      setConfigSaved(true);
    } else {
      setActiveTab(nextTabWithErrors);
    }
  };

  const copyInstallCommand = () => {
    const target = prototypeSettings.clusterMode === 'embedded' ? 'linux' : 'kubernetes';
    
    let command: string;
    if (prototypeSettings.configFormat === 'helm-values') {
      command = `helm install wordpress oci://charts.wordpress.com/stable/wordpress --version 1.2.3 --values wordpress-values.yaml`;
    } else {
      command = `wordpress install --config-values wordpress-config.yaml --target ${target}`;
    }
    
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getConfigFileName = () => {
    return prototypeSettings.configFormat === 'helm-values' ? 'wordpress-values.yaml' : 'wordpress-config.yaml';
  };

  const renderClusterConfig = () => (
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
        onChange={handleInputChange}
        readOnly={true}
        helpText="Auto-generated unique identifier for this installation"
      />

      <Input
        id="clusterName"
        label="Cluster Name"
        value={config.clusterName}
        onChange={handleInputChange}
        placeholder="my-wordpress"
        required={!prototypeSettings.skipValidation}
        error={errors.clusterName}
        helpText="A unique name for your WordPress Enterprise installation"
      />

      <Select
        id="environment"
        label="Environment"
        value={config.environment}
        onChange={handleSelectChange}
        required={!prototypeSettings.skipValidation}
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
          {!prototypeSettings.skipValidation && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="radio"
              id="mode-standard"
              name="deploymentMode"
              value="standard"
              checked={config.deploymentMode === 'standard'}
              onChange={handleRadioChange}
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
              onChange={handleRadioChange}
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
          {!prototypeSettings.skipValidation && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          id="description"
          value={config.description}
          onChange={handleInputChange}
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

  const renderNetworkConfig = () => (
    <div className="space-y-6">
      <Input
        id="domain"
        label="Domain"
        value={config.domain}
        onChange={handleInputChange}
        placeholder="wordpress.example.com"
        required={!prototypeSettings.skipValidation}
        error={errors.domain}
        helpText="Domain name for accessing WordPress"
      />

      <Input
        id="httpProxy"
        label="HTTP Proxy"
        value={config.httpProxy || ''}
        onChange={handleInputChange}
        placeholder="http://proxy.example.com:3128"
        recommended={true}
        helpText="HTTP proxy server URL (optional)"
      />

      <Input
        id="httpsProxy"
        label="HTTPS Proxy"
        value={config.httpsProxy || ''}
        onChange={handleInputChange}
        placeholder="https://proxy.example.com:3128"
        recommended={true}
        helpText="HTTPS proxy server URL (optional)"
      />

      <div className="flex items-center space-x-3">
        <input
          id="useHttps"
          type="checkbox"
          checked={config.useHttps}
          onChange={handleCheckboxChange}
          className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
          style={{
            accentColor: themeColor,
            '--tw-ring-color': themeColor,
          } as React.CSSProperties}
        />
        <label htmlFor="useHttps" className="text-sm text-gray-700">
          Enable HTTPS
        </label>
      </div>
    </div>
  );

  const renderAdminConfig = () => (
    <div className="space-y-6">
      <Input
        id="adminUsername"
        label="Admin Username"
        value={config.adminUsername}
        onChange={handleInputChange}
        placeholder="wordpressadmin"
        required={!prototypeSettings.skipValidation}
        error={errors.adminUsername}
        helpText="Username for the administrator account"
      />

      <Input
        id="adminEmail"
        label="Admin Email"
        type="email"
        value={config.adminEmail}
        onChange={handleInputChange}
        placeholder="admin@example.com"
        required={!prototypeSettings.skipValidation}
        error={errors.adminEmail}
        helpText="Email address for the administrator"
      />

      <Input
        id="adminPassword"
        label="Admin Password"
        type="password"
        value={config.adminPassword}
        onChange={handleInputChange}
        placeholder="••••••••••••"
        required={!prototypeSettings.skipValidation}
        error={errors.adminPassword}
        helpText="Password must be at least 8 characters"
      />

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          License Key File
          {!prototypeSettings.skipValidation && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="mt-1 space-y-3">
          <div className="flex items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".key,.txt"
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              icon={<Upload className="w-4 h-4" />}
            >
              {uploadedFileName ? 'Change License Key' : 'Upload License Key'}
            </Button>
          </div>
          
          {uploadedFileName && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-sm font-medium text-green-800">File uploaded successfully</p>
                <p className="text-sm text-green-600 truncate">{uploadedFileName}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUploadedFileName('');
                  updateConfig({ licenseKey: undefined });
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="flex-shrink-0 text-green-600 hover:text-green-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        {errors.licenseKey && (
          <p className="text-sm text-red-500">{errors.licenseKey}</p>
        )}
        <p className="text-sm text-gray-500">Upload your WordPress Enterprise license key</p>
      </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".key,.txt"
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            icon={<Upload className="w-4 h-4" />}
          >
            Upload License Key
          </Button>
        </div>
        {errors.licenseKey && (
          <p className="text-sm text-red-500">{errors.licenseKey}</p>
        )}
        <p className="text-sm text-gray-500">Upload your WordPress Enterprise license key</p>
      </div>
    </div>
  );

  const renderDatabaseConfig = () => (
    <div className="space-y-6">
      <Select
        id="databaseType"
        label="Database Type"
        value={config.databaseType}
        onChange={handleSelectChange}
        options={[
          { value: 'internal', label: 'Internal (PostgreSQL)' },
          { value: 'external', label: 'External Database' },
        ]}
        required={!prototypeSettings.skipValidation}
        helpText="Choose between managed internal database or connect to your existing database"
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
            onChange={handleInputChange}
            placeholder="db.example.com"
            required={!prototypeSettings.skipValidation}
            error={errors['databaseConfig.host']}
          />

          <Input
            id="databaseConfig.port"
            label="Database Port"
            type="number"
            value={config.databaseConfig?.port?.toString() || '5432'}
            onChange={handleInputChange}
            placeholder="5432"
            required={!prototypeSettings.skipValidation}
          />

          <Input
            id="databaseConfig.username"
            label="Database Username"
            value={config.databaseConfig?.username || ''}
            onChange={handleInputChange}
            placeholder="postgres"
            required={!prototypeSettings.skipValidation}
            error={errors['databaseConfig.username']}
          />

          <Input
            id="databaseConfig.password"
            label="Database Password"
            type="password"
            value={config.databaseConfig?.password || ''}
            onChange={handleInputChange}
            placeholder="••••••••••••"
            required={!prototypeSettings.skipValidation}
            error={errors['databaseConfig.password']}
          />

          <Input
            id="databaseConfig.database"
            label="Database Name"
            value={config.databaseConfig?.database || ''}
            onChange={handleInputChange}
            placeholder="wordpress"
            required={!prototypeSettings.skipValidation}
            error={errors['databaseConfig.database']}
          />
        </>
      )}
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'cluster':
        return renderClusterConfig();
      case 'network':
        return renderNetworkConfig();
      case 'admin':
        return renderAdminConfig();
      case 'database':
        return renderDatabaseConfig();
      default:
        return null;
    }
  };

  if (configSaved) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${themeColor}1A` }}>
              <Save className="w-10 h-10" style={{ color: themeColor }} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Configuration Saved!</h2>
            <p className="text-xl text-gray-600 max-w-2xl mb-8">
              Your configuration has been saved to {getConfigFileName()}
            </p>

            <div className="w-full max-w-2xl space-y-6">
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Installation Command</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="py-1 px-2 text-xs"
                    icon={copied ? <ClipboardCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    onClick={copyInstallCommand}
                  >
                    {copied ? 'Copied!' : 'Copy Command'}
                  </Button>
                </div>
                <div className="flex items-start space-x-2 p-2 bg-white rounded border border-gray-300">
                  <Terminal className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <code className="font-mono text-sm text-left">
                    {prototypeSettings.configFormat === 'helm-values' 
                      ? `helm install wordpress oci://charts.wordpress.com/stable/wordpress --version 1.2.3 --values wordpress-values.yaml`
                      : `wordpress install --config-values wordpress-config.yaml --target ${prototypeSettings.clusterMode === 'embedded' ? 'linux' : 'kubernetes'}`
                    }
                  </code>
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Run this command to start the installation using your saved configuration.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{text.configurationTitle}</h2>
          <p className="text-gray-600 mt-1">
            {text.configurationDescription}
          </p>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-6">
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                onClick={() => setActiveTab('cluster')}
                style={{
                  borderColor: activeTab === 'cluster' ? themeColor : 'transparent',
                  color: activeTab === 'cluster' ? themeColor : 'rgb(107 114 128)',
                }}
              >
                Cluster Settings
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                onClick={() => setActiveTab('network')}
                style={{
                  borderColor: activeTab === 'network' ? themeColor : 'transparent',
                  color: activeTab === 'network' ? themeColor : 'rgb(107 114 128)',
                }}
              >
                Network
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                onClick={() => setActiveTab('admin')}
                style={{
                  borderColor: activeTab === 'admin' ? themeColor : 'transparent',
                  color: activeTab === 'admin' ? themeColor : 'rgb(107 114 128)',
                }}
              >
                Admin Account
              </button>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                onClick={() => setActiveTab('database')}
                style={{
                  borderColor: activeTab === 'database' ? themeColor : 'transparent',
                  color: activeTab === 'database' ? themeColor : 'rgb(107 114 128)',
                }}
              >
                Database
              </button>
            </nav>
          </div>
        </div>

        {renderActiveTab()}
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} icon={<ChevronLeft className="w-5 h-5" />}>
          Back
        </Button>
        {mode === 'install' && window.location.pathname === '/configure' ? (
          <Button onClick={handleSaveConfig} icon={<Save className="w-5 h-5" />}>
            Save Configuration
          </Button>
        ) : (
          <Button onClick={handleNext} icon={<ChevronRight className="w-5 h-5" />}>
            Next: Setup
          </Button>
        )}
      </div>
    </div>
  );
};

export default ConfigurationStep;
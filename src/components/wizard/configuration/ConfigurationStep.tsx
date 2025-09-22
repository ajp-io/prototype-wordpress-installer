import React, { useState, useEffect } from 'react';
import Card from '../../common/Card';
import Button from '../../common/Button';
import { useWizardMode } from '../../../contexts/WizardModeContext';
import { useConfig } from '../../../contexts/ConfigContext';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { useConfigValidation } from './hooks/useConfigValidation';
import { useConfigForm } from './hooks/useConfigForm';
import ConfigStepper, { ConfigStep } from './components/ConfigStepper';
import ConfigSaveSuccess from './components/ConfigSaveSuccess';
import ClusterConfigTab from './tabs/ClusterConfigTab';
import NetworkConfigTab from './tabs/NetworkConfigTab';
import AdminConfigTab from './tabs/AdminConfigTab';
import DatabaseConfigTab from './tabs/DatabaseConfigTab';
import { 
  MonitoringConfigTab, 
  LoggingConfigTab, 
  BackupConfigTab, 
  SecurityConfigTab, 
  PerformanceConfigTab, 
  IntegrationsConfigTab, 
  NotificationsConfigTab, 
  CustomizationConfigTab 
} from './tabs/ExtendedConfigTabs';
import { TabName } from './utils/validationUtils';

interface ConfigurationStepProps {
  onNext: () => void;
  onBack: () => void;
  config?: any;
  isReadOnly?: boolean;
}

const ConfigurationStep: React.FC<ConfigurationStepProps> = ({ onNext, onBack, config: externalConfig, isReadOnly = false }) => {
  const { text, mode } = useWizardMode();
  const { prototypeSettings, config: contextConfig } = useConfig();
  
  // Use external config if provided (for read-only view), otherwise use context config
  const config = externalConfig || contextConfig;
  
  const getConfigSteps = (): TabName[] => {
    const basicSteps: TabName[] = ['cluster', 'network', 'admin', 'database'];
    
    if (prototypeSettings.enableManyConfigGroups) {
      return [
        ...basicSteps,
        'monitoring',
        'logging', 
        'backup',
        'security',
        'performance',
        'integrations',
        'notifications',
        'customization',
        'storage',
        'networking-advanced',
        'certificates',
        'authentication',
        'authorization',
        'compliance',
        'audit',
        'analytics',
        'reporting',
        'maintenance',
        'scaling',
        'load-balancing',
        'caching-advanced',
        'cdn',
        'dns',
        'ssl-tls',
        'firewall',
        'vpn',
        'proxy-advanced',
        'api-gateway',
        'service-mesh',
        'observability',
        'tracing',
        'profiling',
        'debugging',
        'testing',
        'deployment',
        'rollback',
        'canary',
        'blue-green',
        'feature-flags',
        'secrets',
        'encryption',
        'key-management',
        'tokens',
        'sessions',
        'cookies',
        'cors',
        'headers',
        'middleware',
        'plugins-advanced',
        'extensions',
        'themes',
        'localization'
      ];
    }
    
    return basicSteps;
  };
  
  const configSteps = getConfigSteps();
  const [currentConfigStep, setCurrentConfigStep] = useState<TabName>('cluster');
  
  const { 
    errors, 
    clearError, 
    validateAndSetErrors, 
    hasValidationErrors, 
    configStepStatuses,
    furthestReachedStep,
    updateConfigStepStatus 
  } = useConfigValidation();
  
  const {
    config: formConfig,
    configSaved,
    handleInputChange,
    handleSelectChange,
    handleCheckboxChange,
    handleRadioChange,
    handleFileChange,
    handleFileRemove,
    handleNext,
    handleBack: handleConfigBack,
    handleSaveConfig,
    getNextButtonText
  } = useConfigForm({ 
    onNext, 
    validateAndSetErrors, 
    hasValidationErrors, 
    currentConfigStep,
    setCurrentConfigStep,
    configStepStatuses,
    updateConfigStepStatus,
    configSteps
  });
  
  // Use the appropriate config for form operations
  const activeConfig = isReadOnly ? config : formConfig;

  const themeColor = prototypeSettings.themeColor;

  // Set initial step status
  useEffect(() => {
    if (!isReadOnly) {
      updateConfigStepStatus('cluster', 'current');
    }
  }, []);

  const handleStepClick = (step: TabName) => {
    if (!isReadOnly) {
      // Allow clicking on any step up to the furthest reached step
      const steps: TabName[] = ['cluster', 'network', 'admin', 'database'];
      const clickedIndex = steps.indexOf(step);
      const furthestIndex = steps.indexOf(furthestReachedStep);
      
      if (clickedIndex <= furthestIndex) {
        updateConfigStepStatus(currentConfigStep, 'pending');
        updateConfigStepStatus(step, 'current');
        setCurrentConfigStep(step);
      }
    }
  };

  const handleBackClick = () => {
    const handled = handleConfigBack();
    if (!handled) {
      onBack();
    }
  };

  const createConfigSteps = (): ConfigStep[] => {
    const stepLabels = {
      cluster: 'Cluster Settings',
      network: 'Network',
      admin: 'Admin Account',
      database: 'Database',
      monitoring: 'Monitoring',
      logging: 'Logging',
      backup: 'Backup',
      security: 'Security',
      performance: 'Performance',
      integrations: 'Integrations',
      notifications: 'Notifications',
      customization: 'Customization',
      storage: 'Storage Management',
      'networking-advanced': 'Advanced Networking',
      certificates: 'SSL Certificates',
      authentication: 'Authentication',
      authorization: 'Authorization',
      compliance: 'Compliance',
      audit: 'Audit Logging',
      analytics: 'Analytics',
      reporting: 'Reporting',
      maintenance: 'Maintenance',
      scaling: 'Auto Scaling',
      'load-balancing': 'Load Balancing',
      'caching-advanced': 'Advanced Caching',
      cdn: 'CDN Configuration',
      dns: 'DNS Settings',
      'ssl-tls': 'SSL/TLS Settings',
      firewall: 'Firewall Rules',
      vpn: 'VPN Configuration',
      'proxy-advanced': 'Proxy Settings',
      'api-gateway': 'API Gateway',
      'service-mesh': 'Service Mesh',
      observability: 'Observability',
      tracing: 'Distributed Tracing',
      profiling: 'Performance Profiling',
      debugging: 'Debug Configuration',
      testing: 'Testing Framework',
      deployment: 'Deployment Strategy',
      rollback: 'Rollback Policies',
      canary: 'Canary Deployments',
      'blue-green': 'Blue-Green Deployments',
      'feature-flags': 'Feature Flags',
      secrets: 'Secrets Management',
      encryption: 'Encryption Settings',
      'key-management': 'Key Management',
      tokens: 'Token Configuration',
      sessions: 'Session Management',
      cookies: 'Cookie Settings',
      cors: 'CORS Configuration',
      headers: 'HTTP Headers',
      middleware: 'Middleware Stack',
      'plugins-advanced': 'Plugin Management',
      extensions: 'Extensions',
      themes: 'Theme Configuration',
      localization: 'Localization'
    };

    return configSteps.map(stepId => ({
      id: stepId,
      label: stepLabels[stepId],
      status: isReadOnly ? 'completed' : configStepStatuses[stepId]
    }));
  };

  const renderCurrentStep = () => {
    const commonProps = {
      config: activeConfig,
      errors,
      skipValidation: prototypeSettings.skipValidation,
      themeColor,
      isReadOnly
    };

    switch (currentConfigStep) {
      case 'cluster':
        return (
          <ClusterConfigTab
            {...commonProps}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
            onRadioChange={handleRadioChange}
          />
        );
      case 'network':
        return (
          <NetworkConfigTab
            {...commonProps}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
          />
        );
      case 'admin':
        return (
          <AdminConfigTab
            {...commonProps}
            onInputChange={handleInputChange}
            onFileChange={handleFileChange}
            onFileRemove={handleFileRemove}
          />
        );
      case 'database':
        return (
          <DatabaseConfigTab
            {...commonProps}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
          />
        );
      case 'monitoring':
        return (
          <MonitoringConfigTab
            {...commonProps}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
            onCheckboxChange={handleCheckboxChange}
          />
        );
      case 'logging':
        return (
          <LoggingConfigTab
            {...commonProps}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
          />
        );
      case 'backup':
        return (
          <BackupConfigTab
            {...commonProps}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
          />
        );
      case 'security':
        return (
          <SecurityConfigTab
            {...commonProps}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
          />
        );
      case 'performance':
        return (
          <PerformanceConfigTab
            {...commonProps}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
          />
        );
      case 'integrations':
        return (
          <IntegrationsConfigTab
            {...commonProps}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
          />
        );
      case 'notifications':
        return (
          <NotificationsConfigTab
            {...commonProps}
            onInputChange={handleInputChange}
            onCheckboxChange={handleCheckboxChange}
          />
        );
      case 'customization':
        return (
          <CustomizationConfigTab
            {...commonProps}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
          />
        );
      default:
        // For all the additional config groups, show a simple placeholder
        return (
          <div className="space-y-6">
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                Configure settings for {stepLabels[currentConfigStep] || currentConfigStep}.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id={`enable-${currentConfigStep}`}
                  checked={true}
                  disabled={isReadOnly}
                  className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                  style={{
                    accentColor: themeColor,
                    '--tw-ring-color': themeColor,
                  } as React.CSSProperties}
                />
                <label htmlFor={`enable-${currentConfigStep}`} className={`text-sm ${isReadOnly ? 'text-gray-500' : 'text-gray-700'}`}>
                  Enable {stepLabels[currentConfigStep] || currentConfigStep}
                </label>
              </div>
            </div>
          </div>
        );
    }
  };

  if (configSaved) {
    return <ConfigSaveSuccess />;
  }

  return (
    <div className="flex min-h-[600px]">
      {!isReadOnly && (
        <ConfigStepper
          steps={createConfigSteps()}
          currentStep={currentConfigStep}
          furthestReachedStep={furthestReachedStep}
          onStepClick={handleStepClick}
          themeColor={themeColor}
        />
      )}
      
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 m-0 rounded-none border-0 shadow-none">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{text.configurationTitle}</h2>
            <p className="text-gray-600 mt-1">
              {text.configurationDescription}
            </p>
          </div>
          
          <div className="flex-1">
            {renderCurrentStep()}
          </div>
        </Card>

        {!isReadOnly && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBackClick} icon={<ChevronLeft className="w-5 h-5" />}>
                Back
              </Button>
              {mode === 'install' && window.location.pathname === '/configure' ? (
                <Button onClick={handleSaveConfig} icon={<Save className="w-5 h-5" />}>
                  Save Configuration
                </Button>
              ) : (
                <Button onClick={handleNext} icon={<ChevronRight className="w-5 h-5" />}>
                  {getNextButtonText()}
                </Button>
              )}
            </div>
          </div>
        )}
        
        {isReadOnly && (
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-start">
              <Button variant="outline" onClick={handleBackClick} icon={<ChevronLeft className="w-5 h-5" />}>
                Back to Deployment History
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigurationStep;
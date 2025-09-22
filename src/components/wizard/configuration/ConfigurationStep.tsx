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
        'networking',
        'certificates',
        'authentication',
        'authorization',
        'compliance',
        'auditing',
        'analytics',
        'reporting',
        'maintenance',
        'scaling',
        'loadbalancing',
        'caching',
        'cdn',
        'dns',
        'ssl',
        'firewall',
        'vpn',
        'proxy',
        'gateway',
        'mesh',
        'observability',
        'tracing',
        'profiling',
        'debugging',
        'testing',
        'deployment',
        'rollback',
        'canary',
        'bluegreen',
        'feature-flags',
        'secrets',
        'encryption',
        'keys',
        'tokens',
        'sessions',
        'cookies',
        'cors',
        'headers',
        'middleware',
        'plugins',
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
      updateConfigStepStatus(currentConfigStep, 'pending');
      updateConfigStepStatus(step, 'current');
      setCurrentConfigStep(step);
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
      customization: 'Customization'
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
      // For all the additional config groups, we'll render a generic placeholder
      default:
        return (
          <div className="space-y-6">
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                Configure settings for {currentConfigStep.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace(/-/g, ' ')}.
              </p>
            </div>
            <div className="space-y-4">
              <div className="p-8 text-center text-gray-500">
                <h3 className="text-lg font-medium mb-2">
                  {currentConfigStep.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).replace(/-/g, ' ')} Configuration
                </h3>
                <p>Configuration options for this section would appear here.</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
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
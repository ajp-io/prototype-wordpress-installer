import React from 'react';
import Card from '../../common/Card';
import Button from '../../common/Button';
import { useWizardMode } from '../../../contexts/WizardModeContext';
import { useConfig } from '../../../contexts/ConfigContext';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { useTabNavigation } from './hooks/useTabNavigation';
import { useConfigValidation } from './hooks/useConfigValidation';
import { useConfigForm } from './hooks/useConfigForm';
import TabNavigation from './components/TabNavigation';
import ConfigSaveSuccess from './components/ConfigSaveSuccess';
import ClusterConfigTab from './tabs/ClusterConfigTab';
import NetworkConfigTab from './tabs/NetworkConfigTab';
import AdminConfigTab from './tabs/AdminConfigTab';
import DatabaseConfigTab from './tabs/DatabaseConfigTab';

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
  
  const { activeTab, setActiveTab } = useTabNavigation();
  const { errors, clearError, validateAndSetErrors, hasValidationErrors } = useConfigValidation();
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
    handleSaveConfig
  } = useConfigForm({ onNext, validateAndSetErrors, hasValidationErrors, setActiveTab });
  
  // Use the appropriate config for form operations
  const activeConfig = isReadOnly ? config : formConfig;

  const themeColor = prototypeSettings.themeColor;

  const renderActiveTab = () => {
    const commonProps = {
      config: activeConfig,
      errors,
      skipValidation: prototypeSettings.skipValidation,
      themeColor,
      isReadOnly
    };

    switch (activeTab) {
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
      default:
        return null;
    }
  };

  if (configSaved) {
    return <ConfigSaveSuccess />;
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

        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        {renderActiveTab()}
      </Card>

      {!isReadOnly && (
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
      )}
      
      {isReadOnly && (
        <div className="flex justify-start">
          <Button variant="outline" onClick={onBack} icon={<ChevronLeft className="w-5 h-5" />}>
            Back to Deployment History
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConfigurationStep;
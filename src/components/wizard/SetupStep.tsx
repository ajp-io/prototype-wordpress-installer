import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useConfig } from '../../contexts/ConfigContext';
import { useWizardMode } from '../../contexts/WizardModeContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LinuxSetup from './setup/LinuxSetup';
import KubernetesSetup from './setup/KubernetesSetup';

interface SetupStepProps {
  onNext: () => void;
  onBack: () => void;
}

const SetupStep: React.FC<SetupStepProps> = ({ onNext, onBack }) => {
  const { config, updateConfig, prototypeSettings } = useConfig();
  const { text } = useWizardMode();
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const validatePrivateRegistryConfig = () => {
    const errors: {[key: string]: string} = {};
    
    if (config.usePrivateRegistry) {
      if (!config.registryUrl?.trim()) {
        errors.registryUrl = 'Registry URL is required';
      }
      if (!config.registryUsername?.trim()) {
        errors.registryUsername = 'Registry username is required';
      }
      if (!config.registryPassword?.trim()) {
        errors.registryPassword = 'Registry password is required';
      }
      
      // Check if connection test is required and hasn't been completed successfully
      if (config.registryUrl?.trim() && config.registryUsername?.trim() && config.registryPassword?.trim()) {
        if (connectionStatus !== 'success') {
          errors.connectionTest = 'Please test your registry connection before proceeding';
        }
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    // Clear validation error for this field
    if (validationErrors[id]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
    
    if (id === 'networkCIDR' && !value) {
      updateConfig({ networkCIDR: '10.244.0.0/16' });
    } else if (id === 'adminConsolePort') {
      updateConfig({ adminConsolePort: parseInt(value) || 8080 });
    } else {
      updateConfig({ [id]: value });
    }
    setConnectionError(null);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    updateConfig({ [id]: value });
  };

  const handleRegistryChange = (usePrivate: boolean) => {
    updateConfig({ usePrivateRegistry: usePrivate });
    if (!usePrivate) {
      setConnectionStatus('idle');
      setConnectionError(null);
      setValidationErrors({});
    }
  };

  const testConnection = async () => {
    if (!config.usePrivateRegistry || !config.registryUrl || !config.registryUsername || !config.registryPassword) {
      return;
    }

    // Clear any existing connection test validation error
    if (validationErrors.connectionTest) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.connectionTest;
        return newErrors;
      });
    }

    setConnectionStatus('testing');
    setConnectionError(null);

    if (prototypeSettings?.failRegistryAuth) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setConnectionError('Invalid registry credentials. Please check your username and password.');
      setConnectionStatus('error');
      return;
    }

    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000));
    setConnectionStatus('success');
  };

  const handleNext = async () => {
    // Validate private registry configuration if using private registry
    if (!validatePrivateRegistryConfig()) {
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{text.setupTitle}</h2>
          <p className="text-gray-600 mt-1">
            {text.setupDescription}
          </p>
        </div>

        {prototypeSettings?.clusterMode === 'embedded' ? (
          <LinuxSetup
            config={config}
            prototypeSettings={prototypeSettings}
            showAdvanced={showAdvanced}
            onShowAdvancedChange={setShowAdvanced}
            onInputChange={handleInputChange}
            onSelectChange={handleSelectChange}
            onRegistryChange={handleRegistryChange}
            onTestConnection={testConnection}
            connectionStatus={connectionStatus}
            connectionError={connectionError}
            validationErrors={validationErrors}
            isUpgrade={text.mode === 'upgrade'}
          />
        ) : (
          <KubernetesSetup
            config={config}
            onRegistryChange={handleRegistryChange}
            onInputChange={handleInputChange}
            onTestConnection={testConnection}
            connectionStatus={connectionStatus}
            connectionError={connectionError}
            validationErrors={validationErrors}
            isUpgrade={text.mode === 'upgrade'}
          />
        )}
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} icon={<ChevronLeft className="w-5 h-5" />}>
          Back
        </Button>
        <Button 
          onClick={handleNext}
          icon={<ChevronRight className="w-5 h-5" />}
        >
          {prototypeSettings.clusterMode === 'embedded' 
            ? 'Next: Installation'
            : 'Next: Installation'}
        </Button>
      </div>
    </div>
  );
};

export default SetupStep;
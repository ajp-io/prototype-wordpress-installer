import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useConfig } from '../../contexts/ConfigContext';
import { useWizardMode } from '../../contexts/WizardModeContext';
import { ChevronLeft, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import LinuxSetup from './setup/LinuxSetup';
import KubernetesSetup from './setup/KubernetesSetup';
import K0sInstallation from './setup/K0sInstallation';

interface SetupStepProps {
  onNext: () => void;
  onBack: () => void;
}

type SetupPhase = 'configuration' | 'k0s-installation';

const SetupStep: React.FC<SetupStepProps> = ({ onNext, onBack }) => {
  const { config, updateConfig, prototypeSettings } = useConfig();
  const { text } = useWizardMode();
  const [phase, setPhase] = useState<SetupPhase>('configuration');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [k0sComplete, setK0sComplete] = useState(false);
  const [showPreflightModal, setShowPreflightModal] = useState(false);
  const [hasPreflightFailures, setHasPreflightFailures] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
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
    }
  };

  const testConnection = async () => {
    if (!config.usePrivateRegistry || !config.registryUrl || !config.registryUsername || !config.registryPassword) {
      return;
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

  const handleK0sComplete = (hasFailures: boolean = false) => {
    setK0sComplete(true);
    setHasPreflightFailures(hasFailures);
  };

  const handleNext = async () => {
    if (phase === 'configuration') {
      if (prototypeSettings.clusterMode === 'embedded') {
        setPhase('k0s-installation');
      } else {
        onNext();
      }
    } else if (phase === 'k0s-installation') {
      // Check if we have preflight failures and need to show modal
      if (hasPreflightFailures && prototypeSettings.skipHostPreflights) {
        setShowPreflightModal(true);
      } else if (!hasPreflightFailures || prototypeSettings.skipHostPreflights) {
        onNext();
      }
      // If there are failures and skip is not enabled, button should be disabled
    }
  };

  const handleConfirmProceed = () => {
    setShowPreflightModal(false);
    onNext();
  };

  const handleCancelProceed = () => {
    setShowPreflightModal(false);
  };

  const canProceed = () => {
    if (phase === 'configuration') {
      return true;
    }
    
    if (phase === 'k0s-installation') {
      if (!k0sComplete) return false;
      
      // If there are no failures, can always proceed
      if (!hasPreflightFailures) return true;
      
      // If there are failures, can only proceed if skip setting is enabled
      return prototypeSettings.skipHostPreflights;
    }
    
    return false;
  };

  const getButtonText = () => {
    if (phase === 'configuration') {
      if (prototypeSettings.clusterMode === 'embedded') {
        return 'Next: Set Up Hosts';
      } else {
        return 'Next: Preflight Checks';
      }
    }
    
    return 'Next: Install Infrastructure';
  };

  const getButtonIcon = () => {
    return <ChevronRight className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{text.setupTitle}</h2>
          <p className="text-gray-600 mt-1">
            {prototypeSettings.clusterMode === 'embedded' 
              ? (prototypeSettings.enableMultiNode 
                  ? 'Set up the hosts for this installation.'
                  : 'Set up the host for this installation.')
              : text.setupDescription}
          </p>
        </div>

        {phase === 'configuration' ? (
          prototypeSettings?.clusterMode === 'embedded' ? (
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
              isUpgrade={text.mode === 'upgrade'}
            />
          )
        ) : (
          <K0sInstallation onComplete={handleK0sComplete} />
        )}
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} icon={<ChevronLeft className="w-5 h-5" />}>
          Back
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!canProceed()}
          icon={getButtonIcon()}
        >
          {getButtonText()}
        </Button>
      </div>

      <Modal
        isOpen={showPreflightModal}
        onClose={handleCancelProceed}
        title="Proceed with Failed Checks?"
        footer={
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleCancelProceed}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmProceed}
            >
              Continue Anyway
            </Button>
          </div>
        }
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-sm text-gray-700">
              Some host preflight checks failed. Are you sure you want to continue with the installation? 
              Installation issues are likely to occur.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SetupStep;
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
import { ImagePushStatus } from './setup/types';

interface SetupStepProps {
  onNext: () => void;
  onBack: () => void;
}

type SetupPhase = 'configuration' | 'k0s-installation';

const SetupStep: React.FC<SetupStepProps> = ({ onNext, onBack }) => {
  const { config, updateConfig, prototypeSettings } = useConfig();
  const { text } = useWizardMode();
  const [phase, setPhase] = useState<SetupPhase>('configuration');
  const [isPushing, setIsPushing] = useState(false);
  const [pushStatus, setPushStatus] = useState<ImagePushStatus[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [pushComplete, setPushComplete] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(true);
  const [k0sComplete, setK0sComplete] = useState(false);
  const [showPreflightModal, setShowPreflightModal] = useState(false);
  const [hasPreflightFailures, setHasPreflightFailures] = useState(false);

  const images = [
    'wordpress/wordpress:latest',
    'bitnami/postgresql:latest',
    'bitnami/nginx:latest',
    'bitnami/redis:latest'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === 'networkCIDR' && !value) {
      updateConfig({ networkCIDR: '10.244.0.0/16' });
    } else if (id === 'adminConsolePort') {
      updateConfig({ adminConsolePort: parseInt(value) || 8080 });
    } else {
      updateConfig({ [id]: value });
    }
    setAuthError(null);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    updateConfig({ [id]: value });
  };

  const handleRegistryChange = (usePrivate: boolean) => {
    updateConfig({ usePrivateRegistry: usePrivate });
    if (!usePrivate) {
      setIsPushing(false);
      setPushStatus([]);
      setPushComplete(false);
      setAuthError(null);
    }
  };

  const pushImages = async () => {
    if (!config.usePrivateRegistry || !config.registryUrl || !config.registryUsername || !config.registryPassword) {
      return;
    }

    setIsPushing(true);
    setPushComplete(false);
    setAuthError(null);
    setPushStatus(images.map(image => ({
      image,
      status: 'pending',
      progress: 0
    })));

    if (prototypeSettings?.failRegistryAuth) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setAuthError('Invalid registry credentials. Please check your username and password.');
      setIsPushing(false);
      setPushStatus([]);
      return;
    }

    for (const image of images) {
      const statusIndex = images.indexOf(image);
      
      setPushStatus(prev => prev.map((status, index) => 
        index === statusIndex ? { ...status, status: 'pushing' } : status
      ));
      setCurrentMessage(`Pushing ${image}`);

      try {
        for (let progress = 0; progress <= 100; progress += 10) {
          setPushStatus(prev => prev.map((status, index) => 
            index === statusIndex ? { ...status, progress } : status
          ));
          await new Promise(resolve => setTimeout(resolve, 200));
        }

        setPushStatus(prev => prev.map((status, index) => 
          index === statusIndex ? { ...status, status: 'complete', progress: 100 } : status
        ));
      } catch (error) {
        setPushStatus(prev => prev.map((status, index) => 
          index === statusIndex ? { ...status, status: 'failed', progress: 0 } : status
        ));
        setCurrentMessage(`Failed to push ${image}`);
        setIsPushing(false);
        return;
      }
    }

    setCurrentMessage('All images pushed successfully');
    setIsPushing(false);
    setPushComplete(true);
  };

  const handleK0sComplete = (hasFailures: boolean = false) => {
    setK0sComplete(true);
    setHasPreflightFailures(hasFailures);
  };

  const handleNext = async () => {
    if (phase === 'configuration') {
      if (config.usePrivateRegistry && !pushComplete) {
        await pushImages();
      } else if (prototypeSettings.clusterMode === 'embedded') {
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
      if (config.usePrivateRegistry && !pushComplete) {
        return !isPushing;
      }
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
      if (config.usePrivateRegistry && !pushComplete) {
        return isPushing ? 'Pushing Images...' : 'Push Images';
      }
      if (prototypeSettings.clusterMode === 'embedded') {
        return 'Next: Install Infrastructure';
      } else {
        return 'Next: Preflight Checks';
      }
    }
    
    return 'Next: Continue Installation';
  };

  const getButtonIcon = () => {
    if (phase === 'configuration' && config.usePrivateRegistry && !pushComplete) {
      return isPushing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ChevronRight className="w-5 h-5" />;
    }
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
              authError={authError}
              pushStatus={pushStatus}
              currentMessage={currentMessage}
              pushComplete={pushComplete}
              isUpgrade={text.mode === 'upgrade'}
            />
          ) : (
            <KubernetesSetup
              config={config}
              onRegistryChange={handleRegistryChange}
              onInputChange={handleInputChange}
              authError={authError}
              pushStatus={pushStatus}
              currentMessage={currentMessage}
              pushComplete={pushComplete}
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
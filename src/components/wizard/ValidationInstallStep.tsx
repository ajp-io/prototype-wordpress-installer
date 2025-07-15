import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useConfig } from '../../contexts/ConfigContext';
import { useWizardMode } from '../../contexts/WizardModeContext';
import { ValidationStatus, InstallationStatus } from '../../types';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import { setupInfrastructure } from '../../utils/infrastructure';
import { validateEnvironment } from '../../utils/validation';
import { installWordPress } from '../../utils/wordpress';
import InstallationProgress from './validation/InstallationProgress';
import LogViewer from './validation/LogViewer';
import StatusIndicator from './validation/StatusIndicator';
import ErrorMessage from './validation/ErrorMessage';

interface ValidationInstallStepProps {
  onNext: () => void;
}

type Phase = 'infrastructure' | 'validating' | 'installing';

const ValidationInstallStep: React.FC<ValidationInstallStepProps> = ({ onNext }) => {
  const { config, prototypeSettings } = useConfig();
  const { text } = useWizardMode();
  const [phase, setPhase] = useState<Phase>(prototypeSettings.clusterMode === 'embedded' ? 'infrastructure' : 'validating');
  const [installStatus, setInstallStatus] = useState<InstallationStatus>({
    openebs: 'pending',
    registry: 'pending',
    velero: 'pending',
    components: 'pending',
    database: 'pending',
    core: 'pending',
    plugins: 'pending',
    overall: 'pending',
    currentMessage: '',
    logs: [],
    progress: 0,
  });
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>({
    kubernetes: null,
    helm: null,
    storage: null,
    networking: null,
    permissions: null,
  });
  const [wordpressInstallComplete, setWordPressInstallComplete] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showPreflightModal, setShowPreflightModal] = useState(false);
  const [hasValidationFailures, setHasValidationFailures] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);
  const isLinuxMode = prototypeSettings.clusterMode === 'embedded';
  const themeColor = prototypeSettings.themeColor;
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    if (phase === 'infrastructure' && isLinuxMode) {
      startInfrastructureSetup();
    } else if (phase === 'validating') {
      startValidation();
    } else if (phase === 'installing') {
      startInstallation();
    }
  }, [phase]);

  const startInfrastructureSetup = async () => {
    try {
      await setupInfrastructure(config, (newStatus) => {
        setInstallStatus(prev => {
          const updatedStatus = { ...prev, ...newStatus };
          if (updatedStatus.overall === 'completed') {
            setTimeout(() => setPhase('validating'), 500);
          }
          return updatedStatus;
        });
      });
    } catch (error) {
      console.error('Infrastructure setup error:', error);
    }
  };

  const startValidation = async () => {
    setIsValidating(true);
    setValidationComplete(false);
    setHasValidationFailures(false);
    
    try {
      const results = await validateEnvironment(config);
      setValidationStatus(results);
      
      const allPassed = Object.values(results).every(
        (result) => result && result.success && !result.message.includes('warning')
      );
      
      const hasFailures = Object.values(results).some(
        (result) => result && !result.success
      );
      
      setHasValidationFailures(hasFailures);
      setValidationComplete(true);
      setIsValidating(false);
      
      // Only auto-proceed if all checks passed AND there are no failures
      if (allPassed && !hasFailures) {
        setTimeout(() => setPhase('installing'), 1000);
      }
    } catch (error) {
      console.error('Validation error:', error);
      setValidationComplete(true);
      setHasValidationFailures(true);
      setIsValidating(false);
    }
  };

  const startInstallation = async () => {
    try {
      await installWordPress(config, (newStatus) => {
        setInstallStatus((prev) => ({
          ...prev,
          ...newStatus,
          logs: [...prev.logs, ...(newStatus.logs || [])],
        }));
        
        if (newStatus.core === 'completed' && 
            newStatus.database === 'completed' && 
            newStatus.plugins === 'completed') {
          setWordPressInstallComplete(true);
        }
      });
    } catch (error) {
      console.error('Installation error:', error);
      setInstallStatus((prev) => ({
        ...prev,
        overall: 'failed',
        currentMessage: 'Installation failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
    }
  };

  const handleNextClick = () => {
    if (phase === 'validating') {
      // If we have validation failures and the skip setting is enabled, show modal
      if (hasValidationFailures && prototypeSettings.skipHostPreflights) {
        setShowPreflightModal(true);
      } else if (!hasValidationFailures) {
        // No failures, proceed normally
        setPhase('installing');
      }
      // If there are failures and skip is not enabled, button should be disabled (handled in canProceed)
    } else if (phase === 'installing' && wordpressInstallComplete) {
      onNext();
    }
  };

  const handleConfirmProceed = () => {
    setShowPreflightModal(false);
    setPhase('installing');
  };

  const handleCancelProceed = () => {
    setShowPreflightModal(false);
  };

  const renderInfrastructurePhase = () => (
    <div className="space-y-6">
      <InstallationProgress
        progress={installStatus.progress}
        currentMessage={installStatus.currentMessage}
        themeColor={themeColor}
        status={installStatus.overall === 'failed' ? 'failed' : undefined}
      />

      <div className="space-y-2 divide-y divide-gray-200">
        {[
          { key: 'openebs', name: 'Storage', status: installStatus.openebs },
          { key: 'registry', name: 'Registry', status: installStatus.registry },
          { key: 'velero', name: 'Disaster Recovery', status: installStatus.velero },
          { key: 'components', name: 'Additional Components', status: installStatus.components }
        ].map(({ key, name, status }) => (
          <StatusIndicator key={key} title={name} status={status} />
        ))}
      </div>

      <LogViewer
        title="Installation Logs"
        logs={installStatus.logs}
        isExpanded={showLogs}
        onToggle={() => setShowLogs(!showLogs)}
      />
    </div>
  );

  const renderValidationPhase = () => {
    // Show general validation indicator while running
    if (isValidating) {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 py-6">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 border-2 border-t-blue-500 rounded-full animate-spin" />
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">Running preflight checks...</h4>
              <p className="text-sm text-gray-600">Validating your environment meets all requirements</p>
            </div>
          </div>
        </div>
      );
    }

    // Show success message if all passed
    if (validationComplete && !hasValidationFailures) {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4 py-6">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-medium text-gray-900">All preflight checks passed</h4>
              <p className="text-sm text-gray-600">Your environment is ready for installation</p>
            </div>
          </div>
        </div>
      );
    }

    // Show only failed checks if validation completed with failures
    if (validationComplete && hasValidationFailures) {
      const failedChecks = [
        { key: 'kubernetes', name: 'Kubernetes Availability', status: validationStatus.kubernetes },
        { key: 'helm', name: 'Helm Installation', status: validationStatus.helm },
        { key: 'storage', name: 'Storage Classes', status: validationStatus.storage },
        { key: 'networking', name: 'Networking & Ingress', status: validationStatus.networking },
        { key: 'permissions', name: 'RBAC & Permissions', status: validationStatus.permissions }
      ].filter(({ status }) => status && !status.success);

      return (
        <div className="space-y-6">
          <div className="mb-4">
            <div className="flex items-center space-x-3 mb-4">
              <XCircle className="w-6 h-6 text-red-500" />
              <h4 className="text-lg font-medium text-gray-900">Preflight checks failed</h4>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              The following issues must be resolved before proceeding with the installation:
            </p>
          </div>

          <div className="space-y-4">
            {failedChecks.map(({ key, name, status }) => (
              <div key={key} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="text-sm font-medium text-red-800">{name}</h5>
                    <p className="text-sm text-red-700 mt-1">{status?.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button onClick={startValidation} variant="outline" size="sm">
              Retry Preflight Checks
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderInstallationPhase = () => (
    <div className="space-y-6">
      <InstallationProgress
        progress={installStatus.progress}
        currentMessage={installStatus.currentMessage}
        themeColor={themeColor}
        status={installStatus.overall === 'failed' ? 'failed' : undefined}
      />

      <div className="space-y-2 divide-y divide-gray-200">
        {[
          { key: 'database', name: 'Database Installation', status: installStatus.database },
          { key: 'core', name: 'WordPress Core Installation', status: installStatus.core },
          { key: 'plugins', name: 'Plugins & Extensions', status: installStatus.plugins }
        ].map(({ key, name, status }) => (
          <StatusIndicator key={key} title={name} status={status} />
        ))}
      </div>

      <LogViewer
        title="Installation Logs"
        logs={installStatus.logs}
        isExpanded={showLogs}
        onToggle={() => setShowLogs(!showLogs)}
      />

      {installStatus.error && <ErrorMessage error={installStatus.error} />}
    </div>
  );

  const canProceed = () => {
    if (phase === 'validating') {
      // Must wait for validation to complete first
      if (!validationComplete) return false;
      
      // If there are no failures, can always proceed
      if (!hasValidationFailures) return true;
      
      // If there are failures, can only proceed if skip setting is enabled
      return prototypeSettings.skipHostPreflights;
    }
    if (phase === 'installing') {
      return wordpressInstallComplete;
    }
    return false;
  };

  const getButtonText = () => {
    if (phase === 'validating' && !validationComplete) {
      return 'Running Checks...';
    }
    if (phase === 'installing') {
      return 'Next: Finish';
    }
    return 'Next: Start Installation';
  };

  const getPhaseDescription = () => {
    switch (phase) {
      case 'infrastructure':
        return 'Installing infrastructure components';
      case 'validating':
        return isValidating 
          ? 'Running preflight checks...' 
          : hasValidationFailures 
            ? 'Preflight checks failed - please resolve issues to continue'
            : 'Environment validation complete';
      case 'installing':
        return 'Installing WordPress Enterprise';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleNextClick}
          disabled={!canProceed()}
          icon={<ChevronRight className="w-5 h-5" />}
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
              Some validation checks have failed. Are you sure you want to continue with the installation? 
              This may cause installation issues.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ValidationInstallStep;
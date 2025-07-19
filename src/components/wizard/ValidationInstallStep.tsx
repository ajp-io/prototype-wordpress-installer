import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useConfig } from '../../contexts/ConfigContext';
import { useWizardMode } from '../../contexts/WizardModeContext';
import { ValidationStatus, InstallationStatus } from '../../types';
import { ChevronRight, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { setupInfrastructure } from '../../utils/infrastructure';
import { validateEnvironment } from '../../utils/validation';
import { installWordPress } from '../../utils/wordpress';
import K0sInstallation from './setup/K0sInstallation';
import InstallationProgress from './validation/InstallationProgress';
import LogViewer from './validation/LogViewer';
import StatusIndicator from './validation/StatusIndicator';
import ErrorMessage from './validation/ErrorMessage';

interface ValidationInstallStepProps {
  onNext: () => void;
}

type Phase = 'hosts' | 'infrastructure' | 'validating' | 'installing';

const ValidationInstallStep: React.FC<ValidationInstallStepProps> = ({ onNext }) => {
  const { config, prototypeSettings } = useConfig();
  const { text } = useWizardMode();
  const [phase, setPhase] = useState<Phase>(prototypeSettings.clusterMode === 'embedded' ? 'hosts' : 'validating');
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
  const [hostsComplete, setHostsComplete] = useState(false);
  const [hasHostFailures, setHasHostFailures] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);
  const [hostInstallationComplete, setHostInstallationComplete] = useState(false);
  const isLinuxMode = prototypeSettings.clusterMode === 'embedded';
  const themeColor = prototypeSettings.themeColor;

  useEffect(() => {
    if (phase === 'hosts' && isLinuxMode) {
      // Hosts phase is handled by K0sInstallation component
    } else if (phase === 'infrastructure' && isLinuxMode) {
      startInfrastructureSetup();
    } else if (phase === 'validating') {
      startValidation();
    } else if (phase === 'installing') {
      startInstallation();
    }
  }, [phase]);

  const handleHostsComplete = (hasFailures: boolean = false) => {
    setHostInstallationComplete(true);
    setHasHostFailures(hasFailures);
  };

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
      
      // No longer auto-proceed - user must click Next even when checks pass
    } catch (error) {
      console.error('Validation error:', error);
      setValidationComplete(true);
      setHasValidationFailures(true);
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
    if (phase === 'hosts') {
      // User manually proceeds from hosts to infrastructure
      if (hasHostFailures && !prototypeSettings.skipHostPreflights) {
        setShowPreflightModal(true);
      } else {
        setPhase('infrastructure');
      }
    } else if (phase === 'validating') {
      // If we have validation failures and the block setting is NOT enabled, show modal
      if (hasValidationFailures && !prototypeSettings.blockOnAppPreflights) {
        setShowPreflightModal(true);
      } else if (!hasValidationFailures) {
        // No failures, proceed normally
        setPhase('installing');
      }
      // If there are failures and block is enabled, button should be disabled (handled in canProceed)
    } else if (phase === 'installing' && wordpressInstallComplete) {
      onNext();
    }
  };

  const handleConfirmProceed = () => {
    setShowPreflightModal(false);
    if (phase === 'hosts') {
      setPhase('infrastructure');
    } else {
      setPhase('installing');
    }
  };

  const handleCancelProceed = () => {
    setShowPreflightModal(false);
  };

  const renderHostsPhase = () => (
    <div className="space-y-6">
      <K0sInstallation onComplete={handleHostsComplete} />
    </div>
  );

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

  const renderValidationPhase = () => (
    <div className="space-y-6">
      {!validationComplete ? (
        <div className="flex flex-col items-center py-8">
          <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Running Preflight Checks</h3>
          <p className="text-sm text-gray-600 text-center max-w-md">
            Validating your environment to ensure it meets all requirements for WordPress Enterprise installation.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {hasValidationFailures ? (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-700">
                  Preflight checks failed. Please resolve the issues before proceeding with the installation.
                </p>
              </div>
              
              <div className="space-y-3">
                {Object.entries(validationStatus)
                  .filter(([_, result]) => result && !result.success)
                  .map(([key, result]) => {
                    const checkNames = {
                      kubernetes: 'Kubernetes Availability',
                      helm: 'Helm Installation',
                      storage: 'Storage Classes & PV Provisioning',
                      networking: 'Networking & Ingress',
                      permissions: 'RBAC & Permissions'
                    };
                    
                    return (
                      <div key={key} className="flex items-start">
                        <XCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-red-800">
                            {checkNames[key as keyof typeof checkNames] || key}
                          </h4>
                          <p className="mt-1 text-sm text-red-700">{result?.message}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Preflight Checks Passed</h3>
                  <p className="mt-1 text-sm text-green-700">
                    All preflight checks passed successfully. Your environment is ready for WordPress Enterprise installation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

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
    if (phase === 'hosts') {
      if (!hostInstallationComplete) return false;
      
      // If there are no failures, can always proceed
      if (!hasHostFailures) return true;
      
      // If there are failures, can only proceed if skip setting is enabled
      return prototypeSettings.skipHostPreflights;
    }
    
    if (phase === 'validating') {
      // Must wait for validation to complete first
      if (!validationComplete) return false;
      
      // If there are no failures, can always proceed
      if (!hasValidationFailures) return true;
      
      // If there are failures, can only proceed if block setting is NOT enabled
      return !prototypeSettings.blockOnAppPreflights;
    }
    if (phase === 'installing') {
      return wordpressInstallComplete;
    }
    return false;
  };

  const getButtonText = () => {
    if (phase === 'hosts') {
      return hostInstallationComplete ? 'Next: Install Infrastructure' : 'Installing...';
    } else if (phase === 'installing') {
      return 'Next: Finish';
    }
    return prototypeSettings.clusterMode === 'embedded' 
      ? 'Next: Continue Installation'
      : 'Next: Start Installation';
  };

  const getPhaseDescription = () => {
    switch (phase) {
      case 'hosts':
        return 'Setting up hosts and installing k0s';
      case 'infrastructure':
        return 'Installing infrastructure components';
      case 'validating':
        return 'Checking if your environment meets all requirements';
      case 'installing':
        return 'Installing WordPress Enterprise';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Installation</h2>
          <p className="text-gray-600 mt-1">{getPhaseDescription()}</p>
        </div>

        {phase === 'hosts' && renderHostsPhase()}
        {phase === 'infrastructure' && renderInfrastructurePhase()}
        {phase === 'validating' && renderValidationPhase()}
        {phase === 'installing' && renderInstallationPhase()}
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
              {phase === 'hosts' 
                ? 'Some host preflight checks failed. Are you sure you want to continue with the installation? Installation issues are likely to occur.'
                : 'Some preflight checks have failed. Are you sure you want to continue with the installation? This may cause installation issues.'}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ValidationInstallStep;
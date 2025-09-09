import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { ChevronRight, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import K0sInstallation from './setup/K0sInstallation';
import InstallationProgress from './validation/InstallationProgress';
import LogViewer from './validation/LogViewer';
import StatusIndicator from './validation/StatusIndicator';
import ErrorMessage from './validation/ErrorMessage';
import { useValidationInstallFlow } from '../../hooks/useValidationInstallFlow';
import { useValidationInstallNavigation } from '../../hooks/useValidationInstallNavigation';
import { useConfig } from '../../contexts/ConfigContext';

interface ValidationInstallStepProps {
  onNext: () => void;
}

const ValidationInstallStep: React.FC<ValidationInstallStepProps> = ({ onNext }) => {
  const { prototypeSettings } = useConfig();
  const themeColor = prototypeSettings.themeColor;

  const {
    phase,
    installStatus,
    validationStatus,
    wordpressInstallComplete,
    hasValidationFailures,
    hasHostFailures,
    validationComplete,
    hostInstallationComplete,
    isLinuxMode,
    handleHostsComplete,
    startValidation,
    proceedToNextPhase,
  } = useValidationInstallFlow();

  const {
    canProceed,
    getButtonText,
    shouldShowPreflightModal,
    getPhaseDescription,
  } = useValidationInstallNavigation({
    phase,
    hostInstallationComplete,
    hasHostFailures,
    validationComplete,
    hasValidationFailures,
    wordpressInstallComplete,
  });

  const [showLogs, setShowLogs] = useState(false);
  const [showPreflightModal, setShowPreflightModal] = useState(false);

  const handleNextClick = () => {
    const shouldShowModal = shouldShowPreflightModal(phase, hasValidationFailures, hasHostFailures);
    
    if (shouldShowModal) {
      setShowPreflightModal(true);
    } else if (phase === 'installing' && wordpressInstallComplete) {
      onNext();
    } else {
      proceedToNextPhase();
    }
  };

  const handleConfirmProceed = () => {
    setShowPreflightModal(false);
    if (phase === 'installing' && wordpressInstallComplete) {
      onNext();
    } else {
      proceedToNextPhase();
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
          
          <div className="mt-6">
            <Button onClick={startValidation} variant="outline" size="sm">
              Revalidate Environment
            </Button>
          </div>
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

  const renderPhaseContent = () => {
    switch (phase) {
      case 'hosts':
        return renderHostsPhase();
      case 'infrastructure':
        return renderInfrastructurePhase();
      case 'validating':
        return renderValidationPhase();
      case 'installing':
        return renderInstallationPhase();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Installation</h2>
          <p className="text-gray-600 mt-1">{getPhaseDescription(phase)}</p>
        </div>

        {renderPhaseContent()}
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
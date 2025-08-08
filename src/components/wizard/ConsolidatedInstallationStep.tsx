import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useConfig } from '../../contexts/ConfigContext';
import { useWizardMode } from '../../contexts/WizardModeContext';
import { ValidationStatus, InstallationStatus } from '../../types';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import { installInfrastructure } from '../../utils/infrastructure';
import { validateEnvironment } from '../../utils/validation';
import { installWordPress } from '../../utils/wordpress';
import InstallationTimeline, { InstallationStep, StepStatus } from './installation/InstallationTimeline';
import StepDetailPanel from './installation/StepDetailPanel';
import LogViewer from './validation/LogViewer';
import K0sInstallation from './setup/K0sInstallation';

interface ConsolidatedInstallationStepProps {
  onNext: () => void;
}

const ConsolidatedInstallationStep: React.FC<ConsolidatedInstallationStepProps> = ({ onNext }) => {
  const { config, prototypeSettings } = useConfig();
  const { text } = useWizardMode();
  const isLinuxMode = prototypeSettings.clusterMode === 'embedded';
  const themeColor = prototypeSettings.themeColor;

  const [currentStep, setCurrentStep] = useState<InstallationStep>(
    isLinuxMode ? 'hosts' : 'preflights'
  );
  
  const [selectedStep, setSelectedStep] = useState<InstallationStep>(
    isLinuxMode ? 'hosts' : 'preflights'
  );
  
  const [steps, setSteps] = useState<Record<InstallationStep, StepStatus>>({
    hosts: {
      status: isLinuxMode ? 'running' : 'pending',
      title: 'Runtime Installation',
      description: 'Installing runtime on the host',
      progress: 0
    },
    infrastructure: {
      status: 'pending',
      title: 'Infrastructure Installation',
      description: 'Installing infrastructure components',
      progress: 0
    },
    preflights: {
      status: 'pending',
      title: 'Preflight Checks',
      description: 'Validating environment requirements',
      progress: 0
    },
    application: {
      status: 'pending',
      title: 'WordPress Installation',
      description: 'Installing Wordpress Enterprise components',
      progress: 0
    }
  });

  const [infrastructureStatus, setInfrastructureStatus] = useState<InstallationStatus>({
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

  const [applicationStatus, setApplicationStatus] = useState<InstallationStatus>({
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

  const [validationResults, setValidationResults] = useState<ValidationStatus>({
    kubernetes: null,
    helm: null,
    storage: null,
    networking: null,
    permissions: null,
  });

  const [showLogs, setShowLogs] = useState(false);
  const [showPreflightModal, setShowPreflightModal] = useState(false);
  const [allLogs, setAllLogs] = useState<string[]>([]);
  const [installationComplete, setInstallationComplete] = useState(false);
  const [hostsComplete, setHostsComplete] = useState(false);
  const [hasHostFailures, setHasHostFailures] = useState(false);

  // Start the appropriate first step
  useEffect(() => {
    if (isLinuxMode) {
      startRuntimeInstallation();
    } else {
      startPreflightChecks();
    }
    
    // Set up global rerun function for preflights
    window.rerunPreflights = () => {
      startPreflightChecks();
    };
    
    return () => {
      delete window.rerunPreflights;
    };
  }, []);

  const updateStepStatus = (step: InstallationStep, updates: Partial<StepStatus>) => {
    setSteps(prev => ({
      ...prev,
      [step]: { ...prev[step], ...updates }
    }));
  };

  const handleStepClick = (step: InstallationStep) => {
    // Only allow clicking on steps that have started (not pending)
    if (steps[step].status !== 'pending') {
      setSelectedStep(step);
    }
  };

  // Auto-update selected step when current step changes
  useEffect(() => {
    setSelectedStep(currentStep);
  }, [currentStep]);

  const addToAllLogs = (newLogs: string[]) => {
    setAllLogs(prev => [...prev, ...newLogs]);
  };

  const startRuntimeInstallation = async () => {
    updateStepStatus('hosts', { status: 'running' });
    setCurrentStep('hosts');
    // Runtime installation is handled by the K0sInstallation component
  };

  const handleHostsComplete = (hasFailures: boolean = false) => {
    setHostsComplete(true);
    setHasHostFailures(hasFailures);
    // Keep status as 'running' until user manually proceeds to next step
    // Don't auto-proceed - let user manually click Next when ready
  };

  const startInfrastructureInstallation = async () => {
    updateStepStatus('infrastructure', { status: 'running' });
    setCurrentStep('infrastructure');

    try {
      await installInfrastructure(config, (newStatus) => {
        setInfrastructureStatus(prev => {
          const updated = { ...prev, ...newStatus };
          updateStepStatus('infrastructure', { progress: updated.progress });
          
          if (newStatus.logs) {
            addToAllLogs(newStatus.logs);
          }
          
          return updated;
        });
      });

      updateStepStatus('infrastructure', { status: 'completed' });
      
      // Auto-proceed to preflights
      setTimeout(() => {
        startPreflightChecks();
      }, 500);

    } catch (error) {
      console.error('Infrastructure installation error:', error);
      updateStepStatus('infrastructure', { 
        status: 'failed', 
        error: 'Infrastructure installation failed' 
      });
    }
  };

  const startPreflightChecks = async () => {
    updateStepStatus('preflights', { status: 'running' });
    setCurrentStep('preflights');

    try {
      const results = await validateEnvironment(config);
      setValidationResults(results);
      
      const hasFailures = Object.values(results).some(
        (result) => result && !result.success
      );

      if (hasFailures) {
        updateStepStatus('preflights', { 
          status: 'warning',
          error: 'Some preflight checks failed'
        });
      } else {
        updateStepStatus('preflights', { status: 'completed' });
        
        // Auto-proceed to application installation
        setTimeout(() => {
          startApplicationInstallation();
        }, 500);
      }
    } catch (error) {
      console.error('Preflight validation error:', error);
      updateStepStatus('preflights', { 
        status: 'failed',
        error: 'Preflight validation failed'
      });
    }
  };

  const startApplicationInstallation = async () => {
    updateStepStatus('application', { status: 'running' });
    setCurrentStep('application');

    try {
      await installWordPress(config, (newStatus) => {
        setApplicationStatus(prev => {
          const updated = { ...prev, ...newStatus };
          updateStepStatus('application', { progress: updated.progress });
          
          if (newStatus.logs) {
            addToAllLogs(newStatus.logs);
          }
          
          if (updated.core === 'completed' && 
              updated.database === 'completed' && 
              updated.plugins === 'completed') {
            setInstallationComplete(true);
            updateStepStatus('application', { status: 'completed' });
          }
          
          return updated;
        });
      });
    } catch (error) {
      console.error('Application installation error:', error);
      updateStepStatus('application', { 
        status: 'failed',
        error: 'WordPress installation failed'
      });
    }
  };

  const handleConfirmProceed = () => {
    setShowPreflightModal(false);
    startApplicationInstallation();
  };

  const handleCancelProceed = () => {
    setShowPreflightModal(false);
  };

  const canProceed = () => {
    if (isLinuxMode) {
      // For Linux mode, check which step we're on
      if (currentStep === 'hosts') {
        return hostsComplete && !hasHostFailures; // Can proceed only if complete AND no failures
      } else if (currentStep === 'infrastructure') {
        return steps.infrastructure.status === 'completed';
      } else if (currentStep === 'preflights') {
        return steps.preflights.status === 'completed' || !prototypeSettings.blockOnAppPreflights;
      } else if (currentStep === 'application') {
        return installationComplete;
      }
    } else {
      // For Kubernetes mode
      if (currentStep === 'preflights') {
        return steps.preflights.status === 'completed' || !prototypeSettings.blockOnAppPreflights;
      } else if (currentStep === 'application') {
        return installationComplete;
      }
    }
    return false;
  };

  const handleNextClick = () => {
    if (currentStep === 'hosts') {
      // Mark hosts as completed when user clicks Next
      updateStepStatus('hosts', { status: 'completed' });
      startInfrastructureInstallation();
    } else if (currentStep === 'infrastructure') {
      startPreflightChecks();
    } else if (currentStep === 'preflights') {
      // Check if there are failures and show modal if needed
      const hasFailures = Object.values(validationResults).some(
        (result) => result && !result.success
      );
      
      if (hasFailures && !prototypeSettings.blockOnAppPreflights) {
        setShowPreflightModal(true);
      } else {
        startApplicationInstallation();
      }
    } else if (currentStep === 'application') {
      onNext(); // Go to completion step
    }
  };

  const shouldShowNextButton = () => {
    if (currentStep === 'hosts') {
      return hostsComplete && !hasHostFailures; // Only show if complete AND no failures
    } else if (currentStep === 'infrastructure') {
      return steps.infrastructure.status === 'failed'; // Only show if failed
    } else if (currentStep === 'preflights') {
      return steps.preflights.status === 'completed' || 
             (steps.preflights.status === 'warning' && !prototypeSettings.blockOnAppPreflights);
    } else if (currentStep === 'application') {
      return installationComplete; // Always show when complete
    }
    return false;
  };

  const getNextButtonText = () => {
    if (currentStep === 'hosts') {
      return 'Next: Infrastructure Installation';
    } else if (currentStep === 'infrastructure') {
      return 'Retry Infrastructure Installation';
    } else if (currentStep === 'preflights') {
      const hasFailures = Object.values(validationResults).some(
        (result) => result && !result.success
      );
      return hasFailures ? 'Next: WordPress Installation' : 'Next: WordPress Installation';
    } else if (currentStep === 'application') {
      return 'Next: Completion';
    }
    return 'Next';
  };

  return (
    <div className="space-y-6">
      <Card className="p-0 overflow-hidden">
        <div className="flex min-h-[600px]">
          <InstallationTimeline
            steps={steps}
            currentStep={currentStep}
            selectedStep={selectedStep}
            onStepClick={handleStepClick}
            isLinuxMode={isLinuxMode}
            themeColor={themeColor}
          />
          
          <div className="flex-1">
            <StepDetailPanel
              selectedStep={selectedStep}
              stepData={steps[selectedStep]}
              infrastructureStatus={infrastructureStatus}
              preflightResults={validationResults}
              applicationStatus={applicationStatus}
              themeColor={themeColor}
              onHostsComplete={handleHostsComplete}
            />
          </div>
        </div>
        
        <div className="border-t border-gray-200 p-6">
          <LogViewer
            title="Installation Logs"
            logs={allLogs}
            isExpanded={showLogs}
            onToggle={() => setShowLogs(!showLogs)}
          />
        </div>
      </Card>

      <div className="flex justify-end">
        {shouldShowNextButton() && (
          <Button
            onClick={handleNextClick}
            disabled={!canProceed()}
            icon={<ChevronRight className="w-5 h-5" />}
            variant={currentStep === 'preflights' ? 'danger' : 'primary'}
          >
            {getNextButtonText()}
          </Button>
        )}
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
              Some preflight checks have failed. Are you sure you want to continue with the installation? This may cause installation issues.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ConsolidatedInstallationStep;
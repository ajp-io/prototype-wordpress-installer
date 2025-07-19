import React, { useState, useEffect } from 'react';
import Card from '../../common/Card';
import Button from '../../common/Button';
import Modal from '../../common/Modal';
import { useConfig } from '../../../contexts/ConfigContext';
import { useWizardMode } from '../../../contexts/WizardModeContext';
import { ValidationStatus, InstallationStatus } from '../../../types';
import { ChevronRight, AlertTriangle } from 'lucide-react';
import { setupInfrastructure } from '../../../utils/infrastructure';
import { validateEnvironment } from '../../../utils/validation';
import { installWordPress } from '../../../utils/wordpress';
import InstallationTimeline, { InstallationStep } from './InstallationTimeline';
import StepDetailPanel from './StepDetailPanel';
import LogViewer from '../validation/LogViewer';
import ErrorMessage from '../validation/ErrorMessage';

interface ConsolidatedInstallationStepProps {
  onNext: () => void;
}

const ConsolidatedInstallationStep: React.FC<ConsolidatedInstallationStepProps> = ({ onNext }) => {
  const { config, prototypeSettings } = useConfig();
  const { text } = useWizardMode();
  const isLinuxMode = prototypeSettings.clusterMode === 'embedded';
  
  // Installation state
  const [currentStepId, setCurrentStepId] = useState<string>('');
  const [installationStatus, setInstallationStatus] = useState<InstallationStatus>({
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
  
  // Validation state
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>({
    kubernetes: null,
    helm: null,
    storage: null,
    networking: null,
    permissions: null,
  });
  const [validationResults, setValidationResults] = useState<{
    totalChecks: number;
    passedChecks: number;
    failedChecks: Array<{ name: string; message: string }>;
  } | null>(null);
  
  // UI state
  const [showLogs, setShowLogs] = useState(false);
  const [showPreflightModal, setShowPreflightModal] = useState(false);
  const [installationComplete, setInstallationComplete] = useState(false);
  
  // Define steps based on installation mode
  const getInstallationSteps = (): InstallationStep[] => {
    const baseSteps: InstallationStep[] = [
      {
        id: 'preflights',
        name: 'Preflight Checks',
        status: 'pending',
        description: 'Validating environment requirements'
      },
      {
        id: 'application',
        name: 'WordPress Installation',
        status: 'pending',
        description: 'Installing WordPress Enterprise'
      }
    ];

    if (isLinuxMode) {
      return [
        {
          id: 'infrastructure',
          name: 'Infrastructure Setup',
          status: 'pending',
          description: 'Installing required infrastructure components'
        },
        ...baseSteps
      ];
    }

    return baseSteps;
  };

  const [steps, setSteps] = useState<InstallationStep[]>(getInstallationSteps());

  // Initialize first step
  useEffect(() => {
    const firstStep = steps[0];
    setCurrentStepId(firstStep.id);
    updateStepStatus(firstStep.id, 'running');
    
    if (firstStep.id === 'infrastructure') {
      startInfrastructureSetup();
    } else if (firstStep.id === 'preflights') {
      startValidation();
    }
  }, []);

  const updateStepStatus = (stepId: string, status: 'pending' | 'running' | 'completed' | 'failed') => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const moveToNextStep = () => {
    const currentIndex = steps.findIndex(step => step.id === currentStepId);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setCurrentStepId(nextStep.id);
      updateStepStatus(nextStep.id, 'running');
      
      if (nextStep.id === 'preflights') {
        startValidation();
      } else if (nextStep.id === 'application') {
        startApplicationInstallation();
      }
    } else {
      setInstallationComplete(true);
    }
  };

  const startInfrastructureSetup = async () => {
    try {
      await setupInfrastructure(config, (newStatus) => {
        setInstallationStatus(prev => {
          const updatedStatus = { ...prev, ...newStatus };
          if (updatedStatus.overall === 'completed') {
            updateStepStatus('infrastructure', 'completed');
            setTimeout(() => moveToNextStep(), 500);
          } else if (updatedStatus.overall === 'failed') {
            updateStepStatus('infrastructure', 'failed');
          }
          return updatedStatus;
        });
      });
    } catch (error) {
      console.error('Infrastructure setup error:', error);
      updateStepStatus('infrastructure', 'failed');
    }
  };

  const startValidation = async () => {
    try {
      const results = await validateEnvironment(config);
      setValidationStatus(results);
      
      // Process validation results
      const checkNames = {
        kubernetes: 'Kubernetes Availability',
        helm: 'Helm Installation',
        storage: 'Storage Classes & PV Provisioning',
        networking: 'Networking & Ingress',
        permissions: 'RBAC & Permissions'
      };
      
      const failedChecks = Object.entries(results)
        .filter(([_, result]) => result && !result.success)
        .map(([key, result]) => ({
          name: checkNames[key as keyof typeof checkNames] || key,
          message: result?.message || ''
        }));
      
      const totalChecks = Object.keys(results).length;
      const passedChecks = totalChecks - failedChecks.length;
      
      setValidationResults({
        totalChecks,
        passedChecks,
        failedChecks
      });
      
      if (failedChecks.length === 0) {
        updateStepStatus('preflights', 'completed');
        setTimeout(() => moveToNextStep(), 500);
      } else {
        updateStepStatus('preflights', 'failed');
        if (!prototypeSettings.blockOnAppPreflights) {
          // Show modal to allow proceeding
          setShowPreflightModal(true);
        }
      }
    } catch (error) {
      console.error('Validation error:', error);
      updateStepStatus('preflights', 'failed');
    }
  };

  const startApplicationInstallation = async () => {
    try {
      await installWordPress(config, (newStatus) => {
        setInstallationStatus((prev) => ({
          ...prev,
          ...newStatus,
          logs: [...prev.logs, ...(newStatus.logs || [])],
        }));
        
        if (newStatus.core === 'completed' && 
            newStatus.database === 'completed' && 
            newStatus.plugins === 'completed') {
          updateStepStatus('application', 'completed');
          setInstallationComplete(true);
        } else if (newStatus.overall === 'failed') {
          updateStepStatus('application', 'failed');
        }
      });
    } catch (error) {
      console.error('Installation error:', error);
      updateStepStatus('application', 'failed');
      setInstallationStatus((prev) => ({
        ...prev,
        overall: 'failed',
        currentMessage: 'Installation failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }));
    }
  };

  const handleConfirmProceed = () => {
    setShowPreflightModal(false);
    updateStepStatus('preflights', 'completed');
    moveToNextStep();
  };

  const handleCancelProceed = () => {
    setShowPreflightModal(false);
  };

  const canProceed = () => {
    return installationComplete;
  };

  const getCurrentStep = () => {
    return steps.find(step => step.id === currentStepId);
  };

  const currentStep = getCurrentStep();

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="flex min-h-[600px]">
          <InstallationTimeline steps={steps} activeStepId={currentStepId} />
          
          <StepDetailPanel
            stepId={currentStepId}
            stepName={currentStep?.name || ''}
            stepStatus={currentStep?.status || 'pending'}
            installationStatus={installationStatus}
            validationStatus={validationStatus}
            validationResults={validationResults}
          />
        </div>
      </Card>

      <LogViewer
        title="Installation Logs"
        logs={installationStatus.logs}
        isExpanded={showLogs}
        onToggle={() => setShowLogs(!showLogs)}
      />

      {installationStatus.error && <ErrorMessage error={installationStatus.error} />}

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!canProceed()}
          icon={<ChevronRight className="w-5 h-5" />}
        >
          Next: Finish
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
              Some preflight checks have failed. Are you sure you want to continue with the installation? This may cause installation issues.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ConsolidatedInstallationStep;
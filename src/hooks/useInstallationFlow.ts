import { useState, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { useWizardMode } from '../contexts/WizardModeContext';
import { ValidationStatus, InstallationStatus } from '../types';
import { installInfrastructure } from '../utils/infrastructure';
import { validateEnvironment } from '../utils/validation';
import { installWordPress } from '../utils/wordpress';
import { InstallationStep, StepStatus } from '../components/wizard/installation/InstallationTimeline';

export const useInstallationFlow = () => {
  const { config, prototypeSettings } = useConfig();
  const { mode } = useWizardMode();
  const isLinuxMode = prototypeSettings.clusterMode === 'embedded';
  const isUpgrade = mode === 'upgrade';

  const [currentStep, setCurrentStep] = useState<InstallationStep>(
    isLinuxMode ? 'hosts' : 'preflights'
  );
  
  const [selectedStep, setSelectedStep] = useState<InstallationStep>(
    isLinuxMode ? 'hosts' : 'preflights'
  );
  
  const [steps, setSteps] = useState<Record<InstallationStep, StepStatus>>({
    hosts: {
      status: isLinuxMode ? 'running' : 'pending',
      title: isUpgrade ? 'Runtime Upgrade' : 'Runtime Installation',
      description: isUpgrade ? 'Upgrading runtime on the host' : 'Installing runtime on the host',
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
      title: 'WordPress Enterprise Installation',
      description: 'Installing WordPress Enterprise components',
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

  const [installationComplete, setInstallationComplete] = useState(false);
  const [hostsComplete, setHostsComplete] = useState(false);
  const [hasHostFailures, setHasHostFailures] = useState(false);
  const [allRequiredNodesMet, setAllRequiredNodesMet] = useState(false);

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

  const startRuntimeInstallation = async () => {
    updateStepStatus('hosts', { status: 'running' });
    setCurrentStep('hosts');
    // Runtime installation is handled by the K0sInstallation component
  };

  const handleHostsComplete = (hasFailures: boolean = false) => {
    setHostsComplete(true);
    setHasHostFailures(hasFailures);
    
    // For role-based installations, hasFailures indicates whether all required nodes are met
    // (inverted logic: hasFailures = true means not all nodes are met)
    if (prototypeSettings.useNodeRoles && prototypeSettings.enableMultiNode) {
      setAllRequiredNodesMet(!hasFailures);
    } else {
      setAllRequiredNodesMet(true); // For non-role-based installations, always consider requirements met
    }
    
    console.log('handleHostsComplete called:', { 
      hasFailures, 
      enableMultiNode: prototypeSettings.enableMultiNode,
      skipNodeValidation: prototypeSettings.skipNodeValidation 
    });
    
    // Auto-proceed conditions:
    // 1. Single-node successful installations (no failures and single-node mode)
    // 2. skipNodeValidation is enabled (regardless of failures or node count)
    const shouldAutoProceed = (!hasFailures && !prototypeSettings.enableMultiNode) || prototypeSettings.skipNodeValidation;
    
    console.log('shouldAutoProceed:', shouldAutoProceed);
    
    if (shouldAutoProceed) {
      // Mark hosts as completed and auto-proceed to infrastructure
      updateStepStatus('hosts', { status: 'completed' });
      console.log('Auto-proceeding to infrastructure installation');
      setTimeout(() => {
        startInfrastructureInstallation();
      }, 100);
    } else {
      // For multi-node or failed installations, keep status as 'running' until user manually proceeds
      // Don't auto-proceed - let user manually click Next when ready
      console.log('Not auto-proceeding, waiting for manual action');
    }
  };

  const startInfrastructureInstallation = async () => {
    // Mark hosts as completed when starting infrastructure
    updateStepStatus('hosts', { status: 'completed' });
    updateStepStatus('infrastructure', { status: 'running' });
    setCurrentStep('infrastructure');

    try {
      await installInfrastructure(config, (newStatus) => {
        setInfrastructureStatus(prev => {
          const updated = { ...prev, ...newStatus };
          updateStepStatus('infrastructure', { progress: updated.progress });
          
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

  return {
    // State
    currentStep,
    selectedStep,
    steps,
    infrastructureStatus,
    applicationStatus,
    validationResults,
    installationComplete,
    hostsComplete,
    hasHostFailures,
    allRequiredNodesMet,
    isLinuxMode,
    
    // Actions
    setSelectedStep: handleStepClick,
    startRuntimeInstallation,
    handleHostsComplete,
    startInfrastructureInstallation,
    startPreflightChecks,
    startApplicationInstallation,
  };
};
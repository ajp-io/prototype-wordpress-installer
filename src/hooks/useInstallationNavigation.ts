import { useConfig } from '../contexts/ConfigContext';
import { ValidationStatus } from '../types';
import { InstallationStep, StepStatus } from '../components/wizard/installation/InstallationTimeline';

interface UseInstallationNavigationProps {
  currentStep: InstallationStep;
  steps: Record<InstallationStep, StepStatus>;
  validationResults: ValidationStatus;
  installationComplete: boolean;
  hostsComplete: boolean;
  hasHostFailures: boolean;
  allRequiredNodesMet: boolean;
  isLinuxMode: boolean;
}

export const useInstallationNavigation = ({
  currentStep,
  steps,
  validationResults,
  installationComplete,
  hostsComplete,
  hasHostFailures,
  allRequiredNodesMet,
  isLinuxMode,
}: UseInstallationNavigationProps) => {
  const { prototypeSettings } = useConfig();

  const hasStrictPreflightFailures = () => {
    return Object.values(validationResults).some(
      (result) => result && !result.success && result.isStrict
    );
  };

  const canProceed = () => {
    if (isLinuxMode) {
      // For Linux mode, check which step we're on
      if (currentStep === 'hosts') {
        // Can proceed if hosts are complete and either no failures or skip setting enabled
        return hostsComplete && (!hasHostFailures || prototypeSettings.skipHostPreflights);
      } else if (currentStep === 'infrastructure') {
        return steps.infrastructure.status === 'completed';
      } else if (currentStep === 'preflights') {
        // Cannot proceed if there are strict preflight failures
        if (hasStrictPreflightFailures()) {
          return false;
        }
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

  const shouldShowNextButton = () => {
    if (currentStep === 'hosts') {
      // For single-node, never show Next button since it auto-proceeds
      // For multi-node, show Next button when complete and no failures
      if (prototypeSettings.enableMultiNode) {
        // Show button when hosts are complete
        return hostsComplete;
      }
      return false; // Single-node never shows button
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
      return 'Next: WordPress Enterprise Installation';
    } else if (currentStep === 'application') {
      return 'Next: Finish';
    }
    return 'Next';
  };

  const shouldShowPreflightModal = () => {
    if (currentStep !== 'preflights') return false;
    
    // Don't show modal if there are strict failures (user can't proceed anyway)
    if (hasStrictPreflightFailures()) {
      return false;
    }
    
    const hasNonStrictFailures = Object.values(validationResults).some(
      (result) => result && !result.success
    );
    
    return hasNonStrictFailures && !prototypeSettings.blockOnAppPreflights;
  };

  return {
    canProceed,
    shouldShowNextButton,
    getNextButtonText,
    shouldShowPreflightModal,
  };
};
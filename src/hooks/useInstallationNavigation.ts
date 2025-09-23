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
        if (prototypeSettings.useNodeRoles && prototypeSettings.enableMultiNode) {
          // For role-based installations, can only proceed when all required nodes are met
          return hostsComplete && allRequiredNodesMet;
        } else {
          // For non-role-based installations, can proceed if complete and no failures
          return hostsComplete && !hasHostFailures;
        }
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
        if (prototypeSettings.useNodeRoles) {
          // For role-based installations, show button only when all required nodes are met
          return hostsComplete && allRequiredNodesMet;
        } else {
          // For non-role-based installations, show button when complete and no failures
          return hostsComplete && !hasHostFailures;
        }
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
      return 'Next: Completion';
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
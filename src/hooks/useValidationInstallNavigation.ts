import { useConfig } from '../contexts/ConfigContext';

type Phase = 'hosts' | 'infrastructure' | 'validating' | 'installing';

interface UseValidationInstallNavigationProps {
  phase: Phase;
  hostInstallationComplete: boolean;
  hasHostFailures: boolean;
  validationComplete: boolean;
  hasValidationFailures: boolean;
  wordpressInstallComplete: boolean;
}

export const useValidationInstallNavigation = ({
  phase,
  hostInstallationComplete,
  hasHostFailures,
  validationComplete,
  hasValidationFailures,
  wordpressInstallComplete,
}: UseValidationInstallNavigationProps) => {
  const { prototypeSettings } = useConfig();

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
      return hostInstallationComplete ? 'Next: Infrastructure Installation' : 'Installing...';
    } else if (phase === 'installing') {
      return 'Next: Finish';
    }
    return prototypeSettings.clusterMode === 'embedded' 
      ? 'Next: Continue Installation'
      : 'Next: Start Installation';
  };

  const shouldShowPreflightModal = (phase: Phase, hasValidationFailures: boolean, hasHostFailures: boolean) => {
    if (phase === 'hosts') {
      return hasHostFailures && !prototypeSettings.skipHostPreflights;
    } else if (phase === 'validating') {
      return hasValidationFailures && !prototypeSettings.blockOnAppPreflights;
    }
    return false;
  };

  const getPhaseDescription = (phase: Phase) => {
    switch (phase) {
      case 'hosts':
        return 'Installing runtime and setting up hosts';
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

  return {
    canProceed,
    getButtonText,
    shouldShowPreflightModal,
    getPhaseDescription,
  };
};
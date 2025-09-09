import { useState, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { ValidationStatus, InstallationStatus } from '../types';
import { installInfrastructure } from '../utils/infrastructure';
import { validateEnvironment } from '../utils/validation';
import { installWordPress } from '../utils/wordpress';

type Phase = 'hosts' | 'infrastructure' | 'validating' | 'installing';

export const useValidationInstallFlow = () => {
  const { config, prototypeSettings } = useConfig();
  const isLinuxMode = prototypeSettings.clusterMode === 'embedded';

  const [phase, setPhase] = useState<Phase>(isLinuxMode ? 'hosts' : 'validating');
  
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
  const [hasValidationFailures, setHasValidationFailures] = useState(false);
  const [hostsComplete, setHostsComplete] = useState(false);
  const [hasHostFailures, setHasHostFailures] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);
  const [hostInstallationComplete, setHostInstallationComplete] = useState(false);

  // Auto-start appropriate phase
  useEffect(() => {
    if (phase === 'hosts' && isLinuxMode) {
      // Hosts phase is handled by K0sInstallation component
    } else if (phase === 'infrastructure' && isLinuxMode) {
      startInfrastructureInstallation();
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

  const startInfrastructureInstallation = async () => {
    try {
      await installInfrastructure(config, (newStatus) => {
        setInstallStatus(prev => {
          const updatedStatus = { ...prev, ...newStatus };
          if (updatedStatus.overall === 'completed') {
            setTimeout(() => setPhase('validating'), 500);
          }
          return updatedStatus;
        });
      });
    } catch (error) {
      console.error('Infrastructure installation error:', error);
    }
  };

  const startValidation = async () => {
    setValidationComplete(false);
    setHasValidationFailures(false);
    
    try {
      const results = await validateEnvironment(config);
      setValidationStatus(results);
      
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

  const proceedToNextPhase = () => {
    if (phase === 'hosts') {
      setPhase('infrastructure');
    } else if (phase === 'validating') {
      setPhase('installing');
    }
  };

  return {
    // State
    phase,
    installStatus,
    validationStatus,
    wordpressInstallComplete,
    hasValidationFailures,
    hostsComplete,
    hasHostFailures,
    validationComplete,
    hostInstallationComplete,
    isLinuxMode,
    
    // Actions
    handleHostsComplete,
    startValidation,
    proceedToNextPhase,
  };
};
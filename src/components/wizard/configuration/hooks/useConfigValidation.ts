import { useState } from 'react';
import { useConfig } from '../../../../contexts/ConfigContext';
import { ValidationErrors, TabName, validateAllTabs, findFirstTabWithErrors } from '../utils/validationUtils';
import { ConfigStepStatus } from '../components/ConfigStepper';

export const useConfigValidation = () => {
  const { config, prototypeSettings } = useConfig();
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [allTabsValidated, setAllTabsValidated] = useState(false);
  const [furthestReachedStep, setFurthestReachedStep] = useState<TabName>('cluster');
  const [configStepStatuses, setConfigStepStatuses] = useState<Record<TabName, ConfigStepStatus>>({
    cluster: 'pending',
    network: 'pending',
    admin: 'pending',
    database: 'pending'
  });

  const clearError = (field: string) => {
    if (!prototypeSettings.skipValidation && allTabsValidated) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const updateConfigStepStatus = (step: TabName, status: ConfigStepStatus) => {
    setConfigStepStatuses(prev => ({ ...prev, [step]: status }));
    
    // Update furthest reached step when a step becomes current
    if (status === 'current') {
      setFurthestReachedStep(prev => {
        const steps: TabName[] = ['cluster', 'network', 'admin', 'database'];
        const currentIndex = steps.indexOf(step);
        const prevIndex = steps.indexOf(prev);
        return currentIndex > prevIndex ? step : prev;
      });
    }
  };

  const validateAndSetErrors = (): TabName | null => {
    if (prototypeSettings.skipValidation) return null;

    const allTabErrors = validateAllTabs(config, prototypeSettings.skipValidation);
    const flatErrors = Object.values(allTabErrors).reduce((acc, tabErrors) => ({ ...acc, ...tabErrors }), {});
    
    setErrors(flatErrors);
    setAllTabsValidated(true);

    // Update step statuses based on validation results
    const tabs: TabName[] = ['cluster', 'network', 'admin', 'database'];
    const newStatuses = { ...configStepStatuses };
    
    tabs.forEach(tab => {
      const tabErrors = allTabErrors[tab];
      const hasErrors = Object.keys(tabErrors).length > 0;
      
      if (hasErrors) {
        newStatuses[tab] = 'error';
      } else if (newStatuses[tab] !== 'current') {
        // Only mark as completed if it's not the current step
        newStatuses[tab] = 'completed';
      }
    });
    
    setConfigStepStatuses(newStatuses);

    return findFirstTabWithErrors(allTabErrors);
  };

  const hasValidationErrors = (): boolean => {
    if (prototypeSettings.skipValidation) return false;
    
    const allTabErrors = validateAllTabs(config, prototypeSettings.skipValidation);
    return findFirstTabWithErrors(allTabErrors) !== null;
  };

  return {
    errors,
    allTabsValidated,
    configStepStatuses,
    furthestReachedStep,
    clearError,
    updateConfigStepStatus,
    validateAndSetErrors,
    hasValidationErrors
  };
};
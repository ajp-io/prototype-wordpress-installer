import { useState } from 'react';
import { useConfig } from '../../../../contexts/ConfigContext';
import { ValidationErrors, TabName, validateAllTabs, findFirstTabWithErrors } from '../utils/validationUtils';

export const useConfigValidation = () => {
  const { config, prototypeSettings } = useConfig();
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [allTabsValidated, setAllTabsValidated] = useState(false);

  const clearError = (field: string) => {
    if (!prototypeSettings.skipValidation && allTabsValidated) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateAndSetErrors = (): TabName | null => {
    if (prototypeSettings.skipValidation) return null;

    const allTabErrors = validateAllTabs(config, prototypeSettings.skipValidation);
    const flatErrors = Object.values(allTabErrors).reduce((acc, tabErrors) => ({ ...acc, ...tabErrors }), {});
    
    setErrors(flatErrors);
    setAllTabsValidated(true);

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
    clearError,
    validateAndSetErrors,
    hasValidationErrors
  };
};
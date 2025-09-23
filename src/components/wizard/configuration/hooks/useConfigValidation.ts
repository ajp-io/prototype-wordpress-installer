import { useState } from 'react';
import { useConfig } from '../../../../contexts/ConfigContext';
import { ValidationErrors, TabName, validateAllTabs, findFirstTabWithErrors, validateClusterTab, validateNetworkTab, validateAdminTab, validateDatabaseTab, validateMonitoringTab, validateLoggingTab, validateBackupTab, validateSecurityTab, validatePerformanceTab, validateIntegrationsTab, validateNotificationsTab, validateCustomizationTab } from '../utils/validationUtils';

export const useConfigValidation = () => {
  const { config, prototypeSettings } = useConfig();
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [allTabsValidated, setAllTabsValidated] = useState(false);
  const [visitedTabs, setVisitedTabs] = useState<Set<TabName>>(new Set());

  const isTabRequired = (tab: TabName): boolean => {
    // Check if the tab has any required fields by running validation
    const tabErrors = validateCurrentTab(tab);
    return Object.keys(tabErrors).length > 0;
  };
  const validateCurrentTab = (currentTab: TabName): ValidationErrors => {
    switch (currentTab) {
      case 'cluster':
        return validateClusterTab(config, prototypeSettings.skipValidation);
      case 'network':
        return validateNetworkTab(config, prototypeSettings.skipValidation);
      case 'admin':
        return validateAdminTab(config, prototypeSettings.skipValidation);
      case 'database':
        return validateDatabaseTab(config, prototypeSettings.skipValidation);
      case 'monitoring':
        return validateMonitoringTab(config, prototypeSettings.skipValidation);
      case 'logging':
        return validateLoggingTab(config, prototypeSettings.skipValidation);
      case 'backup':
        return validateBackupTab(config, prototypeSettings.skipValidation);
      case 'security':
        return validateSecurityTab(config, prototypeSettings.skipValidation);
      case 'performance':
        return validatePerformanceTab(config, prototypeSettings.skipValidation);
      case 'integrations':
        return validateIntegrationsTab(config, prototypeSettings.skipValidation);
      case 'notifications':
        return validateNotificationsTab(config, prototypeSettings.skipValidation);
      case 'customization':
        return validateCustomizationTab(config, prototypeSettings.skipValidation);
      default:
        return {};
    }
  };

  const clearError = (field: string) => {
    if (allTabsValidated) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateAndSetErrors = (currentTab?: TabName): TabName | null => {
    if (currentTab) {
      // Only validate the current tab when navigating
      const currentTabErrors = validateCurrentTab(currentTab);
      setErrors(currentTabErrors);
      
      // If current tab has errors, return it; otherwise allow navigation
      return Object.keys(currentTabErrors).length > 0 ? currentTab : null;
    } else {
      // Validate all tabs (for final submission)
      const allTabErrors = validateAllTabs(config, prototypeSettings.skipValidation);
      const flatErrors = Object.values(allTabErrors).reduce((acc, tabErrors) => ({ ...acc, ...tabErrors }), {});
      
      setErrors(flatErrors);
      setAllTabsValidated(true);

      return findFirstTabWithErrors(allTabErrors);
    }
  };

  const hasValidationErrors = (): boolean => {
    const allTabErrors = validateAllTabs(config, prototypeSettings.skipValidation);
    return findFirstTabWithErrors(allTabErrors) !== null;
  };

  const markTabAsVisited = (tab: TabName) => {
    setVisitedTabs(prev => new Set([...prev, tab]));
  };

  const isTabComplete = (tab: TabName): boolean => {
    if (!visitedTabs.has(tab)) return false;
    
    const tabErrors = validateCurrentTab(tab);
    return Object.keys(tabErrors).length === 0;
  };

  return {
    errors,
    allTabsValidated,
    visitedTabs,
    clearError,
    validateAndSetErrors,
    hasValidationErrors,
    validateCurrentTab,
    markTabAsVisited,
    isTabComplete,
    isTabRequired
  };
};
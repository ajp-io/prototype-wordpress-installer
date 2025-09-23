import { useState } from 'react';
import { useConfig } from '../../../../contexts/ConfigContext';
import { ValidationErrors, TabName, validateAllTabs, findFirstTabWithErrors, validateClusterTab, validateNetworkTab, validateAdminTab, validateDatabaseTab, validateMonitoringTab, validateLoggingTab, validateBackupTab, validateSecurityTab, validatePerformanceTab, validateIntegrationsTab, validateNotificationsTab, validateCustomizationTab } from '../utils/validationUtils';

export const useConfigValidation = () => {
  const { config, prototypeSettings } = useConfig();
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [allTabsValidated, setAllTabsValidated] = useState(false);
  const [visitedTabs, setVisitedTabs] = useState<Set<TabName>>(new Set());

  const isTabRequired = (tab: TabName): boolean => {
    // Always check if the tab has any required fields by running validation
    // regardless of skipValidation setting (for visual indicators)
    const tabErrors = validateCurrentTab(tab, false); // Always validate for required check
    return Object.keys(tabErrors).length > 0;
  };

  const validateCurrentTabForRequired = (currentTab: TabName): ValidationErrors => {
    // Always validate with skipValidation=false to determine if fields are required
    switch (currentTab) {
      case 'cluster':
        return validateClusterTab(config, false);
      case 'network':
        return validateNetworkTab(config, false);
      case 'admin':
        return validateAdminTab(config, false);
      case 'database':
        return validateDatabaseTab(config, false);
      case 'monitoring':
        return validateMonitoringTab(config, false);
      case 'logging':
        return validateLoggingTab(config, false);
      case 'backup':
        return validateBackupTab(config, false);
      case 'security':
        return validateSecurityTab(config, false);
      case 'performance':
        return validatePerformanceTab(config, false);
      case 'integrations':
        return validateIntegrationsTab(config, false);
      case 'notifications':
        return validateNotificationsTab(config, false);
      case 'customization':
        return validateCustomizationTab(config, false);
      default:
        return {};
    }
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
    // Always check if the tab has any required fields by running validation
    // regardless of skipValidation setting (for visual indicators)
    const tabErrors = validateCurrentTabForRequired(tab);
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
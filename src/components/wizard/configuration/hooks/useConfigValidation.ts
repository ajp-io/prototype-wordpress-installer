import { useState } from 'react';
import { useConfig } from '../../../../contexts/ConfigContext';
import { ValidationErrors, TabName, validateAllTabs, findFirstTabWithErrors, validateClusterTab, validateNetworkTab, validateAdminTab, validateDatabaseTab, validateMonitoringTab, validateLoggingTab, validateBackupTab, validateSecurityTab, validatePerformanceTab, validateIntegrationsTab, validateNotificationsTab, validateCustomizationTab } from '../utils/validationUtils';

export const useConfigValidation = () => {
  const { config, prototypeSettings } = useConfig();
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [allTabsValidated, setAllTabsValidated] = useState(false);
  const [allTabErrors, setAllTabErrors] = useState<{ [key in TabName]: ValidationErrors }>(() => ({} as { [key in TabName]: ValidationErrors }));
  const [allTabsValidatedOnce, setAllTabsValidatedOnce] = useState(() => false);
  const [visitedTabs, setVisitedTabs] = useState<Set<TabName>>(new Set());

  // Debug logging
  console.log('useConfigValidation render:', {
    allTabsValidatedOnce,
    allTabErrorsKeys: Object.keys(allTabErrors),
    hasAnyErrors: Object.values(allTabErrors).some(errors => Object.keys(errors).length > 0)
  });

  const isTabRequired = (tab: TabName): boolean => {
    // Show "Required" label based on whether the tab actually has required fields
    // that need to be filled out in the current configuration
    const tabErrors = validateCurrentTabForRequired(tab);
    return Object.keys(tabErrors).length > 0;
  };

  const validateCurrentTabForRequired = (tab: TabName): ValidationErrors => {
    // This function is specifically for determining UI state (required indicators)
    // It should always return validation errors regardless of skipValidation setting
    switch (tab) {
      case 'cluster':
        return validateClusterTabForUI(config);
      case 'network':
        return validateNetworkTabForUI(config);
      case 'admin':
        return validateAdminTabForUI(config);
      case 'database':
        return validateDatabaseTabForUI(config);
      case 'monitoring':
        return validateMonitoringTabForUI(config);
      case 'logging':
        return validateLoggingTabForUI(config);
      case 'backup':
        return validateBackupTabForUI(config);
      case 'security':
        return validateSecurityTabForUI(config);
      case 'performance':
        return validatePerformanceTabForUI(config);
      case 'integrations':
        return validateIntegrationsTabForUI(config);
      case 'notifications':
        return validateNotificationsTabForUI(config);
      case 'customization':
        return validateCustomizationTabForUI(config);
      default:
        return {};
    }
  };

  // UI-specific validation functions that always return required field errors
  const validateClusterTabForUI = (config: ClusterConfig): ValidationErrors => {
    const errors: ValidationErrors = {};
    if (!config.clusterName) errors.clusterName = 'Cluster name is required';
    if (!config.storageClass) errors.storageClass = 'Storage class is required';
    if (!config.description) errors.description = 'Description is required';
    if (!config.deploymentMode) errors.deploymentMode = 'Deployment mode is required';
    if (!config.environment) errors.environment = 'Environment is required';
    return errors;
  };

  const validateNetworkTabForUI = (config: ClusterConfig): ValidationErrors => {
    const errors: ValidationErrors = {};
    if (!config.domain) errors.domain = 'Domain is required';
    return errors;
  };

  const validateAdminTabForUI = (config: ClusterConfig): ValidationErrors => {
    const errors: ValidationErrors = {};
    if (!config.adminUsername) errors.adminUsername = 'Admin username is required';
    if (!config.adminPassword) errors.adminPassword = 'Admin password is required';
    if (!config.adminEmail) errors.adminEmail = 'Admin email is required';
    if (!config.licenseKey) errors.licenseKey = 'License key is required';
    return errors;
  };

  const validateDatabaseTabForUI = (config: ClusterConfig): ValidationErrors => {
    const errors: ValidationErrors = {};
    if (config.databaseType === 'external') {
      if (!config.databaseConfig?.host) errors['databaseConfig.host'] = 'Database host is required';
      if (!config.databaseConfig?.username) errors['databaseConfig.username'] = 'Database username is required';
      if (!config.databaseConfig?.password) errors['databaseConfig.password'] = 'Database password is required';
      if (!config.databaseConfig?.database) errors['databaseConfig.database'] = 'Database name is required';
    }
    return errors;
    if (config.databaseType === 'external') {
      if (!config.databaseConfig?.host) errors['databaseConfig.host'] = 'Database host is required';
      if (!config.databaseConfig?.username) errors['databaseConfig.username'] = 'Database username is required';
      if (!config.databaseConfig?.password) errors['databaseConfig.password'] = 'Database password is required';
      if (!config.databaseConfig?.database) errors['databaseConfig.database'] = 'Database name is required';
    }
    return errors;
  };

  const validateMonitoringTabForUI = (config: ClusterConfig): ValidationErrors => {
    return {}; // No required fields for monitoring
  };

  const validateLoggingTabForUI = (config: ClusterConfig): ValidationErrors => {
    return {}; // No required fields for logging
  };

  const validateBackupTabForUI = (config: ClusterConfig): ValidationErrors => {
    return {}; // No required fields for backup
  };

  const validateSecurityTabForUI = (config: ClusterConfig): ValidationErrors => {
    return {}; // No required fields for security
  };

  const validatePerformanceTabForUI = (config: ClusterConfig): ValidationErrors => {
    return {}; // No required fields for performance
  };

  const validateIntegrationsTabForUI = (config: ClusterConfig): ValidationErrors => {
    return {}; // No required fields for integrations
  };

  const validateNotificationsTabForUI = (config: ClusterConfig): ValidationErrors => {
    return {}; // No required fields for notifications
  };

  const validateCustomizationTabForUI = (config: ClusterConfig): ValidationErrors => {
    return {}; // No required fields for customization
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
      setAllTabErrors(allTabErrors);
      setAllTabsValidatedOnce(true);

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
    if (allTabsValidatedOnce) {
      // After full validation, use the stored results
      return Object.keys(allTabErrors[tab] || {}).length === 0;
    } else {
      // Before full validation, use the visited + current validation approach
      if (!visitedTabs.has(tab)) return false;
      const tabErrors = validateCurrentTabForRequired(tab);
      return Object.keys(tabErrors).length === 0;
    }
  };

  const hasErrorsInTab = (tab: TabName): boolean => {
    // NEVER show errors until user attempts to submit the entire configuration
    const result = allTabsValidatedOnce === true && 
                   allTabErrors[tab] !== undefined && 
                   Object.keys(allTabErrors[tab]).length > 0;
    
    console.log(`hasErrorsInTab(${tab}):`, {
      allTabsValidatedOnce,
      hasTabErrors: allTabErrors[tab] !== undefined,
      errorCount: Object.keys(allTabErrors[tab] || {}).length,
      result
    });
    
    return result;
  };

  return {
    errors,
    allTabsValidated,
    allTabErrors,
    allTabsValidatedOnce,
    visitedTabs,
    clearError,
    validateAndSetErrors,
    hasValidationErrors,
    validateCurrentTab,
    markTabAsVisited,
    isTabComplete,
    isTabRequired,
    hasErrorsInTab
  };
};
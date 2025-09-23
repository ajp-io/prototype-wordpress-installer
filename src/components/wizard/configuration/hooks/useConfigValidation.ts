import { useState } from 'react';
import { useConfig } from '../../../../contexts/ConfigContext';
import { ValidationErrors, TabName, validateAllTabs, findFirstTabWithErrors, validateClusterTab, validateNetworkTab, validateAdminTab, validateDatabaseTab, validateMonitoringTab, validateLoggingTab, validateBackupTab, validateSecurityTab, validatePerformanceTab, validateIntegrationsTab, validateNotificationsTab, validateCustomizationTab } from '../utils/validationUtils';

export const useConfigValidation = (currentConfigStep: TabName) => {
  const { config, prototypeSettings } = useConfig();
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [allTabsValidated, setAllTabsValidated] = useState(false);
  const [visitedTabs, setVisitedTabs] = useState<Set<TabName>>(new Set());
  const [tabsWithErrors, setTabsWithErrors] = useState<Set<TabName>>(new Set());
  const [tabsMarkedAsRequired, setTabsMarkedAsRequired] = useState<Set<TabName>>(new Set());

  const isTabRequired = (tab: TabName): boolean => {
    // Always show "Required" if the tab was marked as required due to validation failure
    if (tabsMarkedAsRequired.has(tab)) {
      return true;
    }
    
    // Before any validation attempt, show "Required" if tab has required fields
    if (!allTabsValidated) {
      const tabErrors = validateCurrentTabForRequired(tab);
      return Object.keys(tabErrors).length > 0;
    }
    
    // After validation, don't show "Required" unless it was marked as such
    return false;
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
    // Always clear the specific field error
    setErrors(prev => ({ ...prev, [field]: undefined }));
    
    // If we've done full validation before, check if current tab still has errors
    if (allTabsValidated) {
      // Re-validate the current tab to see if it still has errors
      const currentTabErrors = validateCurrentTab(currentConfigStep);
      
      // If no errors remain in this tab, remove it from tabsWithErrors
      if (Object.keys(currentTabErrors).length === 0) {
        setTabsWithErrors(prev => {
          const newSet = new Set(prev);
          newSet.delete(currentConfigStep);
          return newSet;
        });
      }
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
      
      // Track which tabs have errors for visual highlighting
      const tabsWithErrorsSet = new Set<TabName>();
      const tabsWithRequiredFieldsSet = new Set<TabName>();
      
      Object.entries(allTabErrors).forEach(([tabName, tabErrors]) => {
        if (Object.keys(tabErrors).length > 0) {
          tabsWithErrorsSet.add(tabName as TabName);
          tabsWithRequiredFieldsSet.add(tabName as TabName);
        }
      });
      
      setTabsWithErrors(tabsWithErrorsSet);
      setTabsMarkedAsRequired(prev => {
        const newSet = new Set(prev);
        tabsWithRequiredFieldsSet.forEach(tab => newSet.add(tab));
        return newSet;
      });

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
    // Only show as complete if:
    // 1. The tab has been visited AND
    // 2. The user has navigated away from it (it's not the current tab) AND  
    // 3. It has no validation errors
    if (!visitedTabs.has(tab) || tab === currentConfigStep) return false;
    
    const tabErrors = validateCurrentTabForRequired(tab);
    return Object.keys(tabErrors).length === 0;
  };
  
  const hasTabErrors = (tab: TabName): boolean => {
    return tabsWithErrors.has(tab);
  };

  return {
    errors,
    allTabsValidated,
    visitedTabs,
    currentConfigStep,
    clearError,
    validateAndSetErrors,
    hasValidationErrors,
    validateCurrentTab,
    markTabAsVisited,
    isTabComplete,
    isTabRequired,
    hasTabErrors
  };
};
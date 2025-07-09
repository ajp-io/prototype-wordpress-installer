import { ClusterConfig } from '../../../../contexts/ConfigContext';

export interface ValidationErrors {
  clusterName?: string;
  namespace?: string;
  storageClass?: string;
  domain?: string;
  adminUsername?: string;
  adminPassword?: string;
  adminEmail?: string;
  description?: string;
  deploymentMode?: string;
  environment?: string;
  licenseKey?: string;
  [key: string]: string | undefined;
}

export type TabName = 'cluster' | 'network' | 'admin' | 'database';

export const validateClusterTab = (config: ClusterConfig, skipValidation: boolean): ValidationErrors => {
  if (skipValidation) return {};

  const errors: ValidationErrors = {};
  
  if (!config.clusterName) errors.clusterName = 'Cluster name is required';
  if (!config.namespace) errors.namespace = 'Namespace is required';
  if (!config.storageClass) errors.storageClass = 'Storage class is required';
  if (!config.description) errors.description = 'Description is required';
  if (!config.deploymentMode) errors.deploymentMode = 'Deployment mode is required';
  if (!config.environment) errors.environment = 'Environment is required';

  return errors;
};

export const validateNetworkTab = (config: ClusterConfig, skipValidation: boolean): ValidationErrors => {
  if (skipValidation) return {};

  const errors: ValidationErrors = {};
  
  if (!config.domain) errors.domain = 'Domain is required';

  return errors;
};

export const validateAdminTab = (config: ClusterConfig, skipValidation: boolean): ValidationErrors => {
  if (skipValidation) return {};

  const errors: ValidationErrors = {};
  
  if (!config.adminUsername) errors.adminUsername = 'Admin username is required';
  if (!config.adminPassword) errors.adminPassword = 'Admin password is required';
  if (!config.adminEmail) errors.adminEmail = 'Admin email is required';
  if (!config.licenseKey) errors.licenseKey = 'License key is required';

  return errors;
};

export const validateDatabaseTab = (config: ClusterConfig, skipValidation: boolean): ValidationErrors => {
  if (skipValidation) return {};

  const errors: ValidationErrors = {};
  
  if (config.databaseType === 'external') {
    if (!config.databaseConfig?.host) errors['databaseConfig.host'] = 'Database host is required';
    if (!config.databaseConfig?.username) errors['databaseConfig.username'] = 'Database username is required';
    if (!config.databaseConfig?.password) errors['databaseConfig.password'] = 'Database password is required';
    if (!config.databaseConfig?.database) errors['databaseConfig.database'] = 'Database name is required';
  }

  return errors;
};

export const validateAllTabs = (config: ClusterConfig, skipValidation: boolean): { [key in TabName]: ValidationErrors } => {
  return {
    cluster: validateClusterTab(config, skipValidation),
    network: validateNetworkTab(config, skipValidation),
    admin: validateAdminTab(config, skipValidation),
    database: validateDatabaseTab(config, skipValidation)
  };
};

export const findFirstTabWithErrors = (allTabErrors: { [key in TabName]: ValidationErrors }): TabName | null => {
  const tabs: TabName[] = ['cluster', 'network', 'admin', 'database'];
  
  for (const tab of tabs) {
    if (Object.keys(allTabErrors[tab]).length > 0) {
      return tab;
    }
  }
  return null;
};
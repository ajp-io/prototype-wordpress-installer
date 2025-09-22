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
  // Additional fields for extended config groups
  monitoring?: string;
  logging?: string;
  backup?: string;
  security?: string;
  performance?: string;
  integrations?: string;
  notifications?: string;
  customization?: string;
  [key: string]: string | undefined;
}

export type TabName = 'cluster' | 'network' | 'admin' | 'database' | 'monitoring' | 'logging' | 'backup' | 'security' | 'performance' | 'integrations' | 'notifications' | 'customization';
export type TabName = 'cluster' | 'network' | 'admin' | 'database' | 'monitoring' | 'logging' | 'backup' | 'security' | 'performance' | 'integrations' | 'notifications' | 'customization' | 'storage' | 'networking' | 'certificates' | 'authentication' | 'authorization' | 'compliance' | 'auditing' | 'analytics' | 'reporting' | 'maintenance' | 'scaling' | 'loadbalancing' | 'caching' | 'cdn' | 'dns' | 'ssl' | 'firewall' | 'vpn' | 'proxy' | 'gateway' | 'mesh' | 'observability' | 'tracing' | 'profiling' | 'debugging' | 'testing' | 'deployment' | 'rollback' | 'canary' | 'bluegreen' | 'feature-flags' | 'secrets' | 'encryption' | 'keys' | 'tokens' | 'sessions' | 'cookies' | 'cors' | 'headers' | 'middleware' | 'plugins' | 'extensions' | 'themes' | 'localization' | 'timezone' | 'currency' | 'payments' | 'billing' | 'subscriptions' | 'users' | 'roles' | 'permissions' | 'groups' | 'teams' | 'organizations' | 'tenants' | 'workspaces' | 'projects' | 'environments' | 'regions' | 'zones' | 'clusters' | 'nodes' | 'pods' | 'containers' | 'images' | 'volumes' | 'networks' | 'services' | 'ingress' | 'egress' | 'policies' | 'quotas' | 'limits' | 'requests' | 'resources' | 'scheduling' | 'affinity' | 'tolerations' | 'taints' | 'labels' | 'annotations' | 'metadata' | 'specs' | 'status' | 'events' | 'logs-advanced' | 'metrics-advanced' | 'alerts' | 'dashboards' | 'charts' | 'graphs' | 'tables' | 'exports' | 'imports' | 'migrations' | 'upgrades' | 'patches' | 'hotfixes' | 'releases' | 'versions' | 'tags' | 'branches' | 'commits' | 'merges' | 'pulls' | 'pushes' | 'hooks' | 'triggers' | 'workflows' | 'pipelines' | 'stages' | 'jobs' | 'tasks' | 'steps' | 'actions' | 'conditions' | 'loops' | 'retries' | 'timeouts' | 'delays' | 'schedules' | 'crons' | 'events-advanced' | 'webhooks' | 'apis' | 'endpoints' | 'routes' | 'handlers' | 'controllers' | 'models' | 'views' | 'templates' | 'components' | 'widgets' | 'forms' | 'fields' | 'validation' | 'sanitization' | 'formatting' | 'parsing' | 'serialization' | 'compression' | 'optimization' | 'minification' | 'bundling' | 'splitting' | 'lazy-loading' | 'prefetching' | 'preloading' | 'streaming' | 'chunking' | 'batching' | 'queuing' | 'pooling' | 'clustering-advanced' | 'sharding' | 'partitioning' | 'replication' | 'synchronization' | 'consistency' | 'transactions' | 'isolation' | 'durability' | 'atomicity' | 'concurrency' | 'parallelism' | 'threading' | 'processes' | 'workers' | 'executors' | 'schedulers' | 'dispatchers' | 'routers' | 'balancers' | 'proxies-advanced' | 'gateways-advanced' | 'bridges' | 'adapters' | 'connectors' | 'drivers' | 'clients' | 'servers' | 'protocols' | 'formats' | 'encodings' | 'standards' | 'specifications' | 'contracts' | 'interfaces' | 'abstractions' | 'implementations' | 'extensions-advanced' | 'plugins-advanced' | 'addons' | 'modules' | 'packages' | 'libraries' | 'frameworks' | 'platforms' | 'ecosystems' | 'marketplaces' | 'registries' | 'repositories' | 'catalogs' | 'indexes' | 'searches' | 'filters' | 'sorts' | 'rankings' | 'recommendations' | 'suggestions' | 'predictions' | 'forecasts' | 'trends' | 'patterns' | 'anomalies' | 'outliers' | 'clusters-ml' | 'classifications' | 'regressions' | 'associations' | 'correlations' | 'causations' | 'dependencies' | 'relationships' | 'hierarchies' | 'taxonomies' | 'ontologies' | 'schemas' | 'models-advanced' | 'algorithms' | 'heuristics' | 'optimizations-advanced' | 'approximations' | 'estimations' | 'calculations' | 'computations' | 'simulations' | 'emulations' | 'virtualizations' | 'containerizations' | 'orchestrations' | 'automations' | 'integrations-advanced' | 'synchronizations' | 'transformations' | 'mappings' | 'translations' | 'conversions' | 'adaptations' | 'migrations-advanced' | 'upgrades-advanced' | 'downgrades' | 'rollbacks-advanced' | 'recoveries' | 'restorations' | 'repairs' | 'maintenances-advanced' | 'cleanups' | 'optimizations-final' | 'tunings' | 'calibrations' | 'adjustments' | 'configurations-final';

export const validateClusterTab = (config: ClusterConfig, skipValidation: boolean): ValidationErrors => {
  if (skipValidation) return {};

  const errors: ValidationErrors = {};
  
  if (!config.clusterName) errors.clusterName = 'Cluster name is required';
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

export const validateMonitoringTab = (config: ClusterConfig, skipValidation: boolean): ValidationErrors => {
  if (skipValidation) return {};
  const errors: ValidationErrors = {};
  // Add monitoring-specific validation if needed
  return errors;
};

export const validateLoggingTab = (config: ClusterConfig, skipValidation: boolean): ValidationErrors => {
  if (skipValidation) return {};
  const errors: ValidationErrors = {};
  // Add logging-specific validation if needed
  return errors;
};

export const validateBackupTab = (config: ClusterConfig, skipValidation: boolean): ValidationErrors => {
  if (skipValidation) return {};
  const errors: ValidationErrors = {};
  // Add backup-specific validation if needed
  return errors;
};

export const validateSecurityTab = (config: ClusterConfig, skipValidation: boolean): ValidationErrors => {
  if (skipValidation) return {};
  const errors: ValidationErrors = {};
  // Add security-specific validation if needed
  return errors;
};

export const validatePerformanceTab = (config: ClusterConfig, skipValidation: boolean): ValidationErrors => {
  if (skipValidation) return {};
  const errors: ValidationErrors = {};
  // Add performance-specific validation if needed
  return errors;
};

export const validateIntegrationsTab = (config: ClusterConfig, skipValidation: boolean): ValidationErrors => {
  if (skipValidation) return {};
  const errors: ValidationErrors = {};
  // Add integrations-specific validation if needed
  return errors;
};

export const validateNotificationsTab = (config: ClusterConfig, skipValidation: boolean): ValidationErrors => {
  if (skipValidation) return {};
  const errors: ValidationErrors = {};
  // Add notifications-specific validation if needed
  return errors;
};

export const validateCustomizationTab = (config: ClusterConfig, skipValidation: boolean): ValidationErrors => {
  if (skipValidation) return {};
  const errors: ValidationErrors = {};
  // Add customization-specific validation if needed
  return errors;
};

export const validateAllTabs = (config: ClusterConfig, skipValidation: boolean): { [key in TabName]: ValidationErrors } => {
  const basicTabs = {
    cluster: validateClusterTab(config, skipValidation),
    network: validateNetworkTab(config, skipValidation),
    admin: validateAdminTab(config, skipValidation),
    database: validateDatabaseTab(config, skipValidation)
  };

  const extendedTabs = {
    monitoring: validateMonitoringTab(config, skipValidation),
    logging: validateLoggingTab(config, skipValidation),
    backup: validateBackupTab(config, skipValidation),
    security: validateSecurityTab(config, skipValidation),
    performance: validatePerformanceTab(config, skipValidation),
    integrations: validateIntegrationsTab(config, skipValidation),
    notifications: validateNotificationsTab(config, skipValidation),
    customization: validateCustomizationTab(config, skipValidation)
  };

  return { ...basicTabs, ...extendedTabs } as { [key in TabName]: ValidationErrors };
};

export const findFirstTabWithErrors = (allTabErrors: { [key in TabName]: ValidationErrors }): TabName | null => {
  const basicTabs: TabName[] = ['cluster', 'network', 'admin', 'database'];
  const extendedTabs: TabName[] = ['monitoring', 'logging', 'backup', 'security', 'performance', 'integrations', 'notifications', 'customization'];
  const tabs = [...basicTabs, ...extendedTabs];
  
  for (const tab of tabs) {
    if (Object.keys(allTabErrors[tab]).length > 0) {
      return tab;
    }
  }
  return null;
};
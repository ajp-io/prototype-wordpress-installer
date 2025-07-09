import { ClusterConfig } from '../contexts/ConfigContext';
import { InstallationStatus } from '../types';

export const installWordPress = async (
  config: ClusterConfig,
  onStatusUpdate: (status: Partial<InstallationStatus>) => void
): Promise<void> => {
  const installStatus: InstallationStatus = {
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
    progress: 0
  };

  const prototypeSettings = JSON.parse(localStorage.getItem('wordpress-prototype-settings') || '{}');
  const shouldFail = prototypeSettings.failInstallation;

  const addLogs = (newLogs: string[]) => {
    installStatus.logs = [...installStatus.logs, ...newLogs];
    onStatusUpdate({ logs: installStatus.logs });
  };

  // Create PostgreSQL values file
  const postgresValues = `
global:
  postgresql:
    auth:
      username: wordpress
      password: wordpress
      database: wordpress
persistence:
  enabled: true
  storageClass: ${config.storageClass}
  size: 10Gi
`;

  addLogs([
    'Creating PostgreSQL configuration...',
    postgresValues
  ]);

  // Start with the database installation
  onStatusUpdate({ 
    database: 'in-progress', 
    currentMessage: 'Installing PostgreSQL database...',
    progress: 5
  });

  addLogs([
    'Installing PostgreSQL...',
    'Creating database namespace...',
    'Waiting for PostgreSQL deployment...'
  ]);
  await new Promise(resolve => setTimeout(resolve, 3000));
  addLogs(['PostgreSQL installation complete']);

  onStatusUpdate({ 
    database: 'completed', 
    currentMessage: 'Database installation completed',
    progress: 30
  });

  // Start core installation
  onStatusUpdate({ 
    core: 'in-progress', 
    currentMessage: 'Installing WordPress Core...',
    progress: 35
  });

  if (shouldFail) {
    onStatusUpdate({
      core: 'failed',
      plugins: 'pending',
      overall: 'failed',
      currentMessage: 'Installation failed',
      error: 'Failed to create WordPress deployment: insufficient memory resources',
      progress: 45,
      logs: [
        ...installStatus.logs,
        'Error: Deployment failed',
        'Error: pods "wordpress-0" failed to fit in node',
        'Error: 0/3 nodes are available: 3 Insufficient memory'
      ]
    });
    return;
  }

  // Create WordPress values file
  const wordpressValues = `
wordpress:
  admin:
    username: ${config.adminUsername}
    password: ${config.adminPassword}
    email: ${config.adminEmail}
  config:
    server:
      DOMAIN: ${config.domain}
      ROOT_URL: ${config.useHttps ? 'https' : 'http'}://${config.domain}
      PROTOCOL: ${config.useHttps ? 'https' : 'http'}
    database:
      DB_TYPE: postgres
      HOST: wordpress-db-postgresql.${config.namespace}.svc.cluster.local:5432
      NAME: wordpress
      USER: wordpress
      PASSWD: wordpress
persistence:
  enabled: true
  storageClass: ${config.storageClass}
  size: 10Gi
ingress:
  enabled: true
  annotations:
    kubernetes.io/ingress.class: nginx
  hosts:
    - host: ${config.domain}
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: wordpress-tls
      hosts:
        - ${config.domain}
`;

  addLogs([
    'Creating WordPress configuration...',
    wordpressValues
  ]);
  
  addLogs([
    'Installing WordPress Enterprise...',
    'Creating application namespace...',
    'Waiting for WordPress deployment...'
  ]);
  await new Promise(resolve => setTimeout(resolve, 5000));
  addLogs(['WordPress Enterprise deployment complete']);

  onStatusUpdate({ 
    core: 'completed', 
    currentMessage: 'WordPress Core installation completed',
    progress: 75
  });

  // Create plugins values file
  const pluginsValues = `
wordpress:
  plugins:
    enabled: true
    marketplace:
      enabled: true
    preinstalled:
      - name: wordpress-actions
        version: latest
      - name: wordpress-oauth2-proxy
        version: latest
`;

  addLogs([
    'Creating plugins configuration...',
    pluginsValues
  ]);

  // Install plugins via Helm values
  onStatusUpdate({ 
    plugins: 'in-progress', 
    currentMessage: 'Installing WordPress Enterprise plugins...',
    progress: 80
  });

  addLogs([
    'Installing WordPress Enterprise plugins...',
    'Configuring plugin marketplace...',
    'Installing preinstalled plugins...'
  ]);
  await new Promise(resolve => setTimeout(resolve, 3000));
  addLogs(['Plugins installation complete']);

  onStatusUpdate({ 
    plugins: 'completed', 
    currentMessage: 'Plugins installation completed',
    progress: 95
  });

  // Final verification
  onStatusUpdate({ 
    currentMessage: 'Performing final verification...',
    progress: 98
  });

  addLogs([
    'Verifying installation...',
    'NAME: wordpress',
    'LAST DEPLOYED: ' + new Date().toISOString(),
    'NAMESPACE: ' + config.namespace,
    'STATUS: deployed',
    'REVISION: 1'
  ]);

  // Set all components as completed and overall status
  onStatusUpdate({ 
    database: 'completed',
    core: 'completed',
    plugins: 'completed',
    overall: 'completed',
    currentMessage: 'WordPress Enterprise installation completed successfully',
    logs: ['WordPress Enterprise is ready to use!'],
    progress: 100
  });
};
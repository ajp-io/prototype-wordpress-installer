import { ClusterConfig } from '../../contexts/ConfigContext';
import { InstallationStatus } from '../../types';

export const installDatabase = async (
  config: ClusterConfig,
  onStatusUpdate: (status: Partial<InstallationStatus>) => void,
  addLogs: (logs: string[]) => void
): Promise<void> => {
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
};
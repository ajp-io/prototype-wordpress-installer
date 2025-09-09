import { InstallationStatus } from '../../types';

export const installRegistry = async (
  onStatusUpdate: (status: Partial<InstallationStatus>) => void,
  addLogs: (logs: string[]) => void
): Promise<void> => {
  const registryValues = `
persistence:
  enabled: true
  storageClass: openebs-local
  size: 10Gi
service:
  type: ClusterIP
`;

  addLogs([
    'Creating Registry values file...',
    registryValues
  ]);

  onStatusUpdate({ 
    registry: 'in-progress', 
    currentMessage: 'Installing registry...',
    progress: 50
  });

  addLogs([
    'Installing Docker Registry...',
    'Creating namespace...',
    'Waiting for Registry deployment...'
  ]);
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  addLogs(['Registry installation complete']);

  onStatusUpdate({ 
    registry: 'completed', 
    currentMessage: 'Registry installation completed',
    progress: 65
  });
};
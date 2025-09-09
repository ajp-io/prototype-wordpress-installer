import { InstallationStatus } from '../../types';

export const installVelero = async (
  onStatusUpdate: (status: Partial<InstallationStatus>) => void,
  addLogs: (logs: string[]) => void
): Promise<void> => {
  const veleroValues = `
configuration:
  provider: aws
  backupStorageLocation:
    name: default
    bucket: wordpress-backups
    config:
      region: us-east-1
persistence:
  enabled: true
  storageClass: openebs-local
`;

  addLogs([
    'Creating Velero values file...',
    veleroValues
  ]);

  onStatusUpdate({ 
    velero: 'in-progress', 
    currentMessage: 'Preparing disaster recovery...',
    progress: 75
  });

  addLogs([
    'Installing Velero...',
    'Creating namespace...',
    'Waiting for Velero deployment...'
  ]);
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  addLogs(['Velero installation complete']);

  onStatusUpdate({ 
    velero: 'completed', 
    currentMessage: 'Velero installation completed',
    progress: 85
  });
};
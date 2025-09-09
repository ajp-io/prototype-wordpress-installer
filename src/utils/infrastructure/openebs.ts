import { InstallationStatus } from '../../types';

export const installOpenEBS = async (
  storageClass: string,
  onStatusUpdate: (status: Partial<InstallationStatus>) => void,
  addLogs: (logs: string[]) => void
): Promise<void> => {
  const openebsValues = `
storageClass:
  name: openebs-local
  isDefaultClass: true
`;

  addLogs([
    'Creating OpenEBS values file...',
    openebsValues
  ]);

  onStatusUpdate({ 
    openebs: 'in-progress', 
    currentMessage: 'Installing storage...',
    progress: 20
  });

  addLogs([
    'Installing OpenEBS...',
    'Creating namespace...',
    'Waiting for OpenEBS deployment...'
  ]);
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  addLogs(['OpenEBS installation complete']);

  onStatusUpdate({ 
    openebs: 'completed', 
    currentMessage: 'OpenEBS installation completed',
    progress: 35
  });
};
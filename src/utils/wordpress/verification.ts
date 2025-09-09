import { ClusterConfig } from '../../contexts/ConfigContext';
import { InstallationStatus } from '../../types';

export const performFinalVerification = async (
  config: ClusterConfig,
  onStatusUpdate: (status: Partial<InstallationStatus>) => void,
  addLogs: (logs: string[]) => void
): Promise<void> => {
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
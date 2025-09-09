import { ClusterConfig } from '../contexts/ConfigContext';
import { InstallationStatus } from '../types';
import { installOpenEBS } from './infrastructure/openebs';
import { installRegistry } from './infrastructure/registry';
import { installVelero } from './infrastructure/velero';
import { installAdditionalComponents } from './infrastructure/components';

export const installInfrastructure = async (
  config: ClusterConfig,
  onStatusUpdate: (status: Partial<InstallationStatus>) => void
): Promise<void> => {
  const status: InstallationStatus = {
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

  const addLogs = (newLogs: string[]) => {
    status.logs = [...status.logs, ...newLogs];
    onStatusUpdate({ logs: status.logs });
  };

  // Create values files for each chart
  addLogs(['Creating directory for Helm values files...']);
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Install infrastructure components in sequence
  await installOpenEBS(config.storageClass, onStatusUpdate, addLogs);
  await installRegistry(onStatusUpdate, addLogs);
  await installVelero(onStatusUpdate, addLogs);
  await installAdditionalComponents(onStatusUpdate, addLogs);
};
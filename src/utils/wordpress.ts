import { ClusterConfig } from '../contexts/ConfigContext';
import { InstallationStatus } from '../types';
import { installDatabase } from './wordpress/database';
import { installWordPressCore } from './wordpress/core';
import { installWordPressPlugins } from './wordpress/plugins';
import { performFinalVerification } from './wordpress/verification';

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

  // Install components in sequence
  await installDatabase(config, onStatusUpdate, addLogs);

  // Check for failure simulation before core installation
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

  await installWordPressCore(config, onStatusUpdate, addLogs);
  await installWordPressPlugins(onStatusUpdate, addLogs);
  await performFinalVerification(config, onStatusUpdate, addLogs);
};
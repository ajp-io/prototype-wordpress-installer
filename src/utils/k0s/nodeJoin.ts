import { ClusterConfig } from '../../contexts/ConfigContext';
import { NodeJoinStatus } from '../../types';
import { validateHostPreflights } from '../validation';

export const performNodeJoin = async (
  config: ClusterConfig,
  nodeId: string,
  onStatusUpdate: (nodeId: string, status: Partial<NodeJoinStatus>) => void
): Promise<void> => {
  const status: NodeJoinStatus = {
    id: nodeId,
    phase: 'preflight',
    preflightStatus: null,
    progress: 0,
    currentMessage: 'Starting node join process...',
    logs: []
  };

  const addLogs = (newLogs: string[]) => {
    status.logs = [...status.logs, ...newLogs];
    onStatusUpdate(nodeId, { logs: status.logs });
  };

  // Run host preflights
  onStatusUpdate(nodeId, {
    phase: 'preflight',
    currentMessage: 'Running preflight checks...',
    progress: 10
  });

  addLogs(['Starting preflight checks...']);

  try {
    const preflightResults = await validateHostPreflights(config);
    status.preflightStatus = preflightResults;

    const hasErrors = Object.values(preflightResults).some(
      (result) => result && !result.success
    );

    if (hasErrors) {
      onStatusUpdate(nodeId, {
        preflightStatus: preflightResults,
        error: 'Preflight checks failed. Please resolve the issues and try again.',
        progress: 20
      });
      return;
    }

    await performActualNodeJoin(nodeId, onStatusUpdate, addLogs);

  } catch (error) {
    console.error('Node join error:', error);
    onStatusUpdate(nodeId, {
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      progress: status.progress
    });
  }
};

const performActualNodeJoin = async (
  nodeId: string,
  onStatusUpdate: (nodeId: string, status: Partial<NodeJoinStatus>) => void,
  addLogs: (logs: string[]) => void
): Promise<void> => {
  // Start node join process
  onStatusUpdate(nodeId, {
    phase: 'joining',
    currentMessage: 'Starting node join process...',
    progress: 30
  });

  addLogs([
    'Preflight checks passed',
    'Downloading k0s worker binary...',
    'Installing k0s worker...'
  ]);

  await new Promise(resolve => setTimeout(resolve, 2000));
  addLogs(['k0s worker binary installed']);

  onStatusUpdate(nodeId, {
    currentMessage: 'Joining cluster...',
    progress: 60
  });

  addLogs([
    'Creating worker configuration...',
    'Starting k0s worker service...',
    'Joining cluster...'
  ]);

  await new Promise(resolve => setTimeout(resolve, 3000));
  addLogs(['Node joined successfully']);

  onStatusUpdate(nodeId, {
    currentMessage: 'Node joined successfully',
    progress: 100
  });
};
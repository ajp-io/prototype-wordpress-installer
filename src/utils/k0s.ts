import { ClusterConfig } from '../contexts/ConfigContext';
import { K0sInstallStatus, NodeJoinStatus } from '../types';
import { performK0sInstallation } from './k0s/installation';
import { performNodeJoin } from './k0s/nodeJoin';

export const installK0s = async (
  config: ClusterConfig,
  onStatusUpdate: (status: Partial<K0sInstallStatus>) => void
): Promise<void> => {
  return performK0sInstallation(config, onStatusUpdate);
};

export const joinNode = async (
  config: ClusterConfig,
  nodeId: string,
  onStatusUpdate: (nodeId: string, status: Partial<NodeJoinStatus>) => void
): Promise<void> => {
  return performNodeJoin(config, nodeId, onStatusUpdate);
};
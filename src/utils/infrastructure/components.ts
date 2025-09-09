import { InstallationStatus } from '../../types';

export const installAdditionalComponents = async (
  onStatusUpdate: (status: Partial<InstallationStatus>) => void,
  addLogs: (logs: string[]) => void
): Promise<void> => {
  onStatusUpdate({ 
    components: 'in-progress', 
    currentMessage: 'Installing additional components...',
    progress: 90
  });

  // Install Ingress Controller
  addLogs([
    'Installing Ingress Controller...',
    'Creating ingress-nginx namespace...',
    'Waiting for Ingress Controller deployment...'
  ]);
  await new Promise(resolve => setTimeout(resolve, 2000));
  addLogs(['Ingress Controller installation complete']);

  // Install Metrics Server
  addLogs([
    'Installing Metrics Server...',
    'Creating metrics-server namespace...',
    'Waiting for Metrics Server deployment...'
  ]);
  await new Promise(resolve => setTimeout(resolve, 2000));
  addLogs(['Metrics Server installation complete']);

  // Install Cert Manager
  addLogs([
    'Installing Cert Manager...',
    'Creating cert-manager namespace...',
    'Waiting for Cert Manager deployment...'
  ]);
  await new Promise(resolve => setTimeout(resolve, 2000));
  addLogs(['Cert Manager installation complete']);

  onStatusUpdate({ 
    components: 'completed', 
    currentMessage: 'Components installation completed',
    progress: 100,
    overall: 'completed'
  });
};
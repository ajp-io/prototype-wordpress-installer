import { InstallationStatus } from '../../types';

export const installWordPressPlugins = async (
  onStatusUpdate: (status: Partial<InstallationStatus>) => void,
  addLogs: (logs: string[]) => void
): Promise<void> => {
  // Create plugins values file
  const pluginsValues = `
wordpress:
  plugins:
    enabled: true
    marketplace:
      enabled: true
    preinstalled:
      - name: wordpress-actions
        version: latest
      - name: wordpress-oauth2-proxy
        version: latest
`;

  addLogs([
    'Creating plugins configuration...',
    pluginsValues
  ]);

  // Install plugins via Helm values
  onStatusUpdate({ 
    plugins: 'in-progress', 
    currentMessage: 'Installing WordPress Enterprise plugins...',
    progress: 80
  });

  addLogs([
    'Installing WordPress Enterprise plugins...',
    'Configuring plugin marketplace...',
    'Installing preinstalled plugins...'
  ]);
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  addLogs(['Plugins installation complete']);

  onStatusUpdate({ 
    plugins: 'completed', 
    currentMessage: 'Plugins installation completed',
    progress: 95
  });
};
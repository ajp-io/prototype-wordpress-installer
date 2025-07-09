export const getConfigFileName = (configFormat: 'helm-values' | 'config-values'): string => {
  return configFormat === 'helm-values' ? 'wordpress-values.yaml' : 'wordpress-config.yaml';
};

export const getInstallCommand = (configFormat: 'helm-values' | 'config-values', clusterMode: 'existing' | 'embedded'): string => {
  if (configFormat === 'helm-values') {
    return `helm install wordpress oci://charts.wordpress.com/stable/wordpress --version 1.2.3 --values wordpress-values.yaml`;
  } else {
    const target = clusterMode === 'embedded' ? 'linux' : 'kubernetes';
    return `wordpress install --config-values wordpress-config.yaml --target ${target}`;
  }
};
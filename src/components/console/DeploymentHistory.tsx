import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';
import HelmLogsModal from './HelmLogsModal';
import { useConfig } from '../../contexts/ConfigContext';
import { CheckCircle, XCircle, Clock, FileText, Calendar, Tag, Activity, Settings } from 'lucide-react';

interface DeploymentRecord {
  id: string;
  date: string;
  version: string;
  status: 'Success' | 'Failed' | 'In Progress';
  duration?: string;
  helmCharts: HelmChart[];
  config: {
    clusterName: string;
    environment: string;
    deploymentMode: string;
    storageClass: string;
    domain: string;
    useHttps: boolean;
    databaseType: string;
    adminUsername: string;
    adminEmail: string;
    description: string;
  };
}

const DeploymentHistory: React.FC = () => {
  const { prototypeSettings } = useConfig();
  const navigate = useNavigate();
  const themeColor = prototypeSettings.themeColor;

  // Mock deployment data
  const [deployments] = useState<DeploymentRecord[]>([
    {
      id: '1',
      date: '2024-12-15 14:30:22',
      version: '6.4.2',
      status: 'Success',
      duration: '12m 34s',
      config: {
        clusterName: 'wordpress-prod',
        environment: 'production',
        deploymentMode: 'ha',
        storageClass: 'fast-ssd',
        domain: 'wordpress.company.com',
        useHttps: true,
        databaseType: 'internal',
        adminUsername: 'admin',
        adminEmail: 'admin@company.com',
        description: 'Production WordPress Enterprise deployment with high availability configuration'
      },
      helmCharts: [
        {
          name: 'wordpress-postgresql',
          namespace: 'wordpress',
          version: '12.1.9',
          status: 'deployed' as const,
          revision: 1,
          updated: '2024-12-15T14:25:10Z',
          logs: [
            'NAME: wordpress-postgresql',
            'LAST DEPLOYED: Fri Dec 15 14:25:10 2024',
            'NAMESPACE: wordpress',
            'STATUS: deployed',
            'REVISION: 1',
            'TEST SUITE: None',
            'NOTES:',
            'CHART NAME: postgresql',
            'CHART VERSION: 12.1.9',
            'APP VERSION: 15.1.0',
            '',
            '** Please be patient while the chart is being deployed **',
            '',
            'PostgreSQL can be accessed via port 5432 on the following DNS names from within your cluster:',
            '',
            '    wordpress-postgresql.wordpress.svc.cluster.local - Read/Write connection',
            '',
            'To get the password for "postgres" run:',
            '',
            '    export POSTGRES_PASSWORD=$(kubectl get secret --namespace wordpress wordpress-postgresql -o jsonpath="{.data.postgres-password}" | base64 -d)',
            '',
            'To connect to your database run the following command:',
            '',
            '    kubectl run wordpress-postgresql-client --rm --tty -i --restart=\'Never\' --namespace wordpress --image docker.io/bitnami/postgresql:15.1.0-debian-11-r0 --env="PGPASSWORD=$POSTGRES_PASSWORD" \\',
            '      --command -- psql --host wordpress-postgresql --port 5432 -U postgres -d wordpress',
            '',
            'NOTE: If you are connecting to this database from outside the cluster, make sure to create the appropriate ingress rules or port-forward the service.',
            '',
            'WARNING: Rolling tag detected (bitnami/postgresql:15), please note that it is strongly recommended to avoid using rolling tags in a production environment.',
            '+         Please use a specific tag instead.'
          ]
        },
        {
          name: 'wordpress-core',
          namespace: 'wordpress',
          version: '6.4.2',
          status: 'deployed' as const,
          revision: 1,
          updated: '2024-12-15T14:28:45Z',
          logs: [
            'NAME: wordpress-core',
            'LAST DEPLOYED: Fri Dec 15 14:28:45 2024',
            'NAMESPACE: wordpress',
            'STATUS: deployed',
            'REVISION: 1',
            'TEST SUITE: None',
            'NOTES:',
            'CHART NAME: wordpress-enterprise',
            'CHART VERSION: 6.4.2',
            'APP VERSION: 6.4.2',
            '',
            '1. Get the WordPress Enterprise URL:',
            '',
            '  You should be able to access your new WordPress Enterprise installation through',
            '',
            '  https://wordpress.company.com/',
            '',
            '2. Get your WordPress Enterprise login credentials by running:',
            '',
            '  echo Username: admin',
            '  echo Password: $(kubectl get secret --namespace wordpress wordpress-core -o jsonpath="{.data.wordpress-password}" | base64 -d)',
            '',
            '3. The installation includes the following components:',
            '   - WordPress Enterprise Core',
            '   - WordPress Enterprise Admin Dashboard',
            '   - WordPress Enterprise API',
            '   - WordPress Enterprise Marketplace',
            '',
            'Happy WordPressing!'
          ]
        },
        {
          name: 'wordpress-ingress',
          namespace: 'wordpress',
          version: '4.4.2',
          status: 'deployed' as const,
          revision: 1,
          updated: '2024-12-15T14:30:15Z',
          logs: [
            'NAME: wordpress-ingress',
            'LAST DEPLOYED: Fri Dec 15 14:30:15 2024',
            'NAMESPACE: wordpress',
            'STATUS: deployed',
            'REVISION: 1',
            'TEST SUITE: None',
            'NOTES:',
            'CHART NAME: ingress-nginx',
            'CHART VERSION: 4.4.2',
            'APP VERSION: 1.5.1',
            '',
            'The ingress-nginx controller has been installed.',
            'It may take a few minutes for the LoadBalancer IP to be available.',
            'You can watch the status by running \'kubectl --namespace wordpress get services -o wide -w wordpress-ingress-controller\'',
            '',
            'An example Ingress that makes use of the controller:',
            '  apiVersion: networking.k8s.io/v1',
            '  kind: Ingress',
            '  metadata:',
            '    annotations:',
            '      kubernetes.io/ingress.class: nginx',
            '    name: example',
            '    namespace: foo',
            '  spec:',
            '    ingressClassName: nginx',
            '    rules:',
            '      - host: www.example.com',
            '        http:',
            '          paths:',
            '            - backend:',
            '                service:',
            '                  name: exampleService',
            '                  port:',
            '                    number: 80',
            '              path: /',
            '              pathType: Prefix',
            '    # This section is only required if TLS is to be enabled for the Ingress',
            '    tls:',
            '      - hosts:',
            '        - www.example.com',
            '        secretName: example-tls'
          ]
        }
      ]
    },
    {
      id: '2',
      date: '2024-12-10 09:15:45',
      version: '6.4.1',
      status: 'Success',
      duration: '8m 12s',
      config: {
        clusterName: 'wordpress-prod',
        environment: 'production',
        deploymentMode: 'standard',
        storageClass: 'standard',
        domain: 'wordpress.company.com',
        useHttps: true,
        databaseType: 'internal',
        adminUsername: 'admin',
        adminEmail: 'admin@company.com',
        description: 'Standard production deployment for WordPress Enterprise'
      },
      helmCharts: [
        {
          name: 'wordpress-postgresql',
          namespace: 'wordpress',
          version: '12.1.8',
          status: 'deployed' as const,
          revision: 1,
          updated: '2024-12-10T09:12:30Z',
          logs: [
            'NAME: wordpress-postgresql',
            'LAST DEPLOYED: Tue Dec 10 09:12:30 2024',
            'NAMESPACE: wordpress',
            'STATUS: deployed',
            'REVISION: 1',
            'PostgreSQL installation completed successfully.',
            'Database is ready for connections.'
          ]
        },
        {
          name: 'wordpress-core',
          namespace: 'wordpress',
          version: '6.4.1',
          status: 'deployed' as const,
          revision: 1,
          updated: '2024-12-10T09:14:20Z',
          logs: [
            'NAME: wordpress-core',
            'LAST DEPLOYED: Tue Dec 10 09:14:20 2024',
            'NAMESPACE: wordpress',
            'STATUS: deployed',
            'REVISION: 1',
            'WordPress Enterprise 6.4.1 installed successfully.',
            'Application is ready at https://wordpress.company.com'
          ]
        }
      ]
    },
    {
      id: '3',
      date: '2024-12-08 16:22:10',
      version: '6.4.0',
      status: 'Failed',
      duration: '3m 45s',
      config: {
        clusterName: 'wordpress-prod',
        environment: 'production',
        deploymentMode: 'ha',
        storageClass: 'fast-ssd',
        domain: 'wordpress.company.com',
        useHttps: true,
        databaseType: 'external',
        adminUsername: 'admin',
        adminEmail: 'admin@company.com',
        description: 'Failed deployment attempt with external database configuration'
      },
      helmCharts: [
        {
          name: 'wordpress-postgresql',
          namespace: 'wordpress',
          version: '12.1.7',
          status: 'failed' as const,
          revision: 1,
          updated: '2024-12-08T16:22:45Z',
          logs: [
            'NAME: wordpress-postgresql',
            'LAST DEPLOYED: Sun Dec 08 16:22:45 2024',
            'NAMESPACE: wordpress',
            'STATUS: failed',
            'REVISION: 1',
            'Error: INSTALLATION FAILED: failed to create resource: admission webhook "validate.nginx.ingress.kubernetes.io" denied the request: host "wordpress.company.com" and path "/" is already defined in ingress wordpress/wordpress-ingress',
            'Error: unable to build kubernetes objects from release manifest: unable to recognize "": no matches for kind "Ingress" in version "extensions/v1beta1"',
            'Error: failed to install CRD crds/wordpress.yaml: unable to recognize "": no matches for kind "CustomResourceDefinition" in version "apiextensions.k8s.io/v1beta1"'
          ]
        }
      ]
    },
    {
      id: '4',
      date: '2024-12-05 11:45:33',
      version: '6.3.8',
      status: 'Success',
      duration: '15m 22s',
      config: {
        clusterName: 'wordpress-prod',
        environment: 'production',
        deploymentMode: 'standard',
        storageClass: 'standard',
        domain: 'wordpress.company.com',
        useHttps: false,
        databaseType: 'internal',
        adminUsername: 'admin',
        adminEmail: 'admin@company.com',
        description: 'Initial production deployment without HTTPS'
      },
      helmCharts: [
        {
          name: 'wordpress-postgresql',
          namespace: 'wordpress',
          version: '12.1.6',
          status: 'deployed' as const,
          revision: 1,
          updated: '2024-12-05T11:42:15Z',
          logs: [
            'NAME: wordpress-postgresql',
            'LAST DEPLOYED: Thu Dec 05 11:42:15 2024',
            'NAMESPACE: wordpress',
            'STATUS: deployed',
            'REVISION: 1',
            'PostgreSQL 12.1.6 deployed successfully.',
            'Initial database setup completed.'
          ]
        },
        {
          name: 'wordpress-core',
          namespace: 'wordpress',
          version: '6.3.8',
          status: 'deployed' as const,
          revision: 1,
          updated: '2024-12-05T11:44:50Z',
          logs: [
            'NAME: wordpress-core',
            'LAST DEPLOYED: Thu Dec 05 11:44:50 2024',
            'NAMESPACE: wordpress',
            'STATUS: deployed',
            'REVISION: 1',
            'WordPress Enterprise 6.3.8 initial deployment.',
            'HTTP-only configuration applied.',
            'Application available at http://wordpress.company.com'
          ]
        }
      ]
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'In Progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success':
        return 'text-green-600';
      case 'Failed':
        return 'text-red-600';
      case 'In Progress':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };


  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Deployment History</h2>
      <p className="text-gray-600">View the history of all deployments and their status</p>
      
      {deployments.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Deployment History</h3>
            <p className="text-gray-600">No deployments have been recorded yet.</p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-hidden">
            <div className="space-y-4">
              {deployments.map((deployment, index) => (
                <div
                  key={deployment.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    index !== deployments.length - 1 ? 'border-b border-gray-200' : ''
                  } hover:bg-gray-50 transition-colors`}
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {/* Status Icon and Text */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {getStatusIcon(deployment.status)}
                      <span className={`text-sm font-medium ${getStatusColor(deployment.status)}`}>
                        {deployment.status}
                      </span>
                    </div>

                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-1">
                        <h4 className="text-base font-medium text-gray-900">
                          Version {deployment.version}
                        </h4>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{deployment.date}</span>
                        </div>
                        {deployment.duration && (
                          <span>Duration: {deployment.duration}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/console/history/${deployment.id}/config`, {
                        state: {
                          config: deployment.config,
                          version: deployment.version,
                          date: deployment.date
                        }
                      })}
                      icon={<Settings className="w-4 h-4" />}
                    >
                      View Config
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<FileText className="w-4 h-4" />}
                    >
                      View Logs
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
      
      {selectedLogsDeployment && (
        <HelmLogsModal
          isOpen={!!selectedLogsDeployment}
          onClose={() => setSelectedLogsDeployment(null)}
          deploymentVersion={deployments.find(d => d.id === selectedLogsDeployment)?.version || ''}
          deploymentDate={deployments.find(d => d.id === selectedLogsDeployment)?.date || ''}
          charts={deployments.find(d => d.id === selectedLogsDeployment)?.helmCharts || []}
        />
      )}
    </div>
  );
};

export default DeploymentHistory;
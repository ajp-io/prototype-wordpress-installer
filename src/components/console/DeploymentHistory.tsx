import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useConfig } from '../../contexts/ConfigContext';
import { CheckCircle, XCircle, Clock, FileText, Calendar, Tag, Activity } from 'lucide-react';

interface DeploymentRecord {
  id: string;
  date: string;
  version: string;
  status: 'Success' | 'Failed' | 'In Progress';
  duration?: string;
}

const DeploymentHistory: React.FC = () => {
  const { prototypeSettings } = useConfig();
  const themeColor = prototypeSettings.themeColor;

  // Mock deployment data
  const [deployments] = useState<DeploymentRecord[]>([
    {
      id: '1',
      date: '2024-12-15 14:30:22',
      version: '6.4.2',
      status: 'Success',
      duration: '12m 34s',
    },
    {
      id: '2',
      date: '2024-12-10 09:15:45',
      version: '6.4.1',
      status: 'Success',
      duration: '8m 12s',
    },
    {
      id: '3',
      date: '2024-12-08 16:22:10',
      version: '6.4.0',
      status: 'Failed',
      duration: '3m 45s',
    },
    {
      id: '4',
      date: '2024-12-05 11:45:33',
      version: '6.3.8',
      status: 'Success',
      duration: '15m 22s',
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

    </div>
  );
};

export default DeploymentHistory;

export default DeploymentHistory
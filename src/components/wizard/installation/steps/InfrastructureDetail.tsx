import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Loader2, Database, Server, Package } from 'lucide-react';

interface InfrastructureDetailProps {
  status: {
    openebs: 'pending' | 'in-progress' | 'completed' | 'failed';
    registry: 'pending' | 'in-progress' | 'completed' | 'failed';
    velero: 'pending' | 'in-progress' | 'completed' | 'failed';
    components: 'pending' | 'in-progress' | 'completed' | 'failed';
    progress: number;
    currentMessage: string;
  };
  themeColor: string;
}

const InfrastructureDetail: React.FC<InfrastructureDetailProps> = ({
  status,
  themeColor
}) => {
  const renderComponentStatus = (
    title: string,
    componentStatus: 'pending' | 'in-progress' | 'completed' | 'failed',
    icon: React.ReactNode
  ) => {
    let statusIcon;
    let statusColor;

    switch (componentStatus) {
      case 'completed':
        statusIcon = <CheckCircle className="w-5 h-5 text-green-500" />;
        statusColor = 'text-green-500';
        break;
      case 'failed':
        statusIcon = <XCircle className="w-5 h-5 text-red-500" />;
        statusColor = 'text-red-500';
        break;
      case 'in-progress':
        statusIcon = <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
        statusColor = 'text-blue-500';
        break;
      default:
        statusIcon = <AlertTriangle className="w-5 h-5 text-gray-400" />;
        statusColor = 'text-gray-400';
    }

    return (
      <div className="flex items-center space-x-4 py-3">
        <div className="flex-shrink-0 text-gray-500">{icon}</div>
        <div className="flex-grow">
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        </div>
        <div className={`text-sm font-medium flex items-center ${statusColor}`}>
          {statusIcon}
          <span className="ml-2">
            {componentStatus === 'completed'
              ? 'Completed'
              : componentStatus === 'failed'
              ? 'Failed'
              : componentStatus === 'in-progress'
              ? 'Installing...'
              : 'Pending'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full transition-all duration-300"
            style={{
              width: `${status.progress}%`,
              backgroundColor: themeColor
            }}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {status.currentMessage || 'Preparing infrastructure installation...'}
        </p>
      </div>

      <div className="space-y-2 divide-y divide-gray-200">
        {renderComponentStatus('Storage (OpenEBS)', status.openebs, <Database className="w-5 h-5" />)}
        {renderComponentStatus('Container Registry', status.registry, <Server className="w-5 h-5" />)}
        {renderComponentStatus('Disaster Recovery (Velero)', status.velero, <Package className="w-5 h-5" />)}
        {renderComponentStatus('Additional Components', status.components, <Package className="w-5 h-5" />)}
      </div>
    </div>
  );
};

export default InfrastructureDetail;
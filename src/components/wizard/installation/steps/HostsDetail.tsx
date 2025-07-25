import React, { useState } from 'react';
import { Server, Copy, ClipboardCheck, CheckCircle, AlertTriangle, Cpu, MemoryStick as Memory, HardDrive } from 'lucide-react';
import Button from '../../../common/Button';
import { useConfig } from '../../../../contexts/ConfigContext';

interface HostsDetailProps {
  onComplete?: (hasFailures?: boolean) => void;
  themeColor: string;
}

interface NodeMetric {
  cpu: number;
  memory: number;
  storage: {
    used: number;
    total: number;
  };
  dataPath: string;
}

type NodeRole = 'application' | 'database';

const HostsDetail: React.FC<HostsDetailProps> = ({
  onComplete,
  themeColor
}) => {
  const { prototypeSettings } = useConfig();
  const isMultiNode = prototypeSettings.enableMultiNode;
  const skipNodeValidation = prototypeSettings.skipNodeValidation;
  
  const [selectedRole, setSelectedRole] = useState<NodeRole>('application');
  const [copied, setCopied] = useState(false);
  const [joinedNodes, setJoinedNodes] = useState({
    application: 1, // Primary host starts as application
    database: 0,
  });
  
  const requiredNodes = isMultiNode ? { application: 3, database: 3 } : { application: 1, database: 0 };
  
  // Mock node metrics
  const [nodeMetrics] = useState<Record<string, NodeMetric>>({
    'wordpress-app-1': {
      cpu: 45,
      memory: 60,
      storage: { used: 800, total: 2000 },
      dataPath: '/data/wordpress'
    }
  });

  const copyJoinCommand = () => {
    const joinCommand = `sudo ./wordpress-enterprise join 10.128.0.45:30000 ${
      selectedRole === 'application' ? 'EaKuL6cNeIlzMci3JdDU9Oi4' : 'Xm9pK4vRtY2wQn8sLj5uH7fB'
    }`;
    navigator.clipboard.writeText(joinCommand).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleStartNodeJoin = () => {
    // Simulate node joining
    const newCount = {
      ...joinedNodes,
      [selectedRole]: joinedNodes[selectedRole] + 1
    };
    setJoinedNodes(newCount);
  };

  const allNodesJoined = skipNodeValidation || (
    joinedNodes.application >= requiredNodes.application &&
    joinedNodes.database >= requiredNodes.database
  );

  const renderMetricBar = (value: number, warningThreshold = 70) => {
    const color = value >= warningThreshold ? 'rgb(249 115 22)' : themeColor;
    return (
      <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2">
        <div
          className="h-2 rounded-full transition-colors"
          style={{ 
            width: `${value}%`,
            backgroundColor: color
          }}
        />
      </div>
    );
  };

  const formatStorage = (gb: number) => `${gb}GB`;

  const renderHostCard = (name: string, type: string, metrics: NodeMetric) => (
    <div key={name} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: `${themeColor}1A` }}>
          <Server className="w-5 h-5" style={{ color: themeColor }} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-500">{type} Host</p>
        </div>
        <div className="ml-auto">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: themeColor }} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <Cpu className="w-4 h-4 text-gray-400" />
          <span className="ml-2 w-16 text-sm text-gray-600">CPU</span>
          {renderMetricBar(metrics.cpu)}
          <span className="ml-2 text-sm text-gray-600 w-12">{metrics.cpu}%</span>
        </div>

        <div className="flex items-center">
          <Memory className="w-4 h-4 text-gray-400" />
          <span className="ml-2 w-16 text-sm text-gray-600">Memory</span>
          {renderMetricBar(metrics.memory)}
          <span className="ml-2 text-sm text-gray-600 w-12">{metrics.memory}%</span>
        </div>

        <div className="flex items-center">
          <HardDrive className="w-4 h-4 text-gray-400" />
          <span className="ml-2 w-16 text-sm text-gray-600">Storage</span>
          {renderMetricBar((metrics.storage.used / metrics.storage.total) * 100)}
          <span className="ml-2 text-sm text-gray-600 w-20">
            {formatStorage(metrics.storage.used)} / {formatStorage(metrics.storage.total)}
          </span>
        </div>

        <div className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100">
          Data Path: {metrics.dataPath}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${themeColor}1A` }}>
          <CheckCircle className="w-10 h-10" style={{ color: themeColor }} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Primary Host Ready</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          k0s has been successfully installed on your primary host. 
          {isMultiNode ? ' You can now join additional hosts to create a cluster.' : ' Your single-node installation is ready.'}
        </p>
      </div>

      {/* Progress Overview */}
      {isMultiNode && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cluster Progress</h3>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: themeColor }}>
                {joinedNodes.application}/{requiredNodes.application}
              </div>
              <div className="text-sm text-gray-600">Application Hosts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold" style={{ color: themeColor }}>
                {joinedNodes.database}/{requiredNodes.database}
              </div>
              <div className="text-sm text-gray-600">Database Hosts</div>
            </div>
          </div>
        </div>
      )}

      {/* Joined Hosts */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {isMultiNode ? 'Cluster Hosts' : 'Host'}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(nodeMetrics).map(([name, metrics]) => 
            renderHostCard(name, name.includes('app') ? 'Application' : 'Database', metrics)
          )}
        </div>
      </div>

      {/* Join Additional Hosts Section */}
      {isMultiNode && !allNodesJoined && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Join Additional Hosts</h3>
          
          {/* Role Selection */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-3">Select the role for the next host:</p>
            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedRole('application')}
                disabled={joinedNodes.application >= requiredNodes.application}
                className="flex items-center px-4 py-3 rounded-lg border-2 transition-all"
                style={{
                  backgroundColor: selectedRole === 'application' ? `${themeColor}1A` : 'white',
                  borderColor: selectedRole === 'application' ? themeColor : 'rgb(229 231 235)',
                  color: joinedNodes.application >= requiredNodes.application ? 'rgb(156 163 175)' : 'rgb(55 65 81)',
                  cursor: joinedNodes.application >= requiredNodes.application ? 'not-allowed' : 'pointer',
                }}
              >
                <Server className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Application Host</div>
                  <div className="text-sm opacity-75">
                    {joinedNodes.application}/{requiredNodes.application} joined
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => setSelectedRole('database')}
                disabled={joinedNodes.database >= requiredNodes.database}
                className="flex items-center px-4 py-3 rounded-lg border-2 transition-all"
                style={{
                  backgroundColor: selectedRole === 'database' ? `${themeColor}1A` : 'white',
                  borderColor: selectedRole === 'database' ? themeColor : 'rgb(229 231 235)',
                  color: joinedNodes.database >= requiredNodes.database ? 'rgb(156 163 175)' : 'rgb(55 65 81)',
                  cursor: joinedNodes.database >= requiredNodes.database ? 'not-allowed' : 'pointer',
                }}
              >
                <Server className="w-5 h-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">Database Host</div>
                  <div className="text-sm opacity-75">
                    {joinedNodes.database}/{requiredNodes.database} joined
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Join Command */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Run this command on your {selectedRole} host:
            </label>
            <div className="bg-gray-900 rounded-lg p-4 flex items-center justify-between">
              <code className="text-gray-200 text-sm font-mono flex-1 mr-4">
                sudo ./wordpress-enterprise join 10.128.0.45:30000 {selectedRole === 'application' ? 'EaKuL6cNeIlzMci3JdDU9Oi4' : 'Xm9pK4vRtY2wQn8sLj5uH7fB'}
              </code>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyJoinCommand}
                  icon={copied ? <ClipboardCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button
                  size="sm"
                  onClick={handleStartNodeJoin}
                  disabled={joinedNodes[selectedRole] >= requiredNodes[selectedRole]}
                >
                  Simulate Join
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {allNodesJoined && isMultiNode && (
        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <div className="flex items-start">
            <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 mr-3" />
            <div>
              <h4 className="text-lg font-medium text-green-800 mb-1">
                All Required Hosts Joined
              </h4>
              <p className="text-green-700">
                Your cluster is ready with {joinedNodes.application + joinedNodes.database} hosts. 
                You can now proceed to install the infrastructure components.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Skip Option for Development */}
      {!allNodesJoined && isMultiNode && skipNodeValidation && (
        <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-amber-500 mt-0.5 mr-3" />
            <div>
              <h4 className="text-lg font-medium text-amber-800 mb-1">
                Development Mode
              </h4>
              <p className="text-amber-700">
                Node validation is disabled. You can proceed without all required hosts for testing purposes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostsDetail;
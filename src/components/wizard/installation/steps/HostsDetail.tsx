import React, { useState, useEffect } from 'react';
import { Server, Copy, ClipboardCheck, CheckCircle, AlertTriangle, Cpu, MemoryStick as Memory, HardDrive, Loader2, XCircle } from 'lucide-react';
import Button from '../../../common/Button';
import { useConfig } from '../../../../contexts/ConfigContext';
import { validateHostPreflights } from '../../../../utils/validation';
import { installK0s } from '../../../../utils/k0s';
import { HostPreflightStatus, K0sInstallStatus } from '../../../../types';

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
type HostPhase = 'preflight' | 'installing' | 'ready' | 'failed';

interface HostStatus {
  id: string;
  name: string;
  role: NodeRole;
  phase: HostPhase;
  progress: number;
  currentMessage: string;
  logs: string[];
  preflightStatus?: HostPreflightStatus;
  metrics?: NodeMetric;
  error?: string;
}

const HostsDetail: React.FC<HostsDetailProps> = ({
  onComplete,
  themeColor
}) => {
  const { config, prototypeSettings } = useConfig();
  const isMultiNode = prototypeSettings.enableMultiNode;
  const skipNodeValidation = prototypeSettings.skipNodeValidation;
  
  const [selectedRole, setSelectedRole] = useState<NodeRole>('application');
  const [copied, setCopied] = useState(false);
  const [hosts, setHosts] = useState<HostStatus[]>([
    {
      id: 'host-1',
      name: 'wordpress-app-1',
      role: 'application',
      phase: 'preflight',
      progress: 0,
      currentMessage: 'Starting host preflight checks...',
      logs: ['Initializing host setup...']
    }
  ]);
  
  const requiredNodes = isMultiNode ? { application: 3, database: 3 } : { application: 1, database: 0 };
  const readyHosts = hosts.filter(h => h.phase === 'ready');
  const joinedNodes = {
    application: readyHosts.filter(h => h.role === 'application').length,
    database: readyHosts.filter(h => h.role === 'database').length
  };

  // Start the first host installation automatically
  useEffect(() => {
    startHostInstallation('host-1');
  }, []);

  // Check if we're done
  useEffect(() => {
    const allHostsReady = hosts.every(h => h.phase === 'ready' || h.phase === 'failed');
    const hasFailures = hosts.some(h => h.phase === 'failed');
    const meetsRequirements = skipNodeValidation || (
      joinedNodes.application >= requiredNodes.application &&
      joinedNodes.database >= requiredNodes.database
    );

    if (allHostsReady && (meetsRequirements || !isMultiNode)) {
      onComplete?.(hasFailures);
    }
  }, [hosts, joinedNodes, requiredNodes, skipNodeValidation, isMultiNode]);

  const startHostInstallation = async (hostId: string) => {
    const updateHost = (updates: Partial<HostStatus>) => {
      setHosts(prev => prev.map(h => 
        h.id === hostId ? { ...h, ...updates } : h
      ));
    };

    try {
      // Phase 1: Preflight checks
      updateHost({
        phase: 'preflight',
        progress: 10,
        currentMessage: 'Running preflight checks...',
        logs: ['Starting preflight checks...']
      });

      const preflightResults = await validateHostPreflights(config);
      const hasPreflightFailures = Object.values(preflightResults).some(
        (result) => result && !result.success
      );

      if (hasPreflightFailures) {
        updateHost({
          phase: 'failed',
          progress: 100,
          currentMessage: 'Preflight checks failed',
          preflightStatus: preflightResults,
          error: 'Host preflight checks failed. Please resolve the issues and try again.',
          logs: ['Preflight checks failed']
        });
        return;
      }

      updateHost({
        progress: 30,
        currentMessage: 'Preflight checks passed, installing k0s...',
        preflightStatus: preflightResults,
        logs: ['Preflight checks completed successfully', 'Starting k0s installation...']
      });

      // Phase 2: k0s Installation
      updateHost({
        phase: 'installing',
        progress: 40,
        currentMessage: 'Installing k0s...'
      });

      await installK0s(config, (k0sStatus) => {
        updateHost({
          progress: 40 + (k0sStatus.progress || 0) * 0.6, // Scale to 40-100%
          currentMessage: k0sStatus.currentMessage || 'Installing k0s...',
          logs: [...(hosts.find(h => h.id === hostId)?.logs || []), ...(k0sStatus.logs || [])]
        });
      });

      // Phase 3: Ready
      const mockMetrics: NodeMetric = {
        cpu: Math.floor(Math.random() * 30) + 35,
        memory: Math.floor(Math.random() * 20) + 55,
        storage: {
          used: Math.floor(Math.random() * 300) + 700,
          total: 2000
        },
        dataPath: '/data/wordpress'
      };

      updateHost({
        phase: 'ready',
        progress: 100,
        currentMessage: 'Host ready',
        metrics: mockMetrics,
        logs: [...(hosts.find(h => h.id === hostId)?.logs || []), 'k0s installation completed', 'Host is ready']
      });

    } catch (error) {
      console.error('Host installation error:', error);
      updateHost({
        phase: 'failed',
        progress: 100,
        currentMessage: 'Installation failed',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };

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
    const newHostId = `host-${hosts.length + 1}`;
    const newHostName = selectedRole === 'application' ? 
      `wordpress-app-${joinedNodes.application + 1}` : 
      `wordpress-db-${joinedNodes.database + 1}`;

    const newHost: HostStatus = {
      id: newHostId,
      name: newHostName,
      role: selectedRole,
      phase: 'preflight',
      progress: 0,
      currentMessage: 'Starting host preflight checks...',
      logs: ['Initializing host setup...']
    };

    setHosts(prev => [...prev, newHost]);
    startHostInstallation(newHostId);
  };

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

  const getPhaseIcon = (phase: HostPhase) => {
    switch (phase) {
      case 'ready':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'preflight':
      case 'installing':
        return <Loader2 className="w-6 h-6 animate-spin" style={{ color: themeColor }} />;
      default:
        return <Server className="w-6 h-6 text-gray-400" />;
    }
  };

  const getPhaseColor = (phase: HostPhase) => {
    switch (phase) {
      case 'ready':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'preflight':
      case 'installing':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const renderHostCard = (host: HostStatus) => (
    <div key={host.id} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: `${themeColor}1A` }}>
          {getPhaseIcon(host.phase)}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{host.name}</h3>
          <p className="text-sm text-gray-500">{host.role === 'application' ? 'Application' : 'Database'} Host</p>
        </div>
        <div className={`text-sm font-medium ${getPhaseColor(host.phase)}`}>
          {host.phase === 'ready' ? 'Ready' : 
           host.phase === 'failed' ? 'Failed' :
           host.phase === 'installing' ? 'Installing' : 'Checking'}
        </div>
      </div>

      {/* Progress Bar */}
      {host.phase !== 'ready' && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${host.progress}%`,
                backgroundColor: host.phase === 'failed' ? 'rgb(239 68 68)' : themeColor,
              }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">{host.currentMessage}</p>
        </div>
      )}

      {/* Error Display */}
      {host.phase === 'failed' && host.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{host.error}</p>
        </div>
      )}

      {/* Failed Preflight Checks */}
      {host.phase === 'failed' && host.preflightStatus && (
        <div className="mb-4 space-y-2">
          {Object.entries(host.preflightStatus)
            .filter(([_, result]) => result && !result.success)
            .map(([key, result]) => (
              <div key={key} className="flex items-start">
                <XCircle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h5 className="text-sm font-medium text-red-800">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h5>
                  <p className="mt-1 text-sm text-red-700">{result?.message}</p>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Host Metrics (when ready) */}
      {host.phase === 'ready' && host.metrics && (
        <div className="space-y-4">
          <div className="flex items-center">
            <Cpu className="w-4 h-4 text-gray-400" />
            <span className="ml-2 w-16 text-sm text-gray-600">CPU</span>
            {renderMetricBar(host.metrics.cpu)}
            <span className="ml-2 text-sm text-gray-600 w-12">{host.metrics.cpu}%</span>
          </div>

          <div className="flex items-center">
            <Memory className="w-4 h-4 text-gray-400" />
            <span className="ml-2 w-16 text-sm text-gray-600">Memory</span>
            {renderMetricBar(host.metrics.memory)}
            <span className="ml-2 text-sm text-gray-600 w-12">{host.metrics.memory}%</span>
          </div>

          <div className="flex items-center">
            <HardDrive className="w-4 h-4 text-gray-400" />
            <span className="ml-2 w-16 text-sm text-gray-600">Storage</span>
            {renderMetricBar((host.metrics.storage.used / host.metrics.storage.total) * 100)}
            <span className="ml-2 text-sm text-gray-600 w-20">
              {formatStorage(host.metrics.storage.used)} / {formatStorage(host.metrics.storage.total)}
            </span>
          </div>

          <div className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100">
            Data Path: {host.metrics.dataPath}
          </div>
        </div>
      )}
    </div>
  );

  const allNodesJoined = skipNodeValidation || (
    joinedNodes.application >= requiredNodes.application &&
    joinedNodes.database >= requiredNodes.database
  );

  return (
    <div className="space-y-8">
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

      {/* Host Cards */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {isMultiNode ? 'Cluster Hosts' : 'Host'}
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {hosts.map(renderHostCard)}
        </div>
      </div>

      {/* Join Additional Hosts Section */}
      {isMultiNode && !allNodesJoined && readyHosts.length > 0 && (
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
                Your cluster is ready with {hosts.filter(h => h.phase === 'ready').length} hosts. 
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
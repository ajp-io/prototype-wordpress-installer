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
  isRevisiting?: boolean;
}

interface NodeMetric {
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
  themeColor,
  isRevisiting = false
}) => {
  const { config, prototypeSettings } = useConfig();
  const isMultiNode = prototypeSettings.enableMultiNode;
  
  const [copied, setCopied] = useState(false);
  const [hosts, setHosts] = useState<HostStatus[]>([
    {
      id: 'host-1',
      name: 'host-1',
      role: 'application', // Keep for internal tracking but don't display
      phase: 'preflight',
      progress: 0,
      currentMessage: 'Starting host preflight checks...',
      logs: ['Initializing host setup...']
    }
  ]);
  
  const readyHosts = hosts.filter(h => h.phase === 'ready');

  // Start the first host installation automatically only if not revisiting
  useEffect(() => {
    if (!isRevisiting) {
      startHostInstallation('host-1');
    } else {
      // If revisiting, show completed state
      setHosts([{
        id: 'host-1',
        name: 'host-1',
        role: 'application',
        phase: 'ready',
        progress: 100,
        currentMessage: 'Host ready',
        logs: ['Runtime installation completed', 'Host ready'],
        metrics: {
          dataPath: '/data/wordpress'
        }
      }]);
    }
  }, [isRevisiting]);

  // Check if we're done
  useEffect(() => {
    const allHostsReady = hosts.every(h => h.phase === 'ready' || h.phase === 'failed');
    const hasFailures = hosts.some(h => h.phase === 'failed');

    if (allHostsReady && !isRevisiting) {
      onComplete?.(hasFailures);
    }
  }, [hosts, isMultiNode]);

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
        currentMessage: 'Preflight checks passed, installing runtime...',
        preflightStatus: preflightResults,
        logs: ['Preflight checks completed successfully', 'Starting k0s installation...']
      });

      // Phase 2: k0s Installation
      updateHost({
        phase: 'installing',
        progress: 40,
        currentMessage: 'Installing runtime...'
      });

      await installK0s(config, (k0sStatus) => {
        updateHost({
          progress: 40 + (k0sStatus.progress || 0) * 0.6, // Scale to 40-100%
          currentMessage: k0sStatus.currentMessage || 'Installing runtime...',
          logs: [...(hosts.find(h => h.id === hostId)?.logs || []), ...(k0sStatus.logs || [])]
        });
      });

      // Phase 3: Ready
      const mockMetrics: NodeMetric = {
        dataPath: '/data/wordpress'
      };

      updateHost({
        phase: 'ready',
        progress: 100,
        currentMessage: 'Host ready',
        metrics: mockMetrics,
        logs: [...(hosts.find(h => h.id === hostId)?.logs || []), 'k0s installation completed', 'Host ready']
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
    const joinCommand = `sudo ./wordpress-enterprise join 10.128.0.45:30000 EaKuL6cNeIlzMci3JdDU9Oi4`;
    navigator.clipboard.writeText(joinCommand).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleStartNodeJoin = () => {
    const newHostId = `host-${hosts.length + 1}`;
    const newHostName = `host-${hosts.length + 1}`;

    const newHost: HostStatus = {
      id: newHostId,
      name: newHostName,
      role: 'application',
      phase: 'preflight',
      progress: 0,
      currentMessage: 'Starting host preflight checks...',
      logs: ['Initializing host setup...']
    };

    setHosts(prev => [...prev, newHost]);
    startHostInstallation(newHostId);
  };

  const getPhaseIcon = (phase: HostPhase) => {
    switch (phase) {
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'preflight':
      case 'installing':
        return <Loader2 className="w-5 h-5 animate-spin" style={{ color: themeColor }} />;
      default:
        return <Server className="w-5 h-5 text-gray-400" />;
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
    <div key={host.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Header Section */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {getPhaseIcon(host.phase)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{host.name}</h3>
              <p className="text-sm text-gray-500">Runtime Host</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-medium ${getPhaseColor(host.phase)}`}>
              {host.phase === 'ready' ? 'Ready' : 
               host.phase === 'failed' ? 'Failed' :
               host.phase === 'installing' ? 'Installing' : 'Checking'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {host.phase === 'ready' ? 'Installation Complete' : 
               host.phase === 'failed' ? 'Requires Attention' :
               `${host.progress}% Complete`}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="px-6 py-4">
        {/* Progress Bar - Always show, but different styles based on phase */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Installation Progress</span>
            <span className="text-sm text-gray-500">{host.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${host.progress}%`,
                backgroundColor: host.phase === 'failed' ? 'rgb(239 68 68)' : 
                               host.phase === 'ready' ? 'rgb(34 197 94)' : themeColor,
              }}
            />
          </div>
        </div>

        {/* Status Message */}
        <div className="flex items-start space-x-3 mb-4">
          <div className="flex-shrink-0 mt-1">
            <div className="w-2 h-2 rounded-full" style={{
              backgroundColor: host.phase === 'failed' ? 'rgb(239 68 68)' : 
                             host.phase === 'ready' ? 'rgb(34 197 94)' : themeColor
            }} />
          </div>
          <div>
            <p className="text-sm text-gray-900 font-medium">{host.currentMessage}</p>
            <p className="text-xs text-gray-500 mt-1">
              Data Directory: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">/data/wordpress</span>
            </p>
          </div>
        </div>
      </div>

      {/* Error Section */}
      {host.phase === 'failed' && host.error && (
        <div className="px-6 py-4 bg-red-50 border-t border-red-100">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-red-800 mb-1">Installation Error</h4>
              <p className="text-sm text-red-700">{host.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Failed Preflight Checks Section */}
      {host.phase === 'failed' && host.preflightStatus && (
        <div className="px-6 py-4 bg-red-50 border-t border-red-100">
          <h4 className="text-sm font-medium text-red-800 mb-4 flex items-center">
            <XCircle className="w-4 h-4 mr-2" />
            Failed Preflight Checks
          </h4>
          <div className="space-y-4">
            {Object.entries(host.preflightStatus)
              .filter(([_, result]) => result && !result.success)
              .map(([key, result]) => (
                <div key={key} className="bg-white rounded-md border border-red-200 p-3">
                  <div className="flex items-start space-x-3">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-red-800 mb-2">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </h5>
                      <p className="text-sm text-red-700 leading-relaxed">
                        {result?.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Join Command Section - Always visible for multi-node */}
      {isMultiNode && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Add Additional Hosts</h3>
          <p className="text-xs text-gray-600 mb-3">
            Run this command on additional hosts to join them to the installation:
          </p>
          <div className="bg-gray-900 rounded-md p-3 flex items-center justify-between">
            <code className="text-gray-200 text-xs font-mono flex-1 mr-3">
              sudo ./wordpress-enterprise join 10.128.0.45:30000 EaKuL6cNeIlzMci3JdDU9Oi4
            </code>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyJoinCommand}
                icon={copied ? <ClipboardCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                className="text-xs py-1 px-2"
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                size="sm"
                onClick={handleStartNodeJoin}
                className="text-xs py-1 px-2"
              >
                Simulate Join
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Host Cards */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Hosts ({hosts.length})
        </h3>
        <div className="space-y-4">
          {hosts.map(renderHostCard)}
        </div>
      </div>
    </div>
  );
};

export default HostsDetail;
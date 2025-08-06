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
    <div key={host.id} className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          {getPhaseIcon(host.phase)}
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900">{host.name}</h3>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {host.phase !== 'ready' && host.phase !== 'failed' && (
        <div className="mb-3">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${host.progress}%`,
                backgroundColor: host.phase === 'failed' ? 'rgb(239 68 68)' : themeColor,
              }}
            />
          </div>
        </div>
      )}

      {/* Status Message and Data Directory */}
      <div className="text-center space-y-1">
        <div className="text-xs text-gray-500">{host.currentMessage}</div>
        <div className="text-xs text-gray-500">
          Data Directory: <span className="font-mono text-gray-700">/data/wordpress</span>
        </div>
      </div>

      {/* Error Display */}
      {host.phase === 'failed' && host.error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-md">
          <p className="text-xs text-red-700">{host.error}</p>
        </div>
      )}

      {/* Failed Preflight Checks */}
      {host.phase === 'failed' && host.preflightStatus && (
        <div className="mb-3 space-y-1">
          {Object.entries(host.preflightStatus)
            .filter(([_, result]) => result && !result.success)
            .slice(0, 2) // Show only first 2 errors to save space
            .map(([key, result]) => (
              <div key={key} className="flex items-start">
                <XCircle className="w-3 h-3 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <h5 className="text-xs font-medium text-red-800">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h5>
                </div>
              </div>
            ))}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {hosts.map(renderHostCard)}
        </div>
      </div>
    </div>
  );
};

export default HostsDetail;
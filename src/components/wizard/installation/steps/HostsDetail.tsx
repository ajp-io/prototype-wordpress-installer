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

  const handleRerunPreflights = (hostId: string) => {
    startHostInstallation(hostId);
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
    <div key={host.id} className={`rounded-lg p-6 ${
      host.phase === 'failed' 
        ? 'bg-red-50 border border-red-200' 
        : 'bg-white border border-gray-200'
    }`}>
      {/* Header with host name and status */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{host.name}</h3>
        <div className="flex items-center space-x-2">
          {getPhaseIcon(host.phase)}
          <span className={`text-sm font-medium ${getPhaseColor(host.phase)}`}>
            {host.phase === 'ready' ? 'Ready' : 
             host.phase === 'failed' ? 'Failed' :
             host.phase === 'preflight' ? 'Checking' : 'Installing'}
          </span>
        </div>
      </div>

      {/* Progress bar - only when in progress */}
      {(host.phase === 'preflight' || host.phase === 'installing') && (
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: `${host.progress}%`,
                backgroundColor: themeColor,
              }}
            />
          </div>
        </div>
      )}

      {/* Status message - only when not ready */}

      {/* Failed preflight checks */}
      {host.phase === 'failed' && host.preflightStatus && (
        <div className="mt-4 space-y-4">
          {/* Header with count and rerun button */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Preflight checks failed (8 of 52)
            </h4>
            <Button
              onClick={() => handleRerunPreflights(host.id)}
              size="sm"
              className="ml-4"
            >
              Rerun Preflight Checks
            </Button>
          </div>
          
          {/* Failed checks list */}
          <div className="space-y-3">
            {Object.entries(host.preflightStatus)
              .filter(([_, result]) => result && !result.success)
              .map(([key, result]) => (
                <div key={key} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div className="flex-shrink-0 mt-0.5">
                    <XCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-gray-900 mb-1">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </h5>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {result?.message}
                    </p>
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
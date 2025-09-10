import React, { useState } from 'react';
import Modal from '../common/Modal';
import { ChevronDown, ChevronUp, Terminal, Package, Clock, CheckCircle, XCircle } from 'lucide-react';

interface HelmChart {
  name: string;
  namespace: string;
  version: string;
  status: 'deployed' | 'failed' | 'pending-install' | 'pending-upgrade';
  revision: number;
  updated: string;
  logs: string[];
}

interface HelmLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deploymentVersion: string;
  deploymentDate: string;
  charts: HelmChart[];
}

const HelmLogsModal: React.FC<HelmLogsModalProps> = ({
  isOpen,
  onClose,
  deploymentVersion,
  deploymentDate,
  charts
}) => {
  const [expandedCharts, setExpandedCharts] = useState<Set<string>>(new Set());

  const toggleChart = (chartName: string) => {
    setExpandedCharts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chartName)) {
        newSet.delete(chartName);
      } else {
        newSet.add(chartName);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Deployment Logs - Version ${deploymentVersion}`}
      size="xl"
    >
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-3 border">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Deployed: {deploymentDate}</span>
            <span className="mx-2">•</span>
            <Package className="w-4 h-4" />
            <span>{charts.length} Helm Charts</span>
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {charts.map((chart) => {
            const isExpanded = expandedCharts.has(chart.name);
            
            return (
              <div key={chart.name} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleChart(chart.name)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-gray-400" />
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">{chart.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>v{chart.version}</span>
                        <span>Revision {chart.revision}</span>
                        <span>{chart.namespace}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(chart.status)}
                      <span className={`text-sm font-medium ${getStatusColor(chart.status)}`}>
                        {chart.status}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200">
                    <div className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Terminal className="w-4 h-4 text-gray-500" />
                        <h4 className="text-sm font-medium text-gray-700">Helm Installation Logs</h4>
                      </div>
                      <div className="bg-gray-900 text-gray-200 rounded-md p-3 font-mono text-xs overflow-x-auto">
                        <div className="space-y-1">
                          {chart.logs.map((log, index) => (
                            <div key={index} className="whitespace-pre-wrap">
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-xs text-gray-500 mt-4">
          Click on any chart to view its Helm installation logs
        </div>
      </div>
    </Modal>
  );
};

export default HelmLogsModal;
import React, { useState } from 'react';
import { CheckCircle, XCircle, Loader2, Clock, ChevronDown, ChevronUp, Terminal } from 'lucide-react';
import { InstallationStep } from '../../../../types/installation';

interface StepDetailViewProps {
  step: InstallationStep | undefined;
  allLogs: string[];
  themeColor: string;
}

const StepDetailView: React.FC<StepDetailViewProps> = ({
  step,
  allLogs,
  themeColor
}) => {
  const [showLogs, setShowLogs] = useState(false);

  if (!step) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Select a step to view details</p>
        </div>
      </div>
    );
  }

  const getSubStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSubStepTextColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-700';
      case 'failed':
        return 'text-red-700';
      case 'running':
        return 'text-blue-700';
      default:
        return 'text-gray-600';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString();
  };

  const getDuration = () => {
    if (!step.startTime) return null;
    const end = step.endTime || new Date();
    const duration = Math.round((end.getTime() - step.startTime.getTime()) / 1000);
    return `${duration}s`;
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.name}</h3>
        <p className="text-gray-600">{step.description}</p>
        
        {step.status === 'running' && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{step.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: themeColor,
                  width: `${step.progress}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Sub-steps */}
        {step.subSteps && step.subSteps.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Components</h4>
            <div className="space-y-3">
              {step.subSteps.map((subStep) => (
                <div key={subStep.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  {getSubStepIcon(subStep.status)}
                  <span className={`font-medium ${getSubStepTextColor(subStep.status)}`}>
                    {subStep.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {step.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="text-sm font-medium text-red-800">Error</h5>
                <p className="text-sm text-red-700 mt-1">{step.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Timing Information */}
        {(step.startTime || step.endTime) && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              {step.startTime && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>Started: {formatTime(step.startTime)}</span>
                </div>
              )}
              {step.endTime && (
                <div className="flex items-center space-x-1">
                  {step.status === 'completed' ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span>Finished: {formatTime(step.endTime)}</span>
                </div>
              )}
              {getDuration() && (
                <div className="flex items-center space-x-1">
                  <span>Duration: {getDuration()}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer with logs */}
      <div className="border-t border-gray-200">
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Installation Logs ({allLogs.length} entries)
              </span>
            </div>
            {showLogs ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </button>
        
        {showLogs && (
          <div className="border-t border-gray-200 bg-gray-900 text-gray-200 p-4 h-48 overflow-y-auto font-mono text-xs">
            {allLogs.length === 0 ? (
              <div className="text-gray-400 italic">No logs available yet...</div>
            ) : (
              allLogs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap pb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StepDetailView;
import React from 'react';
import { InstallationStep } from '../../../../types/installation';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

interface StepDetailsProps {
  step: InstallationStep;
  themeColor: string;
}

const StepDetails: React.FC<StepDetailsProps> = ({ step, themeColor }) => {
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
    <div className="ml-8 mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      {/* Timing Information */}
      <div className="flex items-center space-x-6 mb-4 text-sm text-gray-600">
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
          <div>
            <span>Duration: {getDuration()}</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {step.error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start space-x-2">
            <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="text-sm font-medium text-red-800">Error</h5>
              <p className="text-sm text-red-700 mt-1">{step.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar for Running Steps */}
      {step.status === 'running' && (
        <div className="mb-4">
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

      {/* Logs */}
      {step.logs.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2">Logs</h5>
          <div className="bg-gray-900 text-gray-200 rounded-md p-3 max-h-48 overflow-y-auto font-mono text-xs">
            {step.logs.map((log, index) => (
              <div key={index} className="whitespace-pre-wrap pb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StepDetails;
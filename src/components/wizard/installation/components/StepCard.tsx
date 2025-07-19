import React from 'react';
import { ChevronDown, ChevronRight, CheckCircle, XCircle, AlertTriangle, Loader2, Clock } from 'lucide-react';
import { InstallationStep } from '../../../../types/installation';

interface StepCardProps {
  step: InstallationStep;
  themeColor: string;
}

const StepCard: React.FC<StepCardProps> = ({
  step,
  themeColor
}) => {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const getStatusIcon = () => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'skipped':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (step.status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'running':
        return 'Running...';
      case 'skipped':
        return 'Skipped';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = () => {
    switch (step.status) {
      case 'completed':
        return 'text-green-700';
      case 'failed':
        return 'text-red-700';
      case 'running':
        return 'text-blue-700';
      case 'skipped':
        return 'text-yellow-700';
      default:
        return 'text-gray-500';
    }
  };

  const getBorderColor = () => {
    switch (step.status) {
      case 'completed':
        return 'border-green-200';
      case 'failed':
        return 'border-red-200';
      case 'running':
        return `border-[${themeColor}]`;
      default:
        return 'border-gray-200';
    }
  };

  const getBackgroundColor = () => {
    switch (step.status) {
      case 'completed':
        return 'bg-green-50';
      case 'failed':
        return 'bg-red-50';
      case 'running':
        return `bg-[${themeColor}]/5`;
      default:
        return 'bg-white';
    }
  };

  const getSubStepIcon = (subStep: any) => {
    switch (subStep.status) {
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

  const getSubStepTextColor = (subStep: any) => {
    switch (subStep.status) {
      case 'completed':
        return 'text-green-700';
      case 'failed':
        return 'text-red-700';
      case 'running':
        return 'text-blue-700';
      default:
        return 'text-gray-500';
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
    <div 
      className={`border rounded-lg transition-all duration-200 ${getBorderColor()} ${getBackgroundColor()}`}
    >
      {/* Header Section */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h4 className="text-base font-medium text-gray-900">{step.name}</h4>
            <p className="text-sm text-gray-600">{step.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </div>
            {step.status === 'running' && (
              <div className="text-xs text-gray-500">
                {step.progress}%
              </div>
            )}
          </div>
          
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>
      
      {/* Progress Bar for Running Steps */}
      {step.status === 'running' && (
        <div className="px-4 pb-2">
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

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* Sub-steps/Components */}
          {step.subSteps && step.subSteps.length > 0 && (
            <div className="p-4">
              <h5 className="text-sm font-medium text-gray-700 mb-3">Components</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {step.subSteps.map((subStep) => (
                  <div key={subStep.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                    {getSubStepIcon(subStep)}
                    <span className={`text-sm font-medium ${getSubStepTextColor(subStep)}`}>
                      {subStep.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {step.error && (
            <div className="px-4 pb-4">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="text-sm font-medium text-red-800">Error</h5>
                    <p className="text-sm text-red-700 mt-1">{step.error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timing Information */}
          {(step.startTime || step.endTime) && (
            <div className="px-4 pb-4">
              <div className="flex items-center space-x-6 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
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

          {/* Progress Details for Running Steps */}
          {step.status === 'running' && (
            <div className="px-4 pb-4">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="flex justify-between text-sm text-blue-700 mb-1">
                  <span>Progress</span>
                  <span>{step.progress}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StepCard;
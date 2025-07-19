import React from 'react';
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { InstallationStep } from '../../../../types/installation';

interface StepCardProps {
  step: InstallationStep;
  themeColor: string;
}

const StepCard: React.FC<StepCardProps> = ({
  step,
  themeColor
}) => {
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
        const completedCount = step.subSteps?.length || 0;
        return `All ${completedCount} checks passed`;
      case 'failed':
        const failedChecks = step.subSteps?.filter(sub => sub.status === 'failed') || [];
        return `${failedChecks.length} checks failed`;
      case 'running':
        return 'Running checks...';
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

  const failedChecks = step.subSteps?.filter(sub => sub.status === 'failed') || [];

  return (
    <div className="border border-gray-200 rounded-lg bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h4 className="text-base font-medium text-gray-900">{step.name}</h4>
          </div>
        </div>
        
        <div className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </div>
      </div>
      
      {/* Progress Bar for Running Steps */}
      {step.status === 'running' && (
        <div className="mt-3">
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

      {/* Failed Checks Details */}
      {step.status === 'failed' && failedChecks.length > 0 && (
        <div className="mt-4 space-y-2">
          {failedChecks.map((check) => (
            <div key={check.id} className="flex items-start space-x-2">
              <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-red-800">{check.name}</div>
                <div className="text-sm text-red-700">{check.error || 'Check failed'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StepCard;
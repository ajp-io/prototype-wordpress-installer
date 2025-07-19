import React from 'react';
import { CheckCircle, XCircle, Loader2, Clock, AlertTriangle } from 'lucide-react';
import { InstallationStep } from '../../../../types/installation';

interface StepCardProps {
  step: InstallationStep;
  themeColor: string;
}

const StepCard: React.FC<StepCardProps> = ({
  step,
  themeColor
}) => {
  const getMainStatusIcon = () => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'running':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      case 'skipped':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  const getSubStepIcon = (status: 'pending' | 'running' | 'completed' | 'failed') => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getMainStatusText = () => {
    switch (step.status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'running':
        return step.id === 'preflights' ? 'Running checks...' : 'Installing...';
      case 'skipped':
        return 'Skipped';
      default:
        return 'Pending';
    }
  };

  const getMainStatusColor = () => {
    switch (step.status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'running':
        return 'text-blue-600';
      case 'skipped':
        return 'text-yellow-600';
      default:
        return 'text-gray-500';
    }
  };

  const renderPreflightContent = () => {
    if (step.status === 'completed') {
      const totalChecks = step.subSteps?.length || 0;
      return (
        <div className="mt-4 p-3 bg-green-50 rounded-md">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            <span className="text-sm text-green-700 font-medium">
              All {totalChecks} pre-flight checks passed successfully
            </span>
          </div>
        </div>
      );
    }

    if (step.status === 'failed') {
      const failedChecks = step.subSteps?.filter(sub => sub.status === 'failed') || [];
      return (
        <div className="mt-4 space-y-3">
          <div className="text-sm text-red-700 font-medium">
            {failedChecks.length} checks failed:
          </div>
          {failedChecks.map((check) => (
            <div key={check.id} className="ml-6 flex items-start space-x-2">
              <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-red-800">{check.name}</div>
                <div className="text-sm text-red-700">{check.error || 'Check failed'}</div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  const renderApplicationContent = () => {
    if (!step.subSteps || step.subSteps.length === 0) return null;

    return (
      <div className="mt-4 space-y-3">
        {step.subSteps.map((subStep) => (
          <div key={subStep.id} className="ml-6 flex items-center space-x-3">
            {getSubStepIcon(subStep.status)}
            <span className="text-sm text-gray-900">{subStep.name}</span>
            {subStep.status === 'running' && (
              <span className="text-sm text-blue-600">- Installing...</span>
            )}
            {subStep.status === 'failed' && subStep.error && (
              <span className="text-sm text-red-600">- {subStep.error}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderInfrastructureContent = () => {
    if (!step.subSteps || step.subSteps.length === 0) return null;

    return (
      <div className="mt-4 space-y-3">
        {step.subSteps.map((subStep) => (
          <div key={subStep.id} className="ml-6 flex items-center space-x-3">
            {getSubStepIcon(subStep.status)}
            <span className="text-sm text-gray-900">{subStep.name}</span>
            {subStep.status === 'running' && (
              <span className="text-sm text-blue-600">- Installing...</span>
            )}
            {subStep.status === 'failed' && subStep.error && (
              <span className="text-sm text-red-600">- {subStep.error}</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (step.id) {
      case 'preflights':
        return renderPreflightContent();
      case 'application':
        return renderApplicationContent();
      case 'infrastructure':
        return renderInfrastructureContent();
      default:
        return null;
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getMainStatusIcon()}
          <div>
            <h4 className="text-lg font-medium text-gray-900">{step.name}</h4>
            <p className="text-sm text-gray-500">{step.description}</p>
          </div>
        </div>
        
        <div className={`text-sm font-medium ${getMainStatusColor()}`}>
          {getMainStatusText()}
        </div>
      </div>
      
      {/* Progress Bar for Running Steps */}
      {step.status === 'running' && (
        <div className="mt-4">
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

      {/* Step-specific content */}
      {renderStepContent()}
    </div>
  );
};

export default StepCard;
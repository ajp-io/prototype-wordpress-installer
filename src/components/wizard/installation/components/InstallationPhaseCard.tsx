import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Clock, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { InstallationStep } from '../../../../types/installation';
import Button from '../../../common/Button';

interface InstallationPhaseCardProps {
  step: InstallationStep;
  themeColor: string;
}

const InstallationPhaseCard: React.FC<InstallationPhaseCardProps> = ({
  step,
  themeColor
}) => {
  const [isExpanded, setIsExpanded] = useState(step.status === 'failed');

  const getPhaseIcon = () => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-white" />;
      case 'failed':
        return <XCircle className="w-8 h-8 text-white" />;
      case 'running':
        return <Loader2 className="w-8 h-8 text-white animate-spin" />;
      default:
        return <Clock className="w-8 h-8 text-white" />;
    }
  };

  const getPhaseIconBg = () => {
    switch (step.status) {
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'running':
        return `bg-[${themeColor}]`;
      default:
        return 'bg-gray-400';
    }
  };

  const getCardBorderColor = () => {
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

  const getCardBgColor = () => {
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

  const getStatusBadge = () => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    
    switch (step.status) {
      case 'completed':
        return <span className={`${baseClasses} bg-green-100 text-green-700`}>Completed</span>;
      case 'failed':
        return <span className={`${baseClasses} bg-red-100 text-red-700`}>Failed</span>;
      case 'running':
        return <span className={`${baseClasses} text-white`} style={{ backgroundColor: themeColor }}>Running</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-600`}>Pending</span>;
    }
  };

  const renderRunningContent = () => {
    const runningSubStep = step.subSteps?.find(sub => sub.status === 'running');
    if (runningSubStep) {
      return (
        <div className="flex items-center space-x-3 text-gray-700">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: themeColor }} />
          <span>{runningSubStep.name} - Installing...</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center space-x-3 text-gray-700">
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: themeColor }} />
        <span>Running system validation checks...</span>
      </div>
    );
  };

  const renderCompletedContent = () => {
    if (step.id === 'preflights') {
      const totalChecks = step.subSteps?.length || 5;
      return (
        <div className="flex items-center space-x-3 text-green-700">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span>All {totalChecks} pre-flight checks passed successfully</span>
        </div>
      );
    }

    // For other completed steps, show sub-steps
    return (
      <div className="space-y-2">
        {step.subSteps?.map((subStep) => (
          <div key={subStep.id} className="flex items-center space-x-3 text-green-700">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm">{subStep.name}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderFailedContent = () => {
    const failedSubSteps = step.subSteps?.filter(sub => sub.status === 'failed') || [];
    const totalChecks = step.subSteps?.length || 5;
    
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-red-100 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span className="text-red-700 font-medium">
            {failedSubSteps.length} of {totalChecks} {step.id === 'preflights' ? 'pre-flight checks' : 'components'} failed
          </span>
        </div>

        {isExpanded && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Failed Checks ({failedSubSteps.length})</h4>
            <div className="space-y-2">
              {failedSubSteps.map((subStep) => (
                <div key={subStep.id} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-red-800">{subStep.name}</div>
                    <div className="text-sm text-red-700 mt-1">
                      {getFailureMessage(subStep.id)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Button
              variant="primary"
              size="sm"
              icon={<RefreshCw className="w-4 h-4" />}
              className="mt-4"
            >
              Retry {step.id === 'preflights' ? 'Pre-flight Checks' : 'Installation'}
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderPendingContent = () => {
    return (
      <div className="space-y-2">
        {step.subSteps?.map((subStep) => (
          <div key={subStep.id} className="flex items-center space-x-3 text-gray-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{subStep.name}</span>
          </div>
        ))}
      </div>
    );
  };

  const getFailureMessage = (subStepId: string): string => {
    const messages: { [key: string]: string } = {
      'storage': 'Required storage class "standard" not found. Please create the storage class or select a different one.',
      'networking': 'Ingress controller not detected. Install an ingress controller (e.g., nginx-ingress) to enable external access.',
      'kubernetes': 'Unable to connect to Kubernetes cluster. Check your kubeconfig and cluster status.',
      'helm': 'Helm is not installed or not accessible. Please install Helm version 3.8.0 or later.',
      'permissions': 'Insufficient RBAC permissions. The current user needs cluster-admin or equivalent permissions.',
      'database': 'Failed to create PostgreSQL deployment: insufficient memory resources',
      'core': 'WordPress core installation failed: timeout waiting for deployment',
      'plugins': 'Plugin installation failed: unable to download from registry'
    };
    
    return messages[subStepId] || 'An unexpected error occurred during this step.';
  };

  const renderContent = () => {
    switch (step.status) {
      case 'running':
        return renderRunningContent();
      case 'completed':
        return renderCompletedContent();
      case 'failed':
        return renderFailedContent();
      default:
        return renderPendingContent();
    }
  };

  const canToggle = step.status === 'failed' || (step.status === 'completed' && step.subSteps && step.subSteps.length > 1);

  return (
    <div 
      className={`border rounded-lg transition-all duration-200 ${getCardBorderColor()} ${getCardBgColor()}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getPhaseIconBg()}`}>
            {getPhaseIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{step.name}</h3>
            <p className="text-sm text-gray-600">{step.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {getStatusBadge()}
          {canToggle && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar for Running Steps */}
      {step.status === 'running' && (
        <div className="px-5 pb-3">
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

      {/* Content */}
      <div className="px-5 pb-5">
        {renderContent()}
      </div>

      {/* Error Message */}
      {step.error && step.status === 'failed' && !isExpanded && (
        <div className="px-5 pb-5">
          <div className="p-3 bg-red-100 rounded-lg border border-red-200">
            <p className="text-sm text-red-700">{step.error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstallationPhaseCard;
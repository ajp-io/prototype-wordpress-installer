import React from 'react';
import { ChevronDown, ChevronRight, CheckCircle, XCircle, AlertTriangle, Loader2, Clock } from 'lucide-react';
import { InstallationStep } from '../../../../types/installation';

interface StepCardProps {
  step: InstallationStep;
  isExpanded: boolean;
  onToggle: () => void;
  themeColor: string;
}

const StepCard: React.FC<StepCardProps> = ({
  step,
  isExpanded,
  onToggle,
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

  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-sm ${getBorderColor()} ${getBackgroundColor()}`}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
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
    </div>
  );
};

export default StepCard;
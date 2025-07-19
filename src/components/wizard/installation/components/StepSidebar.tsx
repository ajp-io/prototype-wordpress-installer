import React from 'react';
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { InstallationStep } from '../../../../types/installation';

interface StepSidebarProps {
  steps: InstallationStep[];
  selectedStepId: string | null;
  onStepSelect: (stepId: string) => void;
  themeColor: string;
}

const StepSidebar: React.FC<StepSidebarProps> = ({
  steps,
  selectedStepId,
  onStepSelect,
  themeColor
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Complete';
      case 'failed':
        return 'Failed';
      case 'running':
        return 'Running';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'running':
        return 'text-blue-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="w-80 border-r border-gray-200 bg-gray-50">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-900">Installation Steps</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {steps.map((step) => {
          const isSelected = selectedStepId === step.id;
          
          return (
            <button
              key={step.id}
              onClick={() => onStepSelect(step.id)}
              className={`w-full text-left p-4 hover:bg-gray-100 transition-colors ${
                isSelected ? 'bg-white border-r-2' : ''
              }`}
              style={{
                borderRightColor: isSelected ? themeColor : 'transparent',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(step.status)}
                  <span className="font-medium text-gray-900">{step.name}</span>
                </div>
                <span className={`text-xs font-medium ${getStatusColor(step.status)}`}>
                  {getStatusText(step.status)}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{step.description}</p>
              
              {step.status === 'running' && (
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: themeColor,
                      width: `${step.progress}%`,
                    }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StepSidebar;
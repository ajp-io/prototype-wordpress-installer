import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Loader2, Clock } from 'lucide-react';

export type InstallationStep = 'infrastructure' | 'preflights' | 'application';

export interface StepStatus {
  status: 'pending' | 'running' | 'completed' | 'failed';
  title: string;
  description: string;
  progress?: number;
  error?: string;
}

interface InstallationTimelineProps {
  steps: Record<InstallationStep, StepStatus>;
  currentStep: InstallationStep;
  isLinuxMode: boolean;
  themeColor: string;
}

const InstallationTimeline: React.FC<InstallationTimelineProps> = ({
  steps,
  currentStep,
  isLinuxMode,
  themeColor
}) => {
  const getStepOrder = (): InstallationStep[] => {
    if (isLinuxMode) {
      return ['infrastructure', 'preflights', 'application'];
    }
    return ['preflights', 'application'];
  };

  const getStatusIcon = (status: 'pending' | 'running' | 'completed' | 'failed') => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'failed':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'running':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-6 h-6 text-gray-400" />;
    }
  };

  const stepOrder = getStepOrder();

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Installation Progress</h3>
      
      <div className="space-y-6">
        {stepOrder.map((stepKey, index) => {
          const step = steps[stepKey];
          const isActive = currentStep === stepKey;
          const isCompleted = step.status === 'completed';
          const isFailed = step.status === 'failed';
          
          return (
            <div key={stepKey} className="relative">
              {/* Connector line */}
              {index < stepOrder.length - 1 && (
                <div 
                  className="absolute left-3 top-8 w-0.5 h-8 bg-gray-300"
                />
              )}
              
              <div className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                isActive ? 'bg-white border border-gray-200 shadow-sm' : ''
              }`}>
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(step.status)}
                </div>
                
                <div className="flex-grow min-w-0">
                  <h4 className={`text-sm font-medium ${
                    isActive ? 'text-gray-900' : 'text-gray-700'
                  }`}>
                    {step.title}
                className="absolute left-3 top-8 w-0.5 h-6 bg-gray-300"
                  <p className="text-xs text-gray-500 mt-1">
                    {step.description}
                  </p>
                  
                  {isFailed && step.error && (
                    <p className="text-xs text-red-600 mt-1">{step.error}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InstallationTimeline;
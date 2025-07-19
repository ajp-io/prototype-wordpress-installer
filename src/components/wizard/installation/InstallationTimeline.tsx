import React from 'react';
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { useConfig } from '../../../contexts/ConfigContext';

export interface InstallationStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  description?: string;
}

interface InstallationTimelineProps {
  steps: InstallationStep[];
  activeStepId: string;
}

const InstallationTimeline: React.FC<InstallationTimelineProps> = ({ steps, activeStepId }) => {
  const { prototypeSettings } = useConfig();
  const themeColor = prototypeSettings.themeColor;

  const getStepIcon = (status: string, isActive: boolean) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Loader2 className="w-5 h-5 animate-spin" style={{ color: themeColor }} />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepTextColor = (status: string, isActive: boolean) => {
    if (status === 'completed') return 'text-green-700';
    if (status === 'failed') return 'text-red-700';
    if (isActive) return 'text-gray-900';
    return 'text-gray-500';
  };

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Installation Progress</h3>
      
      <div className="space-y-6">
        {steps.map((step, index) => {
          const isActive = step.id === activeStepId;
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.id} className="relative">
              {/* Connector line */}
              {!isLast && (
                <div 
                  className="absolute left-2.5 top-8 w-0.5 h-6 bg-gray-300"
                  style={{
                    backgroundColor: step.status === 'completed' ? themeColor : undefined
                  }}
                />
              )}
              
              {/* Step content */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getStepIcon(step.status, isActive)}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className={`text-sm font-medium ${getStepTextColor(step.status, isActive)}`}>
                    {step.name}
                  </h4>
                  {step.description && (
                    <p className="text-xs text-gray-500 mt-1">{step.description}</p>
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
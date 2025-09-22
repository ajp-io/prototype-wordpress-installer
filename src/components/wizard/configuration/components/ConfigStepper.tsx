import React from 'react';
import { useRef } from 'react';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { TabName } from '../utils/validationUtils';

export type ConfigStepStatus = 'pending' | 'current' | 'completed' | 'error';

export interface ConfigStep {
  id: TabName;
  label: string;
  status: ConfigStepStatus;
}

interface ConfigStepperProps {
  steps: ConfigStep[];
  currentStep: TabName;
  onStepClick: (step: TabName) => void;
  themeColor: string;
}

const ConfigStepper: React.FC<ConfigStepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  themeColor
}) => {
  const stepperRef = useRef<HTMLDivElement>(null);

  const getStepIcon = (step: ConfigStep, index: number) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'current':
        return (
          <div 
            className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: themeColor }}
          >
            {index + 1}
          </div>
        );
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStepTextColor = (step: ConfigStep) => {
    switch (step.status) {
      case 'completed':
        return 'text-gray-700';
      case 'error':
        return 'text-red-700';
      case 'current':
        return 'text-gray-900';
      default:
        return 'text-gray-500';
    }
  };

  const getStepBackgroundColor = (step: ConfigStep) => {
    switch (step.status) {
      case 'current':
        return `${themeColor}10`;
      case 'error':
        return 'rgb(254 242 242)'; // red-50
      default:
        return 'transparent';
    }
  };

  const isStepClickable = (step: ConfigStep) => {
    return step.status === 'completed' || step.status === 'error' || step.status === 'current';
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto max-h-screen">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">Configuration</h3>
        <p className="text-sm text-gray-500 mt-1">
          Complete each section to configure your installation
        </p>
      </div>
      
      <div ref={stepperRef} className="space-y-2">
        {steps.map((step, index) => {
          const isClickable = isStepClickable(step);
          
          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                isClickable ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
              }`}
              style={{
                backgroundColor: getStepBackgroundColor(step),
                borderLeft: step.status === 'current' ? `3px solid ${themeColor}` : '3px solid transparent',
              }}
            >
              <div className="flex-shrink-0">
                {getStepIcon(step, index)}
              </div>
              
              <div className="flex-grow min-w-0">
                <h4 className={`text-sm font-medium ${getStepTextColor(step)}`}>
                  {step.label}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Step {index + 1} of {steps.length}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          Progress: {steps.filter(s => s.status === 'completed').length} of {steps.length} completed
        </div>
      </div>
    </div>
  );
};

export default ConfigStepper;
import React from 'react';
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
  const getStepIcon = (step: ConfigStep, index: number) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-white" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-white" />;
      case 'current':
        return <span className="text-white font-medium text-sm">{index + 1}</span>;
      default:
        return <span className="text-gray-500 font-medium text-sm">{index + 1}</span>;
    }
  };

  const getStepBackgroundColor = (step: ConfigStep) => {
    switch (step.status) {
      case 'completed':
        return '#10B981'; // green-500
      case 'error':
        return '#EF4444'; // red-500
      case 'current':
        return themeColor;
      default:
        return '#E5E7EB'; // gray-200
    }
  };

  const getStepTextColor = (step: ConfigStep) => {
    switch (step.status) {
      case 'completed':
      case 'error':
      case 'current':
        return 'text-gray-900';
      default:
        return 'text-gray-500';
    }
  };

  const isStepClickable = (step: ConfigStep) => {
    return step.status === 'completed' || step.status === 'error' || step.status === 'current';
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <button
                onClick={() => isStepClickable(step) && onStepClick(step.id)}
                disabled={!isStepClickable(step)}
                className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                  isStepClickable(step) ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                }`}
                style={{
                  backgroundColor: getStepBackgroundColor(step)
                }}
              >
                {getStepIcon(step, index)}
              </button>
              <span className={`text-sm font-medium text-center max-w-24 ${getStepTextColor(step)}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-px bg-gray-300 mx-4 mt-5" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ConfigStepper;
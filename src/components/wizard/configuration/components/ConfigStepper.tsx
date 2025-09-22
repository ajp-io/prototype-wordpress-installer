import React, { useRef, useEffect } from 'react';
import { TabName } from '../utils/validationUtils';

export interface ConfigStep {
  id: TabName;
  label: string;
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
  const stepRefs = useRef<Map<TabName, HTMLButtonElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current step when it changes
  useEffect(() => {
    const currentStepElement = stepRefs.current.get(currentStep);
    if (currentStepElement) {
      currentStepElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [currentStep]);

  const setStepRef = (stepId: TabName, element: HTMLButtonElement | null) => {
    if (element) {
      stepRefs.current.set(stepId, element);
    } else {
      stepRefs.current.delete(stepId);
    }
  };

  const isCurrentStep = (step: ConfigStep) => step.id === currentStep;

  return (
    <div ref={containerRef} className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
      <div className="mb-6">
        <p className="text-sm text-gray-500">
          Complete each section to configure your installation
        </p>
      </div>
      
      <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
        {steps.map((step, index) => {
          const isCurrent = isCurrentStep(step);
          
          return (
            <button
              ref={(el) => setStepRef(step.id, el)}
              key={step.id}
              onClick={() => onStepClick(step.id)}
              className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                'hover:bg-gray-50 cursor-pointer'
              }`}
              style={{
                backgroundColor: isCurrent ? `${themeColor}10` : 'transparent',
                borderLeft: isCurrent ? `3px solid ${themeColor}` : '3px solid transparent',
              }}
            >
              <div className="flex-grow min-w-0">
                <h4 className={`text-sm font-medium ${isCurrent ? 'text-gray-900' : 'text-gray-700'}`}>
                  {step.label}
                </h4>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ConfigStepper;
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
  isTabComplete: (step: TabName) => boolean;
}

const ConfigStepper: React.FC<ConfigStepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  themeColor,
  isTabComplete
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
          const isComplete = isTabComplete(step.id);
          
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
              <div className="flex-shrink-0">
                {isComplete ? (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: themeColor }}>
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                )}
              </div>
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
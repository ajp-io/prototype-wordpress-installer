import React, { useRef, useEffect } from 'react';
import { TabName } from '../utils/validationUtils';
import { CheckCircle2, Circle } from 'lucide-react';

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
  isTabRequired: (step: TabName) => boolean;
}

const ConfigStepper: React.FC<ConfigStepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  themeColor,
  isTabComplete,
  isTabRequired
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
    <div ref={containerRef} className="w-80 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Configuration</h3>
        <p className="text-sm text-gray-600">
          Complete each section to configure your installation
        </p>
      </div>
      
      <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)]">
        {steps.map((step, index) => {
          const isCurrent = isCurrentStep(step);
          const isComplete = isTabComplete(step.id);
          const isRequired = isTabRequired(step.id);
          
          return (
            <button
              ref={(el) => setStepRef(step.id, el)}
              key={step.id}
              onClick={() => onStepClick(step.id)}
              className={`w-full text-left transition-all duration-200 rounded-lg border-2 ${
                isCurrent 
                  ? 'bg-white shadow-md border-transparent' 
                  : 'bg-white hover:bg-gray-50 border-gray-100 hover:border-gray-200 hover:shadow-sm'
              }`}
              style={{
                borderLeftColor: isCurrent ? themeColor : undefined,
                borderLeftWidth: isCurrent ? '4px' : '2px',
              }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-grow min-w-0 pr-3">
                    <h4 className={`text-sm font-medium leading-tight ${
                      isCurrent ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {step.label}
                    </h4>
                  </div>
                  
                  <div className="flex-shrink-0">
                    {isComplete ? (
                      <CheckCircle2 
                        className="w-5 h-5" 
                        style={{ color: themeColor }}
                      />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isRequired && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                        Required
                      </span>
                    )}
                    {isComplete && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        Complete
                      </span>
                    )}
                  </div>
                  
                  {isCurrent && (
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ConfigStepper;
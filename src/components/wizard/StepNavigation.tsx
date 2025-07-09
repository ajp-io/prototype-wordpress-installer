import React from 'react';
import { WizardStep } from '../../types';
import { CheckCircle, ClipboardList, Server, Download, Settings, Terminal } from 'lucide-react';
import { useWizardMode } from '../../contexts/WizardModeContext';
import { useConfig } from '../../contexts/ConfigContext';

interface StepNavigationProps {
  currentStep: WizardStep;
  configureOnly?: boolean;
  dryRun?: boolean;
}

const StepNavigation: React.FC<StepNavigationProps> = ({ 
  currentStep, 
  configureOnly = false,
  dryRun = false
}) => {
  const { mode } = useWizardMode();
  const { prototypeSettings } = useConfig();
  const themeColor = prototypeSettings.themeColor;

  const getSteps = () => {
    if (configureOnly) {
      return [
        { id: 'welcome', name: 'Welcome', icon: ClipboardList },
        { id: 'configuration', name: 'Configuration', icon: Server }
      ];
    }
    
    if (dryRun) {
      return [
        { id: 'welcome', name: 'Welcome', icon: ClipboardList },
        { id: 'configuration', name: 'Configuration', icon: Server },
        { id: 'setup', name: 'Setup', icon: Settings },
        { id: 'completion', name: 'Commands', icon: Terminal }
      ];
    }

    return [
      { id: 'welcome', name: 'Welcome', icon: ClipboardList },
      { id: 'configuration', name: 'Configuration', icon: Server },
      { id: 'setup', name: 'Setup', icon: Settings },
      { id: 'installation', name: mode === 'upgrade' ? 'Upgrade' : 'Installation', icon: Download },
      { id: 'completion', name: 'Completion', icon: CheckCircle }
    ];
  };

  const steps = getSteps();

  const getStepStatus = (step: { id: string }) => {
    const stepIndex = steps.findIndex((s) => s.id === step.id);
    const currentIndex = steps.findIndex((s) => s.id === currentStep);

    if (stepIndex < currentIndex) return 'complete';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <nav aria-label="Progress">
      <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8">
        {steps.map((step) => {
          const status = getStepStatus(step as { id: string });
          const Icon = step.icon;

          return (
            <li key={step.id} className="md:flex-1">
              <div
                className={`flex items-center pl-4 py-2 text-sm font-medium rounded-md`}
                style={{
                  backgroundColor: status === 'complete' || status === 'current' ? `${themeColor}1A` : 'rgb(243 244 246)',
                  color: status === 'complete' || status === 'current' ? themeColor : 'rgb(107 114 128)',
                  border: status === 'current' ? `1px solid ${themeColor}` : undefined,
                }}
              >
                <span
                  className={`flex-shrink-0 w-8 h-8 flex items-center justify-center mr-3 rounded-full`}
                  style={{
                    backgroundColor: status === 'complete' || status === 'current' ? themeColor : 'rgb(229 231 235)',
                    color: status === 'complete' || status === 'current' ? 'white' : 'rgb(107 114 128)',
                  }}
                >
                  {status === 'complete' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </span>
                <span className="truncate">{step.name}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default StepNavigation;
import React, { useState, useEffect } from 'react';
import Card from '../../common/Card';
import Button from '../../common/Button';
import { useConfig } from '../../../contexts/ConfigContext';
import { useWizardMode } from '../../../contexts/WizardModeContext';
import { ChevronRight } from 'lucide-react';
import { useInstallationFlow } from './hooks/useInstallationFlow';
import OverallProgress from './components/OverallProgress';
import StepCard from './components/StepCard';
import StepDetails from './components/StepDetails';
import InstallationLogs from './components/InstallationLogs';

interface UnifiedInstallationStepProps {
  onNext: () => void;
}

const UnifiedInstallationStep: React.FC<UnifiedInstallationStepProps> = ({ onNext }) => {
  const { config, prototypeSettings } = useConfig();
  const { text } = useWizardMode();
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [showAllLogs, setShowAllLogs] = useState(false);

  const {
    status,
    startInstallation,
    isInstallationComplete,
    hasErrors
  } = useInstallationFlow(config, prototypeSettings);

  useEffect(() => {
    startInstallation();
  }, []);

  // Auto-expand the currently running step
  useEffect(() => {
    if (status.currentStepId && expandedStep !== status.currentStepId) {
      setExpandedStep(status.currentStepId);
    }
  }, [status.currentStepId]);

  const handleStepToggle = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  const getAllLogs = () => {
    return status.steps.flatMap(step => 
      step.logs.map(log => `[${step.name}] ${log}`)
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Installation</h2>
          <p className="text-gray-600 mt-1">
            Installing WordPress Enterprise components
          </p>
        </div>

        <OverallProgress 
          progress={status.overallProgress}
          isComplete={status.isComplete}
          hasErrors={status.hasErrors}
          themeColor={prototypeSettings.themeColor}
        />

        <div className="space-y-4 mt-8">
          {status.steps.map((step) => (
            <div key={step.id}>
              <StepCard
                step={step}
                isExpanded={expandedStep === step.id}
                onToggle={() => handleStepToggle(step.id)}
                themeColor={prototypeSettings.themeColor}
              />
              {expandedStep === step.id && (
                <StepDetails
                  step={step}
                  themeColor={prototypeSettings.themeColor}
                />
              )}
            </div>
          ))}
        </div>

        <InstallationLogs
          logs={getAllLogs()}
          isExpanded={showAllLogs}
          onToggle={() => setShowAllLogs(!showAllLogs)}
        />
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={!isInstallationComplete}
          icon={<ChevronRight className="w-5 h-5" />}
        >
          Next: Finish
        </Button>
      </div>
    </div>
  );
};

export default UnifiedInstallationStep;
import React, { useState, useEffect } from 'react';
import Card from '../../common/Card';
import Button from '../../common/Button';
import { useConfig } from '../../../contexts/ConfigContext';
import { useWizardMode } from '../../../contexts/WizardModeContext';
import { ChevronRight } from 'lucide-react';
import { useInstallationFlow } from './hooks/useInstallationFlow';
import StepSidebar from './components/StepSidebar';
import StepDetailView from './components/StepDetailView';

interface UnifiedInstallationStepProps {
  onNext: () => void;
}

const UnifiedInstallationStep: React.FC<UnifiedInstallationStepProps> = ({ onNext }) => {
  const { config, prototypeSettings } = useConfig();
  const { text } = useWizardMode();
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  const {
    status,
    startInstallation,
    isInstallationComplete,
    hasErrors
  } = useInstallationFlow(config, prototypeSettings);

  useEffect(() => {
    startInstallation();
  }, []);

  // Auto-select the currently running step, or the first step if none are running
  useEffect(() => {
    const runningStep = status.steps.find(step => step.status === 'running');
    if (runningStep && selectedStepId !== runningStep.id) {
      setSelectedStepId(runningStep.id);
    } else if (!selectedStepId && status.steps.length > 0) {
      // If no step is selected and no step is running, select the first step
      setSelectedStepId(status.steps[0].id);
    }
  }, [status.steps, selectedStepId]);

  const selectedStep = status.steps.find(step => step.id === selectedStepId);

  const getAllLogs = () => {
    return status.steps.flatMap(step => 
      step.logs.length > 0 ? step.logs.map(log => `[${step.name}] ${log}`) : []
    );
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Installation</h2>
          <p className="text-gray-600 mt-1">
            Installing WordPress Enterprise components
          </p>
          
          {/* Overall Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm text-gray-500">{Math.round(status.overallProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  backgroundColor: status.hasErrors ? 'rgb(239 68 68)' : status.isComplete ? 'rgb(34 197 94)' : prototypeSettings.themeColor,
                  width: `${status.overallProgress}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Two-sided layout */}
        <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
          <StepSidebar
            steps={status.steps}
            selectedStepId={selectedStepId}
            onStepSelect={setSelectedStepId}
            themeColor={prototypeSettings.themeColor}
          />
          <StepDetailView
            step={selectedStep}
            allLogs={getAllLogs()}
            themeColor={prototypeSettings.themeColor}
          />
        </div>
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
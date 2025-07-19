import React, { useState, useEffect } from 'react';
import Card from '../../common/Card';
import Button from '../../common/Button';
import { useConfig } from '../../../contexts/ConfigContext';
import { useWizardMode } from '../../../contexts/WizardModeContext';
import { ChevronRight } from 'lucide-react';
import { useInstallationFlow } from './hooks/useInstallationFlow';
import InstallationPhaseCard from './components/InstallationPhaseCard';

interface UnifiedInstallationStepProps {
  onNext: () => void;
}

const UnifiedInstallationStep: React.FC<UnifiedInstallationStepProps> = ({ onNext }) => {
  const { config, prototypeSettings } = useConfig();
  const { text } = useWizardMode();

  const {
    status,
    startInstallation,
    isInstallationComplete,
    hasErrors
  } = useInstallationFlow(config, prototypeSettings);

  useEffect(() => {
    startInstallation();
  }, []);

  const getOverallStatusText = () => {
    if (hasErrors) return 'Installation Failed';
    if (isInstallationComplete) return 'Installation Complete';
    return `Installing WordPress Enterprise - ${Math.round(status.overallProgress)}% Complete`;
  };

  const getOverallProgressColor = () => {
    if (hasErrors) return 'rgb(239 68 68)';
    if (isInstallationComplete) return 'rgb(34 197 94)';
    return prototypeSettings.themeColor;
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{text.installationTitle || 'Installation'}</h2>
          <p className="text-gray-600 mt-1">
            Installing WordPress Enterprise components
          </p>
        </div>

        {/* Overall Progress */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                backgroundColor: getOverallProgressColor(),
                width: `${status.overallProgress}%`,
              }}
            />
          </div>
          <div className="text-center text-sm text-gray-600">
            {getOverallStatusText()}
          </div>
        </div>

        {/* Installation Phase Cards */}
        <div className="space-y-4">
          {status.steps.map((step) => (
            <InstallationPhaseCard
              key={step.id}
              step={step}
              themeColor={prototypeSettings.themeColor}
            />
          ))}
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
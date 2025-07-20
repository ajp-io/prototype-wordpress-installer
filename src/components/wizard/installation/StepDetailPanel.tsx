import React from 'react';
import { InstallationStep, StepStatus } from './InstallationTimeline';
import InfrastructureDetail from './steps/InfrastructureDetail';
import PreflightDetail from './steps/PreflightDetail';
import ApplicationDetail from './steps/ApplicationDetail';

interface StepDetailPanelProps {
  currentStep: InstallationStep;
  stepData: StepStatus;
  infrastructureStatus?: any;
  preflightResults?: any;
  applicationStatus?: any;
  themeColor: string;
}

const StepDetailPanel: React.FC<StepDetailPanelProps> = ({
  currentStep,
  stepData,
  infrastructureStatus,
  preflightResults,
  applicationStatus,
  themeColor
}) => {
  const renderStepContent = () => {
    switch (currentStep) {
      case 'infrastructure':
        return (
          <InfrastructureDetail
            status={infrastructureStatus}
            themeColor={themeColor}
          />
        );
      case 'preflights':
        return (
          <PreflightDetail
            results={preflightResults}
            status={stepData.status}
            themeColor={themeColor}
          />
        );
      case 'application':
        return (
          <ApplicationDetail
            status={applicationStatus}
            themeColor={themeColor}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{stepData.title}</h2>
        <p className="text-gray-600 mt-1">{stepData.description}</p>
      </div>

      {renderStepContent()}
    </div>
  );
};

export default StepDetailPanel;
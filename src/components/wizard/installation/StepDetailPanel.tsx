import React from 'react';
import { InstallationStep, StepStatus } from './InstallationTimeline';
import InfrastructureDetail from './steps/InfrastructureDetail';
import PreflightDetail from './steps/PreflightDetail';
import ApplicationDetail from './steps/ApplicationDetail';
import HostsDetail from './steps/HostsDetail';

interface StepDetailPanelProps {
  selectedStep: InstallationStep;
  stepData: StepStatus;
  infrastructureStatus?: any;
  preflightResults?: any;
  applicationStatus?: any;
  themeColor: string;
  onHostsComplete?: (hasFailures?: boolean) => void;
}

const StepDetailPanel: React.FC<StepDetailPanelProps> = ({
  selectedStep,
  stepData,
  infrastructureStatus,
  preflightResults,
  applicationStatus,
  themeColor,
  onHostsComplete
}) => {
  const renderStepContent = () => {
    switch (selectedStep) {
      case 'hosts':
        return (
          <HostsDetail
            onComplete={onHostsComplete}
            themeColor={themeColor}
          />
        );
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
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{stepData.title}</h2>
        <p className="text-gray-600 mt-1">{stepData.description}</p>
      </div>

      {renderStepContent()}
    </div>
  );
};

export default StepDetailPanel;
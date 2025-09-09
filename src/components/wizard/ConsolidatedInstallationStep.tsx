import React, { useState, useEffect } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useWizardMode } from '../../contexts/WizardModeContext';
import { useConfig } from '../../contexts/ConfigContext';
import { ChevronRight, ChevronLeft, AlertTriangle } from 'lucide-react';
import { useInstallationFlow } from '../../hooks/useInstallationFlow';
import { useInstallationLogs } from '../../hooks/useInstallationLogs';
import { useInstallationNavigation } from '../../hooks/useInstallationNavigation';
import InstallationTimeline from './installation/InstallationTimeline';
import StepDetailPanel from './installation/StepDetailPanel';
import LogViewer from './validation/LogViewer';

interface ConsolidatedInstallationStepProps {
  onNext: () => void;
  onBack: () => void;
}

const ConsolidatedInstallationStep: React.FC<ConsolidatedInstallationStepProps> = ({ onNext, onBack }) => {
  const { text } = useWizardMode();
  const { prototypeSettings } = useConfig();
  const themeColor = prototypeSettings.themeColor;

  const {
    currentStep,
    selectedStep,
    steps,
    infrastructureStatus,
    applicationStatus,
    validationResults,
    installationComplete,
    hostsComplete,
    hasHostFailures,
    allRequiredNodesMet,
    isLinuxMode,
    setSelectedStep,
    startRuntimeInstallation,
    handleHostsComplete,
    startInfrastructureInstallation,
    startPreflightChecks,
    startApplicationInstallation,
  } = useInstallationFlow();

  const { allLogs, showLogs, addToAllLogs, toggleLogs } = useInstallationLogs();

  const {
    canProceed,
    shouldShowNextButton,
    getNextButtonText,
    shouldShowPreflightModal,
  } = useInstallationNavigation({
    currentStep,
    steps,
    validationResults,
    installationComplete,
    hostsComplete,
    hasHostFailures,
    allRequiredNodesMet,
    isLinuxMode,
  });

  const [showPreflightModal, setShowPreflightModal] = useState(false);

  // Start the appropriate first step
  useEffect(() => {
    if (isLinuxMode) {
      startRuntimeInstallation();
    } else {
      startPreflightChecks();
    }
    
    // Set up global rerun function for preflights
    window.rerunPreflights = () => {
      startPreflightChecks();
    };
    
    return () => {
      delete window.rerunPreflights;
    };
  }, []);

  // Add logs from infrastructure and application status updates
  useEffect(() => {
    if (infrastructureStatus.logs && infrastructureStatus.logs.length > 0) {
      addToAllLogs(infrastructureStatus.logs);
    }
  }, [infrastructureStatus.logs]);

  useEffect(() => {
    if (applicationStatus.logs && applicationStatus.logs.length > 0) {
      addToAllLogs(applicationStatus.logs);
    }
  }, [applicationStatus.logs]);

  const handleNextClick = () => {
    if (currentStep === 'hosts') {
      // Mark hosts as completed when user clicks Next
      startInfrastructureInstallation();
    } else if (currentStep === 'infrastructure') {
      startPreflightChecks();
    } else if (currentStep === 'preflights') {
      // Check if there are failures and show modal if needed
      if (shouldShowPreflightModal()) {
        setShowPreflightModal(true);
      } else {
        startApplicationInstallation();
      }
    } else if (currentStep === 'application') {
      onNext(); // Go to completion step
    }
  };

  const handleConfirmProceed = () => {
    setShowPreflightModal(false);
    startApplicationInstallation();
  };

  const handleCancelProceed = () => {
    setShowPreflightModal(false);
  };

  return (
    <div className="space-y-6">
      <Card className="p-0 overflow-hidden">
        <div className="flex min-h-[600px]">
          <InstallationTimeline
            steps={steps}
            currentStep={currentStep}
            selectedStep={selectedStep}
            onStepClick={setSelectedStep}
            isLinuxMode={isLinuxMode}
            themeColor={themeColor}
          />
          
          <div className="flex-1">
            <StepDetailPanel
              selectedStep={selectedStep}
              stepData={steps[selectedStep]}
              infrastructureStatus={infrastructureStatus}
              preflightResults={validationResults}
              applicationStatus={applicationStatus}
              themeColor={themeColor}
              onHostsComplete={handleHostsComplete}
            />
          </div>
        </div>
        
        <div className="border-t border-gray-200 p-6">
          <LogViewer
            title="Installation Logs"
            logs={allLogs}
            isExpanded={showLogs}
            onToggle={toggleLogs}
          />
        </div>
      </Card>

      <div className="flex justify-between">
        {!isLinuxMode && currentStep === 'preflights' && (
          <Button
            variant="outline"
            onClick={onBack}
            icon={<ChevronLeft className="w-5 h-5" />}
          >
            Back
          </Button>
        )}
        {isLinuxMode || currentStep !== 'preflights' ? <div></div> : null}
        {shouldShowNextButton() && (
          <Button
            onClick={handleNextClick}
            disabled={!canProceed()}
            icon={<ChevronRight className="w-5 h-5" />}
            title={
              !canProceed() && currentStep === 'preflights' 
                ? 'Critical preflight checks must pass before proceeding' 
                : undefined
            }
          >
            {getNextButtonText()}
          </Button>
        )}
      </div>

      <Modal
        isOpen={showPreflightModal}
        onClose={handleCancelProceed}
        title="Proceed with Failed Checks?"
        footer={
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleCancelProceed}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmProceed}
            >
              Continue Anyway
            </Button>
          </div>
        }
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <p className="text-sm text-gray-700">
              Some preflight checks have failed. Are you sure you want to continue with the installation? This may cause installation issues.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ConsolidatedInstallationStep;
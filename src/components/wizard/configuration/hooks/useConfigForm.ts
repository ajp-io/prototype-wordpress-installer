import { useState } from 'react';
import { useConfig } from '../../../../contexts/ConfigContext';
import { useWizardMode } from '../../../../contexts/WizardModeContext';
import { TabName } from '../utils/validationUtils';
import { ConfigStepStatus } from '../components/ConfigStepper';

interface UseConfigFormProps {
  onNext: () => void;
  validateAndSetErrors: () => TabName | null;
  hasValidationErrors: () => boolean;
  currentConfigStep: TabName;
  setCurrentConfigStep: (step: TabName) => void;
  configStepStatuses: Record<TabName, ConfigStepStatus>;
  updateConfigStepStatus: (step: TabName, status: ConfigStepStatus) => void;
  configSteps: TabName[];
}

export const useConfigForm = ({ 
  onNext, 
  validateAndSetErrors, 
  hasValidationErrors, 
  currentConfigStep,
  setCurrentConfigStep,
  configStepStatuses,
  updateConfigStepStatus,
  configSteps
}: UseConfigFormProps) => {
  const { config, updateConfig, prototypeSettings } = useConfig();
  const { mode } = useWizardMode();
  const [configSaved, setConfigSaved] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    updateConfig({ [id]: value });
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { id, value } = e.target;
    updateConfig({ [id]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    updateConfig({ [id]: checked });
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateConfig({ [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        updateConfig({ 
          licenseKey: content as string,
          licenseFileName: file.name
        });
      };
      reader.readAsText(file);
    }
  };

  const handleFileRemove = () => {
    updateConfig({ 
      licenseKey: undefined,
      licenseFileName: undefined
    });
  };

  const handleNext = () => {
    if (prototypeSettings.skipValidation) {
      const currentIndex = configSteps.indexOf(currentConfigStep);
      if (currentIndex < configSteps.length - 1) {
        // Move to next config step
        updateConfigStepStatus(currentConfigStep, 'completed');
        const nextStep = configSteps[currentIndex + 1];
        updateConfigStepStatus(nextStep, 'current');
        setCurrentConfigStep(nextStep);
      } else {
        // All config steps complete, proceed to main wizard next step
        updateConfigStepStatus(currentConfigStep, 'completed');
        onNext();
      }
      return;
    }

    const nextTabWithErrors = validateAndSetErrors();
    if (nextTabWithErrors) {
      updateConfigStepStatus(nextTabWithErrors, 'error');
      setCurrentConfigStep(nextTabWithErrors);
    } else {
      const currentIndex = configSteps.indexOf(currentConfigStep);
      if (currentIndex < configSteps.length - 1) {
        // Move to next config step
        updateConfigStepStatus(currentConfigStep, 'completed');
        const nextStep = configSteps[currentIndex + 1];
        updateConfigStepStatus(nextStep, 'current');
        setCurrentConfigStep(nextStep);
      } else {
        // All config steps complete, proceed to main wizard next step
        updateConfigStepStatus(currentConfigStep, 'completed');
        onNext();
      }
    }
  };

  const handleBack = () => {
    const currentIndex = configSteps.indexOf(currentConfigStep);
    if (currentIndex > 0) {
      // Move to previous config step
      updateConfigStepStatus(currentConfigStep, 'pending');
      const prevStep = configSteps[currentIndex - 1];
      updateConfigStepStatus(prevStep, 'current');
      setCurrentConfigStep(prevStep);
      return true; // Handled internally
    }
    return false; // Let parent handle
  };

  const handleSaveConfig = () => {
    if (prototypeSettings.skipValidation) {
      setConfigSaved(true);
      return;
    }

    const nextTabWithErrors = validateAndSetErrors();
    if (!nextTabWithErrors) {
      setConfigSaved(true);
    } else {
      updateConfigStepStatus(nextTabWithErrors, 'error');
      setCurrentConfigStep(nextTabWithErrors);
    }
  };

  const getNextButtonText = () => {
    const currentIndex = configSteps.indexOf(currentConfigStep);
    if (currentIndex < configSteps.length - 1) {
      const nextStep = configSteps[currentIndex + 1];
      const stepLabels = {
        cluster: 'Cluster Settings',
        network: 'Network',
        admin: 'Admin Account',
        database: 'Database'
      };
      return `Next: ${stepLabels[nextStep]}`;
    }
    return 'Next: Setup';
  };

  return {
    config,
    configSaved,
    handleInputChange,
    handleSelectChange,
    handleCheckboxChange,
    handleRadioChange,
    handleFileChange,
    handleFileRemove,
    handleNext,
    handleBack,
    handleSaveConfig
    getNextButtonText
  };
};
import { useState } from 'react';
import { useConfig } from '../../../../contexts/ConfigContext';
import { useWizardMode } from '../../../../contexts/WizardModeContext';
import { TabName } from '../utils/validationUtils';

interface UseConfigFormProps {
  onNext: () => void;
  validateAndSetErrors: () => TabName | null;
  hasValidationErrors: () => boolean;
  currentConfigStep: TabName;
  setCurrentConfigStep: (step: TabName) => void;
  configSteps: TabName[];
  markTabAsVisited: (tab: TabName) => void;
}

export const useConfigForm = ({ 
  onNext, 
  validateAndSetErrors, 
  hasValidationErrors, 
  currentConfigStep,
  setCurrentConfigStep,
  configSteps,
  markTabAsVisited
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
    // Always mark current tab as visited when trying to proceed
    markTabAsVisited(currentConfigStep);
    
    if (prototypeSettings.skipValidation) {
      // Skip validation, proceed to next wizard step
      onNext();
    } else {
      // Validate all tabs, not just current one
      const nextTabWithErrors = validateAndSetErrors();
      if (nextTabWithErrors) {
        // Switch to the first tab with errors
        setCurrentConfigStep(nextTabWithErrors);
      } else {
        // All validation passed, proceed to next wizard step
        onNext();
      }
    }
  };

  const handleConfigGroupNext = () => {
    markTabAsVisited(currentConfigStep);
    const currentIndex = configSteps.indexOf(currentConfigStep);
    if (currentIndex < configSteps.length - 1) {
      const nextStep = configSteps[currentIndex + 1];
      setCurrentConfigStep(nextStep);
    }
  };

  const handleConfigGroupBack = () => {
    const currentIndex = configSteps.indexOf(currentConfigStep);
    if (currentIndex > 0) {
      const prevStep = configSteps[currentIndex - 1];
      setCurrentConfigStep(prevStep);
    }
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
      setCurrentConfigStep(nextTabWithErrors);
    }
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
    handleConfigGroupNext,
    handleConfigGroupBack,
    handleSaveConfig,
  };
};
import { useState } from 'react';
import { useConfig } from '../../../../contexts/ConfigContext';
import { useWizardMode } from '../../../../contexts/WizardModeContext';
import { TabName } from '../utils/validationUtils';

interface UseConfigFormProps {
  onNext: () => void;
  validateAndSetErrors: () => TabName | null;
  hasValidationErrors: () => boolean;
  setActiveTab: (tab: TabName) => void;
}

export const useConfigForm = ({ onNext, validateAndSetErrors, hasValidationErrors, setActiveTab }: UseConfigFormProps) => {
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
      onNext();
      return;
    }

    const nextTabWithErrors = validateAndSetErrors();
    if (nextTabWithErrors) {
      setActiveTab(nextTabWithErrors);
    } else {
      onNext();
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
      setActiveTab(nextTabWithErrors);
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
    handleSaveConfig
  };
};
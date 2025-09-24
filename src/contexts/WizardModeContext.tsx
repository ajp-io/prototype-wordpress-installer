import React, { createContext, useContext } from 'react';
import { useConfig } from './ConfigContext';

export type WizardMode = 'install' | 'upgrade';

interface WizardText {
  title: string;
  subtitle: string;
  loginTitle: string;
  loginDescription: string;
  setupTitle: string;
  setupDescription: string;
  configurationTitle: string;
  configurationDescription: string;
  configStepperTitle: string;
  configStepperDescription: string;
  installationTitle: string;
  installationDescription: string;
  completionTitle: string;
  completionDescription: string;
  loginButtonText: string;
  nextButtonText: string;
  nextButtonText: string;
}

const getTextVariations = (isEmbedded: boolean, isConfigureOnly: boolean = false, isDryRun: boolean = false): Record<WizardMode, WizardText> => ({
  install: {
    title: 'WordPress Enterprise',
    subtitle: isDryRun ? 'Dry Run' : isConfigureOnly ? 'Configuration' : 'Installation Wizard',
    loginTitle: 'Welcome to WordPress Enterprise',
    loginDescription: isDryRun 
      ? 'This wizard will help you prepare and validate your WordPress Enterprise configuration.'
      : isConfigureOnly 
        ? `This wizard will guide you through configuring WordPress Enterprise for your ${isEmbedded ? 'Linux machine' : 'Kubernetes cluster'}.`
        : `This wizard will guide you through installing WordPress Enterprise on your ${isEmbedded ? 'Linux machine' : 'Kubernetes cluster'}.`,
    setupTitle: 'Setup',
    setupDescription: 'Setup the environment settings for your installation.',
    configurationTitle: 'Configuration',
    configurationDescription: 'Configure your WordPress Enterprise installation by providing the information below.',
    configStepperTitle: 'Groups',
    configStepperDescription: 'Complete each group to configure your installation',
    installationTitle: 'Install',
    installationDescription: 'Install the WordPress Enterprise components.',
    completionTitle: isDryRun ? 'Configuration Complete' : 'Installation Complete!',
    completionDescription: isDryRun ? 'Your configuration is ready to use.' : 'WordPress Enterprise has been installed successfully.',
    loginButtonText: isDryRun ? 'Start Configuration' : 'Continue',
    nextButtonText: isDryRun ? 'Next: Review Commands' : 'Next: Install',
  },
  upgrade: {
    title: 'WordPress Enterprise',
    subtitle: 'Upgrade Wizard',
    loginTitle: 'Welcome to WordPress Enterprise',
    loginDescription: `This wizard will guide you through upgrading WordPress Enterprise on your ${isEmbedded ? 'Linux machine' : 'Kubernetes cluster'}.`,
    setupTitle: 'Setup',
    setupDescription: 'Setup the environment settings for your upgrade.',
    configurationTitle: 'Upgrade Configuration',
    configurationDescription: 'Configure your WordPress Enterprise installation by providing the information below.',
    configStepperTitle: 'Groups',
    configStepperDescription: 'Complete each group to configure your upgrade',
    installationTitle: 'Upgrade',
    installationDescription: 'Please wait while we upgrade WordPress Enterprise.',
    completionTitle: 'Upgrade Complete!',
    completionDescription: 'WordPress Enterprise has been successfully upgraded.',
    loginButtonText: 'Start Upgrade',
    nextButtonText: 'Next: Upgrade',
  },
});

interface WizardModeContextType {
  mode: WizardMode;
  text: WizardText;
}

const WizardModeContext = createContext<WizardModeContextType | undefined>(undefined);

interface WizardModeProviderProps {
  children: React.ReactNode;
  mode: WizardMode;
  configureOnly?: boolean;
  dryRun?: boolean;
}

export const WizardModeProvider: React.FC<WizardModeProviderProps> = ({ 
  children, 
  mode,
  configureOnly = false,
  dryRun = false
}) => {
  const { prototypeSettings } = useConfig();
  const isEmbedded = prototypeSettings.clusterMode === 'embedded';
  const text = getTextVariations(isEmbedded, configureOnly, dryRun)[mode];

  return (
    <WizardModeContext.Provider value={{ mode, text }}>
      {children}
    </WizardModeContext.Provider>
  );
};

export const useWizardMode = (): WizardModeContextType => {
  const context = useContext(WizardModeContext);
  if (context === undefined) {
    throw new Error('useWizardMode must be used within a WizardModeProvider');
  }
  return context;
};
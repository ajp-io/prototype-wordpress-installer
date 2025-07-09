import React, { useState } from 'react';
import StepNavigation from './StepNavigation';
import WelcomeStep from './WelcomeStep';
import ConfigurationStep from './configuration/ConfigurationStep';
import { WizardStep } from '../../types';
import { WordPressLogo } from '../common/Logo';
import { useWizardMode } from '../../contexts/WizardModeContext';

const ConfigureOnly: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('welcome');
  const { text } = useWizardMode();

  const goToNextStep = () => {
    if (currentStep === 'welcome') {
      setCurrentStep('configuration');
    }
  };

  const goToPreviousStep = () => {
    if (currentStep === 'configuration') {
      setCurrentStep('welcome');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeStep onNext={goToNextStep} />;
      case 'configuration':
        return <ConfigurationStep onNext={() => {}} onBack={goToPreviousStep} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <WordPressLogo className="h-10 w-10" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{text.title}</h1>
                <p className="text-sm text-gray-500">{text.subtitle}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <StepNavigation currentStep={currentStep} configureOnly={true} />
          <div className="mt-8">
            {renderStep()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConfigureOnly;
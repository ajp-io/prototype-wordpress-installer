import React, { useState } from 'react';
import StepNavigation from './StepNavigation';
import ConfigurationStep from './configuration/ConfigurationStep';
import { WizardStep } from '../../types';
import { WordPressLogo } from '../common/Logo';
import { useWizardMode } from '../../contexts/WizardModeContext';
import { LogOut } from 'lucide-react';

interface ConfigureOnlyProps {
  onLogout: () => void;
}

const ConfigureOnly: React.FC<ConfigureOnlyProps> = ({ onLogout }) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('configuration');
  const { text } = useWizardMode();

  const goToNextStep = () => {
    // No next step in configure-only mode
  };

  const goToPreviousStep = () => {
    // No previous step in configure-only mode
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'configuration':
        return <ConfigurationStep onNext={() => {}} onBack={() => {}} />;
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
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
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
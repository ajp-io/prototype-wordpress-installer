import React, { useState } from 'react';
import StepNavigation from './StepNavigation';
import ConfigurationStep from './configuration/ConfigurationStep';
import SetupStep from './SetupStep';
import { WizardStep } from '../../types';
import { WordPressLogo } from '../common/Logo';
import { useWizardMode } from '../../contexts/WizardModeContext';
import { useConfig } from '../../contexts/ConfigContext';
import Card from '../common/Card';
import Button from '../common/Button';
import { Terminal, Copy, ClipboardCheck, ArrowRight, LogOut } from 'lucide-react';

interface DryRunProps {
  onLogout: () => void;
}

const DryRun: React.FC<DryRunProps> = ({ onLogout }) => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('configuration');
  const { text } = useWizardMode();
  const { prototypeSettings } = useConfig();
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  // Only allow dry run for Kubernetes
  if (prototypeSettings.clusterMode === 'embedded') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Not Available</h2>
            <p className="text-gray-600">
              Dry run mode is only available for Kubernetes installations.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  const goToNextStep = () => {
    switch (currentStep) {
      case 'configuration':
        setCurrentStep('setup');
        break;
      case 'setup':
        setCurrentStep('completion');
        break;
      default:
        break;
    }
  };

  const goToPreviousStep = () => {
    switch (currentStep) {
      case 'setup':
        setCurrentStep('configuration');
        break;
      default:
        break;
    }
  };

  const copyCommand = (command: string, id: string) => {
    navigator.clipboard.writeText(command).then(() => {
      setCopied(prev => ({ ...prev, [id]: true }));
      setTimeout(() => setCopied(prev => ({ ...prev, [id]: false })), 2000);
    });
  };

  const renderCommands = () => {
    const commands = [
      {
        id: 'validate',
        title: 'Validate Configuration',
        command: 'wordpress validate --config-values wordpress-config.yaml',
        description: 'Validate your configuration before installation'
      },
      {
        id: 'preflight',
        title: 'Run Preflight Checks',
        command: 'wordpress preflight --config-values wordpress-config.yaml',
        description: 'Check if your environment meets all requirements'
      },
      {
        id: 'install',
        title: 'Install WordPress Enterprise',
        command: 'wordpress install --config-values wordpress-config.yaml --target kubernetes',
        description: 'Start the actual installation process'
      }
    ];

    return (
      <div className="space-y-6">
        <Card>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Available Commands</h2>
            <p className="text-gray-600 mt-1">
              Here are the commands you can run with your configuration
            </p>
          </div>

          <div className="space-y-6">
            {commands.map(({ id, title, command, description }) => (
              <div key={id} className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700">{title}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="py-1 px-2 text-xs"
                    icon={copied[id] ? <ClipboardCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    onClick={() => copyCommand(command, id)}
                  >
                    {copied[id] ? 'Copied!' : 'Copy Command'}
                  </Button>
                </div>
                <div className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-300">
                  <Terminal className="w-4 h-4 text-gray-400" />
                  <code className="font-mono text-sm">{command}</code>
                </div>
                <p className="text-sm text-gray-500 mt-2">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Recommended Order</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-blue-700">
                <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">1</span>
                Validate your configuration
                <ArrowRight className="w-4 h-4 mx-2" />
                Ensure your configuration is valid
              </div>
              <div className="flex items-center text-sm text-blue-700">
                <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">2</span>
                Run preflight checks
                <ArrowRight className="w-4 h-4 mx-2" />
                Verify your environment
              </div>
              <div className="flex items-center text-sm text-blue-700">
                <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">3</span>
                Start installation
                <ArrowRight className="w-4 h-4 mx-2" />
                Install WordPress Enterprise
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'configuration':
        return <ConfigurationStep onNext={goToNextStep} onBack={() => {}} />;
      case 'setup':
        return <SetupStep onNext={goToNextStep} onBack={goToPreviousStep} />;
      case 'completion':
        return renderCommands();
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
          <StepNavigation currentStep={currentStep} dryRun={true} />
          <div className="mt-8">
            {renderStep()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DryRun;
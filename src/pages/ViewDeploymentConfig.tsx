import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { WordPressLogo } from '../components/common/Logo';
import { ConfigProvider } from '../contexts/ConfigContext';
import { WizardModeProvider } from '../contexts/WizardModeContext';
import ConfigurationStep from '../components/wizard/configuration/ConfigurationStep';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

const ViewDeploymentConfig: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const config = location.state?.config;
  const deploymentVersion = location.state?.version;
  const deploymentDate = location.state?.date;

  if (!config) {
    // If no config data is passed, redirect back to history
    navigate('/console/history');
    return null;
  }

  const handleBack = () => {
    navigate('/console/history');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <div className="flex items-center space-x-3">
              <WordPressLogo className="h-10 w-10" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Deployment Configuration
                </h1>
                <p className="text-sm text-gray-500">
                  {deploymentVersion && `Version ${deploymentVersion} • `}
                  {deploymentDate && `Deployed ${deploymentDate}`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={handleBack}
              icon={<ArrowLeft className="w-5 h-5" />}
            >
              Back to Deployment History
            </Button>
          </div>

          <ConfigProvider>
            <WizardModeProvider mode="install" configureOnly={true}>
              <ConfigurationStep
                config={config}
                isReadOnly={true}
                onNext={() => {}}
                onBack={handleBack}
              />
            </WizardModeProvider>
          </ConfigProvider>
        </div>
      </main>
    </div>
  );
};

export default ViewDeploymentConfig;
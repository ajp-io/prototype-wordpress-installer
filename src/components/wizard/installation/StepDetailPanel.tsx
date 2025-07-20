import React from 'react';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { InstallationStatus, ValidationStatus } from '../../../types';
import { useConfig } from '../../../contexts/ConfigContext';
import Button from '../../common/Button';
import StatusIndicator from '../validation/StatusIndicator';
import InstallationProgress from '../validation/InstallationProgress';

interface StepDetailPanelProps {
  stepId: string;
  stepName: string;
  stepStatus: 'pending' | 'running' | 'completed' | 'failed';
  installationStatus?: InstallationStatus;
  validationStatus?: ValidationStatus;
  validationResults?: {
    totalChecks: number;
    passedChecks: number;
    failedChecks: Array<{ name: string; message: string }>;
  };
  onRerunPreflights?: () => void;
  onContinueAnyway?: () => void;
}

const StepDetailPanel: React.FC<StepDetailPanelProps> = ({
  stepId,
  stepName,
  stepStatus,
  installationStatus,
  validationStatus,
  validationResults,
  onRerunPreflights,
  onContinueAnyway
}) => {
  const { prototypeSettings } = useConfig();
  const themeColor = prototypeSettings.themeColor;

  const renderInfrastructureStep = () => {
    if (!installationStatus) return null;

    return (
      <div className="space-y-6">
        <InstallationProgress
          progress={installationStatus.progress}
          currentMessage={installationStatus.currentMessage}
          themeColor={themeColor}
          status={installationStatus.overall === 'failed' ? 'failed' : undefined}
        />

        <div className="space-y-2 divide-y divide-gray-200">
          {[
            { key: 'openebs', name: 'Storage', status: installationStatus.openebs },
            { key: 'registry', name: 'Registry', status: installationStatus.registry },
            { key: 'velero', name: 'Disaster Recovery', status: installationStatus.velero },
            { key: 'components', name: 'Additional Components', status: installationStatus.components }
          ].map(({ key, name, status }) => (
            <StatusIndicator key={key} title={name} status={status} />
          ))}
        </div>
      </div>
    );
  };

  const renderPreflightStep = () => {
    if (stepStatus === 'running') {
      return (
        <div className="flex flex-col items-center py-8">
          <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Running Preflight Checks</h3>
          <p className="text-sm text-gray-600 text-center max-w-md">
            Validating your environment to ensure it meets all requirements for WordPress Enterprise installation.
          </p>
        </div>
      );
    }

    if (stepStatus === 'completed' && validationResults) {
      return (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">All Preflight Checks Passed</h3>
              <p className="mt-1 text-sm text-green-700">
                {validationResults.totalChecks} preflight checks completed successfully. Your environment is ready for WordPress Enterprise installation.
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (stepStatus === 'failed' && validationResults) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {validationResults.failedChecks.length} Preflight Check{validationResults.failedChecks.length !== 1 ? 's' : ''} Failed
            </h3>
            
            <div className="space-y-4 mb-6">
              {validationResults.failedChecks.map((check, index) => (
                <div key={index} className="flex items-start">
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{check.name}</h4>
                    <p className="mt-1 text-sm text-gray-600">{check.message}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="primary"
                onClick={onRerunPreflights}
              >
                Rerun Checks
              </Button>
              <Button
                variant="danger"
                onClick={onContinueAnyway}
              >
                Continue Anyway
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderApplicationStep = () => {
    if (!installationStatus) return null;

    return (
      <div className="space-y-6">
        <InstallationProgress
          progress={installationStatus.progress}
          currentMessage={installationStatus.currentMessage}
          themeColor={themeColor}
          status={installationStatus.overall === 'failed' ? 'failed' : undefined}
        />

        <div className="space-y-2 divide-y divide-gray-200">
          {[
            { key: 'database', name: 'Database Installation', status: installationStatus.database },
            { key: 'core', name: 'WordPress Core Installation', status: installationStatus.core },
            { key: 'plugins', name: 'Plugins & Extensions', status: installationStatus.plugins }
          ].map(({ key, name, status }) => (
            <StatusIndicator key={key} title={name} status={status} />
          ))}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (stepId) {
      case 'infrastructure':
        return renderInfrastructureStep();
      case 'preflights':
        return renderPreflightStep();
      case 'application':
        return renderApplicationStep();
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{stepName}</h2>
        <p className="text-gray-600 mt-1">
          {stepId === 'infrastructure' && 'Installing infrastructure components required for WordPress Enterprise.'}
          {stepId === 'preflights' && 'Checking if your environment meets all requirements for WordPress Enterprise.'}
          {stepId === 'application' && 'Installing WordPress Enterprise application components.'}
        </p>
      </div>

      {renderStepContent()}
    </div>
  );
};

export default StepDetailPanel;
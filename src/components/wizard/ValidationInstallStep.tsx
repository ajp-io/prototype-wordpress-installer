import React from 'react';
import { useConfig } from '../../contexts/ConfigContext';
import K0sInstallation from './setup/K0sInstallation';
import UnifiedInstallationStep from './installation/UnifiedInstallationStep';

interface ValidationInstallStepProps {
  onNext: () => void;
}

const ValidationInstallStep: React.FC<ValidationInstallStepProps> = ({ onNext }) => {
  const { prototypeSettings } = useConfig();
  const isLinuxMode = prototypeSettings.clusterMode === 'embedded';

  // For Linux mode, we still need the separate hosts setup phase
  // For now, we'll keep the K0s installation separate as discussed
  if (isLinuxMode) {
    // TODO: Implement hosts setup integration
    return <K0sInstallation onComplete={() => onNext()} />;
  }
  
  // For Kubernetes mode, use the new unified installation
  return <UnifiedInstallationStep onNext={onNext} />;
};

export default ValidationInstallStep;
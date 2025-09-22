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
}

export const useConfigForm = ({ 
  onNext, 
  validateAndSetErrors, 
  hasValidationErrors, 
  currentConfigStep,
  setCurrentConfigStep,
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
        const nextStep = configSteps[currentIndex + 1];
        setCurrentConfigStep(nextStep);
      } else {
        // All config steps complete, proceed to main wizard next step
        onNext();
      }
      return;
    }

    const nextTabWithErrors = validateAndSetErrors();
    if (nextTabWithErrors) {
      setCurrentConfigStep(nextTabWithErrors);
    } else {
      const currentIndex = configSteps.indexOf(currentConfigStep);
      if (currentIndex < configSteps.length - 1) {
        // Move to next config step
        const nextStep = configSteps[currentIndex + 1];
        setCurrentConfigStep(nextStep);
      } else {
        // All config steps complete, proceed to main wizard next step
        onNext();
      }
    }
  };

  const handleBack = () => {
    const currentIndex = configSteps.indexOf(currentConfigStep);
    if (currentIndex > 0) {
      // Move to previous config step
      const prevStep = configSteps[currentIndex - 1];
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
        database: 'Database',
        monitoring: 'Monitoring',
        logging: 'Logging',
        backup: 'Backup',
        security: 'Security',
        performance: 'Performance',
        integrations: 'Integrations',
        notifications: 'Notifications',
        customization: 'Customization',
        storage: 'Storage Management',
        'networking-advanced': 'Advanced Networking',
        certificates: 'SSL Certificates',
        authentication: 'Authentication',
        authorization: 'Authorization',
        compliance: 'Compliance',
        audit: 'Audit Logging',
        analytics: 'Analytics',
        reporting: 'Reporting',
        maintenance: 'Maintenance',
        scaling: 'Auto Scaling',
        'load-balancing': 'Load Balancing',
        'caching-advanced': 'Advanced Caching',
        cdn: 'CDN Configuration',
        dns: 'DNS Settings',
        'ssl-tls': 'SSL/TLS Settings',
        firewall: 'Firewall Rules',
        vpn: 'VPN Configuration',
        'proxy-advanced': 'Proxy Settings',
        'api-gateway': 'API Gateway',
        'service-mesh': 'Service Mesh',
        observability: 'Observability',
        tracing: 'Distributed Tracing',
        profiling: 'Performance Profiling',
        debugging: 'Debug Configuration',
        testing: 'Testing Framework',
        deployment: 'Deployment Strategy',
        rollback: 'Rollback Policies',
        canary: 'Canary Deployments',
        'blue-green': 'Blue-Green Deployments',
        'feature-flags': 'Feature Flags',
        secrets: 'Secrets Management',
        encryption: 'Encryption Settings',
        'key-management': 'Key Management',
        tokens: 'Token Configuration',
        sessions: 'Session Management',
        cookies: 'Cookie Settings',
        cors: 'CORS Configuration',
        headers: 'HTTP Headers',
        middleware: 'Middleware Stack',
        'plugins-advanced': 'Plugin Management',
        extensions: 'Extensions',
        themes: 'Theme Configuration',
        localization: 'Localization',
      };
      const nextStepLabel = stepLabels[nextStep] || nextStep;
      return `Next: ${nextStepLabel}`;
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
    handleSaveConfig,
    getNextButtonText
  };
};
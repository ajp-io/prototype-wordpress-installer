import { useState, useCallback } from 'react';
import { ClusterConfig } from '../../../../contexts/ConfigContext';
import { UnifiedInstallationStatus, InstallationStep, InstallationStepId } from '../../../../types/installation';
import { setupInfrastructure } from '../../../../utils/infrastructure';
import { validateEnvironment } from '../../../../utils/validation';
import { installWordPress } from '../../../../utils/wordpress';

interface PrototypeSettings {
  clusterMode: 'existing' | 'embedded';
  failPreflights: boolean;
  failInstallation: boolean;
  blockOnAppPreflights: boolean;
}

export const useInstallationFlow = (config: ClusterConfig, prototypeSettings: PrototypeSettings) => {
  const isLinuxMode = prototypeSettings.clusterMode === 'embedded';

  const createInitialSteps = (): InstallationStep[] => {
    const steps: InstallationStep[] = [];

    // Infrastructure step only for Linux mode
    if (isLinuxMode) {
      steps.push({
        id: 'infrastructure',
        name: 'Infrastructure Setup',
        description: 'Installing storage, registry, and disaster recovery components',
        status: 'pending',
        progress: 0,
        logs: []
      });
    }

    // Preflights for both modes
    steps.push({
      id: 'preflights',
      name: 'Application Preflights',
      description: 'Validating environment requirements',
      status: 'pending',
      progress: 0,
      logs: []
    });

    // Application installation for both modes
    steps.push({
      id: 'application',
      name: 'Application Installation',
      description: 'Installing WordPress Enterprise',
      status: 'pending',
      progress: 0,
      logs: []
    });

    return steps;
  };

  const [status, setStatus] = useState<UnifiedInstallationStatus>({
    currentStepId: null,
    overallProgress: 0,
    steps: createInitialSteps(),
    isComplete: false,
    hasErrors: false
  });

  const updateStep = useCallback((stepId: string, updates: Partial<InstallationStep>) => {
    setStatus(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId 
          ? { ...step, ...updates }
          : step
      )
    }));
  }, []);

  const updateOverallProgress = useCallback(() => {
    setStatus(prev => {
      const totalSteps = prev.steps.length;
      const completedSteps = prev.steps.filter(s => s.status === 'completed').length;
      const runningStep = prev.steps.find(s => s.status === 'running');
      
      let progress = (completedSteps / totalSteps) * 100;
      
      // Add partial progress for running step
      if (runningStep) {
        progress += (runningStep.progress / totalSteps);
      }

      const isComplete = prev.steps.every(s => 
        s.status === 'completed' || s.status === 'skipped'
      );
      
      const hasErrors = prev.steps.some(s => s.status === 'failed');

      return {
        ...prev,
        overallProgress: Math.min(progress, 100),
        isComplete,
        hasErrors
      };
    });
  }, []);

  const executeInfrastructureStep = async () => {
    const stepId = 'infrastructure';
    
    updateStep(stepId, { 
      status: 'running', 
      startTime: new Date(),
      logs: ['Starting infrastructure setup...']
    });

    setStatus(prev => ({ ...prev, currentStepId: stepId }));

    try {
      await setupInfrastructure(config, (infraStatus) => {
        updateStep(stepId, {
          progress: infraStatus.progress || 0,
          logs: infraStatus.logs || []
        });
        updateOverallProgress();
      });

      updateStep(stepId, { 
        status: 'completed', 
        progress: 100,
        endTime: new Date()
      });
    } catch (error) {
      updateStep(stepId, { 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Infrastructure setup failed',
        endTime: new Date()
      });
    }
  };

  const executePreflightsStep = async () => {
    const stepId = 'preflights';
    
    updateStep(stepId, { 
      status: 'running', 
      startTime: new Date(),
      logs: ['Starting preflight checks...']
    });

    setStatus(prev => ({ ...prev, currentStepId: stepId }));

    try {
      const results = await validateEnvironment(config);
      
      const hasFailures = Object.values(results).some(result => result && !result.success);
      
      const logs = Object.entries(results).map(([key, result]) => {
        const checkName = key.charAt(0).toUpperCase() + key.slice(1);
        return `${checkName}: ${result?.success ? 'PASS' : 'FAIL'} - ${result?.message}`;
      });

      if (hasFailures && prototypeSettings.blockOnAppPreflights) {
        updateStep(stepId, { 
          status: 'failed', 
          progress: 100,
          logs,
          error: 'Preflight checks failed. Please resolve issues before proceeding.',
          endTime: new Date()
        });
      } else {
        updateStep(stepId, { 
          status: hasFailures ? 'completed' : 'completed', 
          progress: 100,
          logs: [...logs, hasFailures ? 'Proceeding despite failures...' : 'All checks passed'],
          endTime: new Date()
        });
      }
    } catch (error) {
      updateStep(stepId, { 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Preflight checks failed',
        endTime: new Date()
      });
    }
  };

  const executeApplicationStep = async () => {
    const stepId = 'application';
    
    updateStep(stepId, { 
      status: 'running', 
      startTime: new Date(),
      logs: ['Starting WordPress Enterprise installation...']
    });

    setStatus(prev => ({ ...prev, currentStepId: stepId }));

    try {
      await installWordPress(config, (wpStatus) => {
        const logs = wpStatus.logs || [];
        updateStep(stepId, {
          progress: wpStatus.progress || 0,
          logs
        });
        updateOverallProgress();
      });

      updateStep(stepId, { 
        status: 'completed', 
        progress: 100,
        endTime: new Date()
      });
    } catch (error) {
      updateStep(stepId, { 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Application installation failed',
        endTime: new Date()
      });
    }
  };

  const startInstallation = async () => {
    try {
      // Execute steps sequentially
      if (isLinuxMode) {
        await executeInfrastructureStep();
        updateOverallProgress();
        
        // Check if infrastructure failed
        const infraStep = status.steps.find(s => s.id === 'infrastructure');
        if (infraStep?.status === 'failed') {
          return;
        }
      }

      await executePreflightsStep();
      updateOverallProgress();
      
      // Check if preflights failed and we should block
      const preflightStep = status.steps.find(s => s.id === 'preflights');
      if (preflightStep?.status === 'failed') {
        return;
      }

      await executeApplicationStep();
      updateOverallProgress();

    } catch (error) {
      console.error('Installation flow error:', error);
    } finally {
      setStatus(prev => ({ ...prev, currentStepId: null }));
    }
  };

  const isInstallationComplete = status.isComplete && !status.hasErrors;

  return {
    status,
    startInstallation,
    isInstallationComplete,
    hasErrors: status.hasErrors
  };
};
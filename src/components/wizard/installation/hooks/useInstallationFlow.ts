import { useState, useCallback } from 'react';
import { ClusterConfig } from '../../../../contexts/ConfigContext';
import { UnifiedInstallationStatus, InstallationStep, InstallationStepId, InstallationSubStep } from '../../../../types/installation';
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
        logs: [],
        subSteps: [
          { id: 'openebs', name: 'OpenEBS Storage', status: 'pending' },
          { id: 'registry', name: 'Container Registry', status: 'pending' },
          { id: 'velero', name: 'Velero Backup', status: 'pending' },
          { id: 'components', name: 'Additional Components', status: 'pending' }
        ]
      });
    }

    // Preflights for both modes
    steps.push({
      id: 'preflights',
      name: 'Application Preflights',
      description: 'Validating environment requirements',
      status: 'pending',
      progress: 0,
      logs: [],
      subSteps: [
        { id: 'kubernetes', name: 'Kubernetes Connectivity', status: 'pending' },
        { id: 'helm', name: 'Helm Installation', status: 'pending' },
        { id: 'storage', name: 'Storage Classes', status: 'pending' },
        { id: 'networking', name: 'Networking & Ingress', status: 'pending' },
        { id: 'permissions', name: 'RBAC Permissions', status: 'pending' }
      ]
    });

    // Application installation for both modes
    steps.push({
      id: 'application',
      name: 'Application Installation',
      description: 'Installing WordPress Enterprise',
      status: 'pending',
      progress: 0,
      logs: [],
      subSteps: [
        { id: 'database', name: 'PostgreSQL Database', status: 'pending' },
        { id: 'core', name: 'WordPress Core', status: 'pending' },
        { id: 'plugins', name: 'Plugins & Extensions', status: 'pending' }
      ]
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

  const updateSubStep = useCallback((stepId: string, subStepId: string, status: 'pending' | 'running' | 'completed' | 'failed') => {
    setStatus(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId 
          ? {
              ...step,
              subSteps: step.subSteps?.map(subStep =>
                subStep.id === subStepId ? { ...subStep, status } : subStep
              )
            }
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
    });

    setStatus(prev => ({ ...prev, currentStepId: stepId }));

    try {
      await setupInfrastructure(config, (infraStatus) => {
        // Update sub-steps based on infrastructure status
        if (infraStatus.openebs) {
          updateSubStep(stepId, 'openebs', infraStatus.openebs === 'completed' ? 'completed' : infraStatus.openebs === 'in-progress' ? 'running' : 'pending');
        }
        if (infraStatus.registry) {
          updateSubStep(stepId, 'registry', infraStatus.registry === 'completed' ? 'completed' : infraStatus.registry === 'in-progress' ? 'running' : 'pending');
        }
        if (infraStatus.velero) {
          updateSubStep(stepId, 'velero', infraStatus.velero === 'completed' ? 'completed' : infraStatus.velero === 'in-progress' ? 'running' : 'pending');
        }
        if (infraStatus.components) {
          updateSubStep(stepId, 'components', infraStatus.components === 'completed' ? 'completed' : infraStatus.components === 'in-progress' ? 'running' : 'pending');
        }
        
        updateStep(stepId, {
          progress: infraStatus.progress || 0,
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
    });

    setStatus(prev => ({ ...prev, currentStepId: stepId }));

    try {
      // Update sub-steps as we check each one
      const checks = ['kubernetes', 'helm', 'storage', 'networking', 'permissions'];
      
      for (const check of checks) {
        updateSubStep(stepId, check, 'running');
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate check time
      }
      
      const results = await validateEnvironment(config);
      
      const hasFailures = Object.values(results).some(result => result && !result.success);
      
      // Update sub-step statuses based on results
      Object.entries(results).forEach(([key, result]) => {
        updateSubStep(stepId, key, result?.success ? 'completed' : 'failed');
      });

      if (hasFailures) {
        updateStep(stepId, { 
          status: 'failed', 
          progress: 100,
          error: 'Preflight checks failed. Please resolve issues before proceeding.',
          endTime: new Date()
        });
        return false; // Indicate failure
      } else {
        updateStep(stepId, { 
          status: 'completed', 
          progress: 100,
          endTime: new Date()
        });
        return true; // Indicate success
      }
    } catch (error) {
      updateStep(stepId, { 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Preflight checks failed',
        endTime: new Date()
      });
      return false; // Indicate failure
    }
  };

  const executeApplicationStep = async () => {
    const stepId = 'application';
    
    updateStep(stepId, { 
      status: 'running', 
      startTime: new Date(),
    });

    setStatus(prev => ({ ...prev, currentStepId: stepId }));

    try {
      await installWordPress(config, (wpStatus) => {
        // Update sub-steps based on WordPress installation status
        if (wpStatus.database) {
          updateSubStep(stepId, 'database', wpStatus.database === 'completed' ? 'completed' : wpStatus.database === 'in-progress' ? 'running' : 'pending');
        }
        if (wpStatus.core) {
          updateSubStep(stepId, 'core', wpStatus.core === 'completed' ? 'completed' : wpStatus.core === 'in-progress' ? 'running' : 'pending');
        }
        if (wpStatus.plugins) {
          updateSubStep(stepId, 'plugins', wpStatus.plugins === 'completed' ? 'completed' : wpStatus.plugins === 'in-progress' ? 'running' : 'pending');
        }
        
        updateStep(stepId, {
          progress: wpStatus.progress || 0,
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
        setStatus(prev => {
          const infraStep = prev.steps.find(s => s.id === 'infrastructure');
          if (infraStep?.status === 'failed') {
            return prev; // Stop execution
          }
          return prev;
        });
        
        const currentInfraStep = status.steps.find(s => s.id === 'infrastructure');
        if (currentInfraStep?.status === 'failed') {
          return;
        }
      }

      const preflightSuccess = await executePreflightsStep();
      updateOverallProgress();
      
      // Stop if preflights failed
      if (!preflightSuccess) {
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
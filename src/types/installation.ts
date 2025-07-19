export interface InstallationStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  progress: number;
  logs: string[];
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface UnifiedInstallationStatus {
  currentStepId: string | null;
  overallProgress: number;
  steps: InstallationStep[];
  isComplete: boolean;
  hasErrors: boolean;
}

export type InstallationStepId = 
  | 'infrastructure' 
  | 'preflights' 
  | 'application';
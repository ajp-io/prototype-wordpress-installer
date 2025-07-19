import React from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface OverallProgressProps {
  progress: number;
  isComplete: boolean;
  hasErrors: boolean;
  themeColor: string;
}

const OverallProgress: React.FC<OverallProgressProps> = ({
  progress,
  isComplete,
  hasErrors,
  themeColor
}) => {
  const getStatusIcon = () => {
    if (hasErrors) {
      return <XCircle className="w-6 h-6 text-red-500" />;
    }
    if (isComplete) {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
    return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
  };

  const getStatusText = () => {
    if (hasErrors) return 'Installation Failed';
    if (isComplete) return 'Installation Complete';
    return 'Installing...';
  };

  const getProgressColor = () => {
    if (hasErrors) return 'rgb(239 68 68)';
    if (isComplete) return 'rgb(34 197 94)';
    return themeColor;
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-gray-900">Overall Progress</h3>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-gray-700">
            {getStatusText()}
          </span>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="h-3 rounded-full transition-all duration-500 ease-out"
          style={{
            backgroundColor: getProgressColor(),
            width: `${progress}%`,
          }}
        />
      </div>
      
      <div className="flex justify-between text-sm text-gray-500 mt-1">
        <span>Progress</span>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

export default OverallProgress;
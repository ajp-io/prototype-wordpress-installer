import React from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface PreflightDetailProps {
  results: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  themeColor: string;
  onRerun?: () => void;
}

const PreflightDetail: React.FC<PreflightDetailProps> = ({
  results,
  status,
  themeColor,
  onRerun
}) => {
  const getFailedChecks = () => {
    if (!results) return [];
    
    return Object.entries(results)
      .filter(([_, result]: [string, any]) => result && !result.success)
      .map(([key, result]: [string, any]) => ({
        key,
        title: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        message: result?.message || '',
        isStrict: result?.isStrict || false
      }));
  };

  const getStrictFailedChecks = () => {
    return getFailedChecks().filter(check => check.isStrict);
  };

  const getTotalChecks = () => {
    if (!results) return 0;
    return Object.keys(results).length;
  };

  const getPassedChecks = () => {
    if (!results) return 0;
    return Object.values(results).filter((result: any) => result && result.success).length;
  };

  const failedChecks = getFailedChecks();
  const strictFailedChecks = getStrictFailedChecks();
  const totalChecks = getTotalChecks();
  const passedChecks = getPassedChecks();
  const hasStrictFailures = strictFailedChecks.length > 0;

  if (status === 'running') {
    return (
      <div className="flex flex-col items-center py-8">
        <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: themeColor }} />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Running Preflight Checks</h3>
        <p className="text-sm text-gray-600 text-center max-w-md">
          Validating your environment to ensure it meets all requirements for WordPress Enterprise installation.
        </p>
      </div>
    );
  }

  if (status === 'completed' && failedChecks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">All Preflight Checks Passed</h3>
              <p className="mt-1 text-sm text-green-700">
                All {totalChecks} preflight checks passed successfully. Your environment is ready for WordPress Enterprise installation.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'failed' || failedChecks.length > 0) {
    return (
      <div className="space-y-6">
        <div className={`p-4 rounded-lg border ${
          hasStrictFailures 
            ? 'bg-red-100 border-red-300' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {failedChecks.length} of {totalChecks} Preflight Checks Failed
                {hasStrictFailures && ' (Critical Issues Found)'}
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {hasStrictFailures 
                  ? 'Critical preflight checks have failed and must be resolved before proceeding with the installation.'
                  : 'Please resolve the issues below before proceeding with the installation.'
                }
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">Failed Checks:</h4>
            {onRerun && (
              <button
                onClick={onRerun}
                className="px-3 py-1.5 text-sm font-medium text-white rounded-md hover:opacity-90 transition-colors"
                style={{ backgroundColor: themeColor }}
              >
                Rerun Preflight Checks
              </button>
            )}
          </div>
          <div className="space-y-3">
            {failedChecks.map(({ key, title, message, isStrict }) => (
              <div key={key} className={`flex items-start p-3 rounded-md ${
                isStrict ? 'bg-red-100 border border-red-200' : ''
              }`}>
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <h5 className={`text-sm font-medium text-red-800 ${isStrict ? 'font-bold' : ''}`}>
                      {title}
                    </h5>
                    {isStrict && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-200 text-red-800">
                        CRITICAL
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-red-700">{message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PreflightDetail;
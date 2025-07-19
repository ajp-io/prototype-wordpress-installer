import React, { useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Terminal } from 'lucide-react';

interface InstallationLogsProps {
  logs: string[];
  isExpanded: boolean;
  onToggle: () => void;
}

const InstallationLogs: React.FC<InstallationLogsProps> = ({
  logs,
  isExpanded,
  onToggle
}) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logsEndRef.current && isExpanded) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isExpanded]);

  return (
    <div className="mt-8">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
      >
        <Terminal className="w-4 h-4" />
        <span>All Installation Logs ({logs.length} entries)</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      
      {isExpanded && (
        <div className="bg-gray-900 text-gray-200 rounded-md p-4 h-64 overflow-y-auto font-mono text-xs mt-3">
          {logs.length === 0 ? (
            <div className="text-gray-400 italic">No logs available yet...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="whitespace-pre-wrap pb-1">
                {log}
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>
      )}
    </div>
  );
};

export default InstallationLogs;
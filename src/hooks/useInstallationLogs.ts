import { useState } from 'react';

export const useInstallationLogs = () => {
  const [allLogs, setAllLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const addToAllLogs = (newLogs: string[]) => {
    setAllLogs(prev => [...prev, ...newLogs]);
  };

  const toggleLogs = () => {
    setShowLogs(prev => !prev);
  };

  return {
    allLogs,
    showLogs,
    addToAllLogs,
    toggleLogs,
  };
};
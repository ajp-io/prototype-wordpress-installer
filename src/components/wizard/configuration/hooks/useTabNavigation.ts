import { useState } from 'react';
import { TabName } from '../utils/validationUtils';

export const useTabNavigation = (initialTab: TabName = 'cluster') => {
  const [activeTab, setActiveTab] = useState<TabName>(initialTab);

  return {
    activeTab,
    setActiveTab
  };
};
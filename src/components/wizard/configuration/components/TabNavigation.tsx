import React from 'react';
import { TabName } from '../utils/validationUtils';
import { useConfig } from '../../../../contexts/ConfigContext';

interface TabNavigationProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const { prototypeSettings } = useConfig();
  const themeColor = prototypeSettings.themeColor;

  const tabs = [
    { id: 'cluster' as TabName, label: 'Cluster Settings' },
    { id: 'network' as TabName, label: 'Network' },
    { id: 'admin' as TabName, label: 'Admin Account' },
    { id: 'database' as TabName, label: 'Database' }
  ];

  return (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
              onClick={() => onTabChange(tab.id)}
              style={{
                borderColor: activeTab === tab.id ? themeColor : 'transparent',
                color: activeTab === tab.id ? themeColor : 'rgb(107 114 128)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default TabNavigation;
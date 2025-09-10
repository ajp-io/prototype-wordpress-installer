import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { WordPressLogo } from '../components/common/Logo';
import Card from '../components/common/Card';
import { useConfig } from '../contexts/ConfigContext';
import { LayoutDashboard, FileText, History, Server } from 'lucide-react';
import Dashboard from '../components/console/Dashboard';
import DeploymentHistory from '../components/console/DeploymentHistory';

type ConsoleTab = 'dashboard' | 'history' | 'hosts';

const ConsolePage: React.FC = () => {
  const { prototypeSettings } = useConfig();
  const location = useLocation();
  const navigate = useNavigate();
  const themeColor = prototypeSettings.themeColor;
  
  // Determine active tab from URL
  const getActiveTabFromPath = (pathname: string): ConsoleTab => {
    if (pathname.includes('/history')) return 'history';
    if (pathname.includes('/hosts')) return 'hosts';
    return 'dashboard';
  };
  
  const [activeTab, setActiveTab] = useState<ConsoleTab>(getActiveTabFromPath(location.pathname));

  const navigationItems = [
    { id: 'dashboard' as ConsoleTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history' as ConsoleTab, label: 'Deployment History', icon: History },
    { id: 'hosts' as ConsoleTab, label: 'Hosts', icon: Server },
  ];

  const handleNavigateFromDashboard = (tab: 'history' | 'hosts') => {
    const path = tab === 'history' ? '/console/history' : '/console/hosts';
    navigate(path);
    setActiveTab(tab);
  };
  
  const handleTabChange = (tab: ConsoleTab) => {
    const paths = {
      dashboard: '/console/dashboard',
      history: '/console/history',
      hosts: '/console/hosts'
    };
    navigate(paths[tab]);
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard onNavigate={handleNavigateFromDashboard} />
        );
      case 'history':
        return (
          <DeploymentHistory />
        );
      case 'hosts':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Hosts</h2>
            <Card>
              <p className="text-gray-600">Detailed host information will be displayed here.</p>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <div className="flex items-center space-x-3">
              <WordPressLogo className="h-10 w-10" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">WordPress Enterprise Console</h1>
                <p className="text-sm text-gray-500">Manage your WordPress Enterprise installation</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-6">
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: isActive ? `${themeColor}1A` : 'transparent',
                    color: isActive ? themeColor : 'rgb(107 114 128)',
                    borderLeft: isActive ? `3px solid ${themeColor}` : '3px solid transparent',
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default ConsolePage;
```typescript
import React, { useState } from 'react';
import { WordPressLogo } from '../components/common/Logo';
import { useConfig } from '../contexts/ConfigContext';
import Card from '../components/common/Card'; // Assuming Card is needed for content
import Button from '../components/common/Button'; // Assuming Button is needed for navigation

type ConsoleTab = 'dashboard' | 'license' | 'history' | 'hosts';

const ConsolePage: React.FC = () => {
  const { prototypeSettings } = useConfig();
  const themeColor = prototypeSettings.themeColor;
  const [activeTab, setActiveTab] = useState<ConsoleTab>('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h2>
            <p className="text-gray-600">High-level overview will go here.</p>
          </Card>
        );
      case 'license':
        return (
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">License Information</h2>
            <p className="text-gray-600">Detailed license information will go here.</p>
          </Card>
        );
      case 'history':
        return (
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Deployment History</h2>
            <p className="text-gray-600">Deployment history details will go here.</p>
          </Card>
        );
      case 'hosts':
        return (
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hosts Overview</h2>
            <p className="text-gray-600">Detailed host information will go here.</p>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
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

      <main className="flex flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-x-6">
        {/* Sidebar Navigation */}
        <div className="w-64 flex-shrink-0">
          <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-2">
            <Button
              variant={activeTab === 'dashboard' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('dashboard')}
              className="w-full justify-start"
              style={{
                backgroundColor: activeTab === 'dashboard' ? themeColor : undefined,
                borderColor: activeTab === 'dashboard' ? themeColor : undefined,
                color: activeTab === 'dashboard' ? 'white' : undefined,
              }}
            >
              Dashboard
            </Button>
            <Button
              variant={activeTab === 'license' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('license')}
              className="w-full justify-start"
              style={{
                backgroundColor: activeTab === 'license' ? themeColor : undefined,
                borderColor: activeTab === 'license' ? themeColor : undefined,
                color: activeTab === 'license' ? 'white' : undefined,
              }}
            >
              License Information
            </Button>
            <Button
              variant={activeTab === 'history' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('history')}
              className="w-full justify-start"
              style={{
                backgroundColor: activeTab === 'history' ? themeColor : undefined,
                borderColor: activeTab === 'history' ? themeColor : undefined,
                color: activeTab === 'history' ? 'white' : undefined,
              }}
            >
              Deployment History
            </Button>
            <Button
              variant={activeTab === 'hosts' ? 'primary' : 'outline'}
              onClick={() => setActiveTab('hosts')}
              className="w-full justify-start"
              style={{
                backgroundColor: activeTab === 'hosts' ? themeColor : undefined,
                borderColor: activeTab === 'hosts' ? themeColor : undefined,
                color: activeTab === 'hosts' ? 'white' : undefined,
              }}
            >
              Hosts
            </Button>
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default ConsolePage;
```
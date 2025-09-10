import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useConfig } from '../../contexts/ConfigContext';
import { CheckCircle, Clock, Server, FileText } from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: 'history' | 'hosts') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { prototypeSettings } = useConfig();
  const themeColor = prototypeSettings.themeColor;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
      <p className="text-gray-600">Overview of your WordPress Enterprise installation</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Deployment History Summary Card */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${themeColor}1A` }}
              >
                <Clock className="w-5 h-5" style={{ color: themeColor }} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Last Deployment</h3>
                <p className="text-sm text-gray-500">Recent activity</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-600">Success</span>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Date:</span>
              <span className="text-gray-900">Dec 15, 2024</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Version:</span>
              <span className="text-gray-900">v6.4.2</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Type:</span>
              <span className="text-gray-900">Installation</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => onNavigate('history')}
          >
            View History
          </Button>
        </Card>

        {/* Hosts Summary Card */}
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${themeColor}1A` }}
              >
                <Server className="w-5 h-5" style={{ color: themeColor }} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Hosts</h3>
                <p className="text-sm text-gray-500">Infrastructure status</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-600">Healthy</span>
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Hosts:</span>
              <span className="text-gray-900">3</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Active:</span>
              <span className="text-gray-900">3</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">CPU Usage:</span>
              <span className="text-gray-900">45%</span>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => onNavigate('hosts')}
          >
            View Hosts
          </Button>
        </Card>
      </div>

      {/* Quick Actions Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => onNavigate('history')}
          >
            <Clock className="w-4 h-4 mr-2" />
            View Deployment Logs
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
            onClick={() => onNavigate('hosts')}
          >
            <Server className="w-4 h-4 mr-2" />
            Monitor Hosts
          </Button>
          <Button 
            variant="outline" 
            className="justify-start"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Configuration
          </Button>
        </div>
      </Card>
    </div>
  );
}
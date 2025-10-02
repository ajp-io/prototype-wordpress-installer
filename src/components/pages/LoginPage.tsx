import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { WordPressLogo } from '../common/Logo';
import { ChevronRight, Lock, Server, Settings, Download, CheckCircle } from 'lucide-react';
import { useConfig } from '../../contexts/ConfigContext';

const LoginPage: React.FC = () => {
  const { prototypeSettings } = useConfig();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const themeColor = prototypeSettings.themeColor;

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError('');
  };

  const handleSubmit = () => {
    if (password.trim() !== '') {
      // Set authentication state and trigger re-render
      localStorage.setItem('wordpress-authenticated', 'true');
      window.location.reload();
    } else {
      setError('Password is required');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const upcomingSteps = [
    { 
      icon: Server, 
      title: 'Configure', 
      description: 'Set up your WordPress Enterprise installation settings' 
    },
    { 
      icon: Settings, 
      title: 'Setup', 
      description: 'Configure environment and registry settings' 
    },
    { 
      icon: Download, 
      title: 'Install', 
      description: 'Deploy WordPress Enterprise to your infrastructure' 
    },
    { 
      icon: CheckCircle, 
      title: 'Complete', 
      description: 'Access your new WordPress Enterprise installation' 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <WordPressLogo className="mx-auto h-16 w-16 mb-6" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">WordPress Enterprise</h1>
          <p className="text-xl text-gray-600">Installation Wizard</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Login Card */}
          <Card className="order-2 lg:order-1">
            <div className="py-8 px-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Get Started</h2>
              <p className="text-gray-600 mb-8 text-center">
                This wizard will guide you through installing WordPress Enterprise on your infrastructure.
              </p>

              <div className="max-w-xs mx-auto">
                <Input
                  id="password"
                  label="Enter Password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onKeyDown={handleKeyDown}
                  error={error}
                  required
                  icon={<Lock className="w-5 h-5" />}
                  className="w-full"
                />

                <Button 
                  onClick={handleSubmit} 
                  size="lg" 
                  className="w-full mt-4"
                  icon={<ChevronRight className="w-5 h-5" />}
                >
                  Continue to Installation
                </Button>
              </div>
            </div>
          </Card>

          {/* What's Next Card */}
          <Card className="order-1 lg:order-2" title="What's Next">
            <div className="space-y-6">
              <p className="text-gray-600 text-sm">
                After logging in, you'll complete these steps to set up WordPress Enterprise:
              </p>
              
              <div className="space-y-4">
                {upcomingSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3">
                      <div 
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${themeColor}1A` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: themeColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900">{step.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-gray-200">
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
  )
}
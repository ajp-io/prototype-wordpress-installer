import React, { useState } from 'react';
import Card from '../../../common/Card';
import Button from '../../../common/Button';
import { useConfig } from '../../../../contexts/ConfigContext';
import { Save, Terminal, Copy, ClipboardCheck } from 'lucide-react';
import { getConfigFileName, getInstallCommand } from '../utils/configUtils';

const ConfigSaveSuccess: React.FC = () => {
  const { prototypeSettings } = useConfig();
  const [copied, setCopied] = useState(false);
  const themeColor = prototypeSettings.themeColor;

  const copyInstallCommand = () => {
    const command = getInstallCommand(prototypeSettings.configFormat, prototypeSettings.clusterMode);
    
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col items-center text-center py-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${themeColor}1A` }}>
            <Save className="w-10 h-10" style={{ color: themeColor }} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Configuration Saved!</h2>
          <p className="text-xl text-gray-600 max-w-2xl mb-8">
            Your configuration has been saved to {getConfigFileName(prototypeSettings.configFormat)}
          </p>

          <div className="w-full max-w-2xl space-y-6">
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Installation Command</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="py-1 px-2 text-xs"
                  icon={copied ? <ClipboardCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  onClick={copyInstallCommand}
                >
                  {copied ? 'Copied!' : 'Copy Command'}
                </Button>
              </div>
              <div className="flex items-start space-x-2 p-2 bg-white rounded border border-gray-300">
                <Terminal className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <code className="font-mono text-sm text-left">
                  {getInstallCommand(prototypeSettings.configFormat, prototypeSettings.clusterMode)}
                </code>
              </div>
            </div>

            <p className="text-sm text-gray-500">
              Run this command to start the installation using your saved configuration.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ConfigSaveSuccess;
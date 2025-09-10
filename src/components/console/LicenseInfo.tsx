import React from 'react';
import Card from '../common/Card';
import Input from '../common/Input';
import { useConfig } from '../../contexts/ConfigContext';
import { CheckCircle, XCircle, Users, Calendar, Package, Shield } from 'lucide-react';

const LicenseInfo: React.FC = () => {
  const { prototypeSettings } = useConfig();
  const themeColor = prototypeSettings.themeColor;

  // Mock entitlements data - in real app this would come from API/config
  const entitlements = [
    {
      id: 'premium-themes',
      name: 'Premium Themes',
      description: 'Access to premium theme marketplace',
      enabled: true,
      icon: Package,
      limit: null
    },
    {
      id: 'advanced-security',
      name: 'Advanced Security Features',
      description: 'Enhanced security monitoring and threat detection',
      enabled: true,
      icon: Shield,
      limit: null
    },
    {
      id: 'user-seats',
      name: 'User Seats',
      description: 'Maximum number of registered users',
      enabled: true,
      icon: Users,
      limit: '1,000 users'
    },
    {
      id: 'api-calls',
      name: 'API Rate Limit',
      description: 'API requests per hour',
      enabled: true,
      icon: Calendar,
      limit: '10,000 requests/hour'
    },
    {
      id: 'backup-retention',
      name: 'Backup Retention',
      description: 'Automated backup retention period',
      enabled: false,
      icon: Package,
      limit: '90 days'
    }
  ];

  const renderEntitlementCard = (entitlement: typeof entitlements[0]) => {
    const Icon = entitlement.icon;
    
    return (
      <div 
        key={entitlement.id}
        className={`p-4 rounded-lg border ${
          entitlement.enabled 
            ? 'border-green-200 bg-green-50' 
            : 'border-gray-200 bg-gray-50'
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: entitlement.enabled ? `${themeColor}1A` : 'rgb(243 244 246)',
                color: entitlement.enabled ? themeColor : 'rgb(156 163 175)'
              }}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900">{entitlement.name}</h4>
              <p className="text-xs text-gray-500 mt-1">{entitlement.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {entitlement.enabled ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-gray-400" />
            )}
            <span className={`text-xs font-medium ${
              entitlement.enabled ? 'text-green-600' : 'text-gray-500'
            }`}>
              {entitlement.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
        {entitlement.limit && (
          <div className="text-xs text-gray-600">
            <span className="font-medium">Limit:</span> {entitlement.limit}
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">License Information</h2>
      
      {/* Basic License Info */}
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">License Details</h3>
        <div className="space-y-6">
          <Input
            id="licenseKey"
            label="License Key"
            value="XXXX-XXXX-XXXX-XXXX-XXXX"
            readOnly={true}
            helpText="Your unique WordPress Enterprise license key"
          />
          <Input
            id="licenseType"
            label="License Type"
            value="Enterprise"
            readOnly={true}
            helpText="The type of your WordPress Enterprise license"
          />
          <Input
            id="expirationDate"
            label="Expiration Date"
            value="Dec 31, 2024"
            readOnly={true}
            helpText="Date when your license expires"
          />
          <Input
            id="users"
            label="Users/Seats"
            value="Unlimited"
            readOnly={true}
            helpText="Number of users or seats allowed by your license"
          />
          <Input
            id="status"
            label="Status"
            value="Active"
            readOnly={true}
            helpText="Current status of your license"
          />
        </div>
      </Card>
      
      {/* License Entitlements */}
      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">License Entitlements</h3>
          <p className="text-sm text-gray-500 mt-1">
            Features and limits included with your license
          </p>
        </div>
        
        {entitlements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entitlements.map(renderEntitlementCard)}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-sm font-medium text-gray-900 mb-2">No Entitlements Configured</h4>
            <p className="text-sm text-gray-500">
              No specific entitlements have been configured for this license.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LicenseInfo;
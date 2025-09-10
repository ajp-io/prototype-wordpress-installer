import React from 'react';
import Card from '../common/Card';
import Input from '../common/Input';
import { useConfig } from '../../contexts/ConfigContext';

const LicenseInfo: React.FC = () => {
  const { prototypeSettings } = useConfig();
  const themeColor = prototypeSettings.themeColor;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">License Information</h2>
      <Card>
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
    </div>
  );
};

export default LicenseInfo;
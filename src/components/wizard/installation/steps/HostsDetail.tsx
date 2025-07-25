import React from 'react';
import K0sInstallation from '../../setup/K0sInstallation';

interface HostsDetailProps {
  onComplete?: (hasFailures?: boolean) => void;
  themeColor: string;
}

const HostsDetail: React.FC<HostsDetailProps> = ({
  onComplete,
  themeColor
}) => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <p className="text-gray-600">
          Setting up k0s on the primary host and optionally joining additional hosts to create a cluster.
        </p>
      </div>

      <K0sInstallation onComplete={onComplete} />
    </div>
  );
};

export default HostsDetail;
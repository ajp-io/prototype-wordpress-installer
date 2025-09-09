import { useState } from 'react';

export const useJoinCommand = () => {
  const [copied, setCopied] = useState(false);

  const copyJoinCommand = (selectedRole?: 'application' | 'database') => {
    const joinCommand = selectedRole === 'database' 
      ? `sudo ./wordpress-enterprise join 10.128.0.45:30000 Xm9pK4vRtY2wQn8sLj5uH7fB`
      : `sudo ./wordpress-enterprise join 10.128.0.45:30000 EaKuL6cNeIlzMci3JdDU9Oi4`;
    
    navigator.clipboard.writeText(joinCommand).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return {
    copied,
    copyJoinCommand
  };
};
import React from 'react';

export const WordPressLogo: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => {
  return (
    <img 
      src="https://upload.wikimedia.org/wikipedia/commons/9/98/WordPress_blue_logo.svg" 
      alt="WordPress Logo"
      className={className}
    />
  );
};
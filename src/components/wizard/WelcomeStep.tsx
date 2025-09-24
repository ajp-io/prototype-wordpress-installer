import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import { WordPressLogo } from '../common/Logo';
import { ChevronRight, Lock } from 'lucide-react';
import { useWizardMode } from '../../contexts/WizardModeContext';

interface LoginStepProps {
  onNext: () => void;
}

const LoginStep: React.FC<LoginStepProps> = ({ onNext }) => {
  const { text } = useWizardMode();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError('');
  };

  const handleSubmit = () => {
    if (password.trim() !== '') {
      onNext();
    } else {
      setError('Password is required');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col items-center text-center py-12">
          <WordPressLogo className="h-20 w-20 mb-6" />
          <h2 className="text-3xl font-bold text-gray-900">{text.loginTitle}</h2>
          <p className="text-xl text-gray-600 max-w-2xl mb-8">
            {text.loginDescription}
          </p>
          


          <div className="w-full max-w-xs mb-8">
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
              {text.loginButtonText}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginStep;
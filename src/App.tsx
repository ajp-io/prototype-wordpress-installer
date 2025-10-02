import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from './contexts/ConfigContext';
import { WizardModeProvider } from './contexts/WizardModeContext';
import LoginPage from './components/pages/LoginPage';
import InstallWizard from './components/wizard/InstallWizard';
import ConfigureOnly from './components/wizard/ConfigureOnly';
import DryRun from './components/wizard/DryRun';
import PrototypeSettings from './components/prototype/PrototypeSettings';
import ConsolePage from './pages/ConsolePage';
import ViewDeploymentConfig from './pages/ViewDeploymentConfig';

// Simple auth state management for prototype
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => {
    return localStorage.getItem('wordpress-authenticated') === 'true';
  });

  const login = () => {
    localStorage.setItem('wordpress-authenticated', 'true');
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('wordpress-authenticated');
    setIsAuthenticated(false);
    // Force a page reload to ensure we go back to login
    window.location.reload();
  };

  return { isAuthenticated, login, logout };
};

const AuthenticatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  
  return <>{children}</>;
};

function App() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <BrowserRouter>
        <ConfigProvider>
          <Routes>
            <Route 
              path="/" 
              element={
                <AuthenticatedRoute>
                  <WizardModeProvider mode="install">
                    <InstallWizard onLogout={logout} />
                  </WizardModeProvider>
                </AuthenticatedRoute>
              } 
            />
            <Route 
              path="/upgrade" 
              element={
                <AuthenticatedRoute>
                  <WizardModeProvider mode="upgrade">
                    <InstallWizard onLogout={logout} />
                  </WizardModeProvider>
                </AuthenticatedRoute>
              } 
            />
            <Route 
              path="/configure" 
              element={
                <AuthenticatedRoute>
                  <WizardModeProvider mode="install" configureOnly={true}>
                    <ConfigureOnly onLogout={logout} />
                  </WizardModeProvider>
                </AuthenticatedRoute>
              } 
            />
            <Route 
              path="/dry-run" 
              element={
                <AuthenticatedRoute>
                  <WizardModeProvider mode="install" dryRun={true}>
                    <DryRun onLogout={logout} />
                  </WizardModeProvider>
                </AuthenticatedRoute>
              } 
            />
            <Route path="/prototype" element={<PrototypeSettings />} />
            <Route 
              path="/console" 
              element={
                <AuthenticatedRoute>
                  <ConsolePage />
                </AuthenticatedRoute>
              } 
            />
            <Route 
              path="/console/dashboard" 
              element={
                <AuthenticatedRoute>
                  <ConsolePage />
                </AuthenticatedRoute>
              } 
            />
            <Route 
              path="/console/history" 
              element={
                <AuthenticatedRoute>
                  <ConsolePage />
                </AuthenticatedRoute>
              } 
            />
            <Route 
              path="/console/history/:deploymentId/config" 
              element={
                <AuthenticatedRoute>
                  <ViewDeploymentConfig />
                </AuthenticatedRoute>
              } 
            />
            <Route 
              path="/console/hosts" 
              element={
                <AuthenticatedRoute>
                  <ConsolePage />
                </AuthenticatedRoute>
              } 
            />
          </Routes>
        </ConfigProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
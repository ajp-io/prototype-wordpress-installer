import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from './contexts/ConfigContext';
import { WizardModeProvider } from './contexts/WizardModeContext';
import InstallWizard from './components/wizard/InstallWizard';
import ConfigureOnly from './components/wizard/ConfigureOnly';
import DryRun from './components/wizard/DryRun';
import PrototypeSettings from './components/prototype/PrototypeSettings';
import ConsolePage from './pages/ConsolePage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <BrowserRouter>
        <ConfigProvider>
          <Routes>
            <Route 
              path="/" 
              element={
                <WizardModeProvider mode="install">
                  <InstallWizard />
                </WizardModeProvider>
              } 
            />
            <Route 
              path="/upgrade" 
              element={
                <WizardModeProvider mode="upgrade">
                  <InstallWizard />
                </WizardModeProvider>
              } 
            />
            <Route 
              path="/configure" 
              element={
                <WizardModeProvider mode="install" configureOnly={true}>
                  <ConfigureOnly />
                </WizardModeProvider>
              } 
            />
            <Route 
              path="/dry-run" 
              element={
                <WizardModeProvider mode="install" dryRun={true}>
                  <DryRun />
                </WizardModeProvider>
              } 
            />
            <Route path="/prototype" element={<PrototypeSettings />} />
            <Route path="/console" element={<ConsolePage />} />
            <Route path="/console/dashboard" element={<ConsolePage />} />
            <Route path="/console/history" element={<ConsolePage />} />
            <Route path="/console/hosts" element={<ConsolePage />} />
          </Routes>
        </ConfigProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
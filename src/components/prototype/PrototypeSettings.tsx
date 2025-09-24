import React from 'react';
import Card from '../common/Card';
import Select from '../common/Select';
import { WordPressLogo } from '../common/Logo';
import { useConfig } from '../../contexts/ConfigContext';

const PrototypeSettings: React.FC = () => {
  const { prototypeSettings, updatePrototypeSettings } = useConfig();

  const handleSkipValidationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePrototypeSettings({ skipValidation: e.target.checked });
  };

  const handleFailPreflightsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePrototypeSettings({ failPreflights: e.target.checked });
  };

  const handleFailHostPreflightsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePrototypeSettings({ failHostPreflights: e.target.checked });
  };

  const handleFailInstallationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePrototypeSettings({ failInstallation: e.target.checked });
  };

  const handleFailRegistryAuthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePrototypeSettings({ failRegistryAuth: e.target.checked });
  };

  const handleClusterModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updatePrototypeSettings({ clusterMode: e.target.value as 'existing' | 'embedded' });
  };

  const handleConfigFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updatePrototypeSettings({ configFormat: e.target.value as 'helm-values' | 'config-values' });
  };

  const handleThemeColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePrototypeSettings({ themeColor: e.target.value });
  };

  const handleSkipNodeValidationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePrototypeSettings({ skipNodeValidation: e.target.checked });
  };

  const handleMultiNodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePrototypeSettings({ enableMultiNode: e.target.checked });
  };

  const handleSkipHostPreflightsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePrototypeSettings({ skipHostPreflights: e.target.checked });
  };

  const handleBlockOnAppPreflightsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updatePrototypeSettings({ blockOnAppPreflights: e.target.checked });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <WordPressLogo className="h-10 w-10" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Prototype Settings</h1>
                <p className="text-sm text-gray-500">Configure prototype behavior</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">General Settings</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="themeColor" className="block text-sm font-medium text-gray-700">
                    Theme Color
                  </label>
                  <input
                    type="text"
                    id="themeColor"
                    value={prototypeSettings.themeColor}
                    onChange={handleThemeColorChange}
                    placeholder="#316DE6"
                    className="w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                      '--tw-ring-color': prototypeSettings.themeColor
                    } as React.CSSProperties}
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                  <p className="text-sm text-gray-500">Enter a hex color code (e.g., #21759B)</p>
                </div>
                
                <Select
                  id="configFormat"
                  label="Configuration Output Format"
                  value={prototypeSettings.configFormat}
                  onChange={handleConfigFormatChange}
                  options={[
                    { value: 'config-values', label: 'Config Values' },
                    { value: 'helm-values', label: 'Helm Values' }
                  ]}
                  helpText="Choose between WordPress installer config format or Helm values format"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Installation Mode & Target</h2>
              <Select
                id="clusterMode"
                label="Target Environment"
                value={prototypeSettings.clusterMode}
                onChange={handleClusterModeChange}
                options={[
                  { value: 'existing', label: 'Kubernetes Cluster' },
                  { value: 'embedded', label: 'Linux Machine' }
                ]}
                helpText="Choose between installing on a Kubernetes cluster or directly on a Linux machine"
              />
              
              <div className="mt-4 space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="enableMultiNode"
                    checked={prototypeSettings.enableMultiNode}
                    onChange={handleMultiNodeChange}
                    className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                    style={{
                      accentColor: prototypeSettings.themeColor,
                      '--tw-ring-color': prototypeSettings.themeColor
                    } as React.CSSProperties}
                  />
                  <label htmlFor="enableMultiNode" className="text-sm text-gray-700">
                    Enable multi-node support for Linux installations
                  </label>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Validation & Failure Simulation</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-medium text-gray-800 mb-3">General Validation</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="skipValidation"
                        checked={prototypeSettings.skipValidation}
                        onChange={handleSkipValidationChange}
                        className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                        style={{
                          accentColor: prototypeSettings.themeColor,
                          '--tw-ring-color': prototypeSettings.themeColor
                        } as React.CSSProperties}
                      />
                      <label htmlFor="skipValidation" className="text-sm text-gray-700">
                        Skip required field validation on configuration page
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="failInstallation"
                        checked={prototypeSettings.failInstallation}
                        onChange={handleFailInstallationChange}
                        className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                        style={{
                          accentColor: prototypeSettings.themeColor,
                          '--tw-ring-color': prototypeSettings.themeColor
                        } as React.CSSProperties}
                      />
                      <label htmlFor="failInstallation" className="text-sm text-gray-700">
                        Simulate installation failure
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="failRegistryAuth"
                        checked={prototypeSettings.failRegistryAuth}
                        onChange={handleFailRegistryAuthChange}
                        className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                        style={{
                          accentColor: prototypeSettings.themeColor,
                          '--tw-ring-color': prototypeSettings.themeColor
                        } as React.CSSProperties}
                      />
                      <label htmlFor="failRegistryAuth" className="text-sm text-gray-700">
                        Force registry connection test to fail
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base font-medium text-gray-800 mb-3">Application Preflight Checks</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="failPreflights"
                        checked={prototypeSettings.failPreflights}
                        onChange={handleFailPreflightsChange}
                        className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                        style={{
                          accentColor: prototypeSettings.themeColor,
                          '--tw-ring-color': prototypeSettings.themeColor
                        } as React.CSSProperties}
                      />
                      <label htmlFor="failPreflights" className="text-sm text-gray-700">
                        Force application preflight checks to fail
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="makePreflightsStrict"
                        checked={prototypeSettings.makePreflightsStrict}
                        onChange={(e) => updatePrototypeSettings({ makePreflightsStrict: e.target.checked })}
                        disabled={!prototypeSettings.failPreflights}
                        className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          accentColor: prototypeSettings.themeColor,
                          '--tw-ring-color': prototypeSettings.themeColor
                        } as React.CSSProperties}
                      />
                      <label htmlFor="makePreflightsStrict" className={`text-sm ${!prototypeSettings.failPreflights ? 'text-gray-400' : 'text-gray-700'}`}>
                        Make one preflight check strict (mixed strict/non-strict)
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="blockOnAppPreflights"
                        checked={prototypeSettings.blockOnAppPreflights}
                        onChange={handleBlockOnAppPreflightsChange}
                        className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                        style={{
                          accentColor: prototypeSettings.themeColor,
                          '--tw-ring-color': prototypeSettings.themeColor
                        } as React.CSSProperties}
                      />
                      <label htmlFor="blockOnAppPreflights" className="text-sm text-gray-700">
                        Don't allow proceeding if app preflight checks fail
                      </label>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base font-medium text-gray-800 mb-3">Host Preflight Checks (Linux Mode)</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="failHostPreflights"
                        checked={prototypeSettings.failHostPreflights}
                        onChange={handleFailHostPreflightsChange}
                        className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                        style={{
                          accentColor: prototypeSettings.themeColor,
                          '--tw-ring-color': prototypeSettings.themeColor
                        } as React.CSSProperties}
                      />
                      <label htmlFor="failHostPreflights" className="text-sm text-gray-700">
                        Force host preflight checks to fail
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="showManyHostFailures"
                        checked={prototypeSettings.showManyHostFailures || false}
                        onChange={(e) => updatePrototypeSettings({ showManyHostFailures: e.target.checked })}
                        disabled={!prototypeSettings.failHostPreflights}
                        className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                        style={{
                          accentColor: prototypeSettings.themeColor,
                          '--tw-ring-color': prototypeSettings.themeColor
                        } as React.CSSProperties}
                      />
                      <label htmlFor="showManyHostFailures" className={`text-sm ${!prototypeSettings.failHostPreflights ? 'text-gray-400' : 'text-gray-700'}`}>
                        Show many host preflight failures (7 failures for testing)
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="skipHostPreflights"
                        checked={prototypeSettings.skipHostPreflights}
                        onChange={handleSkipHostPreflightsChange}
                        className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                        style={{
                          accentColor: prototypeSettings.themeColor,
                          '--tw-ring-color': prototypeSettings.themeColor
                        } as React.CSSProperties}
                      />
                      <label htmlFor="skipHostPreflights" className="text-sm text-gray-700">
                        Allow proceeding even if host preflight checks fail
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-
  )
}6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Configuration Display Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="enableManyConfigGroups"
                    checked={prototypeSettings.enableManyConfigGroups || false}
                    onChange={(e) => updatePrototypeSettings({ enableManyConfigGroups: e.target.checked })}
                    className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                    style={{
                      accentColor: prototypeSettings.themeColor,
                      '--tw-ring-color': prototypeSettings.themeColor
                    } as React.CSSProperties}
                  />
                  <label htmlFor="enableManyConfigGroups" className="text-sm text-gray-700">
                    Enable many configuration groups (56 groups for testing)
                  </label>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                These settings affect how configuration options are displayed in the wizard.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default PrototypeSettings;
                value={prototypeSettings.configFormat}
                onChange={handleConfigFormatChange}
                options={[
                  { value: 'config-values', label: 'Config Values' },
                  { value: 'helm-values', label: 'Helm Values' }
                ]}
                helpText="Choose between WordPress installer config format or Helm values format"
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Theme Settings</h2>
              <div className="space-y-2">
                <label htmlFor="themeColor" className="block text-sm font-medium text-gray-700">
                  Theme Color
                </label>
                <input
                  type="text"
                  id="themeColor"
                  value={prototypeSettings.themeColor}
                  onChange={handleThemeColorChange}
                  placeholder="#316DE6"
                  className="w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    '--tw-ring-color': prototypeSettings.themeColor
                  } as React.CSSProperties}
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
                <p className="text-sm text-gray-500">Enter a hex color code (e.g., #21759B)</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Linux Installation Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="enableMultiNode"
                    checked={prototypeSettings.enableMultiNode}
                    onChange={handleMultiNodeChange}
                    className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                    style={{
                      accentColor: prototypeSettings.themeColor,
                      '--tw-ring-color': prototypeSettings.themeColor
                    } as React.CSSProperties}
                  />
                  <label htmlFor="enableMultiNode" className="text-sm text-gray-700">
                    Enable multi-node support for Linux installations
                  </label>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Configuration Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="enableManyConfigGroups"
                    checked={prototypeSettings.enableManyConfigGroups || false}
                    onChange={(e) => updatePrototypeSettings({ enableManyConfigGroups: e.target.checked })}
                    className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                    style={{
                      accentColor: prototypeSettings.themeColor,
                      '--tw-ring-color': prototypeSettings.themeColor
                    } as React.CSSProperties}
                  />
                  <label htmlFor="enableManyConfigGroups" className="text-sm text-gray-700">
                    Enable many configuration groups (56 groups for testing)
                  </label>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Validation Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="skipValidation"
                    checked={prototypeSettings.skipValidation}
                    onChange={handleSkipValidationChange}
                    className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                    style={{
                      accentColor: prototypeSettings.themeColor,
                      '--tw-ring-color': prototypeSettings.themeColor
                    } as React.CSSProperties}
                  />
                  <label htmlFor="skipValidation" className="text-sm text-gray-700">
                    Skip required field validation on configuration page
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="skipHostPreflights"
                    checked={prototypeSettings.skipHostPreflights}
                    onChange={handleSkipHostPreflightsChange}
                    className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                    style={{
                      accentColor: prototypeSettings.themeColor,
                      '--tw-ring-color': prototypeSettings.themeColor
                    } as React.CSSProperties}
                  />
                  <label htmlFor="skipHostPreflights" className="text-sm text-gray-700">
                    Allow proceeding even if host preflight checks fail
                  </label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="blockOnAppPreflights"
                    checked={prototypeSettings.blockOnAppPreflights}
                    onChange={handleBlockOnAppPreflightsChange}
                    className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                    style={{
                      accentColor: prototypeSettings.themeColor,
                      '--tw-ring-color': prototypeSettings.themeColor
                    } as React.CSSProperties}
                  />
                  <label htmlFor="blockOnAppPreflights" className="text-sm text-gray-700">
                    Don't allow proceeding if app preflight checks fail
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="failPreflights"
                    checked={prototypeSettings.failPreflights}
                    onChange={handleFailPreflightsChange}
                    className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                    style={{
                      accentColor: prototypeSettings.themeColor,
                      '--tw-ring-color': prototypeSettings.themeColor
                    } as React.CSSProperties}
                  />
                  <label htmlFor="failPreflights" className="text-sm text-gray-700">
                    Force application preflight checks to fail
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="makePreflightsStrict"
                    checked={prototypeSettings.makePreflightsStrict}
                    onChange={(e) => updatePrototypeSettings({ makePreflightsStrict: e.target.checked })}
                    disabled={!prototypeSettings.failPreflights}
                    className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      accentColor: prototypeSettings.themeColor,
                      '--tw-ring-color': prototypeSettings.themeColor
                    } as React.CSSProperties}
                  />
                  <label htmlFor="makePreflightsStrict" className={`text-sm ${!prototypeSettings.failPreflights ? 'text-gray-400' : 'text-gray-700'}`}>
                    Make one preflight check strict (mixed strict/non-strict)
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="failHostPreflights"
                    checked={prototypeSettings.failHostPreflights}
                    onChange={handleFailHostPreflightsChange}
                    className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                    style={{
                      accentColor: prototypeSettings.themeColor,
                      '--tw-ring-color': prototypeSettings.themeColor
                    } as React.CSSProperties}
                  />
                  <label htmlFor="failHostPreflights" className="text-sm text-gray-700">
                    Force host preflight checks to fail
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="showManyHostFailures"
                    checked={prototypeSettings.showManyHostFailures || false}
                    onChange={(e) => updatePrototypeSettings({ showManyHostFailures: e.target.checked })}
                    disabled={!prototypeSettings.failHostPreflights}
                    className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                    style={{
                      accentColor: prototypeSettings.themeColor,
                      '--tw-ring-color': prototypeSettings.themeColor
                    } as React.CSSProperties}
                  />
                  <label htmlFor="showManyHostFailures" className={`text-sm ${!prototypeSettings.failHostPreflights ? 'text-gray-400' : 'text-gray-700'}`}>
                    Show many host preflight failures (7 failures for testing)
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="failInstallation"
                    checked={prototypeSettings.failInstallation}
                    onChange={handleFailInstallationChange}
                    className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                    style={{
                      accentColor: prototypeSettings.themeColor,
                      '--tw-ring-color': prototypeSettings.themeColor
                    } as React.CSSProperties}
                  />
                  <label htmlFor="failInstallation" className="text-sm text-gray-700">
                    Simulate installation failure
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="failRegistryAuth"
                    checked={prototypeSettings.failRegistryAuth}
                    onChange={handleFailRegistryAuthChange}
                    className="h-4 w-4 border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                    style={{
                      accentColor: prototypeSettings.themeColor,
                      '--tw-ring-color': prototypeSettings.themeColor
                    } as React.CSSProperties}
                  />
                  <label htmlFor="failRegistryAuth" className="text-sm text-gray-700">
                    Force registry connection test to fail
                  </label>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                These settings affect how the installer behaves during development and testing.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default PrototypeSettings;
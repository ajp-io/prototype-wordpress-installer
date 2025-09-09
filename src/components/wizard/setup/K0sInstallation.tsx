import React from 'react';
import { useConfig } from '../../../contexts/ConfigContext';
import NodeMetrics from './NodeMetrics';
import NodeJoinSection from './k0s/NodeJoinSection';
import { useK0sInstallation } from '../../../hooks/useK0sInstallation';
import { useJoinCommand } from '../../../hooks/useJoinCommand';

interface K0sInstallationProps {
  onComplete: (hasFailures?: boolean) => void;
}

const K0sInstallation: React.FC<K0sInstallationProps> = ({ onComplete }) => {
  const { prototypeSettings } = useConfig();
  const themeColor = prototypeSettings.themeColor;

  const {
    status,
    selectedRole,
    joinedNodes,
    nodeMetrics,
    pendingNodes,
    isMultiNode,
    useNodeRoles,
    setSelectedRole,
    handleStartNodeJoin,
    REQUIRED_NODES_WITH_ROLES
  } = useK0sInstallation(onComplete);

  const { copied, copyJoinCommand } = useJoinCommand();

  const handleCopyCommand = () => {
    copyJoinCommand(selectedRole);
  };

  return (
    <div className="space-y-6">
      {status.phase === 'ready' && isMultiNode && useNodeRoles && (
        <NodeJoinSection
          selectedRole={selectedRole}
          joinedNodes={joinedNodes}
          requiredNodes={REQUIRED_NODES_WITH_ROLES}
          onRoleChange={setSelectedRole}
          onCopyCommand={handleCopyCommand}
          onStartNodeJoin={handleStartNodeJoin}
          copied={copied}
          themeColor={themeColor}
          skipNodeValidation={prototypeSettings.skipNodeValidation}
          useNodeRoles={useNodeRoles}
        />
      )}
      
      <NodeMetrics 
        nodes={nodeMetrics} 
        pendingNodes={pendingNodes}
        isMultiNode={isMultiNode}
        useNodeRoles={useNodeRoles}
      />
    </div>
  );
};

export default K0sInstallation;
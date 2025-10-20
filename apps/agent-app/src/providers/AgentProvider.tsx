import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppConfig, getConfig } from '@icon/config';

interface AgentContextType {
  config: AppConfig;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  agent: any | null;
  setAgent: (agent: any | null) => void;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

interface AgentProviderProps {
  children: ReactNode;
}

export const AgentProvider: React.FC<AgentProviderProps> = ({ children }) => {
  const [isLoading, setLoading] = useState(false);
  const [agent, setAgent] = useState<any | null>(null);
  
  const config = getConfig();

  const value: AgentContextType = {
    config,
    isLoading,
    setLoading,
    agent,
    setAgent,
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgent = (): AgentContextType => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppConfig, getConfig } from '@icon/config';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '@icon/api';

interface AgentContextType {
  config: AppConfig;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  agent: any | null;
  setAgent: (agent: any | null) => void;
  onboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

interface AgentProviderProps {
  children: ReactNode;
}

export const AgentProvider: React.FC<AgentProviderProps> = ({ children }) => {
  const [isLoading, setLoading] = useState(false);
  const [agent, setAgent] = useState<any | null>(null);
  const [onboardingComplete, setOnboardingCompleteState] = useState<boolean>(false);
  
  const config = getConfig();

  useEffect(() => {
    const loadOnboarding = async () => {
      try {
        const val = await SecureStore.getItemAsync('agentOnboardingComplete');
        setOnboardingCompleteState(val === 'true');
      } catch {}
    };
    loadOnboarding();
  }, []);

  const setOnboardingComplete = async (complete: boolean) => {
    try {
      await SecureStore.setItemAsync('agentOnboardingComplete', complete ? 'true' : 'false');
    } catch {}
    setOnboardingCompleteState(!!complete);
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('agentAuthToken');
    } catch {}
    apiClient.clearAuthToken();
    setAgent(null);
  };

  const value: AgentContextType = {
    config,
    isLoading,
    setLoading,
    agent,
    setAgent,
    onboardingComplete,
    setOnboardingComplete,
    logout,
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
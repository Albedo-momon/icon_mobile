import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AgentProvider } from './src/providers/AgentProvider';
import { AgentNavigator } from './src/navigation/AgentNavigator';
import * as SecureStore from 'expo-secure-store';
import { enableScreens } from 'react-native-screens';
import { apiClient } from '@icon/api';

// OAuth completion removed; Google sign-in not used in agent-app

// Disable react-native-screens at app startup to match user-app behavior
enableScreens(false);

// Restore auth token and apply it to the API client
const restoreAuthToken = async () => {
  try {
    const token = await SecureStore.getItemAsync('agentAuthToken');
    if (token) {
      apiClient.setAuthToken(token);
    }
  } catch (e) {
    console.warn('Failed to restore auth token:', e);
  }
};

export default function App() {
  useEffect(() => {
    restoreAuthToken();
  }, []);

  return (
    <AgentProvider>
      <NavigationContainer>
        <AgentNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AgentProvider>
  );
}

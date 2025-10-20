import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AgentStackParamList } from '@icon/config';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import RequestsScreen from '../screens/RequestsScreen';
import ServiceFlowScreen from '../screens/ServiceFlowScreen';
import TimelineScreen from '../screens/TimelineScreen';
import RequestDetailScreen from '../screens/RequestDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator<AgentStackParamList>();

export const AgentNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: '#FAF8F2',
        },
        headerTintColor: '#2E2E2E',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ title: 'Agent Dashboard' }}
      />

      <Stack.Screen 
        name="Requests" 
        component={RequestsScreen} 
        options={{ title: 'Agent Requests' }}
      />
      <Stack.Screen 
        name="RequestDetail" 
        component={RequestDetailScreen} 
        options={{ title: 'Request Details' }}
      />
      <Stack.Screen 
        name="ServiceFlow" 
        component={ServiceFlowScreen} 
        options={{ title: 'Service Flow' }}
      />
      <Stack.Screen 
        name="Timeline" 
        component={TimelineScreen} 
        options={{ title: 'Timeline' }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
    </Stack.Navigator>
  );
};
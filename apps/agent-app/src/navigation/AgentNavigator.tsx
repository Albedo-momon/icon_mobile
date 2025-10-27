import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AgentStackParamList } from '@icon/config';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import RequestsScreen from '../screens/RequestsScreen';
import ServiceFlowScreen from '../screens/ServiceFlowScreen';
import TimelineScreen from '../screens/TimelineScreen';
import RequestDetailScreen from '../screens/RequestDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import OnboardingInfoScreen from '../screens/OnboardingInfoScreen';
import OnboardingSkillsScreen from '../screens/OnboardingSkillsScreen';
import OnboardingPhotoScreen from '../screens/OnboardingPhotoScreen';

const Stack = createStackNavigator<AgentStackParamList>();

export const AgentNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
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
        name="Login" 
        component={LoginScreen} 
        options={{ title: 'Login' }}
      />
      <Stack.Screen 
        name="OnboardingInfo" 
        component={OnboardingInfoScreen} 
        options={{ title: 'Onboarding: Info' }}
      />
      <Stack.Screen 
        name="OnboardingSkills" 
        component={OnboardingSkillsScreen} 
        options={{ title: 'Onboarding: Skills' }}
      />
      <Stack.Screen 
        name="OnboardingPhoto" 
        component={OnboardingPhotoScreen} 
        options={{ title: 'Onboarding: Photo' }}
      />
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
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
        options={{ title: 'Notifications' }}
      />
    </Stack.Navigator>
  );
};
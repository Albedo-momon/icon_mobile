import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Alert, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { StackNavigationProp } from '@react-navigation/stack';
import { AgentStackParamList, LoginForm, User as AppUser } from '@icon/config';
import { Screen, Text, Button } from '@icon/ui';
import { useAgent } from '../providers/AgentProvider';
import { api, apiClient } from '@icon/api';

type LoginNav = StackNavigationProp<AgentStackParamList, 'Login'>;

interface Props {
  navigation: LoginNav;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { setLoading, setAgent, onboardingComplete, setOnboardingComplete } = useAgent();
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
  });
  const [bgUri, setBgUri] = useState<string | null>(null);

  useEffect(() => {
    // Use external API image (Unsplash) for background photo
    const unsplash = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&h=900&q=80';
    setBgUri(unsplash);
  }, []);

  // API-based auth: admin registers agent, agent logs in with provided credentials

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Clerk effect removed; API auth handled in handleLogin

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const res = await api.auth.login({ email: form.email, password: form.password });
      if (!res.success || !res.data?.token || !res.data?.user) {
        Alert.alert('Error', res.error || 'Invalid email or password');
        return;
      }

      // Persist token and set it on the API client
      const token = res.data.token;
      apiClient.setAuthToken(token);
      try { await SecureStore.setItemAsync('agentAuthToken', token); } catch {}

      // Fetch current agent profile (if available)
      try {
        const agentRes = await api.agent.getCurrentAgent();
        if (agentRes.success && agentRes.data) {
          setAgent(agentRes.data);
        } else {
          // Fallback: shape agent from user
          const u = res.data.user as AppUser;
          setAgent({ id: u.id, userId: u.id, user: u });
        }
      } catch {
        const u = res.data.user as AppUser;
        setAgent({ id: u.id, userId: u.id, user: u });
      }

      // Determine onboarding flow based on whether this is a new email
      let prevEmail: string | null = null;
      try { prevEmail = await SecureStore.getItemAsync('lastAgentEmail'); } catch {}
      const isNewEmail = !prevEmail || prevEmail !== form.email;
      if (isNewEmail) {
        try { await setOnboardingComplete(false); } catch {}
      }
      try { await SecureStore.setItemAsync('lastAgentEmail', form.email); } catch {}

      const nextRoute = isNewEmail ? 'OnboardingInfo' : (onboardingComplete ? 'Dashboard' : 'OnboardingInfo');
      Alert.alert('Success', 'Login successful!', [
        { text: 'OK', onPress: () => navigation.replace(nextRoute) }
      ]);
    } catch (error: any) {
      const msg = error?.errors?.[0]?.message || error?.message || 'Network error occurred';
      Alert.alert('Error', msg);
      console.error('Agent Login Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth removed for agent-app

  return (
    <ImageBackground source={bgUri ? { uri: bgUri } : undefined} style={styles.bg} resizeMode="cover">
      <Screen style={styles.container} backgroundColor="transparent" scrollable showScrollIndicator>
        
        <KeyboardAvoidingView
          style={styles.centerWrap}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
        >
          <View style={styles.header}>
            <Text variant="h2" style={[styles.title, styles.headerText]}>Agent Login</Text>
            <Text variant="body" style={[styles.subtitle, styles.headerText]}>Sign in to manage requests</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text variant="body" style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={(value: string) => handleInputChange('email', value)}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="body" style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={form.password}
                onChangeText={(value: string) => handleInputChange('password', value)}
                placeholder="Enter your password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Button title="Login" onPress={handleLogin} variant="primary" size="large" style={styles.loginButton} />
          </View>
        </KeyboardAvoidingView>
      </Screen>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  centerWrap: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 120,
  },
  header: {
    marginBottom: 14,
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#eee',
    textAlign: 'center',
  },
  headerText: {
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E3E6EE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    color: '#000',
    // 3D shadow
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  loginButton: {
    marginTop: 6,
    marginBottom: 12,
  },
  contentCenter: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  // Google sign-in styles removed
});

export default LoginScreen;
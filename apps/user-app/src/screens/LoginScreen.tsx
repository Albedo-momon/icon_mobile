import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, Alert, TouchableOpacity, Image } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, LoginForm, User as AppUser } from '@icon/config';
import { Screen, Text, Button } from '@icon/ui';
import { useApp } from '../providers/AppProvider';
import { useAuth, useUser, useSignIn, useOAuth, useClerk } from '@clerk/clerk-expo';
// Using official Google "G" logo via remote asset URL per brand guidelines

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { setLoading, setUser } = useApp();
  const [form, setForm] = useState<LoginForm>({
    email: '',
    password: '',
  });

  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { isSignedIn, signOut } = useAuth();
  const { setActive } = useClerk();
  const { user } = useUser();
  const googleOAuth = useOAuth({ strategy: 'oauth_google' });

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (isSignedIn && user) {
      const appUser: AppUser = {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || 'User',
        role: 'CUSTOMER',
        createdAt: user.createdAt?.toISOString?.() || new Date().toISOString(),
        updatedAt: user.updatedAt?.toISOString?.() || new Date().toISOString(),
      };
      setUser(appUser);
    }
  }, [isSignedIn, user, setUser]);

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      if (!signInLoaded) {
        throw new Error('SignIn not loaded');
      }
      const result = await signIn.create({ identifier: form.email, password: form.password });
      if (result?.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        const hasMobile = !!(user as any)?.phoneNumbers?.length;
        if (!hasMobile) {
          Alert.alert('Add Mobile Number', 'Please add your mobile number to continue.', [
            { text: 'OK', onPress: () => navigation.navigate('AddMobile') }
          ]);
        } else {
          Alert.alert('Success', 'Login successful!', [
            { text: 'OK', onPress: () => navigation.navigate('Home') }
          ]);
        }
      } else {
        Alert.alert('Error', 'Login failed');
      }
    } catch (error: any) {
      const msg = error?.errors?.[0]?.message || error?.message || 'Network error occurred';
      Alert.alert('Error', msg);
      console.error('Login Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      // If a session already exists, avoid starting a new OAuth flow
      if (isSignedIn) {
        setLoading(false);
        Alert.alert(
          'Already Signed In',
          'You already have an active session. To sign in with a different Google account, please log out first.',
          [
            { text: 'Go to Home', onPress: () => navigation.navigate('Home') },
            {
              text: 'Logout',
              style: 'destructive',
              onPress: async () => {
                try {
                  await signOut();
                  navigation.replace('Login');
                } catch (e) {
                  console.error('SignOut Error:', e);
                }
              },
            },
          ]
        );
        return;
      }
      const { startOAuthFlow } = googleOAuth;
      const { createdSessionId, setActive: setActiveOAuth } = await startOAuthFlow();
      if (createdSessionId) {
        if (setActiveOAuth) {
          await setActiveOAuth({ session: createdSessionId });
        }
        const hasMobile = !!(user as any)?.phoneNumbers?.length;
        if (!hasMobile) {
          navigation.replace('AddMobile');
        } else {
          Alert.alert('Success', 'Login successful!', [
            { text: 'OK', onPress: () => navigation.navigate('Home') }
          ]);
        }
      } else {
        Alert.alert('Error', 'Google sign-in failed');
      }
    } catch (error: any) {
      const msg = error?.errors?.[0]?.message || error?.message || 'Google sign-in error';
      Alert.alert('Error', msg);
      console.error('Google Sign-in Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPress = () => {
    navigation.navigate('Register');
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text variant="h2" style={styles.title}>
          Login to Your Account
        </Text>
        <Text variant="body" style={styles.subtitle}>
          Access your Icon Computer account
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text variant="body" style={styles.label}>
            Email
          </Text>
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
          <Text variant="body" style={styles.label}>
            Password
          </Text>
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

        <Button
          title="Login"
          onPress={handleLogin}
          variant="primary"
          size="large"
          style={styles.loginButton}
        />

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
          accessibilityLabel="Sign in with Google"
        >
          <Image
            source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
            style={styles.googleIcon}
            accessible
            accessibilityIgnoresInvertColors
          />
          <Text variant="body" style={styles.googleText}>Sign in with Google</Text>
        </TouchableOpacity>

        <View style={styles.registerSection}>
          <Text variant="body" style={styles.registerText}>
            Don't have an account?
          </Text>
          <Button
            title="Register Here"
            onPress={handleRegisterPress}
            variant="ghost"
            size="medium"
          />
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#EEF3FB',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e6e9ef',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  loginButton: {
    marginTop: 20,
    marginBottom: 5,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dadce0',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    marginTop: 20,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  googleIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    resizeMode: 'contain',
  },
  googleText: {
    color: '#3c4043',
    fontWeight: '600',
  },
  registerSection: {
    alignItems: 'center',
  },
  registerText: {
    marginBottom: 10,
    color: '#666',
  },
});

export default LoginScreen;
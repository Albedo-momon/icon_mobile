import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, RegisterForm } from '@icon/config';
import { Screen, Text, Button } from '@icon/ui';
import { useApp } from '../providers/AppProvider';
import { useSignUp, useOAuth, useAuth, useUser, useClerk } from '@clerk/clerk-expo';
// Using official Google "G" logo via remote asset URL per brand guidelines

type RegisterScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { setLoading, setUser } = useApp();
  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyVisible, setVerifyVisible] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const { signOut } = useAuth();
  const googleOAuth = useOAuth({ strategy: 'oauth_google' });
  const { setActive } = useClerk();

  const handleInputChange = (field: keyof RegisterForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (form.password !== form.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (form.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      if (!signUpLoaded) {
        throw new Error('SignUp not loaded');
      }
      const nameParts = form.name.trim().split(' ').filter(Boolean);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ');
      const createResult: any = await signUp.create({ emailAddress: form.email, password: form.password, firstName, lastName });

      // If Clerk allows immediate completion, activate session and continue
      if (createResult?.status === 'complete' && createResult?.createdSessionId) {
        if (setActive) {
          await setActive({ session: createResult.createdSessionId });
        }
        setLoading(false);
        navigation.replace('AddMobile');
        return;
      }

      // Otherwise prepare email verification and show code input
      try {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        Alert.alert('Verify Email', 'We sent a verification code to your email. Enter it below to complete registration.');
        setVerifyVisible(true);
      } catch (prepErr: any) {
        const prepMsg = prepErr?.errors?.[0]?.message || prepErr?.message || 'Failed to start email verification';
        Alert.alert('Verification Setup Error', prepMsg);
      }
    } catch (error: any) {
      const msg = error?.errors?.[0]?.message || error?.message || 'Registration failed';
      Alert.alert('Error', msg);
      console.error('Register Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!signUpLoaded || !signUp) {
      Alert.alert('Error', 'SignUp not loaded');
      return;
    }
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the email verification code');
      return;
    }
    try {
      setVerifying(true);
      const result: any = await signUp.attemptEmailAddressVerification({ code: verificationCode.trim() });
      if (result?.status === 'complete' && result?.createdSessionId) {
        if (setActive) {
          await setActive({ session: result.createdSessionId });
        }
        setVerifyVisible(false);
        navigation.replace('AddMobile');
      } else {
        Alert.alert('Verification Error', 'Could not complete registration. Please check the code and try again.');
      }
    } catch (error: any) {
      const msg = error?.errors?.[0]?.message || error?.message || 'Verification failed';
      Alert.alert('Error', msg);
      console.error('Email Verification Error:', error);
    } finally {
      setVerifying(false);
    }
  };

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  const { user: clerkUser } = useUser();

  const handleGoogleRegister = async () => {
    try {
      setLoading(true);
      const { startOAuthFlow } = googleOAuth;
      const { createdSessionId, setActive: setActiveOAuth } = await startOAuthFlow();
      if (createdSessionId) {
        if (setActiveOAuth) {
          await setActiveOAuth({ session: createdSessionId });
        }
        // Ensure app session user exists so AddMobile doesn't bounce to Login
        if (clerkUser) {
          const appUser = {
            id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress || '',
            name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || clerkUser.username || 'User',
            role: 'CUSTOMER',
            createdAt: clerkUser.createdAt?.toISOString?.() || new Date().toISOString(),
            updatedAt: clerkUser.updatedAt?.toISOString?.() || new Date().toISOString(),
          };
          setUser(appUser as any);
        }
        // Go directly to mobile number entry, then Home
        navigation.replace('AddMobile');
      } else {
        Alert.alert('Error', 'Google sign-up failed');
      }
    } catch (error: any) {
      const msg = error?.errors?.[0]?.message || error?.message || 'Google sign-up error';
      Alert.alert('Error', msg);
      console.error('Google Sign-up Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text variant="h2" style={styles.title}>
              Create Your Account
            </Text>
            <Text variant="body" style={styles.subtitle}>
              Join Icon Computer today
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text variant="body" style={styles.label}>
                Full Name
              </Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(value: string) => handleInputChange('name', value)}
                placeholder="Enter your full name"
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

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
                returnKeyType="next"
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
                returnKeyType="next"
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text variant="body" style={styles.label}>
                Confirm Password
              </Text>
              <TextInput
                style={styles.input}
                value={form.confirmPassword}
                onChangeText={(value: string) => handleInputChange('confirmPassword', value)}
                placeholder="Confirm your password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
              />
            </View>

            <Button
              title="Register"
              onPress={handleRegister}
              variant="primary"
              size="large"
              style={styles.registerButton}
            />

            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleRegister}
              accessibilityLabel="Sign up with Google"
            >
              <Image
                source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                style={styles.googleIcon}
                accessible
                accessibilityIgnoresInvertColors
              />
              <Text variant="body" style={styles.googleText}>Sign up with Google</Text>
            </TouchableOpacity>

            <View style={styles.loginSection}>
              <Text variant="body" style={styles.loginText}>
                Already have an account?
              </Text>
              <Button
                title="Login Here"
                onPress={handleLoginPress}
                variant="ghost"
                size="medium"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {/* Verification Modal */}
      <Modal
        visible={verifyVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setVerifyVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text variant="h3" style={styles.modalTitle}>Email Verification</Text>
            <Text variant="body" style={styles.modalSubtitle}>
              Enter the code sent to {form.email}
            </Text>
            <TextInput
              style={styles.input}
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="Verification code"
              keyboardType="number-pad"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />
            <View style={styles.modalActions}>
              <Button
                title={verifying ? 'Verifying…' : 'Verify'}
                onPress={handleVerifyEmail}
                variant="primary"
                size="large"
                style={styles.modalActionButton}
                disabled={verifying}
              />
              <Button
                title="Cancel"
                onPress={() => setVerifyVisible(false)}
                variant="ghost"
                size="medium"
                style={styles.modalActionButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#EEF3FB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
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
  registerButton: {
    marginTop: 20,
    marginBottom: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  modalActionButton: {
    flex: 1,
    marginHorizontal: 6,
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
  loginSection: {
    alignItems: 'center',
  },
  loginText: {
    marginBottom: 10,
    color: '#666',
  },
});

export default RegisterScreen;
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TextInput, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@icon/config';
import { Screen, Text, Button } from '@icon/ui';
import { useApp } from '../providers/AppProvider';
import { useUser } from '@clerk/clerk-expo';

type AddMobileNavigationProp = StackNavigationProp<RootStackParamList, 'AddMobile'>;

interface Props {
  navigation: AddMobileNavigationProp;
}

const AddMobileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, setUser } = useApp();
  const { user: clerkUser, isSignedIn } = useUser();
  const [mobile, setMobile] = useState('');

  useEffect(() => {
    // If app user is missing but Clerk session exists, hydrate app user from Clerk
    if (!user && isSignedIn && clerkUser) {
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

    // If after hydration user still missing, require login
    if (!user && !isSignedIn) {
      navigation.replace('Login');
      return;
    }

    // Pre-fill if any existing value
    const existing = (user as any)?.mobile || '';
    setMobile(existing);
  }, [user, isSignedIn, clerkUser, navigation, setUser]);

  const validateMobile = (value: string) => {
    // Basic validation: allow +country code and 8-15 digits
    const cleaned = value.trim();
    const regex = /^\+?[0-9]{8,15}$/;
    return regex.test(cleaned);
  };

  const handleContinue = () => {
    if (!validateMobile(mobile)) {
      Alert.alert('Invalid Number', 'Please enter a valid mobile number.');
      return;
    }
    // Persist to session user (API integration can replace this later)
    setUser({ ...(user as any), mobile: mobile.trim() });
    Alert.alert('Saved', 'Mobile number added successfully.', [
      { text: 'OK', onPress: () => navigation.replace('Home') },
    ]);
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text variant="h2" style={styles.title}>Add Mobile Number</Text>
        <Text variant="caption" style={styles.subtitle}>Your mobile number is required to continue</Text>
      </View>

      <View style={styles.form}>
        <Text variant="body" style={styles.label}>Mobile Number</Text>
        <TextInput
          style={styles.input}
          value={mobile}
          onChangeText={setMobile}
          placeholder="e.g. +919876543210"
          keyboardType="phone-pad"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Button
          title="Continue"
          onPress={handleContinue}
          variant="primary"
          size="large"
          style={styles.continueButton}
        />
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
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
  },
  form: {
    flex: 1,
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
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  continueButton: {
    marginTop: 8,
  },
});

export default AddMobileScreen;
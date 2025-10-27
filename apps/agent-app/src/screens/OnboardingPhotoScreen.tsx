import React, { useState } from 'react';
import { View, StyleSheet, Alert, Image, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AgentStackParamList } from '@icon/config';
import { Screen, Text, Button } from '@icon/ui';
import * as ImagePicker from 'expo-image-picker';
import { useAgent } from '../providers/AgentProvider';
import { Ionicons } from '@expo/vector-icons';

type OnboardingPhotoNav = StackNavigationProp<AgentStackParamList, 'OnboardingPhoto'>;
type OnboardingPhotoRoute = RouteProp<AgentStackParamList, 'OnboardingPhoto'>;

interface Props {
  navigation: OnboardingPhotoNav;
  route: OnboardingPhotoRoute;
}

const OnboardingPhotoScreen: React.FC<Props> = ({ navigation, route }) => {
  const { fullName, experienceYears, age, mobile, skills } = route.params;
  const { setAgent, setOnboardingComplete } = useAgent();
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow photo library access to set profile photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const completeOnboarding = async () => {
    if (!photoUri) {
      Alert.alert('Profile Photo Required', 'Please select a profile photo to finish onboarding.');
      return;
    }
    // Optionally: upload photo and details to backend here.
    // For now, update local agent context and mark onboarding complete.
    setAgent((prev: any) => {
      const user = { ...(prev?.user || {}), name: fullName, email: prev?.user?.email, mobile };
      return { ...(prev || {}), user, experienceYears, age, skills, avatarUri: photoUri || (prev as any)?.avatarUri };
    });

    await setOnboardingComplete(true);
    Alert.alert('Welcome', 'Onboarding complete!');
    navigation.replace('Dashboard');
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text variant="h2" style={styles.title}>Agent Onboarding</Text>
        <Text variant="body" style={styles.subtitle}>Step 3 of 3: Profile Photo</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatarWrapper}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarImage} />
              ) : (
                <Text variant="h3" style={styles.avatarText}>{(fullName || 'A').charAt(0).toUpperCase()}</Text>
              )}
            </View>
            <TouchableOpacity onPress={pickPhoto} style={styles.avatarAddButton} accessibilityLabel="Pick Profile Photo">
              <Ionicons name="add" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.summary}>
          <Text variant="body">Name: {fullName}</Text>
          <Text variant="body">Experience: {experienceYears} years</Text>
          <Text variant="body">Age: {age}</Text>
          <Text variant="body">Mobile: {mobile}</Text>
          <Text variant="body">Skills: {skills && skills.length ? skills.join(', ') : 'None'}</Text>
        </View>

        <Button title="Finish" onPress={completeOnboarding} variant="primary" size="large" style={styles.finishButton} disabled={!photoUri} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  title: {
    textAlign: 'left',
    marginBottom: 6,
    color: '#333',
  },
  subtitle: {
    color: '#666',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarRing: {
    padding: 6,
    borderRadius: 50,
    backgroundColor: '#eee',
    position: 'relative',
  },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  avatarImage: {
    width: 86,
    height: 86,
    borderRadius: 43,
  },
  avatarAddButton: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  summary: {
    gap: 6,
    marginTop: 10,
    marginBottom: 16,
  },
  finishButton: {
    width: '100%',
  },
});

export default OnboardingPhotoScreen;
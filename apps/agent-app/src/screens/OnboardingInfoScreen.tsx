import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AgentStackParamList } from '@icon/config';
import { Screen, Text, Button } from '@icon/ui';

type OnboardingInfoNav = StackNavigationProp<AgentStackParamList, 'OnboardingInfo'>;

interface Props {
  navigation: OnboardingInfoNav;
}

const OnboardingInfoScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [experienceYears, setExperienceYears] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [mobile, setMobile] = useState('');
  // Step 1 collects only basic info; skills are moved to step 2

  const validateAndNext = () => {
    const expStr = experienceYears.trim();
    const ageStr = age.trim();
    const exp = Number(expStr);
    const a = Number(ageStr);

    if (!fullName.trim() || !mobile.trim() || !expStr || !ageStr) {
      Alert.alert('Validation', 'All fields are required: full name, experience, age, and mobile');
      return;
    }
    if (!/^\d+$/.test(expStr)) {
      Alert.alert('Validation', 'Experience should be a whole number of years');
      return;
    }
    if (!/^\d+$/.test(ageStr)) {
      Alert.alert('Validation', 'Age should be a whole number');
      return;
    }
    if (isNaN(exp) || exp < 0 || exp > 80) {
      Alert.alert('Validation', 'Experience should be between 0 and 80 years');
      return;
    }
    if (isNaN(a) || a < 16 || a > 90) {
      Alert.alert('Validation', 'Age should be between 16 and 90');
      return;
    }
    navigation.navigate('OnboardingSkills', {
      fullName: fullName.trim(),
      experienceYears: exp,
      age: a,
      mobile: mobile.trim(),
    });
  };

  const expNum = Number(experienceYears);
  const ageNum = Number(age);
  const expStr = experienceYears.trim();
  const ageStr = age.trim();
  const numbersValid = /^\d+$/.test(expStr) && /^\d+$/.test(ageStr);
  const isFormValid =
    fullName.trim().length > 0 &&
    mobile.trim().length > 0 &&
    expStr.length > 0 &&
    ageStr.length > 0 &&
    numbersValid &&
    !isNaN(expNum) && expNum >= 0 && expNum <= 80 &&
    !isNaN(ageNum) && ageNum >= 16 && ageNum <= 90;

  return (
    <Screen style={styles.container}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={styles.contentWrap}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator
          >
            <View style={styles.header}>
              <Text variant="h2" style={styles.title}>Agent Onboarding</Text>
              <Text variant="body" style={styles.subtitle}>Step 1 of 3: Basic Details</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text variant="body" style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text variant="body" style={styles.label}>Experience (years)</Text>
                <TextInput
                  style={styles.input}
                  value={experienceYears}
                  onChangeText={setExperienceYears}
                  placeholder="e.g. 3"
                  keyboardType="numeric"
                  returnKeyType="next"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text variant="body" style={styles.label}>Age</Text>
                <TextInput
                  style={styles.input}
                  value={age}
                  onChangeText={setAge}
                  placeholder="e.g. 28"
                  keyboardType="numeric"
                  returnKeyType="next"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text variant="body" style={styles.label}>Mobile Number</Text>
                <TextInput
                  style={styles.input}
                  value={mobile}
                  onChangeText={setMobile}
                  placeholder="Enter your mobile number"
                  keyboardType="phone-pad"
                  returnKeyType="done"
                />
              </View>

              {/* Move Next button here (was bottom-fixed) */}
              <View style={styles.buttonContainer}>
                <Button
                  title="Next"
                  onPress={validateAndNext}
                  variant="primary"
                  size="small"
                  disabled={!isFormValid}
                  style={styles.nextButton}
                />
              </View>

              {/* Skills moved to OnboardingSkillsScreen (step 2) */}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF3FB',
  },
  kav: {
    flex: 1,
  },
  contentWrap: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 24,
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
  form: {
    padding: 20,
    gap: 12,
  },
  inputGroup: {
    marginBottom: 2,
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
    // 3D shadow
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  nextButton: {
    width: '50%',
    alignSelf: 'center',
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  buttonContainer: {
    marginTop: 20,
   
  },
  skillChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    color: '#333',
    marginRight: 8,
    marginBottom: 8,
  },
  skillChipSelected: {
    backgroundColor: '#007AFF',
    color: '#fff',
  },
  manualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  manualInput: {
    flex: 1,
    marginRight: 8,
  },
  selectedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  selectedTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#e6f0ff',
    color: '#0056b3',
    marginRight: 6,
    marginBottom: 6,
  },
});

export default OnboardingInfoScreen;
import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AgentStackParamList } from '@icon/config';
import { Screen, Text, Button } from '@icon/ui';

type OnboardingSkillsNav = StackNavigationProp<AgentStackParamList, 'OnboardingSkills'>;
type OnboardingSkillsRoute = RouteProp<AgentStackParamList, 'OnboardingSkills'>;

interface Props {
  navigation: OnboardingSkillsNav;
  route: OnboardingSkillsRoute;
}

const OnboardingSkillsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { fullName, experienceYears, age, mobile } = route.params;
  const skillExamples = ['Laptop Repair', 'Hardware Replacement', 'Software Troubleshooting', 'Network Setup', 'OS Installation', 'Data Recovery'];
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [manualSkill, setManualSkill] = useState<string>('');
  const [showOtherInput, setShowOtherInput] = useState<boolean>(false);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  };

  const addManualSkill = () => {
    const s = manualSkill.trim();
    if (!s) return;
    setSelectedSkills(prev => prev.includes(s) ? prev : [...prev, s]);
    setManualSkill('');
  };

  const validateAndNext = () => {
    if (selectedSkills.length === 0) {
      Alert.alert('Validation', 'Please select at least one skill');
      return;
    }
    navigation.navigate('OnboardingPhoto', {
      fullName,
      experienceYears,
      age,
      mobile,
      skills: selectedSkills,
    });
  };

  const isFormValid = selectedSkills.length > 0;

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
              <Text variant="body" style={styles.subtitle}>Step 2 of 3: Skills</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text variant="body" style={styles.label}>Tap to select your skills</Text>
                <View style={styles.skillsRow}>
                  {skillExamples.map((skill) => (
                    <Text
                      key={skill}
                      variant="body"
                      style={[styles.skillChip, selectedSkills.includes(skill) && styles.skillChipSelected]}
                      onPress={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Text>
                  ))}
                  <Text
                    key="Other"
                    variant="body"
                    style={[styles.skillChip, showOtherInput && styles.skillChipSelected]}
                    onPress={() => setShowOtherInput(prev => !prev)}
                  >
                    Other
                  </Text>
                </View>
                {showOtherInput && (
                  <View style={styles.manualRow}>
                    <TextInput
                      style={[styles.input, styles.manualInput]}
                      value={manualSkill}
                      onChangeText={setManualSkill}
                      placeholder="Add a skill"
                      returnKeyType="done"
                      onSubmitEditing={addManualSkill}
                    />
                    <Button title="Add" onPress={addManualSkill} variant="secondary" size="medium" />
                  </View>
                )}
                {selectedSkills.length > 0 && (
                  <View style={styles.selectedRow}>
                    {selectedSkills.map(s => (
                      <Text key={s} variant="caption" style={styles.selectedTag}>{s}</Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button title="Next" onPress={validateAndNext} variant="primary" size="small" disabled={!isFormValid} style={styles.nextButton} />
          </View>
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
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  footer: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderTopColor: '#eee',
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

export default OnboardingSkillsScreen;
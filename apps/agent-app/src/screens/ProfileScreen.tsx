import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AgentStackParamList } from '@icon/config';
import { Screen, Text, Button } from '@icon/ui';
import { Ionicons } from '@expo/vector-icons';
import { useAgent } from '../providers/AgentProvider';
import TopBar from '../components/TopBar';
import StatCard from '../components/StatCard';
import BottomNavBar from '../components/BottomNavBar';
import { CARD_COLORS } from '../components/theme';

export type ProfileNav = StackNavigationProp<AgentStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileNav;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { agent, config, setAgent, logout, onboardingComplete, setOnboardingComplete } = useAgent();
  // Helper utils for display
  const formatDate = (d?: string) => {
    if (!d) return '—';
    try {
      return new Date(d).toLocaleString();
    } catch {
      return d as string;
    }
  };
  const ratingDisplay = typeof (agent as any)?.ratingAvg === 'number'
    ? (agent as any).ratingAvg.toFixed(2)
    : ((agent as any)?.ratingAvg ?? '—');
  const ratingNum = (() => {
    const raw = (agent as any)?.ratingAvg;
    if (typeof raw === 'number') return raw;
    const parsed = Number(raw);
    return isNaN(parsed) ? 0 : parsed;
  })();
  const tags: string[] = Array.isArray((agent as any)?.serviceTags)
    ? (agent as any).serviceTags
    : [];

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(agent?.user?.name || '');
  // Inline editable fields
  const [mobile, setMobile] = useState<string>((agent as any)?.user?.mobile || (agent as any)?.phone || '');
  const [experience, setExperience] = useState<string>(
    typeof (agent as any)?.experienceYears === 'number' ? String((agent as any)?.experienceYears) : ''
  );
  const [age, setAge] = useState<string>(
    typeof (agent as any)?.age === 'number' ? String((agent as any)?.age) : ''
  );
  const [skillsInput, setSkillsInput] = useState<string>(Array.isArray((agent as any)?.skills) ? (agent as any)?.skills.join(', ') : '');
  // Password state and visibility controls
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    setName(agent?.user?.name || '');
    const mob = (agent as any)?.user?.mobile || (agent as any)?.phone || '';
    setMobile(mob);
    const expRaw = (agent as any)?.experienceYears;
    setExperience(typeof expRaw === 'number' ? String(expRaw) : (expRaw ? String(expRaw) : ''));
    const ageRaw = (agent as any)?.age;
    setAge(typeof ageRaw === 'number' ? String(ageRaw) : (ageRaw ? String(ageRaw) : ''));
    const skillsArrLocal: string[] = Array.isArray((agent as any)?.skills) ? (agent as any).skills : [];
    setSkillsInput(skillsArrLocal.length ? skillsArrLocal.join(', ') : '');
  }, [agent]);

  const opStatusRaw = (agent as any)?.operationalStatus;
  const opDisplay = !opStatusRaw ? '—' : typeof opStatusRaw === 'string'
    ? (opStatusRaw.toLowerCase().includes('busy') ? 'Busy' : (opStatusRaw.toLowerCase().includes('free') ? 'Free' : String(opStatusRaw)))
    : (opStatusRaw ? 'Busy' : 'Free');

  const requestsList: any[] = Array.isArray((agent as any)?.requests) ? (agent as any).requests : [];
  const hasAccepted = requestsList.some((r: any) => String(r?.status || '').toUpperCase() === 'ACCEPTED');
  const pendingOrders = typeof (agent as any)?.pendingOrders === 'number' ? (agent as any).pendingOrders : 0;
  const isBusy = hasAccepted || (typeof opStatusRaw === 'string' ? opStatusRaw.toLowerCase().includes('busy') : pendingOrders > 0);
// Add avatar photo URI derived from agent fields
const profilePhotoUri = (agent as any)?.photoUrl || (agent as any)?.imageUrl || (agent as any)?.avatarUrl || (agent as any)?.user?.avatarUrl || null;

  const email = (agent as any)?.email || (agent as any)?.user?.email || '—';
  const mobileNumber = (agent as any)?.user?.mobile || (agent as any)?.phone || '—';
  const completedOrders = typeof (agent as any)?.completedOrders === 'number' ? (agent as any).completedOrders : 0;
  const level = Math.max(1, Math.floor(completedOrders / 50) + 1);
  const rank = Math.max(1, 5000 - completedOrders * 10);

  // Onboarding fields
  const expVal = (agent as any)?.experienceYears;
  const experienceDisplay = typeof expVal === 'number' ? `${expVal}` : (expVal != null ? String(expVal) : '—');
  const ageVal = (agent as any)?.age;
  const ageDisplay = typeof ageVal === 'number' ? `${ageVal}` : (ageVal != null ? String(ageVal) : '—');
  const skillsArr: string[] = Array.isArray((agent as any)?.skills) ? (agent as any).skills : [];
  const hasOnboardingData = !!(skillsArr.length > 0 && typeof expVal === 'number' && typeof ageVal === 'number' && mobileNumber !== '—');
  const onboardingStatus = onboardingComplete && hasOnboardingData ? 'Done' : 'Pending';

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert('Logout', 'You have been logged out.', [
        { text: 'OK', onPress: () => navigation.replace('Login') }
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleSave = () => {
    // Persist edited fields into agent context
    const trimmedName = name.trim();
    const mobileTrimmed = (mobile || '').trim();
    const expNum = parseInt((experience || '').trim(), 10);
    const ageNum = parseInt((age || '').trim(), 10);
    const skillsList = (skillsInput || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const updatedAgent: any = {
      ...(agent || {}),
      name: trimmedName || (agent as any)?.name,
      phone: mobileTrimmed || (agent as any)?.phone,
      age: !isNaN(ageNum) ? ageNum : (agent as any)?.age,
      experienceYears: !isNaN(expNum) ? expNum : (agent as any)?.experienceYears,
      skills: skillsList.length ? skillsList : ((agent as any)?.skills || []),
      user: {
        ...((agent as any)?.user || {}),
        name: trimmedName || (agent as any)?.user?.name,
        mobile: mobileTrimmed || (agent as any)?.user?.mobile,
      },
    };
    setAgent(updatedAgent);

    // Optional password update if user provided a new password inline
    if (newPassword) {
      if (newPassword.length < 6) {
        Alert.alert('Validation', 'Password must be at least 6 characters');
        return;
      }
      setPassword(newPassword);
      setNewPassword('');
      setShowNewPassword(false);
    }

    setEditing(false);
    Alert.alert('Profile', 'Your changes have been saved');
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.topBar}>
        <TopBar
          onBackPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Dashboard'))}
          showProfile={false}
          textColor="#333"
          // hide back button per request
          showBack={false}
        />
      </View>
      <KeyboardAvoidingView
        style={styles.main}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 100}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.middle}>
            <View style={styles.profileCard}>
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <View style={[styles.statusBadge, onboardingStatus === 'Done' ? styles.statusBadgeDone : styles.statusBadgePending]}>
                    <Text variant="caption" style={styles.statusText}>Onboarding: {onboardingStatus}</Text>
                  </View>
                </View>
                <View style={styles.headerRight}>
                  {editing ? (
                    <TouchableOpacity onPress={handleSave} style={styles.editButton} accessibilityLabel="Save Profile">
                      <Ionicons name="checkmark-outline" size={18} color="#fff" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => setEditing(true)} style={styles.editButton} accessibilityLabel="Edit Profile">
                      <Ionicons name="create-outline" size={18} color="#fff" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.avatarWrapper}>
                <View style={styles.avatarRing}>
                  <View style={styles.avatar}>
                    <Image
                      source={profilePhotoUri ? { uri: profilePhotoUri } : require('../../assets/icon.png')}
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.detailsCard}>
                <View style={styles.infoList}>
                  <View style={styles.infoRow}>
                    <Ionicons name="people-outline" size={16} color="#3E86F5" style={styles.infoIcon} />
                    {editing ? (
                      <TextInput
                        style={[styles.inlineInput]}
                        value={name}
                        onChangeText={setName}
                        placeholder="Name"
                        autoCapitalize="words"
                      />
                    ) : (
                      <Text variant="body" style={[styles.infoText, styles.detailsName]}>{name || agent?.user?.name || 'Admin'}</Text>
                    )}
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="mail-outline" size={16} color="#3E86F5" style={styles.infoIcon} />
                    <Text variant="body" style={styles.infoText} numberOfLines={1}>{email}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={16} color="#3E86F5" style={styles.infoIcon} />
                    {editing ? (
                      <TextInput
                        style={styles.inlineInput}
                        value={mobile}
                        onChangeText={setMobile}
                        placeholder="Mobile"
                        keyboardType="phone-pad"
                      />
                    ) : (
                      <Text variant="body" style={styles.infoText}>Mobile: {mobileNumber}</Text>
                    )}
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="briefcase-outline" size={16} color="#3E86F5" style={styles.infoIcon} />
                    {editing ? (
                      <TextInput
                        style={styles.inlineInput}
                        value={experience}
                        onChangeText={setExperience}
                        placeholder="Experience (years)"
                        keyboardType="numeric"
                      />
                    ) : (
                      <Text variant="body" style={styles.infoText}>Experience: {experienceDisplay} years</Text>
                    )}
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="calendar-outline" size={16} color="#3E86F5" style={styles.infoIcon} />
                    {editing ? (
                      <TextInput
                        style={styles.inlineInput}
                        value={age}
                        onChangeText={setAge}
                        placeholder="Age"
                        keyboardType="numeric"
                      />
                    ) : (
                      <Text variant="body" style={styles.infoText}>Age: {ageDisplay}</Text>
                    )}
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="ribbon-outline" size={16} color="#3E86F5" style={styles.infoIcon} />
                    {editing ? (
                      <TextInput
                        style={styles.inlineInput}
                        value={skillsInput}
                        onChangeText={setSkillsInput}
                        placeholder="Skills (comma-separated)"
                      />
                    ) : (
                      <Text variant="body" style={styles.infoText} numberOfLines={2}>Skills: {skillsArr.length ? skillsArr.join(', ') : '—'}</Text>
                    )}
                  </View>
                  <View style={[styles.infoRow, { justifyContent: 'space-between' }]}> 
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <Ionicons name="lock-closed-outline" size={16} color="#3E86F5" style={styles.infoIcon} />
                      {editing ? (
                        <TextInput
                          style={[styles.inlineInput, { flex: 1 }]}
                          value={newPassword}
                          onChangeText={setNewPassword}
                          placeholder="New password"
                          secureTextEntry={!showNewPassword}
                        />
                      ) : (
                        <Text variant="body" style={styles.infoText}>Password: {password ? (showPassword ? password : '••••••••') : '—'}</Text>
                      )}
                    </View>
                    {editing ? (
                      <TouchableOpacity onPress={() => setShowNewPassword(s => !s)} accessibilityLabel="Toggle password visibility">
                        <Ionicons name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} size={16} color="#3E86F5" />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={() => setShowPassword(s => !s)} accessibilityLabel="Toggle password visibility">
                        <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={16} color="#3E86F5" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              {/* Inline edit uses the rows above; provide a Save button too */}
              {editing && (
                <View style={styles.saveButtonContainer}>
                  <Button title="Save" style={styles.saveButton} onPress={handleSave} />
                </View>
              )}

              {/* Actions */}
              <View style={styles.actionsList}>
                <TouchableOpacity
                  style={[styles.actionRow, styles.logoutRow]}
                  onPress={handleLogout}
                  accessibilityLabel="Logout"
                >
                  <Ionicons name="log-out-outline" size={18} color="#E53935" style={styles.actionIcon} />
                  <Text variant="body" style={styles.logoutLabel}>Logout</Text>
                </TouchableOpacity>
              </View>
            
            </View>

            {/* Second card removed per request: consolidated into single profile card */}


          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.bottomNavContainer}>
        <BottomNavBar onHome={() => navigation.navigate('Dashboard')} onSocial={() => navigation.navigate('Requests')} onNotifications={() => navigation.navigate('Notifications')}
          onProfile={() => navigation.navigate('Profile')}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF3FB',
  },
  main: { flex: 1 },
  content: {
    padding: 20,
    flexGrow: 1,
    paddingBottom: 90, // ensure content not hidden behind bottom nav
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  backIcon: {
    marginRight: 6,
  },
  backText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  operationalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  operationalRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  toggleStatusText: {
    marginTop: 4,
    color: '#333',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  jobsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewButton: {
    width: 80,
  },
  detailsList: {
    paddingTop: 2,
  },
  metaText: {
    marginTop: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggle: {
    width: 48,
    height: 24,
    borderRadius: 12,
    padding: 3,
    position: 'relative',
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: '#2ecc71',
  },
  toggleOff: {
    backgroundColor: '#9e9e9e',
  },
  toggleKnob: {
    position: 'absolute',
    top: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  knobLeft: {
    left: 4,
  },
  knobRight: {
    right: 4,
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    paddingBottom: 24,
    position: 'relative',
    marginHorizontal: 6,
    marginTop: 48,
    paddingTop: 72,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    borderWidth: 1,
    borderColor: CARD_COLORS.border,
  },
  displayName: {
    textAlign: 'center',
    marginBottom: 6,
    color: CARD_COLORS.title,
  },
  infoList: {
    marginTop: 6,
    marginBottom: 12,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: { marginRight: 8 },
  infoText: { color: CARD_COLORS.caption },
  detailsCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: CARD_COLORS.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    marginTop: 6,
    marginBottom: 12,
  },
  detailsName: { color: CARD_COLORS.title },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  actionsList: { gap: 12 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: CARD_COLORS.border,
  },
  actionIcon: { marginRight: 10 },
  actionLabel: { color: CARD_COLORS.title },
  upgradeText: { color: '#34A853', fontWeight: '600' },
  logoutRow: { borderBottomWidth: 0 },
  logoutLabel: { color: '#E53935', fontWeight: '600' },
  bottomNavContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderTitle: {
    color: '#333',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  statusBadgeDone: {
    backgroundColor: '#2ecc71',
  },
  statusBadgePending: {
    backgroundColor: '#ff9500',
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ff79a8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatarWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -49,
    alignItems: 'center',
    zIndex: 2,
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

  form: {
    gap: 12,
  },
  inlineInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: CARD_COLORS.border,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    color: CARD_COLORS.title,
  },
  input: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputWithIcon: {
    flex: 1,
  },
  inputIcon: {
    paddingHorizontal: 8,
  },
  passwordText: {
    flex: 1,
    color: '#000',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  formReadonly: {
    gap: 12,
  },
  inputReadonly: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  saveButton: {
    width: 120,
    borderRadius: 22,
    elevation: 3,
  },
  saveButtonContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
});

export default ProfileScreen;
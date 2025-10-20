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
  const { agent, config, setAgent } = useAgent();
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
  // Password state and visibility controls
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setName(agent?.user?.name || '');
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
  const phone = (agent as any)?.phone || '—';
  const completedOrders = typeof (agent as any)?.completedOrders === 'number' ? (agent as any).completedOrders : 0;
  const level = Math.max(1, Math.floor(completedOrders / 50) + 1);
  const rank = Math.max(1, 5000 - completedOrders * 10);

  const handleSave = () => {
    // Persist name changes to context (email remains read-only)
    const trimmedName = name.trim();
    if (trimmedName.length > 0) {
      const updatedAgent: any = {
        ...(agent || {}),
        name: trimmedName,
        user: { ...((agent as any)?.user || {}), name: trimmedName },
      };
      setAgent(updatedAgent);
    }

    // Optional password update if user provided values
    if (newPassword || confirmPassword) {
      if (newPassword.length < 6) {
        Alert.alert('Validation', 'Password must be at least 6 characters');
        return;
      }
      if (newPassword !== confirmPassword) {
        Alert.alert('Validation', 'Password and confirmation do not match');
        return;
      }
      setPassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      setShowNewPassword(false);
      setShowConfirmPassword(false);
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
          textColor="#000"
          // hide back button per request
          showBack={false}
        />
      </View>
      <KeyboardAvoidingView style={styles.main} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.middle}>
            <View style={styles.profileCard}>
              <View style={styles.cardHeader}>
                <View style={styles.headerRight}>
                  <TouchableOpacity onPress={() => setEditing(e => !e)} style={styles.editButton} accessibilityLabel="Edit Profile">
                    <Ionicons name="create-outline" size={18} color="#fff" />
                  </TouchableOpacity>
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
                    <Text variant="body" style={[styles.infoText, styles.detailsName]}>{name || agent?.user?.name || 'Admin'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="mail-outline" size={16} color="#3E86F5" style={styles.infoIcon} />
                    <Text variant="body" style={styles.infoText} numberOfLines={1}>{email}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={16} color="#3E86F5" style={styles.infoIcon} />
                    <Text variant="body" style={styles.infoText}>{phone}</Text>
                  </View>
                </View>
              </View>

              {editing && (
                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <Text variant="body" style={styles.label}>Name</Text>
                    <View style={styles.inputRow}>
                      <Ionicons name="person-outline" size={16} color="#3E86F5" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, styles.inputWithIcon]}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your name"
                        autoCapitalize="words"
                      />
                    </View>
                  </View>

                  <View style={styles.saveButtonContainer}>
                    <Button title="Save" style={styles.saveButton} onPress={handleSave} />
                  </View>
                </View>
              )}

            
            </View>

            <View style={styles.profileCard}>
              <View style={styles.actionsList}>
                <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Profile')}>
                  <Ionicons name="person-outline" size={18} color="#3E86F5" style={styles.actionIcon} />
                  <Text variant="body" style={styles.actionLabel}>My Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('Dashboard')}>
                  <Ionicons name="grid-outline" size={18} color="#3E86F5" style={styles.actionIcon} />
                  <Text variant="body" style={styles.actionLabel}>My Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionRow} onPress={() => Alert.alert('Earning', 'Earning screen not implemented yet.') }>
                  <Ionicons name="cash-outline" size={18} color="#3E86F5" style={styles.actionIcon} />
                  <Text variant="body" style={styles.actionLabel}>Earning</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionRow} onPress={() => Alert.alert('Subscription', 'Upgrade flow not implemented yet.') }>
                  <Ionicons name="pricetag-outline" size={18} color="#3E86F5" style={styles.actionIcon} />
                  <Text variant="body" style={styles.actionLabel}>Subscription <Text variant="body" style={styles.upgradeText}>Upgrade</Text></Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionRow} onPress={() => Alert.alert('Statement', 'Statement screen not implemented yet.') }>
                  <Ionicons name="receipt-outline" size={18} color="#3E86F5" style={styles.actionIcon} />
                  <Text variant="body" style={styles.actionLabel}>Statement</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionRow} onPress={() => Alert.alert('Account Setting', 'Account setting screen not implemented yet.') }>
                  <Ionicons name="settings-outline" size={18} color="#3E86F5" style={styles.actionIcon} />
                  <Text variant="body" style={styles.actionLabel}>Account Setting</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionRow, styles.logoutRow]} onPress={() => Alert.alert('Logout', 'You have been logged out.') }>
                  <Ionicons name="log-out-outline" size={18} color="#E53935" style={styles.actionIcon} />
                  <Text variant="body" style={[styles.actionLabel, styles.logoutLabel]}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>


          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.bottomNavContainer}>
        <BottomNavBar
          onHome={() => navigation.navigate('Dashboard')}
          onSocial={() => navigation.navigate('Requests')}
          onProfile={() => navigation.navigate('Profile')}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
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
  bottomNavContainer: { marginTop: 12 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderTitle: {
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -16,
    alignItems: 'center',
  },
});

export default ProfileScreen;
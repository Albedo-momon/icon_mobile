import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, StyleSheet, Alert, TextInput, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@icon/config';
import { Screen, Text, Button } from '@icon/ui';
import { useApp } from '../providers/AppProvider';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth, useUser } from '@clerk/clerk-expo';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, setUser, config, sessionPassword, setSessionPassword } = useApp();
  const { signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const [isPasswordEnabled, setIsPasswordEnabled] = useState(!!clerkUser?.passwordEnabled);

  const [name, setName] = useState(user?.name || '');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [editing, setEditing] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [changePwVisible, setChangePwVisible] = useState(false);
  const [cpCurrent, setCpCurrent] = useState('');
  const [cpNew, setCpNew] = useState('');
  const [cpConfirm, setCpConfirm] = useState('');
  const [showCpCurrent, setShowCpCurrent] = useState(false);
  const [showCpNew, setShowCpNew] = useState(false);
  const [showCpConfirm, setShowCpConfirm] = useState(false);

  // Place the Edit button in the top navigation bar (right side)
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => setEditing(e => !e)} style={{ marginRight: 12 }} accessibilityLabel="Edit Profile">
          <Ionicons name="create-outline" size={20} color="#2E2E2E" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPassword(sessionPassword || '');
    setSurname((user as any)?.surname || '');
    setMobile((user as any)?.mobile || '');
    setAddress((user as any)?.address || '');
  }, [user, sessionPassword]);

  useEffect(() => {
    setIsPasswordEnabled(!!clerkUser?.passwordEnabled);
  }, [clerkUser]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (e) {
              console.error('Clerk signOut error:', e);
            }
            setUser(null);
            setSessionPassword(null);
            navigation.navigate('Home');
          }
        }
      ]
    );
  };

  const onSave = () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Missing Info', 'Please fill in Name and Email.');
      return;
    }
    setUser({
      ...(user as any),
      name: name.trim(),
      surname: surname.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      address: address.trim(),
      updatedAt: new Date().toISOString(),
    });
    // Exit edit mode and show read-only profile view
    setEditing(false);
    Alert.alert('Saved', 'Your profile has been updated.');
  };

  const handlePickAvatar = async () => {
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
      setAvatarUri(result.assets[0].uri);
    }
  };

  if (!user) {
    return (
      <Screen style={styles.container}>
        <View style={styles.notLoggedIn}>
          <Text variant="h2" style={styles.title}>Not Logged In</Text>
          <Text variant="body" style={styles.subtitle}>Please login to view your profile</Text>
          <Button title="Go to Login" onPress={() => navigation.navigate('Login')} variant="primary" size="large" style={styles.loginButton} />
        </View>

        {/* Bottom Bar with icons */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.bottomItem} onPress={() => navigation.navigate('Home')} accessibilityLabel="Go to Home">
            <Ionicons name="home-outline" size={22} color="#333" />
            <Text variant="caption" style={styles.bottomLabel}>Home</Text>
          </TouchableOpacity>
          <View style={styles.bottomItem}>
            <Ionicons name="person-outline" size={22} color="#007AFF" />
            <Text variant="caption" style={styles.bottomLabel}>Profile</Text>
          </View>
          <TouchableOpacity style={styles.bottomItem} onPress={() => navigation.navigate('AgentHub')} accessibilityLabel="Open Agent hub">
            <Ionicons name="people-outline" size={22} color="#333" />
            <Text variant="caption" style={styles.bottomLabel}>Agent</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bottomItem}
            onPress={() => navigation.navigate('Login')}
            accessibilityLabel="Login"
          >
            <Ionicons name="log-in-outline" size={22} color="#333" />
            <Text variant="caption" style={styles.bottomLabel}>Login</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      {/* Change Password Modal */}
      <Modal
        visible={changePwVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setChangePwVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text variant="h3" style={styles.modalTitle}>{isPasswordEnabled ? 'Change Password' : 'Set Password'}</Text>

            {isPasswordEnabled && (
              <View style={styles.inputGroup}>
                <Text variant="body" style={styles.label}>Current Password</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.modalInput, styles.inputWithIcon]}
                    value={cpCurrent}
                    onChangeText={setCpCurrent}
                    placeholder="Enter current password"
                    secureTextEntry={!showCpCurrent}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    onPress={() => setShowCpCurrent(v => !v)}
                    style={styles.inputIcon}
                    accessibilityLabel="Toggle current password visibility"
                  >
                    <Ionicons name={showCpCurrent ? 'eye-off-outline' : 'eye-outline'} size={20} color="#7c7c7c" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text variant="body" style={styles.label}>New Password</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.modalInput, styles.inputWithIcon]}
                  value={cpNew}
                  onChangeText={setCpNew}
                  placeholder="Enter new password"
                  secureTextEntry={!showCpNew}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowCpNew(v => !v)}
                  style={styles.inputIcon}
                  accessibilityLabel="Toggle new password visibility"
                >
                  <Ionicons name={showCpNew ? 'eye-off-outline' : 'eye-outline'} size={20} color="#7c7c7c" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text variant="body" style={styles.label}>Confirm Password</Text>
              <View style={styles.inputRow}>
                <TextInput
                  style={[styles.modalInput, styles.inputWithIcon]}
                  value={cpConfirm}
                  onChangeText={setCpConfirm}
                  placeholder="Confirm new password"
                  secureTextEntry={!showCpConfirm}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowCpConfirm(v => !v)}
                  style={styles.inputIcon}
                  accessibilityLabel="Toggle confirm password visibility"
                >
                  <Ionicons name={showCpConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color="#7c7c7c" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Button title="Cancel" variant="secondary" size="small" style={styles.modalButton} onPress={() => setChangePwVisible(false)} />
              <Button
                title={isPasswordEnabled ? 'Change' : 'Set'}
                variant="primary"
                size="small"
                style={styles.modalButton}
                onPress={async () => {
                  if (isPasswordEnabled && !cpCurrent.trim()) {
                    Alert.alert('Validation', 'Please enter your current password');
                    return;
                  }
                  if (cpNew.length < 6) {
                    Alert.alert('Validation', 'New password must be at least 6 characters');
                    return;
                  }
                  if (cpNew !== cpConfirm) {
                    Alert.alert('Validation', 'New password and confirmation do not match');
                    return;
                  }

                  try {
                    if (isPasswordEnabled) {
                      if (!clerkUser) {
                        Alert.alert('Error', 'Account not loaded. Please try again.');
                        return;
                      }
                      await clerkUser?.updatePassword({ currentPassword: cpCurrent, newPassword: cpNew });
                    } else {
                      if (!clerkUser) {
                        Alert.alert('Error', 'Account not loaded. Please try again.');
                        return;
                      }
                      await clerkUser?.updatePassword({ newPassword: cpNew });
                      // Immediately reflect password-enabled state in UI
                      setIsPasswordEnabled(true);
                    }
                    // Update local session password display to reflect the change
                    setSessionPassword(cpNew);
                    setPassword(cpNew);
                    setChangePwVisible(false);
                    setCpCurrent('');
                    setCpNew('');
                    setCpConfirm('');
                    setShowCpCurrent(false);
                    setShowCpNew(false);
                    setShowCpConfirm(false);
                    Alert.alert('Success', isPasswordEnabled ? 'Password changed successfully' : 'Password set successfully');
                  } catch (e: any) {
                    const msg = e?.errors?.[0]?.message || e?.message || 'Failed to update password';
                    Alert.alert('Error', msg);
                  }
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={styles.middle}>
            <View style={styles.profileCard}>

            <View style={styles.avatarWrapper}>
              <View style={styles.avatarRing}>
                <View style={styles.avatar}>
                  {avatarUri ? (
                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                  ) : (
                    <Text variant="h1" style={styles.avatarText}>{(name || user.name || 'U').charAt(0).toUpperCase()}</Text>
                  )}
                </View>
                {editing && (
                  <TouchableOpacity style={styles.avatarAddButton} onPress={handlePickAvatar} accessibilityLabel="Add profile photo">
                    <Ionicons name="add" size={20} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Social media links removed per request */}
            <Text variant="h2" style={styles.displayName}>{name || user.name || 'User'}</Text>

            {editing ? (
              <View style={styles.form}>
                <TextInput
                  style={[styles.input, styles.inputEditing]}
                  placeholder="Name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  placeholderTextColor="#bbb"
                />
                <TextInput
                  style={[styles.input, styles.inputEditing]}
                  placeholder="Surname"
                  value={surname}
                  onChangeText={setSurname}
                  autoCapitalize="words"
                  autoCorrect={false}
                  placeholderTextColor="#bbb"
                />
                <TextInput
                  style={[styles.input, styles.inputEditing]}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholderTextColor="#bbb"
                />
                <TextInput
                  style={[styles.input, styles.inputEditing]}
                  placeholder="Mobile"
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="phone-pad"
                  placeholderTextColor="#bbb"
                />
                <TextInput
                  style={[styles.input, styles.inputEditing]}
                  placeholder="Address"
                  value={address}
                  onChangeText={setAddress}
                  placeholderTextColor="#bbb"
                />
                <View style={[styles.inputReadonly, styles.inputRow]}>
                  <Text variant="body" style={styles.passwordText}>
                    {isPasswordEnabled ? (showPassword ? (password || '') : '********') : ''}
                  </Text>
                  {isPasswordEnabled && (
                    <TouchableOpacity
                      onPress={() => setShowPassword(v => !v)}
                      style={styles.inputIcon}
                      accessibilityLabel="Toggle password visibility"
                    >
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#7c7c7c" />
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity onPress={() => setChangePwVisible(true)} style={styles.changePasswordLink} accessibilityLabel={isPasswordEnabled ? 'Change Password' : 'Set Password'}>
                  <Text variant="caption" style={[styles.changePasswordText, !isPasswordEnabled ? { color: '#007AFF' } : undefined]}>{isPasswordEnabled ? 'Change Password' : 'Set Password'}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formReadonly}>
                <View style={styles.inputReadonly}><Text variant="body" color="#000">{name || 'Name'}</Text></View>
                <View style={styles.inputReadonly}><Text variant="body" color={surname ? '#000' : '#999'}>{surname || 'Add Surname'}</Text></View>
                <View style={styles.inputReadonly}><Text variant="body" color="#000">{email || 'Email'}</Text></View>
                <View style={styles.inputReadonly}><Text variant="body" color={mobile ? '#000' : '#999'}>{mobile || 'Add Mobile No'}</Text></View>
                <View style={styles.inputReadonly}><Text variant="body" color={address ? '#000' : '#999'}>{address || 'Add Address'}</Text></View>
                <View style={[styles.inputReadonly, styles.inputRow]}>
                  <Text variant="body" style={styles.passwordText}>
                    {isPasswordEnabled ? (showPassword ? (password || '') : '********') : ''}
                  </Text>
                  {isPasswordEnabled && (
                    <TouchableOpacity
                      onPress={() => setShowPassword(v => !v)}
                      style={styles.inputIcon}
                      accessibilityLabel="Toggle password visibility"
                    >
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#7c7c7c" />
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity onPress={() => setChangePwVisible(true)}
                  style={styles.changePasswordLink}
                  accessibilityLabel={isPasswordEnabled ? 'Change Password' : 'Set Password'}
                >
                  <Text variant="caption" style={[styles.changePasswordText, !isPasswordEnabled ? { color: '#007AFF' } : undefined]}>{isPasswordEnabled ? 'Change Password' : 'Set Password'}</Text>
                </TouchableOpacity>
              </View>
            )}
            {editing && (
              <View style={styles.saveButtonContainer}>
                <Button title="Save" onPress={onSave} variant="primary" size="small" style={styles.saveButton} />
              </View>
            )}
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {/* Bottom Bar with icons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomItem} onPress={() => navigation.navigate('Home')} accessibilityLabel="Go to Home">
          <Ionicons name="home-outline" size={22} color="#333" />
          <Text variant="caption" style={styles.bottomLabel}>Home</Text>
        </TouchableOpacity>
        <View style={styles.bottomItem}>
          <Ionicons name="person-outline" size={22} color="#007AFF" />
          <Text variant="caption" style={styles.bottomLabel}>Profile</Text>
        </View>
        <TouchableOpacity style={styles.bottomItem} onPress={() => user ? navigation.navigate('AgentHub') : navigation.navigate('Login')} accessibilityLabel="Open Agent hub">
          <Ionicons name="people-outline" size={22} color="#333" />
          <Text variant="caption" style={styles.bottomLabel}>Agent</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomItem}
          onPress={handleLogout}
          accessibilityLabel="Logout"
        >
          <Ionicons name="log-out-outline" size={22} color="#333" />
          <Text variant="caption" style={styles.bottomLabel}>Logout</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingTop: 50,
    flexGrow: 1,
    paddingBottom: 120,
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
  },
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  loginButton: {
    width: '100%',
  },
  profileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    paddingBottom: 48,
    position: 'relative',
    // Extra top padding to make room for half-overlap avatar
    paddingTop: 72,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
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
    // Center the avatar so half is outside and half inside the card
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
  hello: {
    color: '#7c7c7c',
    marginRight: 8,
  },
  displayName: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
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
    // 3D shadow
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  inputWithIcon: {
    paddingRight: 42,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
  },
  inputRow: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  passwordText: {
    textAlign: 'left',
    color: '#000',
  },
  changePasswordLink: {
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  changePasswordText: {
    color: '#007AFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    // 3D shadow
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  modalButton: {
    width: 120,
  },
  inputEditing: {
    color: '#7c7c7c',
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
    // 3D shadow
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
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
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    zIndex: 100,
    elevation: 8,
  },
  bottomItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomLabel: {
    marginTop: 4,
    color: '#333',
  },
});

export default ProfileScreen;
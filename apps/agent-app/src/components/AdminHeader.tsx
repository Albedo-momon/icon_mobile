import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@icon/ui';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  title?: string; // e.g., "My Dashboard"
  subtitle?: string; // e.g., "This is personal intranet"
  welcomeName?: string; // e.g., agent name
  onMenuPress?: () => void;
  onSearchPress?: () => void;
  onNotifPress?: () => void;
}

const AdminHeader: React.FC<Props> = ({
  title = 'My Dashboard',
  subtitle = 'This is personal intranet',
  welcomeName = 'Agent',
  onMenuPress,
  onSearchPress,
  onNotifPress,
}) => {
  return (
    <View style={styles.container}>
      {/* Top brand / actions row */}
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <TouchableOpacity onPress={onMenuPress} accessibilityLabel="Open menu">
            <Ionicons name="menu-outline" size={22} color="#3E86F5" />
          </TouchableOpacity>
          <Text variant="h3" style={styles.brandText}>ICON</Text>
        </View>
        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={onSearchPress} style={styles.actionBtn} accessibilityLabel="Search">
            <Ionicons name="search-outline" size={18} color="#3E86F5" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onNotifPress} style={styles.actionBtn} accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={18} color="#3E86F5" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Context text */}
      <View style={styles.contextRow}>
        <Text variant="caption" style={styles.title}>{title}</Text>
        <Text variant="caption" style={styles.subtitle}>{subtitle}</Text>
      </View>

      {/* Welcome hero */}
      <View style={styles.welcomeBox}>
        <Text variant="body" style={styles.welcomeLabel}>Welcome,</Text>
        <Text variant="h2" style={styles.welcomeName}>{welcomeName}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EAF2FF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandText: {
    color: '#356AE6',
    marginLeft: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: '#EDF2FA',
  },
  contextRow: {
    marginTop: 10,
  },
  title: {
    color: '#496182',
  },
  subtitle: {
    color: '#7C8DA4',
  },
  welcomeBox: {
    marginTop: 12,
  },
  welcomeLabel: {
    color: '#6A7C93',
  },
  welcomeName: {
    color: '#1E88E5',
    fontWeight: '700',
  },
});

export default AdminHeader;
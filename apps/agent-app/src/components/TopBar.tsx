import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Text } from '@icon/ui';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onBackPress: () => void;
  showProfile?: boolean;
  onProfilePress?: () => void;
  textColor?: string; // kept for backward compatibility if needed elsewhere
  style?: ViewStyle;
  backLabel?: string;
  profileLabel?: string;
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  showBack?: boolean;
}

const TopBar: React.FC<Props> = ({
  onBackPress,
  showProfile = true,
  onProfilePress,
  textColor = '#000',
  style,
  backLabel = 'Back',
  profileLabel = 'Profile',
  buttonBackgroundColor = '#2E86FF',
  buttonTextColor = '#fff',
  showBack = true,
}) => {
  return (
    <View style={[styles.container, style]}>
      {showBack && (
        <TouchableOpacity
          style={[styles.button, styles.left, { backgroundColor: buttonBackgroundColor }]}
          onPress={onBackPress}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color={buttonTextColor} style={styles.iconLeft} />
          <Text style={[styles.label, { color: buttonTextColor }]}>{backLabel}</Text>
        </TouchableOpacity>
      )}

      {showProfile && (
        <TouchableOpacity
          style={[styles.button, styles.right, { backgroundColor: buttonBackgroundColor }]}
          onPress={onProfilePress}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          <Text style={[styles.label, { color: buttonTextColor }]}>{profileLabel}</Text>
          <Ionicons name="person-outline" size={20} color={buttonTextColor} style={styles.iconRight} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: 6,
  },
  iconRight: {
    marginLeft: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default TopBar;
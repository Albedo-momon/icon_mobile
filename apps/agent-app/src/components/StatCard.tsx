import React from 'react';
import { View, StyleSheet, ColorValue } from 'react-native';
import { Text } from '@icon/ui';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  variant?: 'purple' | 'orange' | 'green';
}

const gradients: Record<NonNullable<Props['variant']>, readonly [ColorValue, ColorValue]> = {
  purple: ['#6A11CB', '#B91372'],
  orange: ['#FFB347', '#FF7F50'],
  green: ['#34C759', '#2ECC71'],
};

const StatCard: React.FC<Props> = ({ icon, value, label, variant = 'purple' }) => {
  const colors = gradients[variant];
  return (
    <View style={styles.card}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.iconCircle}>
        <Ionicons name={icon} size={20} color="#FFFFFF" />
      </LinearGradient>
      <View style={styles.content}>
        <Text variant="h2" style={styles.value}>{String(value)}</Text>
        <Text variant="caption" style={styles.label}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEF3FB',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 72,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  content: { flex: 1, flexDirection: 'column', alignItems: 'flex-start' },
  value: {
    color: '#2E2E2E',
    fontWeight: '700',
    marginBottom: 2,
  },
  label: {
    color: '#7C8DA4',
    marginLeft: 4,
  },
});

export default StatCard;
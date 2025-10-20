import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@icon/ui';

interface Props {
  title: string;
  percent: number; // 0-100
}

const ProgressCard: React.FC<Props> = ({ title, percent }) => {
  const safe = Math.max(0, Math.min(100, percent));
  return (
    <View style={styles.card}>
      <Text variant="body" style={styles.title}>{title}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${safe}%` }]} />
      </View>
      <Text variant="caption" style={styles.percentLabel}>{safe}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEF3FB',
  },
  title: { color: '#2E2E2E', marginBottom: 8 },
  progressBar: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E8EEF7',
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: '#3E86F5',
    borderRadius: 999,
  },
  percentLabel: { marginTop: 8, color: '#7C8DA4' },
});

export default ProgressCard;
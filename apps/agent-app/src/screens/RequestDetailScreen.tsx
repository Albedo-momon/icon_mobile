import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AgentStackParamList } from '@icon/config';
import { Screen, Text, Button } from '@icon/ui';
import { useAgent } from '../providers/AgentProvider';
import TopBar from '../components/TopBar';
import { CARD_COLORS } from '../components/theme';

export type RequestDetailNav = StackNavigationProp<AgentStackParamList, 'RequestDetail'>;
export type RequestDetailRoute = RouteProp<AgentStackParamList, 'RequestDetail'>;

interface Props {
  navigation: RequestDetailNav;
  route: RequestDetailRoute;
}

const RequestDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { config } = useAgent();
  const {
    requestId,
    serviceType,
    title,
    customerName,
    nextVisitAt,
    status,
    clientAddress,
    clientPhone,
    clientEmail,
    issueType,
    issueDescription,
  } = route.params;

  const [etaMinutes, setEtaMinutes] = useState<string>('');
  const [etaError, setEtaError] = useState<string>('');

  const acceptRequest = () => {
    // Require ETA for IN_HOUSE before accepting
    if (serviceType === 'IN_HOUSE') {
      const num = parseInt(etaMinutes, 10);
      if (isNaN(num) || num <= 0) {
        setEtaError('Please enter ETA in minutes (positive number).');
        Alert.alert('ETA required', 'Enter a valid ETA in minutes to proceed.');
        return;
      }
      setEtaError('');
      navigation.navigate('ServiceFlow', { requestId, serviceType, etaMinutes: num });
      return;
    }
    navigation.navigate('ServiceFlow', { requestId, serviceType });
  };

  return (
    <Screen backgroundColor="#FAF8F2" style={styles.container}>
      <View style={styles.header}>
        
        <Text variant="h2" numberOfLines={1} style={{ color: '#333' }}>Request Details</Text>
        
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text variant="h4" numberOfLines={1} style={[styles.cardTitle, { color: CARD_COLORS.title }]}>{title || 'Service request'}</Text>
            {status && (
              <View style={[
                styles.statusChip,
                status === 'NEW' ? styles.new :
                status === 'ACCEPTED' ? styles.accepted :
                status === 'IN_PROGRESS' ? styles.in_progress :
                status === 'COMPLETED' ? styles.completed :
                styles.cancelled
              ]}>
                <Text variant="caption" style={styles.chipText} numberOfLines={1}>{status}</Text>
              </View>
            )}
          </View>

          <Text variant="body">Request ID: {requestId}</Text>
          <Text variant="body">Type: {serviceType.replace('_', ' ')}</Text>
          {customerName && <Text variant="body">Customer: {customerName}</Text>}
          {clientPhone && <Text variant="body">Phone: {clientPhone}</Text>}
          {clientEmail && <Text variant="body">Email: {clientEmail}</Text>}
          {serviceType === 'IN_HOUSE' && clientAddress && (
            <Text variant="body">Address: {clientAddress}</Text>
          )}
          {issueType && <Text variant="body">Issue: {issueType}</Text>}
          {issueDescription && <Text variant="caption" style={{ color: CARD_COLORS.caption }}>{issueDescription}</Text>}
          {nextVisitAt && status !== 'NEW' && (
            <Text variant="caption" style={{ color: CARD_COLORS.caption }}>Next visit: {new Date(nextVisitAt).toLocaleString()}</Text>
          )}

          {serviceType === 'IN_HOUSE' && status === 'NEW' && (
            <View style={styles.etaRow}>
              <Text variant="body" style={styles.etaLabel}>ETA (minutes)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter ETA"
                value={etaMinutes}
                onChangeText={setEtaMinutes}
              />
            </View>
          )}
          {etaError ? <Text variant="caption" style={styles.error}>{etaError}</Text> : null}

          <View style={styles.actions}>
            {status === 'NEW' && (
              <Button title="Accept Request" variant="primary" size="small" onPress={acceptRequest} style={{ alignSelf: 'flex-start', marginRight: 8 }} />
            )}
            <Button title="View Timeline" variant="secondary" size="medium" onPress={() => navigation.navigate('Timeline', { requestId })} />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { padding: 16, marginBottom: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  subtitle: { color: '#555' },
  content: { flex: 1 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: CARD_COLORS.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { flex: 1 },
  statusChip: { borderRadius: 12, paddingVertical: 4, paddingHorizontal: 8, maxWidth: 120, marginLeft: 8, flexShrink: 0 },
  chipText: { color: '#FFFFFF' },
  new: { backgroundColor: '#2E86FF' },
  accepted: { backgroundColor: '#2ECC71' },
  in_progress: { backgroundColor: '#F39C12' },
  completed: { backgroundColor: '#27AE60' },
  cancelled: { backgroundColor: '#E74C3C' },
  actions: { flexDirection: 'row', justifyContent: 'flex-start', marginTop: 12 },
  etaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  etaLabel: { marginRight: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#FFF' },
  error: { color: '#E74C3C', marginTop: 6 },
});

export default RequestDetailScreen;
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AgentStackParamList, ApiResponse } from '@icon/config';
import { Screen, Text, Button } from '@icon/ui';
import { useAgent } from '../providers/AgentProvider';
import TopBar from '../components/TopBar';
import BottomNavBar from '../components/BottomNavBar';
import { CARD_COLORS } from '../components/theme';

export type ServiceType = 'IN_HOUSE' | 'IN_SHOP' | 'PC_BUILD';

interface RequestItem {
  id: string;
  title: string;
  customerName: string;
  serviceType: ServiceType;
  status: 'NEW' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  nextVisitAt?: string;
  clientAddress?: string;
  clientPhone?: string;
  clientEmail?: string;
  issueType?: string;
  issueDescription?: string;
}

type RequestsNav = StackNavigationProp<AgentStackParamList, 'Requests'>;

interface Props {
  navigation: RequestsNav;
}

const RequestsScreen: React.FC<Props> = ({ navigation }) => {
  const { config } = useAgent();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadRequests = async () => {
      setLoading(true);
      try {
        if (config.mockMode) {
          const now = new Date();
          const day2 = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          setRequests([
            {
              id: 'REQ-1001',
              title: 'On-site diagnosis: Laptop not booting',
              customerName: 'Alice',
              serviceType: 'IN_HOUSE',
              status: 'NEW',
              clientAddress: '123 Main St, Springfield',
              clientPhone: '+1 555-0123',
              clientEmail: 'alice@example.com',
              issueType: 'Laptop not booting',
              issueDescription: 'Device fails to power on; suspect PSU or motherboard.',
            },
            {
              id: 'REQ-1002',
              title: 'In-shop repair: GPU artifacting',
              customerName: 'Bob',
              serviceType: 'IN_SHOP',
              status: 'ACCEPTED',
              clientPhone: '+1 555-0456',
              clientEmail: 'bob@example.com',
              issueType: 'GPU artifacting',
              issueDescription: 'Artifacts on screen under load; likely thermal or VRAM issue.',
            },
            {
              id: 'REQ-1003',
              title: 'PC build: Ryzen + RTX assembly',
              customerName: 'Charlie',
              serviceType: 'PC_BUILD',
              status: 'IN_PROGRESS',
              clientPhone: '+1 555-0789',
              clientEmail: 'charlie@example.com',
              issueType: 'PC Build',
              issueDescription: 'Assemble parts and install OS with drivers.',
            },
          ]);
        } else {
          // Placeholder for real API integration
          const resp: ApiResponse<RequestItem[]> = { success: true, data: [] };
          setRequests(resp.data || []);
        }
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, [config.mockMode]);

  const openRequest = (req: RequestItem) => {
    navigation.navigate('RequestDetail', {
      requestId: req.id,
      serviceType: req.serviceType,
      title: req.title,
      customerName: req.customerName,
      nextVisitAt: req.nextVisitAt,
      status: req.status,
      clientAddress: req.clientAddress,
      clientPhone: req.clientPhone,
      clientEmail: req.clientEmail,
      issueType: req.issueType,
      issueDescription: req.issueDescription,
    });
  };

  return (
    <Screen style={styles.container}>
       <View style={styles.pageHeader}>
            <Text variant="h2" style={{ color: CARD_COLORS.title }}>Agent Requests</Text>
          </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View >
         

          {loading ? (
            <Text>Loading requests...</Text>
          ) : (
            requests.map((req) => (
              <TouchableOpacity key={req.id} onPress={() => openRequest(req)}>
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text variant="body">Customer: {req.customerName}</Text>
                    
                    <View style={[
                      styles.statusChip,
                      req.status === 'NEW' ? styles.new :
                      req.status === 'ACCEPTED' ? styles.accepted :
                      req.status === 'IN_PROGRESS' ? styles.in_progress :
                      req.status === 'COMPLETED' ? styles.completed :
                      styles.cancelled
                    ]}>
                      <Text variant="captionSm" style={styles.chipText}>{req.status}</Text>
                    </View>
                  </View>
                  <Text variant="caption" numberOfLines={1} style={[styles.cardTitle, { color: CARD_COLORS.title }]}>{req.title}</Text>
                  <Text variant="caption" style={{ color: CARD_COLORS.caption }}>Type: {req.serviceType.replace('_', ' ')}</Text>
                  {req.nextVisitAt && req.status !== 'NEW' && (
                    <Text variant="button">Next visit: {new Date(req.nextVisitAt).toLocaleString()}</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
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
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  content: { padding: 20, flexGrow: 1, paddingBottom: 90 },
  pageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    paddingBottom: 24,
    marginHorizontal: 6,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: CARD_COLORS.border,
  },
  pageHeader: { marginBottom: 12, paddingHorizontal: 20, paddingTop: 20 },
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fff' },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#EEF3FB', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { flex: 1, marginRight: 8 },
  statusChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, alignSelf: 'flex-start', flexShrink: 0, maxWidth: 120, marginLeft: 8 },
  chipText: { color: '#fff', fontWeight: 'bold' },
  actions: { marginTop: 8, alignItems: 'flex-start' },
  new: { backgroundColor: '#007AFF' },
  accepted: { backgroundColor: '#34C759' },
  in_progress: { backgroundColor: '#FF9800' },
  completed: { backgroundColor: '#4CAF50' },
  cancelled: { backgroundColor: '#F44336' },
});

export default RequestsScreen;
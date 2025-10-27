import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AgentStackParamList } from '@icon/config';
import { Screen, Text, Button } from '@icon/ui';
import { api } from '@icon/api';
import { useAgent } from '../providers/AgentProvider';
import { CARD_COLORS } from '../components/theme';
import BottomNavBar from '../components/BottomNavBar';
import { Ionicons } from '@expo/vector-icons';

export type TimelineNav = StackNavigationProp<AgentStackParamList, 'Timeline'>;
export type TimelineRoute = RouteProp<AgentStackParamList, 'Timeline'>;

interface Props {
  navigation: TimelineNav;
  route: TimelineRoute;
}

const TimelineScreen: React.FC<Props> = ({ navigation, route }) => {
  const { requestId, events } = route.params;
  const { config } = useAgent();

  const [loadedEvents, setLoadedEvents] = React.useState<any[]>(Array.isArray(events) ? events : []);
  React.useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (loadedEvents.length > 0) return;
      try {
        const res = await api.timeline.getEvents(requestId);
        if (mounted && res.success) {
          setLoadedEvents(res.data || []);
        }
      } catch {}
    };
    load();
    return () => { mounted = false; };
  }, [requestId]);
  const displayEvents = loadedEvents.length > 0 ? loadedEvents : (config.mockMode ? [{ id: `${requestId}-accept`, type: 'ACCEPTED', description: 'Request accepted', timestamp: new Date().toISOString(), actor: 'AGENT' }] : []);

  return (
    <Screen backgroundColor="#FAF8F2" style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <TouchableOpacity onPress={() => navigation.navigate('Requests')} style={styles.backButton} accessibilityLabel="Back to Requests">
              <Ionicons name="arrow-back-outline" size={22} color="#000" />
            </TouchableOpacity>
            <Text variant="h2" style={{ color: '#333' }}>Timeline</Text>
          </View>
          <Text variant="caption" style={[styles.subtitle, { color: CARD_COLORS.caption }]}>Request {requestId}</Text>
        </View>

        <View style={[styles.card, styles.timelineList]}>
          {(displayEvents ?? []).map(evt => (
             <View key={evt.id} style={styles.eventRow}>
               <View style={styles.dot} />
               <View style={styles.eventContent}>
                 <Text variant="h3" numberOfLines={1} style={{ color: CARD_COLORS.title }}>{evt.type}</Text>
                 <Text variant="caption" style={{ color: CARD_COLORS.caption }}>{new Date(evt.timestamp).toLocaleString()}</Text>
                 {evt.description ? <Text variant="body">{evt.description}</Text> : null}
               </View>
             </View>
           ))}
          {!displayEvents || displayEvents.length === 0 ? (
            <Text variant="caption" style={{ color: CARD_COLORS.caption }}>No timeline events yet.</Text>
          ) : null}
        </View>


      </ScrollView>

      <View style={styles.bottomNav}>
        <BottomNavBar
          onHome={() => navigation.navigate('Dashboard')}
          onSocial={() => navigation.navigate('Requests')}
         onNotifications={() => navigation.navigate('Notifications')}
          onProfile={() => navigation.navigate('Profile')}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 24, paddingHorizontal: 16 },
  header: { padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backButton: { padding: 4 },
  subtitle: { color: '#555' },
  card: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: CARD_COLORS.border },
  timelineList: { borderLeftWidth: 2, borderLeftColor: CARD_COLORS.border, paddingLeft: 12 },
  eventRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#34C759', marginRight: 12, marginTop: 6 },
  eventContent: { flex: 1 },
  actions: { marginTop: 8, flexDirection: 'row', alignItems: 'center' },
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fff' },
});

export default TimelineScreen;
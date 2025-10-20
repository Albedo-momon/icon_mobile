import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AgentStackParamList } from '@icon/config';
import { Screen, Text, Button } from '@icon/ui';
import TopBar from '../components/TopBar';
import { CARD_COLORS } from '../components/theme';

export type TimelineNav = StackNavigationProp<AgentStackParamList, 'Timeline'>;
export type TimelineRoute = RouteProp<AgentStackParamList, 'Timeline'>;

interface Props {
  navigation: TimelineNav;
  route: TimelineRoute;
}

const TimelineScreen: React.FC<Props> = ({ navigation, route }) => {
  const { requestId, events } = route.params;

  return (
    <Screen backgroundColor="#FAF8F2" style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TopBar
            onBackPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Dashboard'))}
            showProfile
            onProfilePress={() => navigation.navigate('Profile')}
            textColor="#fff"
          />
          <Text variant="h2" style={{ color: '#333' }}>Timeline</Text>
-          <Text variant="caption" style={styles.subtitle}>Request {requestId}</Text>
+          <Text variant="caption" style={[styles.subtitle, { color: CARD_COLORS.caption }]}>Request {requestId}</Text>
        </View>

        <View style={styles.card}>
          {(events ?? []).map(evt => (
          <View key={evt.id} style={styles.eventRow}>
              <View style={styles.dot} />
              <View style={styles.eventContent}>
-                <Text variant="h3" numberOfLines={1}>{evt.type}</Text>
-                <Text variant="caption">{new Date(evt.timestamp).toLocaleString()}</Text>
+                <Text variant="h3" numberOfLines={1} style={{ color: CARD_COLORS.title }}>{evt.type}</Text>
+                <Text variant="caption" style={{ color: CARD_COLORS.caption }}>{new Date(evt.timestamp).toLocaleString()}</Text>
                {evt.description ? <Text variant="body">{evt.description}</Text> : null}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 24, paddingHorizontal: 16 },
  header: { padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  subtitle: { color: '#555' },
  card: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: CARD_COLORS.border },
  eventRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#34C759', marginRight: 12, marginTop: 6 },
  eventContent: { flex: 1 },
});

export default TimelineScreen;
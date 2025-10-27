import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@icon/config';
import { Screen, Text } from '@icon/ui';
import { Ionicons } from '@expo/vector-icons';

type AgentHistoryNavProp = StackNavigationProp<RootStackParamList, 'AgentHistory'>;

interface Props {
  navigation: AgentHistoryNavProp;
}

type StatusKey = 'open' | 'resolved' | 'closed';

const STATUS_META: Record<StatusKey, { label: string; color: string; bg: string }> = {
  open: { label: 'OPEN', color: '#1F6FEB', bg: '#EAF2FF' },
  resolved: { label: 'RESOLVED', color: '#2E7D32', bg: '#E7F5E8' },
  closed: { label: 'CLOSED', color: '#A84300', bg: '#FFF1E6' },
};

const MOCK_HISTORY = [
  {
    id: 'SR00002GJZWA',
    title: 'Service Disruption',
    category: 'Laptop',
    status: 'closed' as StatusKey,
    raisedAt: '22 Sep, 2025 02:03 PM',
    resolution: 'Cancelled',
  },
  {
    id: 'SR00002XABCD',
    title: 'Camera Offline',
    category: 'CCTV',
    status: 'open' as StatusKey,
    raisedAt: '21 Sep, 2025 11:20 AM',
    resolution: '—',
  },
  {
    id: 'SR00002PQRS1',
    title: 'No Display Output',
    category: 'Computer',
    status: 'resolved' as StatusKey,
    raisedAt: '20 Sep, 2025 05:45 PM',
    resolution: 'Fixed',
  },
];

export default function AgentHistoryScreen({ navigation }: Props) {
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState<'all' | StatusKey>('all');
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  const filtered = React.useMemo(() => {
    return MOCK_HISTORY.filter(item => {
      const matchesQuery = `${item.title} ${item.id} ${item.category}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = filter === 'all' ? true : item.status === filter;
      return matchesQuery && matchesStatus;
    });
  }, [query, filter]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text variant="h2" style={styles.title}>History</Text>
        <Text variant="caption" color="#666" style={styles.subtitle}>Past agent bookings and service requests</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title, ID, or category"
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          accessibilityLabel="Search history"
        />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {[
          { key: 'all', label: 'All' },
          { key: 'open', label: 'Open' },
          { key: 'resolved', label: 'Resolved' },
          { key: 'closed', label: 'Closed' },
        ].map(f => {
          const selected = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, selected && styles.filterChipSelected]}
              onPress={() => setFilter(f.key as any)}
              accessibilityLabel={`Filter ${f.label}`}
            >
              <Text
                variant="body"
                style={StyleSheet.flatten([styles.filterText, selected && styles.filterTextSelected])}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState} accessibilityLabel="No history results">
            <View style={styles.emptyIconWrap}>
              <Ionicons name="search-outline" size={20} color="#666" />
            </View>
            <Text variant="body" style={{ color: '#2E2E2E', fontWeight: '600' }}>No matching requests</Text>
            <Text variant="caption" color="#666">Try adjusting filters or search</Text>
          </View>
        ) : (
          filtered.map(item => {
            const statusMeta = STATUS_META[item.status];
            const isOpen = !!expanded[item.id];
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                <View style={[styles.badge, { backgroundColor: statusMeta.bg }]}> 
                  <Text
                    variant="caption"
                    style={StyleSheet.flatten([styles.badgeText, { color: statusMeta.color }])}
                  >
                    {statusMeta.label}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => toggleExpand(item.id)} accessibilityLabel={isOpen ? 'View less' : 'View more'}>
                  <Text variant="caption" style={styles.link}>{isOpen ? 'View less' : 'View more'}</Text>
                </TouchableOpacity>
              </View>

              <Text variant="h3" style={styles.cardTitle}>{item.title}</Text>
              <Text variant="caption" color="#666" style={styles.requestIdText}>Request ID: {item.id}</Text>

              {isOpen && (
                <View style={styles.details}>
                  <View style={styles.timelineRow}>
                    <View style={styles.timelineIconWrap}>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#2C5AA0" />
                      <View style={styles.vline} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="body" style={styles.detailTitle}>Service request raised</Text>
                      <Text variant="caption" color="#666" style={styles.raisedText}>On {item.raisedAt}</Text>
                    </View>
                  </View>

                  <View style={styles.timelineRow}>
                    <View style={styles.timelineIconWrap}>
                      <Ionicons name="alert-circle-outline" size={18} color="#FF8C00" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="body" style={styles.detailTitle}>Resolution status</Text>
                      <Text variant="caption" style={StyleSheet.flatten([styles.resolutionText, item.status === 'resolved' ? styles.resolved : item.status === 'closed' ? styles.closed : styles.open])}>{item.resolution}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
            );
          })
        )}
      </ScrollView>

      <View style={{ height: 12 }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    color: '#2E2E2E',
    marginBottom: 4,
    fontSize: 20,
  },
  subtitle: {
    fontSize: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    gap: 8,
    // 3D shadow
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    color: '#2E2E2E',
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8DDE6',
    backgroundColor: '#FFFFFF',
  },
  filterChipSelected: {
    backgroundColor: '#2C5AA0',
    borderColor: '#2C5AA0',
  },
  filterText: {
    color: '#2E2E2E',
    fontWeight: '600',
    fontSize: 13,
  },
  filterTextSelected: {
    color: '#FAF8F2',
  },
  list: {
    paddingBottom: 24,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
    // 3D shadow
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  emptyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    // 3D shadow
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontWeight: '700',
    letterSpacing: 0.3,
    fontSize: 12,
  },
  cardTitle: {
    color: '#2E2E2E',
    marginBottom: 2,
    fontWeight: '700',
    fontSize: 16,
  },
  link: {
    color: '#2C5AA0',
    fontSize: 12,
  },
  details: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F5',
    paddingTop: 10,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  timelineIconWrap: {
    width: 24,
    alignItems: 'center',
  },
  vline: {
    width: 2,
    height: 28,
    backgroundColor: '#D8DDE6',
    marginTop: 2,
    borderRadius: 1,
  },
  detailTitle: {
    color: '#2E2E2E',
    marginBottom: 2,
    fontWeight: '600',
    fontSize: 14,
  },
  resolutionText: {
    fontWeight: '700',
    fontSize: 13,
  },
  resolved: {
    color: '#2E7D32',
  },
  closed: {
    color: '#A84300',
  },
  open: {
    color: '#1F6FEB',
  },
  requestIdText: {
    fontSize: 12,
  },
  raisedText: {
    fontSize: 12,
  },
});
import React from 'react';
import { StyleSheet, View, ScrollView, Modal, Image, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList, TimelineEvent, StageLabel } from '@icon/config';
import { Screen, Text, Button } from '@icon/ui';
import { api } from '@icon/api';

type AgentStatusNavProp = StackNavigationProp<RootStackParamList, 'AgentStatus'>;
type AgentStatusRouteProp = RouteProp<RootStackParamList, 'AgentStatus'>;

interface Props {
  navigation: AgentStatusNavProp;
  route: AgentStatusRouteProp;
}

// Build timeline based on selected service type
const buildTimeline = (serviceType?: 'IN_HOUSE' | 'IN_SHOP' | 'PC_BUILD') => {
  switch (serviceType) {
    case 'IN_SHOP':
      return [
        { key: 'raised', title: 'Request Raised', desc: 'You submitted a service request', time: '10:12 AM', status: 'done' as const },
        { key: 'searching', title: 'Searching For Agent', desc: 'Matching an available technician', time: '10:13 AM', status: 'done' as const },
        { key: 'request_sent', title: 'Request Sent', desc: 'Sent to selected agent', time: '10:14 AM', status: 'done' as const },
        { key: 'waiting_approval', title: 'Waiting for Agent Approval', desc: 'Agent reviewing your request', time: '10:15 AM', status: 'done' as const },
        { key: 'accepted', title: 'Agent Accepted', desc: 'Rahul accepted your request', time: '10:16 AM', status: 'done' as const },
        { key: 'diagnosis_started', title: 'Diagnosis Started', desc: 'Assessing device issues', time: '—', status: 'current' as const },
        { key: 'diagnosis_completed', title: 'Diagnosis Completed', desc: 'Issue identified', time: '—', status: 'pending' as const },
        { key: 'repair_in_progress', title: 'Repair In Progress', desc: 'Fixing the device', time: '—', status: 'pending' as const },
        { key: 'testing', title: 'Testing & QA', desc: 'Verifying the fix', time: '—', status: 'pending' as const },
        { key: 'complete', title: 'Completed', desc: 'Service marked done', time: '—', status: 'pending' as const },
      ];
    case 'PC_BUILD':
      return [
        { key: 'raised', title: 'Request Raised', desc: 'You submitted a PC build request', time: '10:12 AM', status: 'done' as const },
        { key: 'accepted', title: 'Agent Accepted', desc: 'Rahul accepted your request', time: '10:16 AM', status: 'done' as const },
        { key: 'build_in_progress', title: 'Build In Progress', desc: 'Assembling your PC', time: '—', status: 'current' as const },
        { key: 'build_done', title: 'Build Done', desc: 'Hardware build completed', time: '—', status: 'pending' as const },
        { key: 'software_installation_in_progress', title: 'Software Installation In Progress', desc: 'Installing OS and drivers', time: '—', status: 'pending' as const },
        { key: 'installation_done', title: 'Installation Done', desc: 'Software setup completed', time: '—', status: 'pending' as const },
        { key: 'testing_qa', title: 'Testing & QA', desc: 'Stress tests and validation', time: '—', status: 'pending' as const },
        { key: 'testing_done', title: 'Testing Done', desc: 'Quality checks completed', time: '—', status: 'pending' as const },
        { key: 'complete', title: 'Completed', desc: 'Build marked done', time: '—', status: 'pending' as const },
      ];
    case 'IN_HOUSE':
    default:
      return [
        { key: 'raised', title: 'Request Raised', desc: 'You submitted a service request', time: '10:12 AM', status: 'done' as const },
        { key: 'searching', title: 'Searching For Agent', desc: 'Matching an available technician', time: '10:13 AM', status: 'done' as const },
        { key: 'request_sent', title: 'Request Sent', desc: 'Sent to selected agent', time: '10:14 AM', status: 'done' as const },
        { key: 'waiting_approval', title: 'Waiting for Agent Approval', desc: 'Agent reviewing your request', time: '10:15 AM', status: 'done' as const },
        { key: 'accepted', title: 'Agent Accepted', desc: 'Rahul accepted your request', time: '10:16 AM', status: 'done' as const },
        { key: 'eta', title: 'ETA Confirmed', desc: 'Estimated arrival in 25 minutes', time: '10:18 AM', status: 'done' as const },
        { key: 'diagnosis_pending', title: 'Diagnosis Pending', desc: 'Awaiting technician to start diagnosis', time: '—', status: 'current' as const },
        { key: 'diagnosis_started', title: 'Diagnosis Started', desc: 'Assessing device issues', time: '—', status: 'pending' as const },
        { key: 'diagnosis_completed', title: 'Diagnosis Completed', desc: 'Issue identified', time: '—', status: 'pending' as const },
        { key: 'repair_in_progress', title: 'Repair In Progress', desc: 'Fixing the device', time: '—', status: 'pending' as const },
        { key: 'testing', title: 'Testing & QA', desc: 'Verifying the fix', time: '—', status: 'pending' as const },
        { key: 'complete', title: 'Completed', desc: 'Service marked done', time: '—', status: 'pending' as const },
      ];
  }
};

export default function AgentStatusScreen({ navigation, route }: Props) {
  // Compute timeline from route params
  const serviceType = route?.params?.serviceType;
  const requestId = route?.params?.requestId;

  // Loaded events from API, fallback to local build if none
  const [loadedEvents, setLoadedEvents] = React.useState<TimelineEvent[]>([]);
  const [eventsLoaded, setEventsLoaded] = React.useState<boolean>(false);

  React.useEffect(() => {
    let isMounted = true;
    const fetchTimeline = async () => {
      if (!requestId) {
        setLoadedEvents([]);
        setEventsLoaded(false);
        return;
      }
      try {
        const res = await api.timeline.getEvents(requestId);
        if (isMounted && res?.success && Array.isArray(res.data)) {
          setLoadedEvents(res.data);
          setEventsLoaded(true);
        } else if (isMounted) {
          setLoadedEvents([]);
          setEventsLoaded(true);
        }
      } catch (e) {
        if (isMounted) {
          setLoadedEvents([]);
          setEventsLoaded(true);
        }
      }
    };
    fetchTimeline();
    return () => { isMounted = false; };
  }, [requestId]);

  const formatEventTime = React.useCallback((iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    const hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }, []);

  // Adapt events to timeline card rendering format
  const timelineEntries = React.useMemo(() => {
    if (loadedEvents.length > 0) {
      return loadedEvents.map((evt, idx, arr) => ({
        key: `${evt.type}-${evt.timestamp}-${idx}`,
        stageType: evt.type,
        title: (StageLabel as any)[evt.type] || (evt.type === 'ACCEPTED' ? 'Agent Accepted' : evt.type),
        desc: evt.description || ((StageLabel as any)[evt.type] ? `Moved to ${(StageLabel as any)[evt.type]}` : 'Event recorded'),
        time: formatEventTime(evt.timestamp),
        status: idx < arr.length - 1 ? ('done' as const) : ('current' as const),
      }));
    }
    return buildTimeline(serviceType);
  }, [loadedEvents, formatEventTime, serviceType]);

  // Current progress index for rendering
  const progressIndex = React.useMemo(() => timelineEntries.findIndex(e => e.status === 'current'), [timelineEntries]);
  const [showAgentModal, setShowAgentModal] = React.useState(false);
  // Countdown: start from 3 hours after agent accepts (applies when accepted step reached)
  const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
  const [etaConfirmedAt] = React.useState<number>(() => Date.now());
  const [timeLeftMs, setTimeLeftMs] = React.useState<number>(THREE_HOURS_MS);
  const formatTime = React.useCallback((ms: number) => {
    if (ms <= 0) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }, []);

  React.useEffect(() => {
    // Only run countdown if ETA step has been reached/done (from events or fallback)
    const etaReached = loadedEvents.length
      ? loadedEvents.some(e => e.type === 'ETA')
      : timelineEntries.some(e => e.key === 'eta' && (e.status === 'done' || e.status === 'current'));
    if (!etaReached) return;
    const endAt = etaConfirmedAt + THREE_HOURS_MS;
    const tick = () => {
      const now = Date.now();
      setTimeLeftMs(Math.max(0, endAt - now));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [etaConfirmedAt, timelineEntries, loadedEvents]);

  const agent = React.useMemo(() => ({
    name: 'Rahul',
    avatarUrl: 'https://i.pravatar.cc/120?u=rahul-agent',
    phone: '+91-9876543210',
    completedOrders: 142,
    since: '2023',
  }), []);

  const requestSummary = {
    serviceType: serviceType || 'IN_HOUSE',
    category: route?.params?.category,
    issueTitle: route?.params?.issueTitle,
    issueNotes: route?.params?.issueNotes,
    requestId: route?.params?.requestId,
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.headerRow}>
        <Text variant="h2" style={styles.title}>Agent Request Timeline</Text>
        <Text variant="caption" color="#666">Track your service status</Text>
      </View>

      {/* Request Summary */}
      <View style={{ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E4E7EC', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8 }}>
        <Text variant="body" style={{ fontWeight: '700', color: '#2E2E2E' }}>Service: {requestSummary.serviceType.replace('_', ' ')}</Text>
        {!!requestSummary.category && (
          <Text variant="caption" color="#666">Category: {requestSummary.category}</Text>
        )}
        {!!requestSummary.issueTitle && (
          <Text variant="caption" color="#666">Issue: {requestSummary.issueTitle}</Text>
        )}
        {!!requestSummary.issueNotes && (
          <Text variant="caption" color="#666">Notes: {requestSummary.issueNotes}</Text>
        )}
        {!!requestSummary.requestId && (
          <Text variant="caption" color="#999">Request ID: {requestSummary.requestId}</Text>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.timelineList}>
        {timelineEntries.map((item, index) => {
          const isReached = index <= progressIndex;
          const isCurrent = index === progressIndex;
          const isLast = index === timelineEntries.length - 1;
          return (
            <View key={item.key} style={styles.row}>
              <View style={styles.leftCol}>
                <View style={[styles.dot, isReached ? styles.dotActive : styles.dotInactive, isCurrent && styles.dotCurrent]} />
                {!isLast && (
                  <View style={[styles.vline, isReached ? styles.vlineActive : styles.vlineInactive]} />
                )}
              </View>
              <View style={[styles.card, isCurrent && styles.cardCurrent]}>
                <Text variant="body" style={styles.cardTitle}>{item.title}</Text>
                <Text variant="caption" color="#666">{item.desc}</Text>
                <Text variant="caption" color="#999">{item.time}</Text>
                {(item.key === 'eta' || (item as any).stageType === 'ETA') && (item.status === 'done' || item.status === 'current') && (
                  <View style={styles.countdownRow}>
                    <View style={styles.countdownBadge}>
                      <Ionicons name="time-outline" size={16} color="#2C5AA0" />
                      <Text variant="caption" style={styles.countdownText}>
                        {formatTime(timeLeftMs)} remaining
                      </Text>
                    </View>
                  </View>
                )}
                {(item.key === 'accepted' || (item as any).stageType === 'ACCEPTED') && item.status === 'done' && (
                  <View style={styles.agentActionRow}>
                    <Button title="View Agent" onPress={() => setShowAgentModal(true)} />
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.actions}>
        <Button title="Back to Agent Hub" onPress={() => navigation.navigate('AgentHub')} />
      </View>

      <Modal visible={showAgentModal} transparent animationType="fade" onRequestClose={() => setShowAgentModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowAgentModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <TouchableOpacity
              style={styles.modalCloseIcon}
              onPress={() => setShowAgentModal(false)}
              accessibilityLabel="Close"
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Ionicons name="close-outline" size={24} color="#333" />
            </TouchableOpacity>
            <Text variant="h3">Agent Details</Text>
            <View style={styles.avatarSection}>
              <Image source={{ uri: agent.avatarUrl }} style={styles.avatarImage} />
            </View>
            <View style={styles.modalRow}>
              <Text variant="body" style={styles.modalLabel}>Name</Text>
              <Text variant="body" style={styles.modalValue}>{agent.name}</Text>
            </View>
            
            <View style={styles.modalRow}>
              <Text variant="body" style={styles.modalLabel}>Phone</Text>
              <Text variant="body" style={styles.modalValue}>{agent.phone}</Text>
            </View>
            <View style={styles.modalRow}>
              <Text variant="body" style={styles.modalLabel}>Completed</Text>
              <Text variant="body" style={styles.modalValue}>{agent.completedOrders}</Text>
            </View>
            <View style={styles.modalRow}>
              <Text variant="body" style={styles.modalLabel}>Since</Text>
              <Text variant="body" style={styles.modalValue}>{agent.since}</Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F2',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerRow: {
    marginBottom: 12,
  },
  title: {
    marginBottom: 4,
    color: '#2E2E2E',
  },
  timelineList: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  leftCol: {
    width: 28,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#C9CED6',
    backgroundColor: '#FFFFFF',
  },
  dotActive: {
    backgroundColor: '#2C5AA0',
    borderColor: '#2C5AA0',
  },
  dotInactive: {
    backgroundColor: '#FFFFFF',
  },
  dotCurrent: {
    shadowColor: '#2C5AA0',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 3,
  },
  vline: {
    width: 2,
    flexGrow: 1,
    minHeight: 36,
    marginTop: 4,
    borderRadius: 1,
  },
  vlineActive: {
    backgroundColor: '#2C5AA0',
  },
  vlineInactive: {
    backgroundColor: '#D8DDE6',
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cardCurrent: {
    borderColor: '#2C5AA0',
    shadowColor: '#2C5AA0',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    color: '#2E2E2E',
    marginBottom: 4,
    fontWeight: '600',
  },
  actions: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  agentActionRow: {
    marginTop: 8,
  },
  countdownRow: {
    marginTop: 8,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#D8DDE6',
    backgroundColor: '#F6F9FE',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  countdownText: {
    marginLeft: 6,
    color: '#2C5AA0',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  modalTitle: {
    color: '#333',
    marginBottom: 10,
  },
  agentName: {
    color: '#333',
    marginBottom: 6,
    alignSelf: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EEE',
    borderWidth: 1,
    borderColor: '#E4E7EC',
  },
  modalCloseIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 8,
    borderRadius: 18,
    backgroundColor: '#F2F4F7',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  modalLabel: {
    color: '#666',
  },
  modalValue: {
    color: '#2E2E2E',
    fontWeight: '600',
  },
});
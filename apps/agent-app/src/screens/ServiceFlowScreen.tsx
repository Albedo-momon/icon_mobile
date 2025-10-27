import React, { useMemo, useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AgentStackParamList, ServiceType } from '@icon/config';
import { Screen, Text, Button } from '@icon/ui';
import { api } from '@icon/api';
import { useAgent } from '../providers/AgentProvider';
import { CARD_COLORS } from '../components/theme'
import BottomNavBar from '../components/BottomNavBar';
import { Ionicons } from '@expo/vector-icons';

export type ServiceFlowNav = StackNavigationProp<AgentStackParamList, 'ServiceFlow'>;
export type ServiceFlowRoute = RouteProp<AgentStackParamList, 'ServiceFlow'>;

interface Props {
  navigation: ServiceFlowNav;
  route: ServiceFlowRoute;
}

type StageKey = 'ACCEPT' | 'ETA' | 'START_VISIT' | 'DIAGNOSIS' | 'REPAIR' | 'END_VISIT' | 'BUILD' | 'INSTALL' | 'QA' | 'COMPLETED';
interface TimelineEvent { id: string; type: StageKey | 'CANCELLED' | 'REASSIGN'; description?: string; timestamp: string; actor: 'AGENT'|'ADMIN'|'USER'; }

const SERVICE_FLOWS: Record<ServiceType, StageKey[]> = {
  IN_HOUSE: ['ACCEPT', 'ETA', 'START_VISIT', 'DIAGNOSIS', 'REPAIR', 'END_VISIT', 'COMPLETED'],
  IN_SHOP: ['ACCEPT', 'DIAGNOSIS', 'REPAIR', 'COMPLETED'],
  PC_BUILD: ['ACCEPT', 'BUILD', 'INSTALL', 'QA', 'COMPLETED'],
};

const StageLabel: Record<StageKey, string> = {
  ACCEPT: 'Accept Request',
  ETA: 'Set ETA',
  START_VISIT: 'Start Visit',
  DIAGNOSIS: 'Diagnosis',
  REPAIR: 'Repair',
  END_VISIT: 'End Visit',
  BUILD: 'Build',
  INSTALL: 'Install',
  QA: 'QA',
  COMPLETED: 'Completed',
};

// Common diagnosis options shown as checkboxes in the modal
const DIAGNOSIS_OPTIONS: string[] = [
  'Display Issue',
  'Battery/Power',
  'Storage/Drive',
  'OS/Software',
  'Network',
  'Peripheral',
];

// Common install options shown as checkboxes in the modal
const INSTALL_OPTIONS: string[] = [
  'Mount Hardware',
  'Connect Cables',
  'Install OS',
  'Setup Drivers',
  'Configure BIOS',
  'Cable Management',
];

const ServiceFlowScreen: React.FC<Props> = ({ navigation, route }) => {
  const { config } = useAgent();
  const { requestId, serviceType, etaMinutes } = route.params;
  const stages = useMemo(() => SERVICE_FLOWS[serviceType], [serviceType]);

  const indexOfStage = (key: StageKey) => stages.findIndex(s => s === key);
  const initialIndex = useMemo(() => {
    if (serviceType === 'IN_HOUSE') {
      const idxEta = indexOfStage('ETA');
      return idxEta >= 0 ? idxEta : 0;
    }
    return 0;
  }, [serviceType, stages]);

  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);

  // Modal state for per-step confirmation
  const [isStepModalOpen, setStepModalOpen] = useState<boolean>(false);
  const [pendingStage, setPendingStage] = useState<StageKey | null>(null);

  // Diagnosis modal state
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>([]);
  const [otherSelected, setOtherSelected] = useState<boolean>(false);
  const [otherText, setOtherText] = useState<string>('');

  // Install modal state
  const [selectedInstallations, setSelectedInstallations] = useState<string[]>([]);
  const [installOtherSelected, setInstallOtherSelected] = useState<boolean>(false);
  const [installOtherText, setInstallOtherText] = useState<string>('');

  const [etaTargetTs, setEtaTargetTs] = useState<number | null>(null);
  const [timeLeftSec, setTimeLeftSec] = useState<number>(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (serviceType === 'IN_HOUSE' && typeof etaMinutes === 'number' && etaMinutes > 0) {
      const target = Date.now() + etaMinutes * 60 * 1000;
      setEtaTargetTs(target);
      const etaEvent = {
        id: `${requestId}-eta-${Date.now()}`,
        type: 'ETA' as const,
        description: `ETA set to ${etaMinutes} minutes`,
        timestamp: new Date().toISOString(),
        actor: 'AGENT' as const,
      };
      setTimeline(prev => [...prev, etaEvent]);
      // Persist to shared timeline
      try { api.timeline.addEvent(requestId, etaEvent); } catch {}
      const tick = () => {
        const secs = Math.max(Math.ceil((target - Date.now()) / 1000), 0);
        setTimeLeftSec(secs);
      };
      tick();
      timerRef.current = setInterval(tick, 1000) as unknown as number;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [serviceType, etaMinutes, requestId]);

  const formatTime = (seconds: number) => {
    const s = seconds % 60;
    const mTotal = Math.floor(seconds / 60);
    const m = mTotal % 60;
    const h = Math.floor(mTotal / 60);
    const pad = (n: number) => String(n).padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  };

  // Request advancing to the next stage via modal
  const advance = () => {
    const nextIndex = Math.min(currentIndex + 1, stages.length - 1);
    const nextStage = stages[nextIndex];
    setPendingStage(nextStage);
    setStepModalOpen(true);
  };

  // Request starting visit via modal
  const startVisit = () => {
    setPendingStage('START_VISIT');
    setStepModalOpen(true);
  };

  // Apply a stage change (after confirmation)
  const applyStage = (stage: StageKey) => {
    if (stage === 'START_VISIT') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Hide ETA countdown and button after starting the visit
      setEtaTargetTs(null);
      setTimeLeftSec(0);
      const idx = indexOfStage('START_VISIT');
      if (idx >= 0) {
        setCurrentIndex(idx);
      }
      const evt = {
        id: `${requestId}-${Date.now()}`,
        type: 'START_VISIT' as const,
        description: 'Started visit',
        timestamp: new Date().toISOString(),
        actor: 'AGENT' as const,
      };
      setTimeline(prev => [...prev, evt]);
      try { api.timeline.addEvent(requestId, evt); } catch {}
      return;
    }
    if (stage === 'DIAGNOSIS') {
      const idx = indexOfStage('DIAGNOSIS');
      if (idx >= 0) {
        setCurrentIndex(idx);
      }
      const descList = selectedDiagnoses.length ? selectedDiagnoses.join(', ') : 'No selections';
      const evt: TimelineEvent = {
        id: `${requestId}-${Date.now()}`,
        type: 'DIAGNOSIS',
        description: `Diagnosis: ${descList}`,
        timestamp: new Date().toISOString(),
        actor: 'AGENT',
      };
      setTimeline(prev => [...prev, evt]);
      try { api.timeline.addEvent(requestId, evt); } catch {}
      // Reset diagnosis modal state after applying
      setSelectedDiagnoses([]);
      setOtherSelected(false);
      setOtherText('');
      return;
    }
    const idx = indexOfStage(stage);
    if (idx >= 0) {
      setCurrentIndex(idx);
    }
    if (stage === 'INSTALL') {
      const descList = selectedInstallations.length ? selectedInstallations.join(', ') : 'No selections';
      const evt: TimelineEvent = {
        id: `${requestId}-${Date.now()}`,
        type: 'INSTALL',
        description: `Install: ${descList}`,
        timestamp: new Date().toISOString(),
        actor: 'AGENT',
      };
      setTimeline(prev => [...prev, evt]);
      try { api.timeline.addEvent(requestId, evt); } catch {}
      // Reset install modal state after applying
      setSelectedInstallations([]);
      setInstallOtherSelected(false);
      setInstallOtherText('');
      return;
    }
    const evt: TimelineEvent = {
      id: `${requestId}-${Date.now()}`,
      type: stage,
      description: `Moved to ${StageLabel[stage]}`,
      timestamp: new Date().toISOString(),
      actor: 'AGENT',
    };
    setTimeline(prev => [...prev, evt]);
    try { api.timeline.addEvent(requestId, evt); } catch {}
  };

  const closeStepModal = () => {
    setStepModalOpen(false);
    setPendingStage(null);
  };

  const confirmPendingStage = () => {
    if (!pendingStage) {
      setStepModalOpen(false);
      return;
    }
    applyStage(pendingStage);
    setStepModalOpen(false);
    setPendingStage(null);
  };

  // Diagnosis selection helpers
  const toggleDiagnosis = (opt: string) => {
    setSelectedDiagnoses(prev => (
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    ));
  };
  const toggleOther = () => setOtherSelected(prev => !prev);
  const addOtherDiagnosis = () => {
    const t = otherText.trim();
    if (!t) return;
    setSelectedDiagnoses(prev => (prev.includes(t) ? prev : [...prev, t]));
    setOtherText('');
  };

  // Install selection helpers
  const toggleInstallOption = (opt: string) => {
    setSelectedInstallations(prev => (
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    ));
  };
  const toggleInstallOther = () => setInstallOtherSelected(prev => !prev);
  const addInstallOther = () => {
    const t = installOtherText.trim();
    if (!t) return;
    setSelectedInstallations(prev => (prev.includes(t) ? prev : [...prev, t]));
    setInstallOtherText('');
  };

  const openTimeline = () => {
    navigation.navigate('Timeline', { requestId, events: timeline });
  };

  return (
    <Screen backgroundColor="#FAF8F2" style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 90 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <TouchableOpacity onPress={() => navigation.navigate('Requests')} style={styles.backButton} accessibilityLabel="Back to Requests">
              <Ionicons name="arrow-back-outline" size={22} color="#000" />
            </TouchableOpacity>
            <Text variant="h2" style={{ color: '#333' }}>Service Flow</Text>
          </View>
          <Text variant="caption" style={[styles.subtitle, { color: CARD_COLORS.caption }]}>Request {requestId}</Text>
          <Text variant="caption" style={[styles.subtitle, { color: CARD_COLORS.caption }]}>Type: {serviceType.replace('_', ' ')}</Text>
          <Text variant="caption" style={[styles.subtitle, { color: CARD_COLORS.caption }]}>{config.mockMode ? 'Mock Mode' : 'Live'}</Text>
        </View>

        <View style={styles.flowCard}>
          {serviceType === 'IN_HOUSE' && etaTargetTs && currentIndex < indexOfStage('START_VISIT') && (
            <View style={styles.etaCard}>
              <Text variant="h3">Arriving in</Text>
              <Text variant="h2" style={styles.etaCountdown}>{formatTime(timeLeftSec)}</Text>
              <View style={styles.etaActions}>
                <Button title="Start Visit" variant="primary" size="small" onPress={startVisit} />
              </View>
            </View>
          )}

          {stages.map((stage, idx) => (
            <View key={stage} style={styles.stageRow}>
              <View style={[styles.stageMarker, idx <= currentIndex ? styles.stageActive : styles.stageInactive]} />
              <View style={styles.stageContent}>
                <Text variant="h3" numberOfLines={1}>{StageLabel[stage]}</Text>
                <Text variant="caption">{idx < currentIndex ? 'Done' : idx === currentIndex ? 'Current' : 'Pending'}</Text>
              </View>
            </View>
          ))}

          <View style={styles.actions}>
            <Button title="Advance" variant="primary" size="small" onPress={advance} style={{ flex: 1, marginRight: 8 }} />
            <Button title="View Timeline" variant="secondary" size="small" onPress={openTimeline} style={{ flex: 1 }} />
          </View>
        </View>

      </ScrollView>

      {isStepModalOpen && (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <TouchableOpacity onPress={closeStepModal} style={styles.modalClose} accessibilityLabel="Close">
              <Ionicons name="close-outline" size={22} color="#333" />
            </TouchableOpacity>
            <Text variant="h3" style={styles.modalTitle}>{pendingStage ? StageLabel[pendingStage] : 'Confirm'}</Text>
            <Text variant="body" style={styles.modalText}>Confirm this step to proceed.</Text>

            {pendingStage === 'DIAGNOSIS' && (
              <View style={styles.modalSection}>
                {DIAGNOSIS_OPTIONS.map(opt => (
                  <TouchableOpacity key={opt} style={styles.checkboxRow} onPress={() => toggleDiagnosis(opt)}>
                    <Ionicons
                      name={selectedDiagnoses.includes(opt) ? 'checkbox-outline' : 'square-outline'}
                      size={22}
                      color="#333"
                      style={styles.checkboxIcon}
                    />
                    <Text variant="body" style={styles.checkboxLabel}>{opt}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.checkboxRow} onPress={toggleOther}>
                  <Ionicons
                    name={otherSelected ? 'checkbox-outline' : 'square-outline'}
                    size={22}
                    color="#333"
                    style={styles.checkboxIcon}
                  />
                  <Text variant="body" style={styles.checkboxLabel}>Other</Text>
                </TouchableOpacity>

                {otherSelected && (
                  <View style={styles.otherInputRow}>
                    <TextInput
                      style={styles.otherInput}
                      value={otherText}
                      onChangeText={setOtherText}
                      placeholder="Enter custom diagnosis"
                    />
                    <Button title="Add" variant="secondary" size="small" onPress={addOtherDiagnosis} style={styles.otherAddBtn} />
                  </View>
                )}

                {selectedDiagnoses.length > 0 ? (
                  <View style={styles.selectedPreview}>
                    <Text variant="caption" style={styles.previewLabel}>Selected</Text>
                    <View style={styles.previewChips}>
                      {selectedDiagnoses.map(item => (
                        <View key={item} style={styles.chip}>
                          <Text variant="caption" style={styles.chipText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : (
                  <Text variant="caption" style={styles.previewEmpty}>No selections yet</Text>
                )}
              </View>
            )}

            {pendingStage === 'INSTALL' && (
              <View style={styles.modalSection}>
                {INSTALL_OPTIONS.map(opt => (
                  <TouchableOpacity key={opt} style={styles.checkboxRow} onPress={() => toggleInstallOption(opt)}>
                    <Ionicons
                      name={selectedInstallations.includes(opt) ? 'checkbox-outline' : 'square-outline'}
                      size={22}
                      color="#333"
                      style={styles.checkboxIcon}
                    />
                    <Text variant="body" style={styles.checkboxLabel}>{opt}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity style={styles.checkboxRow} onPress={toggleInstallOther}>
                  <Ionicons
                    name={installOtherSelected ? 'checkbox-outline' : 'square-outline'}
                    size={22}
                    color="#333"
                    style={styles.checkboxIcon}
                  />
                  <Text variant="body" style={styles.checkboxLabel}>Other</Text>
                </TouchableOpacity>

                {installOtherSelected && (
                  <View style={styles.otherInputRow}>
                    <TextInput
                      style={styles.otherInput}
                      value={installOtherText}
                      onChangeText={setInstallOtherText}
                      placeholder="Enter custom installation task"
                    />
                    <Button title="Add" variant="secondary" size="small" onPress={addInstallOther} style={styles.otherAddBtn} />
                  </View>
                )}

                {selectedInstallations.length > 0 ? (
                  <View style={styles.selectedPreview}>
                    <Text variant="caption" style={styles.previewLabel}>Selected</Text>
                    <View style={styles.previewChips}>
                      {selectedInstallations.map(item => (
                        <View key={item} style={styles.chip}>
                          <Text variant="caption" style={styles.chipText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : (
                  <Text variant="caption" style={styles.previewEmpty}>No selections yet</Text>
                )}
              </View>
            )}

            <Button title="Confirm" variant="primary" onPress={confirmPendingStage} style={styles.modalConfirm} />
          </View>
        </View>
      )}

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
  flowCard: { backgroundColor: '#fff', margin: 16, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: CARD_COLORS.border, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, overflow: 'hidden' },
  etaCard: { backgroundColor: '#F9FBFF', borderColor: CARD_COLORS.border, borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  etaCountdown: { color: '#2E86FF' },
  etaActions: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  stageRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stageMarker: { width: 16, height: 16, borderRadius: 8, marginRight: 12 },
  stageActive: { backgroundColor: '#34C759' },
  stageInactive: { backgroundColor: '#E5E5E5' },
  stageContent: { flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fff' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', zIndex: 20 },
  modalCard: { width: '92%', maxWidth: 560, backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: CARD_COLORS.border, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, elevation: 4 },
  modalClose: { position: 'absolute', top: 8, right: 8, padding: 8 },
  modalTitle: { marginTop: 8, marginRight: 32, color: '#333' },
  modalText: { marginTop: 8, color: CARD_COLORS.caption },
  modalConfirm: { marginTop: 16 },
  modalSection: { marginTop: 12 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  checkboxIcon: { marginRight: 8 },
  checkboxLabel: { color: '#333' },
  otherInputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  otherInput: { flex: 1, borderWidth: 1, borderColor: CARD_COLORS.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#fff' },
  otherAddBtn: { marginLeft: 8 },
  selectedPreview: { marginTop: 12 },
  previewLabel: { color: CARD_COLORS.caption, marginBottom: 6 },
  previewChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { },
  chipText: { color: '#274B91' },
  previewEmpty: { marginTop: 8, color: CARD_COLORS.caption },
});

export default ServiceFlowScreen;
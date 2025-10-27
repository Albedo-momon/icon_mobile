import React from 'react';
import { StyleSheet, View, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Image, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@icon/config';
import { Screen, Text, Button } from '@icon/ui';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../providers/AppProvider';

type AgentRequestNavProp = StackNavigationProp<RootStackParamList, 'AgentRequest'>;

interface Props {
  navigation: AgentRequestNavProp;
}

const CATEGORY_OPTIONS = [
  { key: 'cctv', label: 'CCTV', icon: 'videocam-outline' as const, sub: [
    'No video feed', 'Blurry image', 'Night vision not working', 'Recording failure', 'Power issue', 'Network disconnect', 'Other'
  ] },
  { key: 'laptop', label: 'Laptop', icon: 'laptop-outline' as const, sub: [
    'Won’t turn on', 'Battery drains fast', 'Screen flicker', 'Keyboard not working', 'Overheating', 'Slow performance', 'Other'
  ] },
  { key: 'computer', label: 'Computer', icon: 'tv-outline' as const, sub: [
    'Boot failure', 'Blue screen', 'No display', 'USB ports not working', 'Network issue', 'Frequent crashes', 'Other'
  ] },
  { key: 'other', label: 'Other', icon: 'construct-outline' as const, sub: [] },
];

// Add service type models aligned with agent-flow-summary
const SERVICE_TYPES = [
  { key: 'IN_HOUSE', label: 'In-House' },
  { key: 'IN_SHOP', label: 'In-Shop' },
  { key: 'PC_BUILD', label: 'PC Build' },
] as const;

// New: PC Build specific options
const PC_BUILD_OPTIONS = [
  { key: 'full_build', label: 'Full Build', icon: 'construct-outline' as const, sub: [
    'Gaming build', 'Workstation build', 'Budget build', 'Other'
  ] },
  { key: 'upgrade', label: 'Upgrade', icon: 'arrow-up-circle-outline' as const, sub: [
    'CPU', 'GPU', 'RAM', 'Storage', 'PSU', 'Cooling', 'Other'
  ] },
  { key: 'components', label: 'Components', icon: 'cube-outline' as const, sub: [
    'CPU', 'GPU', 'Motherboard', 'RAM', 'SSD/HDD', 'Case', 'PSU', 'Fans', 'Peripherals', 'Other'
  ] },
  { key: 'custom', label: 'Custom Build', icon: 'settings-outline' as const, sub: [
    'High-end gaming', 'Quiet workstation', 'Small form factor', 'Other'
  ] },
  { key: 'other', label: 'Other', icon: 'ellipsis-horizontal-circle-outline' as const, sub: [] },
] as const;

export default function AgentRequestScreen({ navigation }: Props) {
  const { user } = useApp();
  const [category, setCategory] = React.useState<string | null>(null);
  const [issue, setIssue] = React.useState<string | null>(null);
  const [otherText, setOtherText] = React.useState('');
  const scrollRef = React.useRef<ScrollView>(null);
  // New: selected service type model
  const [serviceType, setServiceType] = React.useState<'IN_HOUSE' | 'IN_SHOP' | 'PC_BUILD' | null>(null);
  // Step state for process timeline
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const randomImageUrl = React.useMemo(() => 'https://i.dummyjson.com/data/products/1/1.jpg', []);
  const serviceLabel = SERVICE_TYPES.find(s => s.key === serviceType)?.label || '';
  const goBackStep = () => {
    setStep(prev => (prev > 1 ? (prev - 1) as 1 | 2 | 3 : prev));
  };

  const onSelectCategory = (key: string) => {
    setCategory(key);
    setIssue(null);
    if (key !== 'other') setOtherText('');
  };

  // Use appropriate options list based on selected service type
  const optionsList = serviceType === 'PC_BUILD' ? PC_BUILD_OPTIONS : CATEGORY_OPTIONS;
  const current = optionsList.find(c => c.key === category);

  const isPCBuildQuick = serviceType === 'PC_BUILD' && (category === 'full_build' || category === 'custom');

  const canSubmit = !!serviceType && !!category && (
    category === 'other'
      ? otherText.trim().length > 0
      : isPCBuildQuick
        ? true
        : !!issue && (issue === 'Other' ? otherText.trim().length > 0 : true)
  );

  // Require address when service type is In-House
  const addressRequired = serviceType === 'IN_HOUSE';
  const hasAddress = !!(user as any)?.address && !!(user as any)?.address.trim();
  const canSubmitRequest = canSubmit && (!addressRequired || hasAddress);

  const submit = () => {
    if (addressRequired && !hasAddress) {
      Alert.alert(
        'Address Required',
        'Please add your address in Profile to request a home visit.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Profile', onPress: () => navigation.navigate('Profile') },
        ]
      );
      return;
    }
    // Navigate to AgentStatus with selected model and request details
    navigation.navigate('AgentStatus', {
      requestId: 'mock-' + Date.now(),
      serviceType: serviceType || undefined,
      category: category || undefined,
      issueTitle: issue || (category === 'other' ? 'Other' : undefined),
      issueNotes: otherText.trim() || undefined,
    });
  };

  return (
    <Screen style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={64}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets
          ref={scrollRef}
        >
          {/* Timeline: numbers only 1-2-3 */}
          <View style={styles.timelineContainer}>
            {[1, 2, 3].map(idx => {
              const status = idx < step ? 'done' : idx === step ? 'current' : 'pending';
              return (
                <React.Fragment key={idx}>
                  <View
                    style={[
                      styles.timelineDot,
                      status === 'current' && styles.timelineDotCurrent,
                      status === 'done' && styles.timelineDotDone,
                    ]}
                  >
                    <Text
                      variant="caption"
                      style={StyleSheet.flatten([
                        styles.timelineDotLabel,
                        status === 'current' && styles.timelineDotLabelActive,
                      ])}
                    >
                      {idx}
                    </Text>
                  </View>
                  {idx < 3 && (
                    <View
                      style={[
                        styles.timelineConnector,
                        step > idx && styles.timelineConnectorActive,
                      ]}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </View>

          {/* Step 1: ONLY service type options */}
          {step === 1 && (
            <View style={styles.stepOneContainer}>
              <View style={styles.typeList}>
                {SERVICE_TYPES.map(opt => {
                  const selected = serviceType === opt.key;
                  const icon = opt.key === 'IN_HOUSE' ? 'home-outline' : opt.key === 'IN_SHOP' ? 'storefront-outline' : 'construct-outline';
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={StyleSheet.flatten([styles.typeRow, selected && styles.typeRowSelected])}
                      onPress={() => { setServiceType(opt.key); setStep(2); }}
                      accessibilityLabel={`Select ${opt.label}`}
                    >
                      <View style={styles.typeRowLeft}>
                        <Ionicons name={icon as any} size={20} color={selected ? '#FAF8F2' : '#2E2E2E'} />
                        <Text
                          variant="body"
                          style={StyleSheet.flatten([styles.typeRowLabel, selected && styles.typeRowLabelSelected])}
                          numberOfLines={1}
                        >
                          {opt.label}
                        </Text>
                      </View>
                      <Ionicons name={selected ? 'checkmark-circle-outline' : 'chevron-forward-outline'} size={20} color={selected ? '#FAF8F2' : '#2E2E2E'} />
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.bannerBox}>
                <Image
                  source={{ uri: randomImageUrl }}
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
              </View>
            </View>
          )}

          {/* Step 2: categories and issue */}
          {step === 2 && (
            <>
              <Text variant="h2" style={styles.title}>Select category and issue</Text>
              <View style={styles.categoriesRow}>
                {optionsList.map(opt => {
                  const selected = category === opt.key;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[styles.catChip, selected && styles.catChipSelected]}
                      onPress={() => {
                        onSelectCategory(opt.key);
                        if (serviceType === 'PC_BUILD' && (opt.key === 'full_build' || opt.key === 'custom')) {
                          setIssue(opt.label);
                          setStep(3);
                        }
                      }}
                      accessibilityLabel={`Select ${opt.label}`}
                    >
                      <Ionicons name={opt.icon} size={18} color={selected ? '#FAF8F2' : '#2E2E2E'} />
                      <Text
                        variant="caption"
                        style={StyleSheet.flatten([styles.catLabel, selected && styles.catLabelSelected])}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* Step 3: review & submit */}
          {step === 3 && (
            <>
              <View style={styles.summaryBox}>
                <Text variant="body">Service Type: {serviceLabel}</Text>
                <Text variant="body">Category: {current?.label || category}</Text>
                <Text variant="body">Issue: {issue || (category === 'other' ? 'Other' : '')}</Text>
                {!!otherText && <Text variant="body">Notes: {otherText}</Text>}
              </View>
            </>
          )}

          {step === 2 && category && ((serviceType === 'PC_BUILD' ? (category === 'upgrade' || category === 'components') : category !== 'other')) && (
            <View style={styles.subList}>
              {current?.sub.map(s => {
                const selected = issue === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.subItem, selected && styles.subItemSelected]}
                    onPress={() => {
                      setIssue(s);
                      if (s !== 'Other') setOtherText('');
                    }}
                    accessibilityLabel={`Select issue ${s}`}
                  >
                    <Ionicons name={selected ? 'checkmark-circle-outline' : 'ellipse-outline'} size={18} color={selected ? '#2C5AA0' : '#2E2E2E'} />
                    <Text variant="body" style={styles.subText}>{s}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {step === 2 && category && ((serviceType === 'PC_BUILD' ? (category === 'upgrade' || category === 'components') : category !== 'other')) && issue === 'Other' && (
            <View style={styles.otherBox}>
              <Text variant="body" style={styles.otherLabel}>Describe your issue</Text>
              <TextInput
                placeholder="Type your issue..."
                placeholderTextColor="#888"
                value={otherText}
                onChangeText={setOtherText}
                style={styles.input}
                multiline
                onFocus={() => scrollRef.current?.scrollToEnd({ animated: true })}
                returnKeyType="done"
                blurOnSubmit={false}
              />
            </View>
          )}

          {step === 2 && category === 'other' && (
            <View style={styles.otherBox}>
              <Text variant="body" style={styles.otherLabel}>Describe your issue</Text>
              <TextInput
                placeholder="Type your issue..."
                placeholderTextColor="#888"
                value={otherText}
                onChangeText={setOtherText}
                style={styles.input}
                multiline
                onFocus={() => scrollRef.current?.scrollToEnd({ animated: true })}
                returnKeyType="done"
                blurOnSubmit={false}
              />
            </View>
          )}

          {step === 2 && (
            <View style={styles.actions}>
              <Button title="Back" onPress={goBackStep} />
              <View style={{ height: 8 }} />
              <Button title="Continue" onPress={() => setStep(3)} disabled={!canSubmit} />
            </View>
          )}

          {step === 3 && (
            <View style={styles.actions}>
              <Button title="Back" onPress={goBackStep} />
              <View style={{ height: 8 }} />
              <Button title="Submit Request" onPress={submit} disabled={!canSubmitRequest} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  stepOneContainer: {
    flex: 1,
    minHeight: 0,
  },
  title: {
    color: '#2E2E2E',
    marginBottom: 4,
  },
  subtitle: {
    marginBottom: 12,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D8DDE6',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    marginBottom: 8,
    gap: 6,
  },
  catChipSelected: {
    backgroundColor: '#2C5AA0',
    borderColor: '#2C5AA0',
  },
  catLabel: {
    color: '#2E2E2E',
  },
  catLabelSelected: {
    color: '#FAF8F2',
    fontWeight: '600',
  },
  subList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 12,
    // 3D shadow
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  subItemSelected: {
    backgroundColor: '#F0F7FF',
  },
  subText: {
    marginLeft: 8,
    color: '#2E2E2E',
  },
  otherBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 12,
    // 3D shadow
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  otherLabel: {
    marginBottom: 6,
    color: '#2E2E2E',
  },
  input: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#D8DDE6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#2E2E2E',
    backgroundColor: '#FFFFFF',
    // 3D shadow
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  actions: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  // Review summary box
  summaryBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E7EC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 12,
    // 3D shadow
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  // Timeline styles
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  timelineConnector: {
    width: 16,
    height: 1,
    backgroundColor: '#D8DDE6',
    marginHorizontal: 8,
  },
  timelineConnectorActive: {
    backgroundColor: '#2C5AA0',
  },
  // Numbered dot styles
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D8DDE6',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotCurrent: {
    backgroundColor: '#2C5AA0',
    borderColor: '#2C5AA0',
  },
  timelineDotDone: {
    backgroundColor: '#F0F7FF',
    borderColor: '#2C5AA0',
  },
  timelineDotLabel: {
    color: '#2E2E2E',
    fontWeight: '600',
  },
  timelineDotLabelActive: {
    color: '#FAF8F2',
    fontWeight: '600',
  },
  timelineChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D8DDE6',
    backgroundColor: '#FFFFFF',
  },
  timelineChipCurrent: {
    backgroundColor: '#2C5AA0',
    borderColor: '#2C5AA0',
  },
  timelineChipDone: {
    backgroundColor: '#F0F7FF',
    borderColor: '#2C5AA0',
  },
  timelineChipLabel: {
    color: '#2E2E2E',
  },
  timelineChipLabelActive: {
    color: '#FAF8F2',
    fontWeight: '600',
  },
  typeList: {
    gap: 10,
    width: '100%',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D7D7D7',
    backgroundColor: '#FAF8F2',
    width: '100%',
    // 3D shadow
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  typeRowSelected: {
    backgroundColor: '#2E2E2E',
    borderColor: '#2E2E2E',
  },
  typeRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: '85%',
  },
  typeRowLabel: {
    color: '#2E2E2E',
    fontWeight: '600',
  },
  typeRowLabelSelected: {
    color: '#FAF8F2',
  },
  bannerBox: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7D7D7',
    backgroundColor: '#FFF',
    width: '100%',
    flex: 1,
    flexGrow: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerTitle: {
    color: '#2E2E2E',
    fontWeight: '700',
    marginBottom: 6,
  },
  bannerSubtitle: {
    color: '#5A5A5A',
  },
});
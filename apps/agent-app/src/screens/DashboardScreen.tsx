import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Screen, Text, Button } from '@icon/ui';
import { agentService } from '@icon/api';
import { useAgent } from '../providers/AgentProvider';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AgentStackParamList } from '@icon/config';
import AdminHeader from '../components/AdminHeader';
import StatCard from '../components/StatCard';
import ProgressCard from '../components/ProgressCard';
import BottomNavBar from '../components/BottomNavBar';

const DashboardScreen: React.FC = () => {
  const { agent, setAgent, isLoading, setLoading, config, onboardingComplete } = useAgent();
  const navigation = useNavigation<StackNavigationProp<AgentStackParamList>>();
  const [dashboard, setDashboard] = useState<any | null>(null);

  useEffect(() => {
    if (!onboardingComplete) {
      navigation.replace('OnboardingInfo');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [agentResp, dashResp] = await Promise.all([
          agentService.getCurrentAgent(),
          agentService.getAgentDashboard(),
        ]);
        const agentData = (agentResp as any)?.data || agentResp;
        const dashData = (dashResp as any)?.data || dashResp;
        setAgent(agentData);
        setDashboard(dashData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setAgent, setLoading, onboardingComplete]);

  const completed = Number((dashboard as any)?.completedOrders ?? (agent as any)?.completedOrders ?? 0);
  const pending = Number((dashboard as any)?.pendingOrders ?? 0);
  const total = Math.max(1, completed + pending);
  const progressPct = Math.round((completed / total) * 100);
  const displayName = (agent as any)?.user?.name ?? (agent as any)?.name ?? 'Agent';
  const ratingVal = (agent as any)?.rating;
  const ratingDisplay = typeof ratingVal === 'number' ? Number(ratingVal).toFixed(1) : (ratingVal ?? '—');

  return (
    <Screen  style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View >
          <AdminHeader welcomeName={displayName} onNotifPress={() => navigation.navigate('Notifications')}/>

          {isLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#2E2E2E" />
              <Text variant="caption" style={styles.loaderText}>Loading dashboard...</Text>
            </View>
          ) : (
            <View >
              {/* KPI column */}
              <View style={styles.kpiStack}>
                <StatCard icon="checkbox-outline" value={completed} label="Completed Orders" variant="green" />
                <StatCard icon="time-outline" value={pending} label="Pending Orders" variant="orange" />
                <StatCard icon="star-outline" value={ratingDisplay} label="Rating" variant="purple" />
              </View>
              <View style={styles.kpiRow}>
                  <Button title="Accept Request" variant="primary" size="medium" onPress={() => navigation.navigate('Requests')} />
            </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom nav */}
      <View style={styles.bottomNav}>
        <BottomNavBar onHome={() => navigation.navigate('Dashboard')} onSocial={() => navigation.navigate('Requests')} onNotifications={() => navigation.navigate('Notifications')}
          onProfile={() => navigation.navigate('Profile')}
        />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 56,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  loader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loaderText: {
    color: '#666',
    marginTop: 8,
  },
  kpiRow: {
 
   alignItems: 'center',
  },
  kpiCol: {
    flex: 1,
  },
  pointsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EEF3FB',
    marginBottom: 12,
  },
  pointsTitle: {
    marginBottom: 8,
    color: '#2E2E2E',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  kpiStack: {
    gap: 8,
    marginBottom: 12,
  },
});

export default DashboardScreen;
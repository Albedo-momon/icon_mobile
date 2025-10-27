import React from 'react';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '@icon/config';
import { Screen, Text } from '@icon/ui';
import { useApp } from '../providers/AppProvider';
import { useAuth } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';

type AgentHubNavigationProp = StackNavigationProp<RootStackParamList, 'AgentHub'>;

interface Props {
  navigation: AgentHubNavigationProp;
}

const AgentHubScreen: React.FC<Props> = ({ navigation }) => {
  const { user, setUser } = useApp();
  const { signOut } = useAuth();
  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      Alert.alert('Logged out', 'You have been logged out', [
        { text: 'OK', onPress: () => navigation.navigate('Home') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
      console.error('Logout Error:', error);
    }
  };
  const randomImageUrl = React.useMemo(() => 'https://i.dummyjson.com/data/products/1/1.jpg', []);
  return (
    <Screen style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.topContent}>
          {/* Fun Header with doodle icon and playful title */}
          <View style={styles.heroRow}>
            <View style={styles.doodleBox}>
              <Ionicons name="calendar-outline" size={28} color="#333" />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="h2" style={styles.heroTitle}>Book Appointment</Text>
              <Text variant="caption" color="#666" style={styles.heroSubtitle}>Because your devices deserve spa days too 🛠️✨</Text>
            </View>
          </View>

          {/* Four Action Cards */}
          <View style={styles.cardGrid}>
            <TouchableOpacity style={styles.card} accessibilityLabel="Book Appointment" onPress={() => navigation.navigate('AgentRequest')}>
              <Ionicons name="calendar-outline" size={28} color="#333" />
              <Text variant="body" style={styles.cardText}>Book Agent</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.card} accessibilityLabel="Repair Status" onPress={() => navigation.navigate('AgentStatus')}>
              <Ionicons name="search-outline" size={28} color="#333" />
              <Text variant="body" style={styles.cardText}>Agent Status</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.card} accessibilityLabel="History" onPress={() => navigation.navigate('AgentHistory')}>
              <Ionicons name="pricetag-outline" size={28} color="#333" />
              <Text variant="body" style={styles.cardText}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.card} accessibilityLabel="View Services" onPress={() => navigation.navigate('Services')}>
              <Ionicons name="construct-outline" size={28} color="#333" />
              <Text variant="body" style={styles.cardText}>View Services</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Full-height bottom banner (fills remaining space) */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: randomImageUrl }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
        </View>
      </ScrollView>

      {/* Bottom Bar with icons (same as Home) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.bottomItem} onPress={() => navigation.navigate('Home')} accessibilityLabel="Go to Home">
          <Ionicons name="home-outline" size={22} color="#333" />
          <Text variant="caption" style={styles.bottomLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomItem} onPress={() => user ? navigation.navigate('Profile') : navigation.navigate('Login')} accessibilityLabel="Go to Profile">
          <Ionicons name="person-outline" size={22} color="#333" />
          <Text variant="caption" style={styles.bottomLabel}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomItem} onPress={() => user ? navigation.navigate('AgentHub') : navigation.navigate('Login')} accessibilityLabel="Open Agent hub">
          <Ionicons name="people-outline" size={22} color="#007AFF" />
          <Text variant="caption" style={styles.bottomLabel}>Agent</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bottomItem}
          onPress={() => { user ? handleLogout() : navigation.navigate('Login'); }}
          accessibilityLabel={user ? 'Logout' : 'Login'}
        >
          <Ionicons name={user ? 'log-out-outline' : 'log-in-outline'} size={22} color="#333" />
          <Text variant="caption" style={styles.bottomLabel}>{user ? 'Logout' : 'Login'}</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 120,
    flexGrow: 1,
  },
  topContent: {
    flexGrow: 0,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  doodleBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#eee',
    transform: [{ rotate: '-6deg' }],
  },
  heroTitle: {
    color: '#333',
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  heroSubtitle: {
    marginTop: 4,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 16,
  },
  card: {
    width: '48%',
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    // 3D shadow
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardText: {
    color: '#333',
    marginTop: 10,
    fontWeight: '700',
  },
  bannerContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    zIndex: 100,
    elevation: 8,
  },
  bottomItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomLabel: {
    marginTop: 4,
    color: '#333',
  },
});

export default AgentHubScreen;
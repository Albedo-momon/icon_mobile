import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Alert, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, CMSResponse } from '@icon/config';
import { Screen, Text } from '@icon/ui';
import { cmsService, authService, apiClient } from '@icon/api';
import { useApp } from '../providers/AppProvider';
import { useAuth } from '@clerk/clerk-expo';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { config, isLoading, setLoading, user, setUser } = useApp();
  const [cmsData, setCmsData] = useState<CMSResponse | null>(null);
  const bannerScrollRef = useRef<ScrollView | null>(null);
  const [activeBanner, setActiveBanner] = useState(0);
  const { width } = Dimensions.get('window');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { signOut } = useAuth();

  useEffect(() => {
    loadCMSData();
  }, []);

  const loadCMSData = async () => {
    try {
      setLoading(true);
      const response = await cmsService.getCMSData();
      setCmsData(response);
    } catch (error) {
      Alert.alert('Error', 'Failed to load content');
      console.error('CMS Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Removed CTA handlers; Home no longer shows Browse/Login/Register buttons

  const handleLogout = async () => {
    try {
      setLoading(true);
      // End Clerk session to fully log out
      await signOut();
      await authService.logout();
      apiClient.clearAuthToken();
      setUser(null);
      Alert.alert('Logged out', 'You have been logged out', [
        { text: 'OK', onPress: () => { setDrawerOpen(false); navigation.navigate('Home'); } }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
      console.error('Logout Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Text variant="h3" style={styles.topBarTitle}>ShopApp</Text>
        </View>
        <View style={styles.topBarRight}>
          <TouchableOpacity onPress={() => setDrawerOpen(true)} accessibilityLabel="Open side menu">
            <Ionicons name="menu-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Banner Carousel */}
        {cmsData?.banners && cmsData.banners.length > 0 && (
          <View style={styles.heroSection}>
            <ScrollView
              ref={bannerScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setActiveBanner(index);
              }}
              scrollEventThrottle={16}
            >
              {cmsData.banners.map((banner, idx) => (
                <Image
                  key={banner.id}
                  source={{ uri: banner.imageUrl }}
                  style={[styles.bannerImage, { width: width - 32 }]}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            <View style={styles.dots}>
              {cmsData.banners.map((_, idx) => (
                <View
                  key={idx}
                  style={[styles.dot, activeBanner === idx && styles.dotActive]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Best Sellers */}
        {cmsData?.products && cmsData.products.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="h3">Best Sellers</Text>
              <Text variant="caption" color="#666">Top picks from our catalog</Text>
            </View>
            <View style={styles.cardRow}>
              {cmsData.products.slice(0, 3).map((p) => (
                <View key={p.id} style={styles.productCard}>
                  <Image source={{ uri: p.imageUrl }} style={styles.productImage} />
                  <Text variant="body" style={styles.productName}>{p.name}</Text>
                  <Text variant="caption" style={styles.productPrice}>${p.price.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Book Agent CTA (matches sidebar button) */}
        <TouchableOpacity
          style={styles.bookAgentButton}
          onPress={() => { user ? navigation.navigate('AgentHub') : navigation.navigate('Login'); }}
          accessibilityLabel="Book agent"
        >
          <Ionicons name="people-outline" size={20} color="#fff" style={styles.bookAgentIcon} />
          <Text variant="body" style={styles.bookAgentText}>BOOK AGENT</Text>
        </TouchableOpacity>

        {/* Laptop Collection */}
        {cmsData?.products && cmsData.products.some(p => p.category?.toLowerCase() === 'laptops') && (
          <View style={styles.section}>
            <Text variant="h3">Laptop Collection</Text>
            <View style={styles.cardRow}>
              {cmsData.products.filter(p => p.category?.toLowerCase() === 'laptops').slice(0, 2).map((p) => (
                <View key={p.id} style={[styles.productCard, { flex: 1 }]}> 
                  <Image source={{ uri: p.imageUrl }} style={styles.productImage} />
                  <Text variant="body" style={styles.productName}>{p.name}</Text>
                  <Text variant="caption" style={styles.productPrice}>${p.price.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Special Offers styled like preview, with image */}
        {cmsData?.offers && cmsData.offers.length > 0 && (
          <View style={styles.section}>
            <Text variant="h3">Special Offers</Text>
            <View style={styles.offerCard}>
              {cmsData.offers.slice(0, 2).map((offer) => {
                const relatedProduct = cmsData.products.find(p => offer.title?.toLowerCase().includes(p.name.toLowerCase()));
                return (
                  <View key={offer.id} style={styles.offerRow}>
                    {relatedProduct?.imageUrl ? (
                      <Image source={{ uri: relatedProduct.imageUrl }} style={styles.offerImage} />
                    ) : (
                      <View style={[styles.offerImage, { backgroundColor: '#eee' }]} />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text variant="body" style={styles.offerTitle}>{offer.title}</Text>
                      <Text variant="caption" color="#666">{offer.description}</Text>
                      <View style={styles.offerBadge}><Text variant="caption" style={styles.offerBadgeText}>Limited Time</Text></View>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

      </ScrollView>

      {/* Bottom Bar with icons */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomItem}>
          <Ionicons name="home-outline" size={22} color="#007AFF" />
          <Text variant="caption" style={styles.bottomLabel}>Home</Text>
        </View>
        <TouchableOpacity style={styles.bottomItem} onPress={() => user ? navigation.navigate('Profile') : navigation.navigate('Login')} accessibilityLabel="Go to Profile">
          <Ionicons name="person-outline" size={22} color="#333" />
          <Text variant="caption" style={styles.bottomLabel}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.bottomItem} onPress={() => user ? navigation.navigate('AgentHub') : navigation.navigate('Login')} accessibilityLabel="Open Agent hub">
          <Ionicons name="people-outline" size={22} color="#333" />
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

      {/* Side Drawer */}
      {drawerOpen && (
        <>
          <TouchableOpacity style={styles.drawerOverlay} activeOpacity={1} onPress={() => setDrawerOpen(false)} />
          <View style={[styles.sideDrawer, { width: Math.min(width * 0.8, Math.max(260, width - 24)) }]}>
            <View style={styles.drawerInner}>
              <ScrollView contentContainerStyle={styles.drawerContent}>
                <View style={styles.drawerHeader}>
                  <Text variant="h2" style={styles.drawerTitle}>Menu</Text>
                  <TouchableOpacity
                    style={styles.drawerHeaderBack}
                    onPress={() => {
                      setDrawerOpen(false);
                    }}
                    accessibilityLabel="Go back"
                  >
                    <Ionicons name="arrow-back-outline" size={22} color="#333" />
                    <Text variant="body" style={styles.drawerHeaderBackText}>Back</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.drawerItem} onPress={() => { setDrawerOpen(false); navigation.navigate('Home'); }}>
                  <Ionicons name="home-outline" size={22} color="#007AFF" style={styles.drawerItemIcon} />
                  <Text variant="body" style={styles.drawerItemText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.drawerItem} onPress={() => { setDrawerOpen(false); user ? navigation.navigate('Profile') : navigation.navigate('Login'); }}>
                  <Ionicons name="person-outline" size={22} color="#333" style={styles.drawerItemIcon} />
                  <Text variant="body" style={styles.drawerItemText}>Profile</Text>
                </TouchableOpacity>
                {user ? (
                  <TouchableOpacity style={styles.drawerItem} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color="#333" style={styles.drawerItemIcon} />
                    <Text variant="body" style={styles.drawerItemText}>Logout</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity style={styles.drawerItem} onPress={() => { setDrawerOpen(false); navigation.navigate('Login'); }}>
                      <Ionicons name="log-in-outline" size={22} color="#333" style={styles.drawerItemIcon} />
                      <Text variant="body" style={styles.drawerItemText}>Login</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.drawerItem} onPress={() => { setDrawerOpen(false); navigation.navigate('Register'); }}>
                      <Ionicons name="person-add-outline" size={22} color="#333" style={styles.drawerItemIcon} />
                      <Text variant="body" style={styles.drawerItemText}>Register</Text>
                    </TouchableOpacity>
                  </>
                )}
              </ScrollView>
              <TouchableOpacity
                style={styles.bookAgentButton}
                onPress={() => { setDrawerOpen(false); user ? navigation.navigate('AgentHub') : navigation.navigate('Login'); }}
                accessibilityLabel="Book agent"
              >
                <Ionicons name="people-outline" size={20} color="#fff" style={styles.bookAgentIcon} />
                <Text variant="body" style={styles.bookAgentText}>BOOK AGENT</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 24,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  topBarLeft: { flex: 1, alignItems: 'flex-start' },
  topBarRight: { width: 40, alignItems: 'flex-end' },
  topBarTitle: { textAlign: 'left' },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  heroSection: {
    marginBottom: 16,
  },
  bannerImage: {
    height: 180,
    borderRadius: 8,
    marginRight: 8,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#007AFF',
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  description: {
    marginTop: 10,
    lineHeight: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  productCard: {
    width: '31%',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    // 3D shadow
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  productName: {
    marginBottom: 4,
  },
  productPrice: {
    color: '#007AFF',
    fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E2D9',
    // 3D shadow
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  categoryImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryName: {
    fontWeight: '600',
  },
  offerCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    // 3D shadow
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  offerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  offerImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#ddd',
  },
  offerTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  offerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#ffeded',
    borderRadius: 6,
    marginTop: 4,
  },
  offerBadgeText: {
    color: '#ff4d4f',
  },
  // Actions and button styles removed
  footer: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
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
  sideDrawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    zIndex: 200,
  },
  drawerInner: {
    flex: 1,
    justifyContent: 'space-between',
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.20)',
    zIndex: 150,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drawerTitle: {
    marginTop: 12,
    marginBottom: 12,
  },
  drawerHeaderTitle: {
    flex: 1,
  },
  drawerHeaderBack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerHeaderBackText: {
    marginLeft: 6,
    color: '#2E2E2E',
  },
  drawerHeaderSpacer: {
    flex: 1,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    paddingVertical: 12,
  },
  drawerItemIcon: {
    marginRight: 12,
  },
  drawerItemText: {
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  drawerContent: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  bookAgentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    // 3D shadow
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  bookAgentIcon: {
    marginRight: 14,
  },
  bookAgentText: {
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default HomeScreen;
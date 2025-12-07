import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: string;
  price_coins: number;
  price_gems: number;
  icon: string;
  rarity: string;
}

interface User {
  id: string;
  username: string;
  coins: number;
  gems: number;
  owned_powers: string[];
  owned_skins: string[];
  is_premium: boolean;
  subscription_type: string | null;
}

const RARITY_COLORS: Record<string, string[]> = {
  common: ['#78909c', '#546e7a'],
  rare: ['#42a5f5', '#1e88e5'],
  epic: ['#ab47bc', '#8e24aa'],
  legendary: ['#ffca28', '#ffa000'],
};

const ICON_MAP: Record<string, string> = {
  snowflake: 'snow',
  fire: 'flame',
  shield: 'shield',
  clock: 'time',
  ghost: 'skull',
  crown: 'ribbon',
  flash: 'flash',
  'color-palette': 'color-palette',
};

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'powers' | 'skins' | 'premium'>('powers');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      await fetchShopItems();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShopItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/shop/items`);
      setItems(response.data.items || []);
    } catch (error) {
      console.error('Error fetching shop items:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/api/auth/me?token=${token}`);
      setUser(response.data);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handlePurchase = async (item: ShopItem, currency: 'coins' | 'gems') => {
    const price = currency === 'coins' ? item.price_coins : item.price_gems;
    const userBalance = currency === 'coins' ? user?.coins : user?.gems;
    const currencyName = currency === 'coins' ? 'novcica' : 'dragulja';

    if ((userBalance || 0) < price) {
      Alert.alert('Nedovoljno sredstava', `Nemate dovoljno ${currencyName}`);
      return;
    }

    Alert.alert(
      'Potvrdi kupovinu',
      `Da li zelite da kupite ${item.name} za ${price} ${currencyName}?`,
      [
        { text: 'Otkazi', style: 'cancel' },
        {
          text: 'Kupi',
          onPress: async () => {
            setPurchasing(item.id);
            try {
              const token = await AsyncStorage.getItem('authToken');
              await axios.post(`${API_URL}/api/shop/purchase?token=${token}`, {
                item_id: item.id,
                currency,
              });
              Alert.alert('Uspeh!', `Uspesno ste kupili ${item.name}!`);
              await refreshUser();
            } catch (error: any) {
              Alert.alert('Greska', error.response?.data?.detail || 'Greska pri kupovini');
            } finally {
              setPurchasing(null);
            }
          },
        },
      ]
    );
  };

  const handleSubscribe = async (plan: string) => {
    Alert.alert(
      'Pretplata',
      `Aktiviranje ${plan} pretplate. U pravoj aplikaciji ovde bi bilo povezivanje sa platnim procesorom.`,
      [
        { text: 'Otkazi', style: 'cancel' },
        {
          text: 'Aktiviraj',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('authToken');
              await axios.post(`${API_URL}/api/shop/subscribe?token=${token}`, { plan });
              Alert.alert('Uspeh!', 'Pretplata aktivirana!');
              await refreshUser();
            } catch (error: any) {
              Alert.alert('Greska', error.response?.data?.detail || 'Greska');
            }
          },
        },
      ]
    );
  };

  const isOwned = (item: ShopItem) => {
    if (item.type === 'power') {
      return user?.owned_powers?.includes(item.id);
    } else if (item.type === 'skin') {
      return user?.owned_skins?.includes(item.id);
    }
    return false;
  };

  const filteredItems = items.filter((item) => {
    if (activeTab === 'powers') return item.type === 'power';
    if (activeTab === 'skins') return item.type === 'skin';
    return false;
  });

  if (loading) {
    return (
      <LinearGradient colors={['#0a1628', '#1a3a5c', '#0d2137']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4fc3f7" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0a1628', '#1a3a5c', '#0d2137']} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 10 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4fc3f7" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Prodavnica</Text>
          <View style={styles.currencyContainer}>
            <View style={styles.currencyItem}>
              <Ionicons name="logo-bitcoin" size={18} color="#ffd700" />
              <Text style={styles.currencyText}>{user?.coins || 0}</Text>
            </View>
            <View style={styles.currencyItem}>
              <Ionicons name="diamond" size={18} color="#e040fb" />
              <Text style={styles.currencyText}>{user?.gems || 0}</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'powers' && styles.activeTab]}
            onPress={() => setActiveTab('powers')}
          >
            <Ionicons name="flash" size={20} color={activeTab === 'powers' ? '#4fc3f7' : '#5a7a9a'} />
            <Text style={[styles.tabText, activeTab === 'powers' && styles.activeTabText]}>Moci</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'skins' && styles.activeTab]}
            onPress={() => setActiveTab('skins')}
          >
            <Ionicons name="color-palette" size={20} color={activeTab === 'skins' ? '#4fc3f7' : '#5a7a9a'} />
            <Text style={[styles.tabText, activeTab === 'skins' && styles.activeTabText]}>Skinovi</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'premium' && styles.activeTab]}
            onPress={() => setActiveTab('premium')}
          >
            <Ionicons name="star" size={20} color={activeTab === 'premium' ? '#ffd700' : '#5a7a9a'} />
            <Text style={[styles.tabText, activeTab === 'premium' && styles.activeTabText]}>Premium</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab !== 'premium' ? (
          <View style={styles.itemsGrid}>
            {filteredItems.map((item) => {
              const owned = isOwned(item);
              const colors = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
              const iconName = ICON_MAP[item.icon] || 'help-circle';

              return (
                <View key={item.id} style={styles.itemCard}>
                  <LinearGradient colors={colors} style={styles.itemGradient}>
                    <View style={styles.rarityBadge}>
                      <Text style={styles.rarityText}>{item.rarity.toUpperCase()}</Text>
                    </View>
                    <Ionicons name={iconName as any} size={40} color="#fff" />
                    <Text style={styles.itemName}>{item.name}</Text>
                  </LinearGradient>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemDescription} numberOfLines={2}>
                      {item.description}
                    </Text>
                    {owned ? (
                      <View style={styles.ownedBadge}>
                        <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
                        <Text style={styles.ownedText}>Kupljeno</Text>
                      </View>
                    ) : (
                      <View style={styles.priceButtons}>
                        <TouchableOpacity
                          style={styles.priceButton}
                          onPress={() => handlePurchase(item, 'coins')}
                          disabled={purchasing === item.id}
                        >
                          {purchasing === item.id ? (
                            <ActivityIndicator size="small" color="#ffd700" />
                          ) : (
                            <>
                              <Ionicons name="logo-bitcoin" size={16} color="#ffd700" />
                              <Text style={styles.priceText}>{item.price_coins}</Text>
                            </>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.priceButton}
                          onPress={() => handlePurchase(item, 'gems')}
                          disabled={purchasing === item.id}
                        >
                          <Ionicons name="diamond" size={16} color="#e040fb" />
                          <Text style={styles.priceText}>{item.price_gems}</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          /* Premium Section */
          <View style={styles.premiumSection}>
            {user?.is_premium ? (
              <View style={styles.premiumActive}>
                <Ionicons name="star" size={50} color="#ffd700" />
                <Text style={styles.premiumActiveTitle}>Premium Aktivan!</Text>
                <Text style={styles.premiumActiveText}>
                  Uzivate u svim premium benefitima.
                </Text>
              </View>
            ) : (
              <>
                {/* Basic */}
                <TouchableOpacity
                  style={styles.premiumCard}
                  onPress={() => handleSubscribe('basic')}
                >
                  <LinearGradient
                    colors={['#42a5f5', '#1e88e5']}
                    style={styles.premiumGradient}
                  >
                    <Text style={styles.premiumBadge}>BASIC</Text>
                    <Text style={styles.premiumPrice}>2.99 EUR</Text>
                    <Text style={styles.premiumPeriod}>jednokratno</Text>
                  </LinearGradient>
                  <View style={styles.premiumFeatures}>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark" size={18} color="#4caf50" />
                      <Text style={styles.featureText}>Bez reklama</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark" size={18} color="#4caf50" />
                      <Text style={styles.featureText}>Privatne sobe</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark" size={18} color="#4caf50" />
                      <Text style={styles.featureText}>Osnovna statistika</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Pro Monthly */}
                <TouchableOpacity
                  style={[styles.premiumCard, styles.premiumRecommended]}
                  onPress={() => handleSubscribe('pro_monthly')}
                >
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>PREPORUCENO</Text>
                  </View>
                  <LinearGradient
                    colors={['#ab47bc', '#8e24aa']}
                    style={styles.premiumGradient}
                  >
                    <Text style={styles.premiumBadge}>PRO</Text>
                    <Text style={styles.premiumPrice}>4.99 EUR</Text>
                    <Text style={styles.premiumPeriod}>mesecno</Text>
                  </LinearGradient>
                  <View style={styles.premiumFeatures}>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark" size={18} color="#4caf50" />
                      <Text style={styles.featureText}>Sve iz BASIC</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark" size={18} color="#4caf50" />
                      <Text style={styles.featureText}>Premium skinovi</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark" size={18} color="#4caf50" />
                      <Text style={styles.featureText}>XP Boost (+50%)</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark" size={18} color="#4caf50" />
                      <Text style={styles.featureText}>Prioritetno matchmaking</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark" size={18} color="#4caf50" />
                      <Text style={styles.featureText}>Specijalna znacka</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Pro Yearly */}
                <TouchableOpacity
                  style={styles.premiumCard}
                  onPress={() => handleSubscribe('pro_yearly')}
                >
                  <LinearGradient
                    colors={['#ffca28', '#ffa000']}
                    style={styles.premiumGradient}
                  >
                    <Text style={[styles.premiumBadge, { color: '#000' }]}>PRO YEARLY</Text>
                    <Text style={[styles.premiumPrice, { color: '#000' }]}>39.99 EUR</Text>
                    <Text style={[styles.premiumPeriod, { color: '#333' }]}>godisnje (usteda 33%)</Text>
                  </LinearGradient>
                  <View style={styles.premiumFeatures}>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark" size={18} color="#4caf50" />
                      <Text style={styles.featureText}>Sve iz PRO</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark" size={18} color="#4caf50" />
                      <Text style={styles.featureText}>Ekskluzivni godisnji skin</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="checkmark" size={18} color="#ffd700" />
                      <Text style={[styles.featureText, { color: '#ffd700' }]}>Usteda 20 EUR!</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  currencyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  currencyText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  activeTab: {
    backgroundColor: 'rgba(79, 195, 247, 0.2)',
  },
  tabText: {
    color: '#5a7a9a',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#4fc3f7',
  },
  itemsGrid: {
    gap: 16,
  },
  itemCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  itemGradient: {
    alignItems: 'center',
    paddingVertical: 24,
    position: 'relative',
  },
  rarityBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rarityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  itemName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
  },
  itemInfo: {
    padding: 16,
  },
  itemDescription: {
    color: '#a8d4ff',
    fontSize: 14,
    marginBottom: 12,
  },
  ownedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 12,
  },
  ownedText: {
    color: '#4caf50',
    fontWeight: '600',
  },
  priceButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  priceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  priceText: {
    color: '#fff',
    fontWeight: '600',
  },
  premiumSection: {
    gap: 20,
  },
  premiumActive: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 20,
  },
  premiumActiveTitle: {
    color: '#ffd700',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
  },
  premiumActiveText: {
    color: '#a8d4ff',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  premiumCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  premiumRecommended: {
    borderWidth: 2,
    borderColor: '#ab47bc',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -1,
    right: 20,
    backgroundColor: '#ab47bc',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    zIndex: 1,
  },
  recommendedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  premiumGradient: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  premiumBadge: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  premiumPrice: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    marginTop: 8,
  },
  premiumPeriod: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  premiumFeatures: {
    padding: 16,
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    color: '#a8d4ff',
    fontSize: 14,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient/build/LinearGradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLanguage } from '../../src/context/LanguageContext';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface User {
  id: string;
  username: string;
  email: string;
  coins: number;
  gems: number;
  is_premium: boolean;
  subscription_type: string | null;
  owned_powers: string[];
  owned_skins: string[];
  equipped_skin: string;
  stats: {
    games_played: number;
    games_won: number;
    times_frozen: number;
    times_unfrozen_others: number;
    times_as_mraz: number;
    total_play_time: number;
    longest_survival: number;
    xp: number;
    level: number;
  };
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, locale, setLocale, languages } = useLanguage();
  
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      
      // Refresh user data from server
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const response = await axios.get(`${API_URL}/api/auth/me?token=${token}`);
        setUser(response.data);
        await AsyncStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout'),
      t('profile.logoutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.logout'),
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('user');
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleLanguageChange = async (langCode: string) => {
    await setLocale(langCode);
    setLanguageModalVisible(false);
  };

  const getXpProgress = () => {
    if (!user?.stats) return 0;
    const xpForNextLevel = user.stats.level * 100;
    const currentLevelXp = user.stats.xp % xpForNextLevel;
    return (currentLevelXp / xpForNextLevel) * 100;
  };

  const getCurrentLanguage = () => {
    const lang = languages.find(l => l.code === locale);
    return lang ? `${lang.flag} ${lang.name}` : 'Srpski';
  };

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
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={user?.is_premium ? ['#ffd700', '#ffa000'] : ['#4fc3f7', '#0288d1']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user?.username?.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            {user?.is_premium && (
              <View style={styles.premiumBadge}>
                <Ionicons name="star" size={14} color="#ffd700" />
              </View>
            )}
          </View>
          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          
          {/* Level Progress */}
          <View style={styles.levelContainer}>
            <View style={styles.levelInfo}>
              <Text style={styles.levelText}>{t('leaderboard.level')} {user?.stats?.level || 1}</Text>
              <Text style={styles.xpText}>{user?.stats?.xp || 0} XP</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${getXpProgress()}%` }]} />
            </View>
          </View>
        </View>

        {/* Currency */}
        <View style={styles.currencySection}>
          <View style={styles.currencyCard}>
            <Ionicons name="logo-bitcoin" size={28} color="#ffd700" />
            <Text style={styles.currencyValue}>{user?.coins || 0}</Text>
            <Text style={styles.currencyLabel}>{t('profile.coins')}</Text>
          </View>
          <View style={styles.currencyCard}>
            <Ionicons name="diamond" size={28} color="#e040fb" />
            <Text style={styles.currencyValue}>{user?.gems || 0}</Text>
            <Text style={styles.currencyLabel}>{t('profile.gems')}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.stats')}</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="game-controller" size={24} color="#4fc3f7" />
              <Text style={styles.statValue}>{user?.stats?.games_played || 0}</Text>
              <Text style={styles.statLabel}>{t('profile.gamesPlayed')}</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={24} color="#ffd700" />
              <Text style={styles.statValue}>{user?.stats?.games_won || 0}</Text>
              <Text style={styles.statLabel}>{t('profile.gamesWon')}</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="snow" size={24} color="#29b6f6" />
              <Text style={styles.statValue}>{user?.stats?.times_frozen || 0}</Text>
              <Text style={styles.statLabel}>{t('profile.timesFrozen')}</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="flame" size={24} color="#ff7043" />
              <Text style={styles.statValue}>{user?.stats?.times_unfrozen_others || 0}</Text>
              <Text style={styles.statLabel}>{t('profile.timesUnfrozen')}</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="skull" size={24} color="#ab47bc" />
              <Text style={styles.statValue}>{user?.stats?.times_as_mraz || 0}</Text>
              <Text style={styles.statLabel}>{t('profile.timesAsMraz')}</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color="#4caf50" />
              <Text style={styles.statValue}>{user?.stats?.longest_survival || 0}s</Text>
              <Text style={styles.statLabel}>{t('profile.record')}</Text>
            </View>
          </View>
        </View>

        {/* Inventory */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.inventory')}</Text>
          <View style={styles.inventoryCard}>
            <View style={styles.inventoryItem}>
              <Ionicons name="flash" size={22} color="#4fc3f7" />
              <Text style={styles.inventoryText}>{t('profile.powers')}</Text>
              <Text style={styles.inventoryCount}>{user?.owned_powers?.length || 0}</Text>
            </View>
            <View style={styles.inventorySeparator} />
            <View style={styles.inventoryItem}>
              <Ionicons name="color-palette" size={22} color="#e040fb" />
              <Text style={styles.inventoryText}>{t('profile.skins')}</Text>
              <Text style={styles.inventoryCount}>{user?.owned_skins?.length || 0}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          {/* Language Selection */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setLanguageModalVisible(true)}
          >
            <Ionicons name="language-outline" size={22} color="#4fc3f7" />
            <Text style={styles.actionText}>{t('profile.language')}</Text>
            <Text style={styles.languageValue}>{getCurrentLanguage()}</Text>
            <Ionicons name="chevron-forward" size={22} color="#5a7a9a" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="settings-outline" size={22} color="#a8d4ff" />
            <Text style={styles.actionText}>{t('profile.settings')}</Text>
            <Ionicons name="chevron-forward" size={22} color="#5a7a9a" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="help-circle-outline" size={22} color="#a8d4ff" />
            <Text style={styles.actionText}>{t('profile.help')}</Text>
            <Ionicons name="chevron-forward" size={22} color="#5a7a9a" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="document-text-outline" size={22} color="#a8d4ff" />
            <Text style={styles.actionText}>{t('profile.terms')}</Text>
            <Ionicons name="chevron-forward" size={22} color="#5a7a9a" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color="#ef5350" />
            <Text style={[styles.actionText, { color: '#ef5350' }]}>{t('profile.logout')}</Text>
            <Ionicons name="chevron-forward" size={22} color="#ef5350" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('profile.selectLanguage')}</Text>
            
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  locale === lang.code && styles.languageOptionActive
                ]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <Text style={styles.languageFlag}>{lang.flag}</Text>
                <Text style={[
                  styles.languageName,
                  locale === lang.code && styles.languageNameActive
                ]}>
                  {lang.name}
                </Text>
                {locale === lang.code && (
                  <Ionicons name="checkmark-circle" size={24} color="#4fc3f7" />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: '700',
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1a1a2e',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffd700',
  },
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#a8d4ff',
    marginBottom: 16,
  },
  levelContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  levelText: {
    color: '#4fc3f7',
    fontSize: 16,
    fontWeight: '700',
  },
  xpText: {
    color: '#a8d4ff',
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4fc3f7',
    borderRadius: 4,
  },
  currencySection: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  currencyCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  currencyValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  currencyLabel: {
    color: '#a8d4ff',
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '31%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    color: '#a8d4ff',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  inventoryCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
  },
  inventoryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inventorySeparator: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  inventoryText: {
    flex: 1,
    color: '#a8d4ff',
    fontSize: 14,
  },
  inventoryCount: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  actionText: {
    flex: 1,
    color: '#a8d4ff',
    fontSize: 16,
  },
  languageValue: {
    color: '#4fc3f7',
    fontSize: 14,
    marginRight: 8,
  },
  logoutButton: {
    marginTop: 8,
    backgroundColor: 'rgba(239, 83, 80, 0.1)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#0d2137',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.3)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 24,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  languageOptionActive: {
    backgroundColor: 'rgba(79, 195, 247, 0.15)',
    borderWidth: 1,
    borderColor: '#4fc3f7',
  },
  languageFlag: {
    fontSize: 28,
    marginRight: 16,
  },
  languageName: {
    flex: 1,
    color: '#a8d4ff',
    fontSize: 18,
  },
  languageNameActive: {
    color: '#4fc3f7',
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.3)',
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#a8d4ff',
    fontSize: 16,
    fontWeight: '600',
  },
});

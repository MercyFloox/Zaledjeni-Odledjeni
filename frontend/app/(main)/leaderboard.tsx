import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface LeaderboardEntry {
  rank: number;
  username: string;
  value: number;
  level: number;
}

export default function LeaderboardScreen() {
  const insets = useSafeAreaInsets();
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'xp' | 'games_won' | 'times_unfrozen_others'>('xp');
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeCategory]);

  const loadData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user.username);
      }
      await fetchLeaderboard();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const category = activeCategory === 'games_won' ? 'wins' : activeCategory;
      const response = await axios.get(`${API_URL}/api/leaderboard?category=${category}`);
      setLeaderboard(response.data.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLeaderboard();
    setRefreshing(false);
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#ffd700';
    if (rank === 2) return '#c0c0c0';
    if (rank === 3) return '#cd7f32';
    return '#5a7a9a';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return 'trophy';
    if (rank === 2) return 'medal';
    if (rank === 3) return 'ribbon';
    return null;
  };

  const getCategoryLabel = () => {
    switch (activeCategory) {
      case 'xp': return 'XP';
      case 'games_won': return 'Pobeda';
      case 'times_unfrozen_others': return 'Odledjivanja';
    }
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4fc3f7" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="trophy" size={32} color="#ffd700" />
          <Text style={styles.title}>Rang Lista</Text>
        </View>

        {/* Categories */}
        <View style={styles.categories}>
          <TouchableOpacity
            style={[styles.categoryButton, activeCategory === 'xp' && styles.activeCategory]}
            onPress={() => setActiveCategory('xp')}
          >
            <Ionicons name="star" size={18} color={activeCategory === 'xp' ? '#ffd700' : '#5a7a9a'} />
            <Text style={[styles.categoryText, activeCategory === 'xp' && styles.activeCategoryText]}>XP</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryButton, activeCategory === 'games_won' && styles.activeCategory]}
            onPress={() => setActiveCategory('games_won')}
          >
            <Ionicons name="trophy" size={18} color={activeCategory === 'games_won' ? '#ffd700' : '#5a7a9a'} />
            <Text style={[styles.categoryText, activeCategory === 'games_won' && styles.activeCategoryText]}>Pobede</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.categoryButton, activeCategory === 'times_unfrozen_others' && styles.activeCategory]}
            onPress={() => setActiveCategory('times_unfrozen_others')}
          >
            <Ionicons name="flame" size={18} color={activeCategory === 'times_unfrozen_others' ? '#ff7043' : '#5a7a9a'} />
            <Text style={[styles.categoryText, activeCategory === 'times_unfrozen_others' && styles.activeCategoryText]}>Spasilac</Text>
          </TouchableOpacity>
        </View>

        {/* Top 3 */}
        {leaderboard.length >= 3 && (
          <View style={styles.top3Container}>
            {/* 2nd Place */}
            <View style={[styles.topPlayer, styles.secondPlace]}>
              <View style={[styles.topPlayerAvatar, { backgroundColor: '#c0c0c0' }]}>
                <Text style={styles.topPlayerInitial}>{leaderboard[1]?.username?.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.topPlayerName} numberOfLines={1}>{leaderboard[1]?.username}</Text>
              <Text style={styles.topPlayerValue}>{leaderboard[1]?.value} {getCategoryLabel()}</Text>
              <View style={[styles.rankBadge, { backgroundColor: '#c0c0c0' }]}>
                <Text style={styles.rankText}>2</Text>
              </View>
            </View>

            {/* 1st Place */}
            <View style={[styles.topPlayer, styles.firstPlace]}>
              <Ionicons name="trophy" size={30} color="#ffd700" style={styles.crownIcon} />
              <View style={[styles.topPlayerAvatar, { backgroundColor: '#ffd700', width: 70, height: 70 }]}>
                <Text style={[styles.topPlayerInitial, { fontSize: 28 }]}>{leaderboard[0]?.username?.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.topPlayerName} numberOfLines={1}>{leaderboard[0]?.username}</Text>
              <Text style={[styles.topPlayerValue, { color: '#ffd700' }]}>{leaderboard[0]?.value} {getCategoryLabel()}</Text>
              <View style={[styles.rankBadge, { backgroundColor: '#ffd700' }]}>
                <Text style={[styles.rankText, { color: '#000' }]}>1</Text>
              </View>
            </View>

            {/* 3rd Place */}
            <View style={[styles.topPlayer, styles.thirdPlace]}>
              <View style={[styles.topPlayerAvatar, { backgroundColor: '#cd7f32' }]}>
                <Text style={styles.topPlayerInitial}>{leaderboard[2]?.username?.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.topPlayerName} numberOfLines={1}>{leaderboard[2]?.username}</Text>
              <Text style={styles.topPlayerValue}>{leaderboard[2]?.value} {getCategoryLabel()}</Text>
              <View style={[styles.rankBadge, { backgroundColor: '#cd7f32' }]}>
                <Text style={styles.rankText}>3</Text>
              </View>
            </View>
          </View>
        )}

        {/* Rest of Leaderboard */}
        <View style={styles.listContainer}>
          {leaderboard.slice(3).map((entry, index) => {
            const isCurrentUser = entry.username === currentUser;
            return (
              <View
                key={entry.rank}
                style={[styles.listItem, isCurrentUser && styles.currentUserItem]}
              >
                <Text style={styles.listRank}>{entry.rank}</Text>
                <View style={styles.listAvatar}>
                  <Text style={styles.listInitial}>{entry.username.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.listInfo}>
                  <Text style={[styles.listName, isCurrentUser && styles.currentUserName]}>
                    {entry.username} {isCurrentUser && '(Ti)'}
                  </Text>
                  <Text style={styles.listLevel}>Nivo {entry.level}</Text>
                </View>
                <Text style={styles.listValue}>{entry.value}</Text>
              </View>
            );
          })}

          {leaderboard.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="trophy-outline" size={60} color="#5a7a9a" />
              <Text style={styles.emptyText}>Nema podataka</Text>
              <Text style={styles.emptySubtext}>Igraj da se pojavi na rang listi!</Text>
            </View>
          )}
        </View>
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
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  categories: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  categoryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  activeCategory: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
  },
  categoryText: {
    color: '#5a7a9a',
    fontSize: 14,
    fontWeight: '600',
  },
  activeCategoryText: {
    color: '#ffd700',
  },
  top3Container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  topPlayer: {
    alignItems: 'center',
    flex: 1,
  },
  firstPlace: {
    marginBottom: 20,
  },
  secondPlace: {},
  thirdPlace: {},
  crownIcon: {
    marginBottom: 8,
  },
  topPlayerAvatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  topPlayerInitial: {
    color: '#000',
    fontSize: 22,
    fontWeight: '700',
  },
  topPlayerName: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 80,
  },
  topPlayerValue: {
    color: '#a8d4ff',
    fontSize: 12,
    marginTop: 4,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  rankText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  listContainer: {
    gap: 10,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  currentUserItem: {
    backgroundColor: 'rgba(79, 195, 247, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.3)',
  },
  listRank: {
    width: 30,
    color: '#5a7a9a',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  listAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(79, 195, 247, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listInitial: {
    color: '#4fc3f7',
    fontSize: 16,
    fontWeight: '700',
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  currentUserName: {
    color: '#4fc3f7',
  },
  listLevel: {
    color: '#5a7a9a',
    fontSize: 12,
    marginTop: 2,
  },
  listValue: {
    color: '#4fc3f7',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#a8d4ff',
    fontSize: 18,
    marginTop: 16,
  },
  emptySubtext: {
    color: '#5a7a9a',
    fontSize: 14,
    marginTop: 4,
  },
});

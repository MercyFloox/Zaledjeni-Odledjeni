import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient/build/LinearGradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useLanguage } from '../../src/context/LanguageContext';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface Room {
  id: string;
  code: string;
  name: string;
  players: any[];
  max_players: number;
  status: string;
}

interface User {
  id: string;
  username: string;
  coins: number;
  gems: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  
  const [user, setUser] = useState<User | null>(null);
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modals
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  
  // BLE Status
  const [bleDevice, setBleDevice] = useState<any>(null);
  const [testingFreeze, setTestingFreeze] = useState(false);
  const freezeAnimation = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      await fetchPublicRooms();
      await loadBleDevice();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/rooms/public`);
      setPublicRooms(response.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const loadBleDevice = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const response = await axios.get(`${API_URL}/api/ble/device?token=${token}`);
        if (response.data.device) {
          setBleDevice(response.data.device);
        }
      }
    } catch (error) {
      console.error('Error loading BLE device:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPublicRooms();
    await loadBleDevice();
    setRefreshing(false);
  };

  const handleTestFreeze = async () => {
    setTestingFreeze(true);
    
    // Trigger freeze animation
    Animated.sequence([
      Animated.timing(freezeAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(freezeAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTestingFreeze(false);
    });

    // Call backend endpoint
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const response = await axios.post(`${API_URL}/api/game/freeze-test?token=${token}`);
        console.log('Test freeze response:', response.data);
      }
    } catch (error) {
      console.error('Error testing freeze:', error);
      Alert.alert(t('common.error'), 'Test freeze greška');
    }
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert('Greska', 'Unesite ime sobe');
      return;
    }

    setCreating(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      const response = await axios.post(
        `${API_URL}/api/rooms/create?token=${token}`,
        {
          name: roomName.trim(),
          max_players: 10,
          is_private: isPrivate,
        }
      );

      const { room } = response.data;
      setCreateModalVisible(false);
      setRoomName('');
      
      // Navigate to game room
      router.push(`/(game)/lobby?code=${room.code}`);
    } catch (error: any) {
      Alert.alert('Greska', error.response?.data?.detail || 'Greska pri kreiranju sobe');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      Alert.alert('Greska', 'Unesite kod sobe');
      return;
    }

    setJoining(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      await axios.post(
        `${API_URL}/api/rooms/join?token=${token}`,
        { room_code: roomCode.trim().toUpperCase() }
      );

      setJoinModalVisible(false);
      setRoomCode('');
      
      router.push(`/(game)/lobby?code=${roomCode.trim().toUpperCase()}`);
    } catch (error: any) {
      Alert.alert('Greska', error.response?.data?.detail || 'Soba nije pronadjena');
    } finally {
      setJoining(false);
    }
  };

  const joinPublicRoom = async (code: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      await axios.post(
        `${API_URL}/api/rooms/join?token=${token}`,
        { room_code: code }
      );
      router.push(`/(game)/lobby?code=${code}`);
    } catch (error: any) {
      Alert.alert('Greska', error.response?.data?.detail || 'Greska pri pridruzivanju');
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
          <View>
            <Text style={styles.greeting}>Zdravo, {user?.username || 'Igrac'}!</Text>
            <Text style={styles.subGreeting}>Spreman za igru?</Text>
          </View>
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

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setCreateModalVisible(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4fc3f7', '#0288d1']}
              style={styles.quickActionGradient}
            >
              <Ionicons name="add-circle" size={40} color="#fff" />
              <Text style={styles.quickActionText}>Kreiraj Sobu</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => setJoinModalVisible(true)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ff7043', '#f4511e']}
              style={styles.quickActionGradient}
            >
              <Ionicons name="enter" size={40} color="#fff" />
              <Text style={styles.quickActionText}>Pridruzi se</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* How to Play */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kako se igra?</Text>
          <View style={styles.howToPlay}>
            <View style={styles.howToPlayItem}>
              <View style={[styles.stepNumber, { backgroundColor: '#4fc3f7' }]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.howToPlayText}>"Mraz" juri ostale igrace</Text>
            </View>
            <View style={styles.howToPlayItem}>
              <View style={[styles.stepNumber, { backgroundColor: '#29b6f6' }]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.howToPlayText}>Dodirom rukavica igrac se zamrzava</Text>
            </View>
            <View style={styles.howToPlayItem}>
              <View style={[styles.stepNumber, { backgroundColor: '#ff7043' }]}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.howToPlayText}>Drugi igraci mogu da odlede zamrznutog</Text>
            </View>
            <View style={styles.howToPlayItem}>
              <View style={[styles.stepNumber, { backgroundColor: '#f4511e' }]}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.howToPlayText}>Igra se zavrsava kada su svi zaledjeni!</Text>
            </View>
          </View>
        </View>

        {/* Public Rooms */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Javne Sobe</Text>
          {publicRooms.length === 0 ? (
            <View style={styles.emptyRooms}>
              <Ionicons name="game-controller-outline" size={50} color="#5a7a9a" />
              <Text style={styles.emptyText}>Nema aktivnih javnih soba</Text>
              <Text style={styles.emptySubtext}>Kreiraj svoju sobu!</Text>
            </View>
          ) : (
            publicRooms.map((room) => (
              <TouchableOpacity
                key={room.id}
                style={styles.roomCard}
                onPress={() => joinPublicRoom(room.code)}
                activeOpacity={0.8}
              >
                <View style={styles.roomInfo}>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <Text style={styles.roomCode}>Kod: {room.code}</Text>
                </View>
                <View style={styles.roomPlayers}>
                  <Ionicons name="people" size={18} color="#4fc3f7" />
                  <Text style={styles.roomPlayersText}>
                    {room.players.length}/{room.max_players}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Create Room Modal */}
      <Modal
        visible={createModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Kreiraj Novu Sobu</Text>
            
            <View style={styles.modalInput}>
              <Ionicons name="text" size={22} color="#4fc3f7" />
              <TextInput
                style={styles.modalTextInput}
                placeholder="Ime sobe"
                placeholderTextColor="#5a7a9a"
                value={roomName}
                onChangeText={setRoomName}
              />
            </View>

            <TouchableOpacity
              style={styles.privateToggle}
              onPress={() => setIsPrivate(!isPrivate)}
            >
              <Ionicons
                name={isPrivate ? 'lock-closed' : 'lock-open'}
                size={22}
                color={isPrivate ? '#ff7043' : '#4fc3f7'}
              />
              <Text style={styles.privateText}>
                {isPrivate ? 'Privatna soba' : 'Javna soba'}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setCreateModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Otkazi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleCreateRoom}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>Kreiraj</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Join Room Modal */}
      <Modal
        visible={joinModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setJoinModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pridruzi se Sobi</Text>
            
            <View style={styles.modalInput}>
              <Ionicons name="key" size={22} color="#4fc3f7" />
              <TextInput
                style={styles.modalTextInput}
                placeholder="Unesi kod sobe (npr. ABC123)"
                placeholderTextColor="#5a7a9a"
                value={roomCode}
                onChangeText={setRoomCode}
                autoCapitalize="characters"
                maxLength={6}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setJoinModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Otkazi</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmButton, { backgroundColor: '#ff7043' }]}
                onPress={handleJoinRoom}
                disabled={joining}
              >
                {joining ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>Pridruzi se</Text>
                )}
              </TouchableOpacity>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  subGreeting: {
    fontSize: 16,
    color: '#a8d4ff',
    marginTop: 4,
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
  quickActions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  quickActionButton: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  quickActionGradient: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 10,
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  howToPlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  howToPlayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  howToPlayText: {
    flex: 1,
    color: '#a8d4ff',
    fontSize: 14,
  },
  emptyRooms: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
  },
  emptyText: {
    color: '#a8d4ff',
    fontSize: 16,
    marginTop: 16,
  },
  emptySubtext: {
    color: '#5a7a9a',
    fontSize: 14,
    marginTop: 4,
  },
  roomCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.2)',
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  roomCode: {
    color: '#a8d4ff',
    fontSize: 14,
    marginTop: 4,
  },
  roomPlayers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roomPlayersText: {
    color: '#4fc3f7',
    fontWeight: '600',
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
  modalInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.2)',
  },
  modalTextInput: {
    flex: 1,
    height: 56,
    marginLeft: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  privateToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
    marginBottom: 24,
  },
  privateText: {
    color: '#a8d4ff',
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.3)',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#a8d4ff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#4fc3f7',
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

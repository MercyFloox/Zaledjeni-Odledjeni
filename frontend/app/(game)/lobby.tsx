import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface Player {
  id: string;
  username: string;
  is_host: boolean;
  is_ready: boolean;
  equipped_skin: string;
}

interface Room {
  id: string;
  code: string;
  name: string;
  host_id: string;
  players: Player[];
  status: string;
  max_players: number;
}

export default function LobbyScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const insets = useSafeAreaInsets();
  
  const [room, setRoom] = useState<Room | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    loadData();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const loadData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        
        // Connect to socket
        connectSocket(parsedUser);
      }
      await fetchRoom();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectSocket = (userData: any) => {
    // Connect to Socket.IO server
    const socketUrl = API_URL.replace('/api', '').replace('https://', 'wss://').replace('http://', 'ws://');
    socketRef.current = io(API_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      socketRef.current?.emit('join_game', {
        room_code: code,
        player_id: userData.id,
      });
    });

    socketRef.current.on('player_joined', (data) => {
      console.log('Player joined:', data);
      fetchRoom();
    });

    socketRef.current.on('player_left', (data) => {
      console.log('Player left:', data);
      fetchRoom();
    });

    socketRef.current.on('player_ready_update', (data) => {
      console.log('Player ready update:', data);
      fetchRoom();
    });

    socketRef.current.on('game_started', (data) => {
      console.log('Game started:', data);
      router.replace(`/(game)/play?code=${code}&mraz=${data.mraz_id}`);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  };

  const fetchRoom = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/rooms/${code}`);
      setRoom(response.data);
    } catch (error) {
      console.error('Error fetching room:', error);
      Alert.alert('Greska', 'Soba nije pronadjena');
      router.back();
    }
  };

  const handleReady = () => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    
    socketRef.current?.emit('player_ready', {
      room_code: code,
      player_id: user?.id,
      is_ready: newReadyState,
    });
  };

  const handleStartGame = () => {
    const readyPlayers = room?.players.filter(p => p.is_ready || p.is_host) || [];
    if (readyPlayers.length < 2) {
      Alert.alert('Nedovoljno igraca', 'Potrebno je najmanje 2 igraca koji su spremni');
      return;
    }

    socketRef.current?.emit('start_game', {
      room_code: code,
    });
  };

  const handleLeave = () => {
    Alert.alert(
      'Napusti sobu',
      'Da li ste sigurni?',
      [
        { text: 'Otkazi', style: 'cancel' },
        {
          text: 'Napusti',
          style: 'destructive',
          onPress: () => {
            socketRef.current?.emit('leave_game', {
              room_code: code,
              player_id: user?.id,
            });
            router.back();
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Pridruzi mi se u igri "Zaledjen-Odledjen"! Kod sobe: ${code}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const isHost = room?.host_id === user?.id;

  if (loading) {
    return (
      <LinearGradient colors={['#0a1628', '#1a3a5c', '#0d2137']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4fc3f7" />
          <Text style={styles.loadingText}>Ucitavanje sobe...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0a1628', '#1a3a5c', '#0d2137']}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleLeave}>
          <Ionicons name="arrow-back" size={24} color="#4fc3f7" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.roomName}>{room?.name}</Text>
          <TouchableOpacity style={styles.codeContainer} onPress={handleShare}>
            <Text style={styles.codeText}>Kod: {code}</Text>
            <Ionicons name="share-outline" size={18} color="#4fc3f7" />
          </TouchableOpacity>
        </View>
        <View style={styles.playerCount}>
          <Ionicons name="people" size={20} color="#4fc3f7" />
          <Text style={styles.playerCountText}>
            {room?.players.length}/{room?.max_players}
          </Text>
        </View>
      </View>

      {/* Players List */}
      <ScrollView style={styles.playersContainer} contentContainerStyle={styles.playersContent}>
        <Text style={styles.sectionTitle}>Igraci u sobi</Text>
        {room?.players.map((player, index) => (
          <View key={player.id} style={styles.playerCard}>
            <View style={styles.playerAvatar}>
              <Text style={styles.playerInitial}>
                {player.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.playerInfo}>
              <View style={styles.playerNameRow}>
                <Text style={styles.playerName}>{player.username}</Text>
                {player.is_host && (
                  <View style={styles.hostBadge}>
                    <Ionicons name="star" size={12} color="#ffd700" />
                    <Text style={styles.hostText}>Host</Text>
                  </View>
                )}
              </View>
              <Text style={styles.playerStatus}>
                {player.is_ready || player.is_host ? 'Spreman' : 'Ceka...'}
              </Text>
            </View>
            <View style={[
              styles.readyIndicator,
              (player.is_ready || player.is_host) && styles.readyIndicatorActive
            ]}>
              <Ionicons
                name={player.is_ready || player.is_host ? 'checkmark' : 'time'}
                size={20}
                color={player.is_ready || player.is_host ? '#4caf50' : '#5a7a9a'}
              />
            </View>
          </View>
        ))}

        {/* Empty slots */}
        {Array.from({ length: (room?.max_players || 10) - (room?.players.length || 0) }).map((_, i) => (
          <View key={`empty-${i}`} style={[styles.playerCard, styles.emptySlot]}>
            <View style={[styles.playerAvatar, styles.emptyAvatar]}>
              <Ionicons name="person-add" size={24} color="#5a7a9a" />
            </View>
            <Text style={styles.emptyText}>Ceka se igrac...</Text>
          </View>
        ))}
      </ScrollView>

      {/* How to Play */}
      <View style={styles.infoSection}>
        <Ionicons name="information-circle" size={20} color="#4fc3f7" />
        <Text style={styles.infoText}>
          Jedan igrac ce biti nasumicno izabran za "Mraza". On mora da zamrzne sve ostale igrace dodirom rukavica!
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={[styles.actionContainer, { paddingBottom: insets.bottom + 20 }]}>
        {isHost ? (
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStartGame}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4caf50', '#388e3c']}
              style={styles.buttonGradient}
            >
              <Ionicons name="play" size={24} color="#fff" />
              <Text style={styles.buttonText}>Zapocni Igru</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.readyButton, isReady && styles.readyButtonActive]}
            onPress={handleReady}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isReady ? ['#ff7043', '#f4511e'] : ['#4fc3f7', '#0288d1']}
              style={styles.buttonGradient}
            >
              <Ionicons name={isReady ? 'close' : 'checkmark'} size={24} color="#fff" />
              <Text style={styles.buttonText}>
                {isReady ? 'Otkazi spremnost' : 'Spreman sam!'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
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
  loadingText: {
    color: '#a8d4ff',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(79, 195, 247, 0.2)',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(79, 195, 247, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 16,
  },
  roomName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  codeText: {
    color: '#4fc3f7',
    fontSize: 14,
    fontWeight: '600',
  },
  playerCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(79, 195, 247, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  playerCountText: {
    color: '#4fc3f7',
    fontWeight: '600',
  },
  playersContainer: {
    flex: 1,
  },
  playersContent: {
    padding: 20,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  emptySlot: {
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.2)',
    backgroundColor: 'transparent',
  },
  playerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(79, 195, 247, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyAvatar: {
    backgroundColor: 'rgba(90, 122, 154, 0.2)',
  },
  playerInitial: {
    color: '#4fc3f7',
    fontSize: 20,
    fontWeight: '700',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 14,
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  hostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  hostText: {
    color: '#ffd700',
    fontSize: 10,
    fontWeight: '700',
  },
  playerStatus: {
    color: '#a8d4ff',
    fontSize: 12,
    marginTop: 2,
  },
  readyIndicator: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(90, 122, 154, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readyIndicatorActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  emptyText: {
    flex: 1,
    marginLeft: 14,
    color: '#5a7a9a',
    fontSize: 14,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 195, 247, 0.1)',
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    color: '#a8d4ff',
    fontSize: 13,
    lineHeight: 18,
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  readyButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  readyButtonActive: {},
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
});

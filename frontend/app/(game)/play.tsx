import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient/build/LinearGradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';
import { useLanguage } from '../../src/context/LanguageContext';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface Player {
  id: string;
  username: string;
  status: 'mraz' | 'active' | 'frozen';
}

export default function PlayScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  
  const [user, setUser] = useState<any>(null);
  const [currentMraz, setCurrentMraz] = useState<string | null>(null);
  const [playerStatuses, setPlayerStatuses] = useState<{ [key: string]: string }>({});
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameTime, setGameTime] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  
  // Round Over state
  const [roundOver, setRoundOver] = useState(false);
  const [winner, setWinner] = useState<any>(null);
  const [nextMraz, setNextMraz] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    loadData();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!roundOver) {
      const timer = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [roundOver]);

  const loadData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        connectSocket(parsedUser);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const connectSocket = (userData: any) => {
    socketRef.current = io(API_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current.on('connect', () => {
      console.log('Game socket connected');
      socketRef.current?.emit('join_game', {
        room_code: code,
        player_id: userData.id,
      });
    });

    socketRef.current.on('game_started', (data) => {
      console.log('Game started:', data);
      setCurrentMraz(data.mraz_id);
      setPlayerStatuses(data.player_statuses || {});
      setRoundNumber(data.round_number || 1);
      setRoundOver(false);
      setGameTime(0);
      
      // Update players list with statuses
      const updatedPlayers: Player[] = Object.keys(data.player_statuses || {}).map(playerId => ({
        id: playerId,
        username: playerId === userData.id ? userData.username : `Player ${playerId.slice(0, 4)}`,
        status: data.player_statuses[playerId],
      }));
      setPlayers(updatedPlayers);
    });

    socketRef.current.on('player_frozen', (data) => {
      console.log('Player frozen:', data);
      setPlayerStatuses(prev => ({
        ...prev,
        [data.frozen_player_id]: 'frozen'
      }));
    });

    socketRef.current.on('player_unfrozen', (data) => {
      console.log('Player unfrozen:', data);
      setPlayerStatuses(prev => ({
        ...prev,
        [data.unfrozen_player_id]: 'active'
      }));
    });

    socketRef.current.on('round_over', (data) => {
      console.log('Round over:', data);
      setRoundOver(true);
      setWinner({
        id: data.winner_id,
        username: data.winner_username,
      });
      setNextMraz(data.next_mraz);
    });

    socketRef.current.on('player_joined', (data) => {
      console.log('Player joined:', data);
    });

    socketRef.current.on('player_left', (data) => {
      console.log('Player left:', data);
    });
  };

  const myStatus = user ? playerStatuses[user.id] : 'active';
  const isMraz = myStatus === 'mraz';
  const isFrozen = myStatus === 'frozen';
  const isActive = myStatus === 'active';

  const handleFreeze = () => {
    if (!isMraz || roundOver) return;
    
    // Get list of active (non-frozen) players that are not Mraz
    const activeTargets = Object.keys(playerStatuses).filter(
      id => id !== user?.id && playerStatuses[id] === 'active'
    );
    
    if (activeTargets.length === 0) {
      Alert.alert(t('common.info') || 'Info', 'Nema igrača za zamrzavanje');
      return;
    }

    Alert.alert(
      t('game.freeze') || 'Zamrzni',
      'Izaberi igrača za zamrzavanje:',
      [
        { text: t('common.cancel') || 'Otkaži', style: 'cancel' },
        ...activeTargets.slice(0, 3).map(targetId => ({
          text: `Player ${targetId.slice(0, 6)}`,
          onPress: () => {
            socketRef.current?.emit('freeze_player', {
              room_code: code,
              frozen_player_id: targetId,
              mraz_id: user?.id,
            });
          },
        })),
      ]
    );
  };

  const handleUnfreeze = () => {
    if (isMraz || isFrozen || roundOver) return;
    
    // Get list of frozen players
    const frozenTargets = Object.keys(playerStatuses).filter(
      id => playerStatuses[id] === 'frozen'
    );
    
    if (frozenTargets.length === 0) {
      Alert.alert(t('common.info') || 'Info', 'Nema zamrznutih igrača');
      return;
    }

    Alert.alert(
      t('game.unfreeze') || 'Odledi',
      'Izaberi igrača za odleđivanje:',
      [
        { text: t('common.cancel') || 'Otkaži', style: 'cancel' },
        ...frozenTargets.slice(0, 3).map(targetId => ({
          text: `Player ${targetId.slice(0, 6)}`,
          onPress: () => {
            socketRef.current?.emit('unfreeze_player', {
              room_code: code,
              frozen_player_id: targetId,
              unfreezer_id: user?.id,
            });
          },
        })),
      ]
    );
  };

  const handleRestartRound = () => {
    socketRef.current?.emit('restart_round', {
      room_code: code,
    });
  };

  const handleExitGame = () => {
    Alert.alert(
      t('game.leaveGame') || 'Napusti igru',
      t('game.leaveGameConfirm') || 'Da li ste sigurni?',
      [
        { text: t('common.cancel') || 'Otkaži', style: 'cancel' },
        {
          text: t('game.leaveGame') || 'Napusti',
          style: 'destructive',
          onPress: () => {
            if (socketRef.current) {
              socketRef.current.emit('leave_game', {
                room_code: code,
                player_id: user?.id,
              });
              socketRef.current.disconnect();
            }
            router.replace('/(main)/home');
          },
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    if (status === 'mraz') return '#29b6f6';
    if (status === 'frozen') return '#4fc3f7';
    return '#4caf50';
  };

  const getStatusText = (status: string) => {
    if (status === 'mraz') return 'MRAZ';
    if (status === 'frozen') return 'ZAMRZNUT';
    return 'ACTIVE';
  };

  // Round Over Modal
  if (roundOver) {
    return (
      <LinearGradient
        colors={['#0a1628', '#1a3a5c', '#0d2137']}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <View style={styles.roundOverContainer}>
          <Ionicons name="trophy" size={80} color="#ffd700" />
          <Text style={styles.roundOverTitle}>{t('game.gameOver') || 'Runda Završena!'}</Text>
          <Text style={styles.roundOverSubtitle}>
            {winner?.id === user?.id 
              ? t('game.youWon') || 'Pobedili ste!' 
              : `${winner?.username} je pobedio!`}
          </Text>
          <Text style={styles.gameTime}>
            {t('game.gameTime') || 'Vreme'}: {formatTime(gameTime)}
          </Text>
          <Text style={styles.roundNumber}>
            Runda: {roundNumber}
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Sledeći Mraz:</Text>
              <Text style={styles.statValue}>
                {nextMraz === user?.id ? 'TI!' : 'Drugi igrač'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.restartButton}
            onPress={handleRestartRound}
          >
            <LinearGradient
              colors={['#4caf50', '#388e3c']}
              style={styles.restartButtonGradient}
            >
              <Text style={styles.restartButtonText}>Play Again</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exitButton}
            onPress={() => router.replace('/(main)/home')}
          >
            <Text style={styles.exitButtonText}>{t('game.backToHome') || 'Nazad'}</Text>
          </TouchableOpacity>
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
        <TouchableOpacity style={styles.exitBtn} onPress={handleExitGame}>
          <Ionicons name="close" size={24} color="#ff7043" />
        </TouchableOpacity>
        <View style={styles.timerContainer}>
          <Ionicons name="time" size={20} color="#4fc3f7" />
          <Text style={styles.timerText}>{formatTime(gameTime)}</Text>
        </View>
        <View style={styles.roundBadge}>
          <Text style={styles.roundText}>R{roundNumber}</Text>
        </View>
      </View>

      {/* My Status Badge */}
      <View style={[styles.myStatusBadge, { backgroundColor: getStatusColor(myStatus) + '20', borderColor: getStatusColor(myStatus) }]}>
        <Ionicons
          name={isMraz ? 'snow' : isFrozen ? 'snow-outline' : 'checkmark-circle'}
          size={24}
          color={getStatusColor(myStatus)}
        />
        <Text style={[styles.myStatusText, { color: getStatusColor(myStatus) }]}>
          {isMraz ? t('game.youAreMraz') || 'TI SI MRAZ!' : 
           isFrozen ? t('game.youAreFrozen') || 'ZAMRZNUT SI!' : 
           t('game.run') || 'ACTIVE'}
        </Text>
      </View>

      {/* Players List */}
      <ScrollView style={styles.playersSection} contentContainerStyle={styles.playersContent}>
        <Text style={styles.sectionTitle}>Igrači ({Object.keys(playerStatuses).length})</Text>
        {Object.keys(playerStatuses).map((playerId) => {
          const status = playerStatuses[playerId];
          const isMe = playerId === user?.id;
          
          return (
            <View
              key={playerId}
              style={[
                styles.playerCard,
                { borderColor: getStatusColor(status) }
              ]}
            >
              <View style={styles.playerInfo}>
                <Ionicons
                  name={status === 'mraz' ? 'snow' : status === 'frozen' ? 'snow-outline' : 'person'}
                  size={20}
                  color={getStatusColor(status)}
                />
                <Text style={styles.playerName}>
                  {isMe ? `${user.username} (TI)` : `Player ${playerId.slice(0, 6)}`}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
                <Text style={styles.statusText}>{getStatusText(status)}</Text>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.actionArea, { paddingBottom: insets.bottom + 20 }]}>
        {isFrozen && (
          <View style={styles.frozenMessage}>
            <Ionicons name="snow" size={40} color="#4fc3f7" />
            <Text style={styles.frozenText}>{t('game.waitToUnfreeze') || 'Čekaj da te odlede!'}</Text>
          </View>
        )}

        {isMraz && !isFrozen && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleFreeze}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#29b6f6', '#0288d1']}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="snow" size={32} color="#fff" />
              <Text style={styles.actionButtonText}>{t('game.freeze') || 'ZAMRZNI!'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {!isMraz && !isFrozen && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleUnfreeze}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#ff7043', '#f4511e']}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="flame" size={32} color="#fff" />
              <Text style={styles.actionButtonText}>{t('game.unfreeze') || 'ODLEDI!'}</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  exitBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 112, 67, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(79, 195, 247, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  timerText: {
    color: '#4fc3f7',
    fontSize: 18,
    fontWeight: '700',
  },
  roundBadge: {
    backgroundColor: 'rgba(79, 195, 247, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  roundText: {
    color: '#4fc3f7',
    fontSize: 16,
    fontWeight: '700',
  },
  myStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  myStatusText: {
    fontSize: 20,
    fontWeight: '700',
  },
  playersSection: {
    flex: 1,
    marginTop: 20,
  },
  playersContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    color: '#a8d4ff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  playerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  playerName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  actionArea: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  frozenMessage: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  frozenText: {
    color: '#4fc3f7',
    fontSize: 16,
    marginTop: 10,
  },
  actionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  roundOverContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  roundOverTitle: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 20,
  },
  roundOverSubtitle: {
    color: '#a8d4ff',
    fontSize: 18,
    marginTop: 10,
  },
  gameTime: {
    color: '#5a7a9a',
    fontSize: 16,
    marginTop: 20,
  },
  roundNumber: {
    color: '#4fc3f7',
    fontSize: 16,
    marginTop: 8,
  },
  statsContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#a8d4ff',
    fontSize: 14,
    marginBottom: 8,
  },
  statValue: {
    color: '#4fc3f7',
    fontSize: 24,
    fontWeight: '700',
  },
  restartButton: {
    marginTop: 40,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  restartButtonGradient: {
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  exitButton: {
    marginTop: 20,
    paddingVertical: 14,
  },
  exitButtonText: {
    color: '#5a7a9a',
    fontSize: 16,
    fontWeight: '600',
  },
});

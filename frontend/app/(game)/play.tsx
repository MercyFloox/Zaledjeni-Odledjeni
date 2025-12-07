import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  Vibration,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient/build/LinearGradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';
const { width, height } = Dimensions.get('window');

interface Player {
  id: string;
  username: string;
  is_frozen: boolean;
}

export default function PlayScreen() {
  const router = useRouter();
  const { code, mraz } = useLocalSearchParams<{ code: string; mraz: string }>();
  const insets = useSafeAreaInsets();
  
  const [user, setUser] = useState<any>(null);
  const [isMraz, setIsMraz] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [frozenPlayers, setFrozenPlayers] = useState<string[]>([]);
  const [gameTime, setGameTime] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const freezeSound = useRef<Audio.Sound | null>(null);
  const unfreezeSound = useRef<Audio.Sound | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const freezeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      freezeSound.current?.unloadAsync();
      unfreezeSound.current?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    if (!gameOver) {
      const timer = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameOver]);

  useEffect(() => {
    // Pulse animation for action button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const loadData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsMraz(mraz === parsedUser.id);
        connectSocket(parsedUser);
      }
      await loadSounds();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadSounds = async () => {
    try {
      const { sound: freeze } = await Audio.Sound.createAsync(
        require('../../assets/sounds/freeze.mp3')
      );
      freezeSound.current = freeze;
      
      const { sound: unfreeze } = await Audio.Sound.createAsync(
        require('../../assets/sounds/unfreeze.mp3')
      );
      unfreezeSound.current = unfreeze;
    } catch (error) {
      console.log('Sound files not found, continuing without sounds');
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

    socketRef.current.on('player_frozen', async (data) => {
      console.log('Player frozen:', data);
      if (data.frozen_player_id === userData.id) {
        setIsFrozen(true);
        playFreezeAnimation();
        try {
          await freezeSound.current?.replayAsync();
        } catch (e) {}
        Vibration.vibrate([0, 100, 50, 100]);
      }
      setFrozenPlayers(prev => [...prev, data.frozen_player_id]);
    });

    socketRef.current.on('player_unfrozen', async (data) => {
      console.log('Player unfrozen:', data);
      if (data.unfrozen_player_id === userData.id) {
        setIsFrozen(false);
        playUnfreezeAnimation();
        try {
          await unfreezeSound.current?.replayAsync();
        } catch (e) {}
        Vibration.vibrate(100);
      }
      setFrozenPlayers(prev => prev.filter(id => id !== data.unfrozen_player_id));
    });

    socketRef.current.on('game_over', (data) => {
      console.log('Game over:', data);
      setGameOver(true);
      setWinner(data.winner);
    });

    socketRef.current.on('proximity_event', (data) => {
      console.log('Proximity detected:', data);
      // Handle proximity detection
    });
  };

  const playFreezeAnimation = () => {
    Animated.timing(freezeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const playUnfreezeAnimation = () => {
    Animated.timing(freezeAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const handleFreeze = (targetId: string) => {
    if (!isMraz || gameOver) return;
    
    socketRef.current?.emit('freeze_player', {
      room_code: code,
      frozen_player_id: targetId,
      mraz_id: user?.id,
    });
  };

  const handleUnfreeze = (targetId: string) => {
    if (isMraz || isFrozen || gameOver) return;
    
    socketRef.current?.emit('unfreeze_player', {
      room_code: code,
      frozen_player_id: targetId,
      unfreezer_id: user?.id,
    });
  };

  // Simulate proximity detection (in real app, this would use Bluetooth)
  const simulateProximity = () => {
    Alert.alert(
      'Simulacija dodira',
      isMraz 
        ? 'Izaberi igraca za zamrzavanje (u pravoj igri ovo bi bilo automatski preko Bluetooth-a)'
        : isFrozen 
          ? 'Zaledjen si! Cekaj da te neko odledi.'
          : 'Izaberi zaledjenog igraca za odledjivanje',
      [
        { text: 'Otkazi', style: 'cancel' },
        {
          text: 'Test zamrzni/odledi',
          onPress: () => {
            if (isMraz) {
              // Simulate freezing a random player
              const otherPlayers = players.filter(p => p.id !== user?.id && !frozenPlayers.includes(p.id));
              if (otherPlayers.length > 0) {
                handleFreeze(otherPlayers[0].id);
              }
            } else if (!isFrozen) {
              // Simulate unfreezing
              if (frozenPlayers.length > 0) {
                handleUnfreeze(frozenPlayers[0]);
              }
            }
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

  const handleExitGame = () => {
    Alert.alert(
      'Napusti igru',
      'Da li ste sigurni da zelite da napustite igru?',
      [
        { text: 'Otkazi', style: 'cancel' },
        {
          text: 'Napusti',
          style: 'destructive',
          onPress: () => router.replace('/(main)/home'),
        },
      ]
    );
  };

  const backgroundColor = freezeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(10, 22, 40, 1)', 'rgba(79, 195, 247, 0.3)'],
  });

  if (gameOver) {
    return (
      <LinearGradient
        colors={['#0a1628', '#1a3a5c', '#0d2137']}
        style={[styles.container, { paddingTop: insets.top }]}
      >
        <View style={styles.gameOverContainer}>
          <Ionicons name="trophy" size={80} color="#ffd700" />
          <Text style={styles.gameOverTitle}>Igra Zavrsena!</Text>
          <Text style={styles.gameOverSubtitle}>
            {winner === user?.id ? 'Pobedili ste!' : 'Mraz je pobedio!'}
          </Text>
          <Text style={styles.gameTime}>Vreme igre: {formatTime(gameTime)}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{frozenPlayers.length}</Text>
              <Text style={styles.statLabel}>Zaledjeno</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.exitButton}
            onPress={() => router.replace('/(main)/home')}
          >
            <LinearGradient
              colors={['#4fc3f7', '#0288d1']}
              style={styles.exitButtonGradient}
            >
              <Text style={styles.exitButtonText}>Nazad na pocetnu</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor, paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitBtn} onPress={handleExitGame}>
          <Ionicons name="close" size={24} color="#ff7043" />
        </TouchableOpacity>
        <View style={styles.timerContainer}>
          <Ionicons name="time" size={20} color="#4fc3f7" />
          <Text style={styles.timerText}>{formatTime(gameTime)}</Text>
        </View>
        <View style={styles.frozenCount}>
          <Ionicons name="snow" size={20} color="#29b6f6" />
          <Text style={styles.frozenCountText}>{frozenPlayers.length}</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Role Badge */}
        <View style={[styles.roleBadge, isMraz ? styles.mrazBadge : styles.playerBadge]}>
          <Ionicons
            name={isMraz ? 'snow' : 'person'}
            size={24}
            color={isMraz ? '#29b6f6' : '#ff7043'}
          />
          <Text style={[styles.roleText, isMraz ? styles.mrazText : styles.playerText]}>
            {isMraz ? 'TI SI MRAZ!' : isFrozen ? 'ZALEDJEN SI!' : 'BEGAJ!'}
          </Text>
        </View>

        {/* Status */}
        {isFrozen && !isMraz && (
          <View style={styles.frozenOverlay}>
            <Ionicons name="snow" size={100} color="#4fc3f7" />
            <Text style={styles.frozenText}>ZALEDJEN</Text>
            <Text style={styles.frozenSubtext}>Cekaj da te neko odledi!</Text>
          </View>
        )}

        {/* Action Area */}
        {!isFrozen && (
          <Animated.View style={[styles.actionArea, { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                isMraz ? styles.freezeButton : styles.unfreezeButton,
              ]}
              onPress={simulateProximity}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isMraz ? ['#29b6f6', '#0288d1'] : ['#ff7043', '#f4511e']}
                style={styles.actionButtonGradient}
              >
                <Ionicons
                  name={isMraz ? 'snow' : 'flame'}
                  size={60}
                  color="#fff"
                />
                <Text style={styles.actionButtonText}>
                  {isMraz ? 'ZAMRZNI!' : 'ODLEDI!'}
                </Text>
                <Text style={styles.actionButtonSubtext}>
                  Priblizi se igracu
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Instructions */}
        <View style={styles.instructions}>
          <Ionicons name="information-circle" size={20} color="#4fc3f7" />
          <Text style={styles.instructionText}>
            {isMraz
              ? 'Priblizi rukavicu drugim igracima da ih zamrznes!'
              : isFrozen
                ? 'Stani mirno! Drugi igraci te mogu odlediti.'
                : 'Begaj od Mraza! Odledi zaledjene igrace dodirom.'}
          </Text>
        </View>
      </View>

      {/* Bluetooth Status */}
      <View style={[styles.bluetoothStatus, { paddingBottom: insets.bottom + 20 }]}>
        <Ionicons name="bluetooth" size={18} color="#4fc3f7" />
        <Text style={styles.bluetoothText}>Bluetooth skeniranje aktivno</Text>
        <View style={styles.bluetoothDot} />
      </View>
    </Animated.View>
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
  frozenCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(41, 182, 246, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  frozenCountText: {
    color: '#29b6f6',
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    marginBottom: 30,
  },
  mrazBadge: {
    backgroundColor: 'rgba(41, 182, 246, 0.2)',
    borderWidth: 2,
    borderColor: '#29b6f6',
  },
  playerBadge: {
    backgroundColor: 'rgba(255, 112, 67, 0.2)',
    borderWidth: 2,
    borderColor: '#ff7043',
  },
  roleText: {
    fontSize: 20,
    fontWeight: '700',
  },
  mrazText: {
    color: '#29b6f6',
  },
  playerText: {
    color: '#ff7043',
  },
  frozenOverlay: {
    alignItems: 'center',
    marginVertical: 40,
  },
  frozenText: {
    color: '#4fc3f7',
    fontSize: 36,
    fontWeight: '900',
    marginTop: 20,
    textShadowColor: '#4fc3f7',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  frozenSubtext: {
    color: '#a8d4ff',
    fontSize: 16,
    marginTop: 10,
  },
  actionArea: {
    marginVertical: 30,
  },
  actionButton: {
    borderRadius: 100,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  freezeButton: {},
  unfreezeButton: {},
  actionButtonGradient: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 10,
  },
  actionButtonSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  instructions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 195, 247, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 10,
    maxWidth: '100%',
  },
  instructionText: {
    flex: 1,
    color: '#a8d4ff',
    fontSize: 14,
    lineHeight: 20,
  },
  bluetoothStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  bluetoothText: {
    color: '#4fc3f7',
    fontSize: 14,
  },
  bluetoothDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4caf50',
  },
  gameOverContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  gameOverTitle: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '900',
    marginTop: 20,
  },
  gameOverSubtitle: {
    color: '#a8d4ff',
    fontSize: 18,
    marginTop: 10,
  },
  gameTime: {
    color: '#5a7a9a',
    fontSize: 16,
    marginTop: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#4fc3f7',
    fontSize: 32,
    fontWeight: '700',
  },
  statLabel: {
    color: '#a8d4ff',
    fontSize: 14,
    marginTop: 4,
  },
  exitButton: {
    marginTop: 40,
    borderRadius: 16,
    overflow: 'hidden',
  },
  exitButtonGradient: {
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  exitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

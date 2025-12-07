import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient/build/LinearGradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from 'expo-constants';
import { useLanguage } from '../../src/context/LanguageContext';
import { BleManager, Device, State } from 'react-native-ble-plx';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL || '';

interface BluetoothDevice {
  id: string;
  name: string | null;
  rssi: number | null;
  connected: boolean;
}

interface SavedDevice {
  device_id: string;
  device_name: string;
  connected_at: string;
}

export default function BluetoothSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  
  // Check if running in Expo Go
  const isExpoGo = Constants.appOwnership === 'expo';
  
  const [bleManager] = useState<BleManager | null>(() => {
    if (Platform.OS === 'web' || isExpoGo) {
      return null;
    }
    return new BleManager();
  });
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [savedDevice, setSavedDevice] = useState<SavedDevice | null>(null);
  const [bluetoothState, setBluetoothState] = useState<State>(State.Unknown);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const devicesRef = useRef<Map<string, BluetoothDevice>>(new Map());

  useEffect(() => {
    initializeBluetooth();
    loadSavedDevice();
    
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      if (bleManager) {
        bleManager.stopDeviceScan();
        bleManager.destroy();
      }
    };
  }, []);

  const initializeBluetooth = async () => {
    try {
      // Check if we're on web platform
      if (Platform.OS === 'web') {
        setBluetoothState(State.Unsupported);
        setLoading(false);
        return;
      }

      // Request permissions for Android
      if (Platform.OS === 'android') {
        await requestAndroidPermissions();
      }

      // Check Bluetooth state
      if (bleManager) {
        const state = await bleManager.state();
        setBluetoothState(state);

        // Subscribe to Bluetooth state changes
        bleManager.onStateChange((newState) => {
          setBluetoothState(newState);
        }, true);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error initializing Bluetooth:', error);
      setLoading(false);
    }
  };

  const requestAndroidPermissions = async () => {
    if (Platform.OS !== 'android') return true;

    try {
      const apiLevel = Platform.Version as number;
      
      if (apiLevel >= 31) {
        // Android 12+
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        
        return Object.values(results).every(
          (result) => result === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        // Android 11 and below
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  };

  const loadSavedDevice = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        const response = await axios.get(`${API_URL}/api/ble/device?token=${token}`);
        if (response.data.device) {
          setSavedDevice(response.data.device);
        }
      }
    } catch (error) {
      console.error('Error loading saved device:', error);
    }
  };

  const handleScan = async () => {
    if (!bleManager || bluetoothState !== State.PoweredOn) {
      Alert.alert(
        t('bluetooth.bluetoothOff'),
        t('bluetooth.turnOnBluetooth'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    // Clear previous devices
    devicesRef.current.clear();
    setDevices([]);
    setScanning(true);

    // Start scanning
    bleManager.startDeviceScan(
      null, // Scan for all services
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          console.error('Scan error:', error);
          setScanning(false);
          return;
        }

        if (device && device.id) {
          const bleDevice: BluetoothDevice = {
            id: device.id,
            name: device.name || device.localName || null,
            rssi: device.rssi,
            connected: false,
          };

          // Only add devices with names or strong signal
          if (bleDevice.name || (bleDevice.rssi && bleDevice.rssi > -80)) {
            devicesRef.current.set(device.id, bleDevice);
            setDevices(Array.from(devicesRef.current.values()));
          }
        }
      }
    );

    // Stop scanning after 10 seconds
    scanTimeoutRef.current = setTimeout(() => {
      if (bleManager) {
        bleManager.stopDeviceScan();
      }
      setScanning(false);
    }, 10000);
  };

  const handleStopScan = () => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    if (bleManager) {
      bleManager.stopDeviceScan();
    }
    setScanning(false);
  };

  const handleConnect = async (device: BluetoothDevice) => {
    if (!bleManager) {
      Alert.alert(
        t('common.error'),
        t('bluetooth.notAvailable')
      );
      return;
    }

    try {
      setConnecting(device.id);
      
      // Stop scanning first
      bleManager.stopDeviceScan();
      setScanning(false);

      // Connect to device
      const connectedBleDevice = await bleManager.connectToDevice(device.id, {
        timeout: 10000,
      });

      // Discover services and characteristics
      await connectedBleDevice.discoverAllServicesAndCharacteristics();

      const updatedDevice: BluetoothDevice = {
        ...device,
        name: connectedBleDevice.name || connectedBleDevice.localName || device.name,
        connected: true,
      };

      setConnectedDevice(updatedDevice);

      // Save to backend
      await saveDeviceToBackend(updatedDevice);

      Alert.alert(
        t('common.success'),
        `${t('bluetooth.connectedTo')} ${updatedDevice.name || updatedDevice.id}!`
      );

      // Monitor disconnection
      bleManager.onDeviceDisconnected(device.id, (error, disconnectedDevice) => {
        if (disconnectedDevice) {
          setConnectedDevice(null);
          Alert.alert(t('bluetooth.disconnected'), t('bluetooth.deviceDisconnected'));
        }
      });

    } catch (error: any) {
      console.error('Connection error:', error);
      Alert.alert(
        t('common.error'),
        error.message || t('bluetooth.connectionFailed')
      );
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async () => {
    if (connectedDevice && bleManager) {
      try {
        await bleManager.cancelDeviceConnection(connectedDevice.id);
        setConnectedDevice(null);
        
        // Remove from backend
        await removeDeviceFromBackend();
        
        Alert.alert(t('common.success'), t('bluetooth.disconnected'));
      } catch (error) {
        console.error('Disconnect error:', error);
        setConnectedDevice(null);
      }
    }
  };

  const saveDeviceToBackend = async (device: BluetoothDevice) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        await axios.post(`${API_URL}/api/ble/save-device?token=${token}`, {
          device_id: device.id,
          device_name: device.name || 'Unknown Device',
        });
        
        setSavedDevice({
          device_id: device.id,
          device_name: device.name || 'Unknown Device',
          connected_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error saving device:', error);
    }
  };

  const removeDeviceFromBackend = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        await axios.delete(`${API_URL}/api/ble/remove-device?token=${token}`);
        setSavedDevice(null);
      }
    } catch (error) {
      console.error('Error removing device:', error);
    }
  };

  const getRssiIcon = (rssi: number | null) => {
    if (!rssi) return 'cellular-outline';
    if (rssi > -50) return 'wifi';
    if (rssi > -70) return 'wifi-outline';
    return 'cellular-outline';
  };

  const getRssiColor = (rssi: number | null) => {
    if (!rssi) return '#5a7a9a';
    if (rssi > -50) return '#4caf50';
    if (rssi > -70) return '#ffc107';
    return '#f44336';
  };

  const getSignalQuality = (rssi: number | null) => {
    if (!rssi) return t('bluetooth.unknown');
    if (rssi > -50) return t('bluetooth.excellent');
    if (rssi > -60) return t('bluetooth.good');
    if (rssi > -70) return t('bluetooth.fair');
    return t('bluetooth.weak');
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0a1628', '#1a3a5c', '#0d2137']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4fc3f7" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
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
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#4fc3f7" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('bluetooth.setup')}</Text>
        <View style={styles.headerRight}>
          <View style={[
            styles.bluetoothIndicator,
            bluetoothState === State.PoweredOn ? styles.bluetoothOn : styles.bluetoothOff
          ]}>
            <Ionicons 
              name="bluetooth" 
              size={16} 
              color={bluetoothState === State.PoweredOn ? '#4caf50' : '#f44336'} 
            />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[
            styles.statusIndicator,
            connectedDevice ? styles.statusConnected : styles.statusDisconnected
          ]}>
            <Ionicons
              name={connectedDevice ? 'bluetooth' : 'bluetooth-outline'}
              size={40}
              color={connectedDevice ? '#4caf50' : '#5a7a9a'}
            />
          </View>
          <Text style={styles.statusTitle}>
            {connectedDevice ? t('bluetooth.connected') : t('bluetooth.notConnected')}
          </Text>
          {connectedDevice && (
            <Text style={styles.connectedDeviceName}>
              {connectedDevice.name || connectedDevice.id}
            </Text>
          )}
          {bluetoothState !== State.PoweredOn && (
            <View style={styles.bluetoothWarning}>
              <Ionicons name="warning" size={16} color="#ffc107" />
              <Text style={styles.warningText}>{t('bluetooth.turnOnBluetooth')}</Text>
            </View>
          )}
        </View>

        {/* Web Platform Warning */}
        {Platform.OS === 'web' && (
          <View style={styles.webWarningCard}>
            <View style={styles.webWarningHeader}>
              <Ionicons name="information-circle" size={24} color="#ffc107" />
              <Text style={styles.webWarningTitle}>Bluetooth Not Available</Text>
            </View>
            <Text style={styles.webWarningText}>
              Bluetooth functionality is only available on mobile devices. Please use the mobile app to connect to Bluetooth devices.
            </Text>
          </View>
        )}

        {/* Connected Device Info */}
        {connectedDevice && (
          <View style={styles.connectedCard}>
            <View style={styles.connectedHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#4caf50" />
              <Text style={styles.connectedTitle}>{t('bluetooth.activeDevice')}</Text>
            </View>
            <View style={styles.connectedInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('bluetooth.deviceName')}</Text>
                <Text style={styles.infoValue}>
                  {connectedDevice.name || 'Unknown'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ID</Text>
                <Text style={styles.infoValueSmall} numberOfLines={1}>
                  {connectedDevice.id}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('bluetooth.signalStrength')}</Text>
                <View style={styles.signalContainer}>
                  <Ionicons
                    name={getRssiIcon(connectedDevice.rssi)}
                    size={18}
                    color={getRssiColor(connectedDevice.rssi)}
                  />
                  <Text style={[styles.infoValue, { color: getRssiColor(connectedDevice.rssi) }]}>
                    {connectedDevice.rssi ? `${connectedDevice.rssi} dBm` : 'N/A'}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={handleDisconnect}
            >
              <Ionicons name="close-circle" size={20} color="#f44336" />
              <Text style={styles.disconnectText}>{t('bluetooth.disconnect')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Saved Device (from backend) */}
        {savedDevice && !connectedDevice && (
          <View style={styles.savedDeviceCard}>
            <View style={styles.savedDeviceHeader}>
              <Ionicons name="bookmark" size={20} color="#4fc3f7" />
              <Text style={styles.savedDeviceTitle}>{t('bluetooth.savedDevice')}</Text>
            </View>
            <Text style={styles.savedDeviceName}>{savedDevice.device_name}</Text>
            <Text style={styles.savedDeviceId}>{savedDevice.device_id}</Text>
          </View>
        )}

        {/* Scan Section */}
        <View style={styles.scanSection}>
          <Text style={styles.sectionTitle}>{t('bluetooth.availableDevices')}</Text>
          
          <TouchableOpacity
            style={styles.scanButton}
            onPress={scanning ? handleStopScan : handleScan}
            disabled={Platform.OS === 'web' || bluetoothState !== State.PoweredOn}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={scanning ? ['#f44336', '#d32f2f'] : 
                      (Platform.OS === 'web' || bluetoothState !== State.PoweredOn) ? ['#5a7a9a', '#4a6a8a'] :
                      ['#4fc3f7', '#0288d1']}
              style={styles.scanButtonGradient}
            >
              {scanning ? (
                <>
                  <ActivityIndicator color="#fff" />
                  <Text style={styles.scanButtonText}>{t('bluetooth.stopScan')}</Text>
                </>
              ) : (
                <>
                  <Ionicons name="search" size={22} color="#fff" />
                  <Text style={styles.scanButtonText}>{t('bluetooth.scanDevices')}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {scanning && (
            <View style={styles.scanningInfo}>
              <Text style={styles.scanningText}>
                {t('bluetooth.foundDevices')}: {devices.length}
              </Text>
              <Text style={styles.scanningSubtext}>
                {t('bluetooth.scanningFor')} 10s...
              </Text>
            </View>
          )}

          {/* Devices List */}
          {devices.length > 0 ? (
            <View style={styles.devicesList}>
              {devices
                .sort((a, b) => (b.rssi || -100) - (a.rssi || -100))
                .map((device) => (
                <TouchableOpacity
                  key={device.id}
                  style={[
                    styles.deviceCard,
                    connectedDevice?.id === device.id && styles.deviceCardConnected
                  ]}
                  onPress={() => handleConnect(device)}
                  disabled={connecting !== null || connectedDevice?.id === device.id}
                >
                  <View style={styles.deviceIcon}>
                    {connecting === device.id ? (
                      <ActivityIndicator color="#4fc3f7" />
                    ) : (
                      <Ionicons 
                        name={connectedDevice?.id === device.id ? "bluetooth" : "bluetooth-outline"} 
                        size={24} 
                        color="#4fc3f7" 
                      />
                    )}
                  </View>
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>
                      {device.name || t('bluetooth.unknownDevice')}
                    </Text>
                    <Text style={styles.deviceId} numberOfLines={1}>
                      {device.id}
                    </Text>
                    <View style={styles.deviceSignal}>
                      <Ionicons
                        name={getRssiIcon(device.rssi)}
                        size={14}
                        color={getRssiColor(device.rssi)}
                      />
                      <Text style={[styles.deviceRssi, { color: getRssiColor(device.rssi) }]}>
                        {device.rssi ? `${device.rssi} dBm` : 'N/A'} - {getSignalQuality(device.rssi)}
                      </Text>
                    </View>
                  </View>
                  {connectedDevice?.id === device.id ? (
                    <View style={styles.connectedBadge}>
                      <Ionicons name="checkmark-circle" size={24} color="#4caf50" />
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={22} color="#5a7a9a" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : !scanning && (
            <View style={styles.emptyState}>
              <Ionicons name="bluetooth-outline" size={50} color="#5a7a9a" />
              <Text style={styles.emptyText}>{t('bluetooth.noDevices')}</Text>
              <Text style={styles.emptySubtext}>{t('bluetooth.tapToScan')}</Text>
            </View>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.sectionTitle}>{t('bluetooth.instructions')}</Text>
          <View style={styles.instructionsList}>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>1</Text>
              </View>
              <Text style={styles.instructionText}>{t('bluetooth.instruction1')}</Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>2</Text>
              </View>
              <Text style={styles.instructionText}>{t('bluetooth.instruction2')}</Text>
            </View>
            <View style={styles.instructionItem}>
              <View style={styles.instructionNumber}>
                <Text style={styles.instructionNumberText}>3</Text>
              </View>
              <Text style={styles.instructionText}>{t('bluetooth.instruction3')}</Text>
            </View>
          </View>
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
  loadingText: {
    color: '#a8d4ff',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerRight: {
    width: 44,
    alignItems: 'flex-end',
  },
  bluetoothIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bluetoothOn: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  bluetoothOff: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statusCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 30,
    marginBottom: 20,
  },
  statusIndicator: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusConnected: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 2,
    borderColor: '#4caf50',
  },
  statusDisconnected: {
    backgroundColor: 'rgba(90, 122, 154, 0.2)',
    borderWidth: 2,
    borderColor: '#5a7a9a',
  },
  statusTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  connectedDeviceName: {
    color: '#4caf50',
    fontSize: 14,
    marginTop: 4,
  },
  bluetoothWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  warningText: {
    color: '#ffc107',
    fontSize: 12,
  },
  connectedCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  connectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  connectedTitle: {
    color: '#4caf50',
    fontSize: 16,
    fontWeight: '600',
  },
  connectedInfo: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    color: '#a8d4ff',
    fontSize: 14,
  },
  infoValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  infoValueSmall: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 180,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  disconnectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(76, 175, 80, 0.3)',
    marginTop: 8,
  },
  disconnectText: {
    color: '#f44336',
    fontSize: 14,
    fontWeight: '600',
  },
  savedDeviceCard: {
    backgroundColor: 'rgba(79, 195, 247, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.3)',
  },
  savedDeviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  savedDeviceTitle: {
    color: '#4fc3f7',
    fontSize: 14,
    fontWeight: '600',
  },
  savedDeviceName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  savedDeviceId: {
    color: '#a8d4ff',
    fontSize: 11,
    marginTop: 4,
  },
  scanSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  scanButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
  },
  scanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  scanButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  scanningInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scanningText: {
    color: '#4fc3f7',
    fontSize: 14,
    fontWeight: '600',
  },
  scanningSubtext: {
    color: '#a8d4ff',
    fontSize: 12,
    marginTop: 4,
  },
  devicesList: {
    gap: 10,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 14,
  },
  deviceCardConnected: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  deviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(79, 195, 247, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  deviceName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  deviceId: {
    color: '#5a7a9a',
    fontSize: 10,
    marginTop: 2,
  },
  deviceSignal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  deviceRssi: {
    fontSize: 12,
  },
  connectedBadge: {
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
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
  instructionsSection: {
    marginBottom: 20,
  },
  instructionsList: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4fc3f7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionNumberText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  instructionText: {
    flex: 1,
    color: '#a8d4ff',
    fontSize: 14,
    lineHeight: 20,
  },
  webWarningCard: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  webWarningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  webWarningTitle: {
    color: '#ffc107',
    fontSize: 16,
    fontWeight: '600',
  },
  webWarningText: {
    color: '#a8d4ff',
    fontSize: 14,
    lineHeight: 20,
  },
});

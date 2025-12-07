import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient/build/LinearGradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../src/context/LanguageContext';

interface BluetoothDevice {
  id: string;
  name: string;
  rssi: number;
  connected: boolean;
}

export default function BluetoothSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();
  
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);

  // Simulirani uređaji za demo
  const mockDevices: BluetoothDevice[] = [
    { id: '1', name: 'FrozenGlove-001', rssi: -45, connected: false },
    { id: '2', name: 'BLE Beacon A', rssi: -62, connected: false },
    { id: '3', name: 'iBeacon-X', rssi: -78, connected: false },
  ];

  const handleScan = () => {
    setScanning(true);
    setDevices([]);
    
    // Simulacija skeniranja
    setTimeout(() => {
      setDevices(mockDevices);
      setScanning(false);
    }, 3000);
  };

  const handleConnect = (device: BluetoothDevice) => {
    Alert.alert(
      t('bluetooth.connecting'),
      `${t('bluetooth.connectingTo')} ${device.name}...`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('bluetooth.connect'),
          onPress: () => {
            // Simulacija povezivanja
            setTimeout(() => {
              setConnectedDevice({ ...device, connected: true });
              Alert.alert(
                t('common.success'),
                `${t('bluetooth.connectedTo')} ${device.name}!`
              );
            }, 1500);
          },
        },
      ]
    );
  };

  const handleDisconnect = () => {
    if (connectedDevice) {
      setConnectedDevice(null);
      Alert.alert(t('common.success'), t('bluetooth.disconnected'));
    }
  };

  const getRssiIcon = (rssi: number) => {
    if (rssi > -50) return 'wifi';
    if (rssi > -70) return 'wifi-outline';
    return 'cellular-outline';
  };

  const getRssiColor = (rssi: number) => {
    if (rssi > -50) return '#4caf50';
    if (rssi > -70) return '#ffc107';
    return '#f44336';
  };

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
        <View style={styles.headerRight} />
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
            <Text style={styles.connectedDeviceName}>{connectedDevice.name}</Text>
          )}
        </View>

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
                <Text style={styles.infoValue}>{connectedDevice.name}</Text>
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
                    {connectedDevice.rssi} dBm
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

        {/* Scan Section */}
        <View style={styles.scanSection}>
          <Text style={styles.sectionTitle}>{t('bluetooth.availableDevices')}</Text>
          
          <TouchableOpacity
            style={styles.scanButton}
            onPress={handleScan}
            disabled={scanning}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={scanning ? ['#5a7a9a', '#4a6a8a'] : ['#4fc3f7', '#0288d1']}
              style={styles.scanButtonGradient}
            >
              {scanning ? (
                <>
                  <ActivityIndicator color="#fff" />
                  <Text style={styles.scanButtonText}>{t('bluetooth.scanning')}</Text>
                </>
              ) : (
                <>
                  <Ionicons name="search" size={22} color="#fff" />
                  <Text style={styles.scanButtonText}>{t('bluetooth.scanDevices')}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Devices List */}
          {devices.length > 0 ? (
            <View style={styles.devicesList}>
              {devices.map((device) => (
                <TouchableOpacity
                  key={device.id}
                  style={styles.deviceCard}
                  onPress={() => handleConnect(device)}
                  disabled={connectedDevice?.id === device.id}
                >
                  <View style={styles.deviceIcon}>
                    <Ionicons name="bluetooth" size={24} color="#4fc3f7" />
                  </View>
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{device.name}</Text>
                    <View style={styles.deviceSignal}>
                      <Ionicons
                        name={getRssiIcon(device.rssi)}
                        size={14}
                        color={getRssiColor(device.rssi)}
                      />
                      <Text style={styles.deviceRssi}>{device.rssi} dBm</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={22} color="#5a7a9a" />
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
  deviceSignal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  deviceRssi: {
    color: '#a8d4ff',
    fontSize: 12,
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
});

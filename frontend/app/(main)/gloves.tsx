import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient/build/LinearGradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../src/context/LanguageContext';

interface BLESensor {
  id: string;
  name: string;
  description: string;
  price: string;
  features: string[];
  affiliateLink: string;
  icon: string;
  color: string[];
  recommended?: boolean;
}

const BLE_SENSORS: BLESensor[] = [
  {
    id: 'nrf52',
    name: 'nRF52 Beacon',
    description: 'Profesionalni BLE modul sa najdužim dometom i najnižom potrošnjom energije. Idealan za ozbiljne igrače.',
    price: '15-25 EUR',
    features: [
      'Domet do 100m',
      'Baterija traje 2+ godine',
      'Vodootporan (IP67)',
      'Programabilni parametri',
    ],
    affiliateLink: 'https://example.com/nrf52-beacon',
    icon: 'hardware-chip',
    color: ['#4fc3f7', '#0288d1'],
    recommended: true,
  },
  {
    id: 'ibeacon',
    name: 'iBeacon / Eddystone',
    description: 'Standardni Bluetooth beacon kompatibilan sa iOS i Android. Jednostavan za korišćenje.',
    price: '10-20 EUR',
    features: [
      'Domet do 70m',
      'Baterija traje 1+ godina',
      'Kompaktan dizajn',
      'Plug & Play setup',
    ],
    affiliateLink: 'https://example.com/ibeacon',
    icon: 'bluetooth',
    color: ['#ab47bc', '#8e24aa'],
  },
  {
    id: 'tile',
    name: 'Tile Sticker / NutTag',
    description: 'Najjeftinija opcija za početnike. Mali, lagan i jednostavan za montažu na rukavicu.',
    price: '5-15 EUR',
    features: [
      'Domet do 30m',
      'Baterija traje 6+ meseci',
      'Ultra tanak dizajn',
      'Lako se lepi na rukavicu',
    ],
    affiliateLink: 'https://example.com/tile-sticker',
    icon: 'pricetag',
    color: ['#66bb6a', '#43a047'],
  },
];

export default function GlovesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const handleBuyNow = (sensor: BLESensor) => {
    Alert.alert(
      t('gloves.buyNow'),
      `${t('gloves.redirecting')} ${sensor.name}`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('gloves.openLink'),
          onPress: () => {
            // Placeholder - u pravoj aplikaciji ovde ide affiliate link
            Linking.openURL(sensor.affiliateLink).catch(() => {
              Alert.alert(t('common.error'), t('gloves.linkError'));
            });
          },
        },
      ]
    );
  };

  const handleBluetoothSetup = () => {
    router.push('/(game)/bluetooth-setup');
  };

  return (
    <LinearGradient colors={['#0a1628', '#1a3a5c', '#0d2137']} style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 10 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <LinearGradient colors={['#4fc3f7', '#0288d1']} style={styles.iconGradient}>
              <Ionicons name="hand-left" size={40} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.title}>{t('gloves.title')}</Text>
          <Text style={styles.subtitle}>{t('gloves.subtitle')}</Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['rgba(79, 195, 247, 0.15)', 'rgba(2, 136, 209, 0.1)']}
            style={styles.heroCard}
          >
            <Ionicons name="sparkles" size={24} color="#ffd700" />
            <Text style={styles.heroTitle}>{t('gloves.activateTitle')}</Text>
            <Text style={styles.heroText}>{t('gloves.activateDescription')}</Text>
          </LinearGradient>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>{t('gloves.whatAreBLE')}</Text>
          <Text style={styles.descriptionText}>{t('gloves.bleDescription')}</Text>
        </View>

        {/* BLE Sensors List */}
        <View style={styles.sensorsSection}>
          <Text style={styles.sectionTitle}>{t('gloves.chooseSensor')}</Text>
          
          {BLE_SENSORS.map((sensor) => (
            <View key={sensor.id} style={styles.sensorCard}>
              {sensor.recommended && (
                <View style={styles.recommendedBadge}>
                  <Ionicons name="star" size={12} color="#ffd700" />
                  <Text style={styles.recommendedText}>{t('gloves.recommended')}</Text>
                </View>
              )}
              
              <View style={styles.sensorHeader}>
                <LinearGradient colors={sensor.color} style={styles.sensorIcon}>
                  <Ionicons name={sensor.icon as any} size={28} color="#fff" />
                </LinearGradient>
                <View style={styles.sensorInfo}>
                  <Text style={styles.sensorName}>{sensor.name}</Text>
                  <Text style={styles.sensorPrice}>{sensor.price}</Text>
                </View>
              </View>
              
              <Text style={styles.sensorDescription}>{sensor.description}</Text>
              
              <View style={styles.featuresContainer}>
                {sensor.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
              
              <TouchableOpacity
                style={styles.buyButton}
                onPress={() => handleBuyNow(sensor)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={sensor.color}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buyButtonGradient}
                >
                  <Ionicons name="cart" size={20} color="#fff" />
                  <Text style={styles.buyButtonText}>{t('gloves.buyNow')}</Text>
                  <Ionicons name="open-outline" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* How it Works Section */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>{t('gloves.howItWorks')}</Text>
          
          <View style={styles.stepsContainer}>
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: '#4fc3f7' }]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{t('gloves.step1Title')}</Text>
                <Text style={styles.stepText}>{t('gloves.step1Text')}</Text>
              </View>
            </View>
            
            <View style={styles.stepConnector} />
            
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: '#ab47bc' }]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{t('gloves.step2Title')}</Text>
                <Text style={styles.stepText}>{t('gloves.step2Text')}</Text>
              </View>
            </View>
            
            <View style={styles.stepConnector} />
            
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: '#ff7043' }]}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{t('gloves.step3Title')}</Text>
                <Text style={styles.stepText}>{t('gloves.step3Text')}</Text>
              </View>
            </View>
            
            <View style={styles.stepConnector} />
            
            <View style={styles.stepItem}>
              <View style={[styles.stepNumber, { backgroundColor: '#66bb6a' }]}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{t('gloves.step4Title')}</Text>
                <Text style={styles.stepText}>{t('gloves.step4Text')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* DIY Section */}
        <View style={styles.diySection}>
          <LinearGradient
            colors={['rgba(255, 112, 67, 0.15)', 'rgba(244, 81, 30, 0.1)']}
            style={styles.diyCard}
          >
            <Ionicons name="construct" size={32} color="#ff7043" />
            <Text style={styles.diyTitle}>{t('gloves.diyTitle')}</Text>
            <Text style={styles.diyText}>{t('gloves.diyText')}</Text>
          </LinearGradient>
        </View>

        {/* Bluetooth Setup Button */}
        <TouchableOpacity
          style={styles.setupButton}
          onPress={handleBluetoothSetup}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4fc3f7', '#0288d1']}
            style={styles.setupButtonGradient}
          >
            <Ionicons name="bluetooth" size={24} color="#fff" />
            <Text style={styles.setupButtonText}>{t('gloves.bluetoothSetup')}</Text>
            <Ionicons name="arrow-forward" size={22} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Info Note */}
        <View style={styles.infoNote}>
          <Ionicons name="information-circle" size={20} color="#4fc3f7" />
          <Text style={styles.infoText}>{t('gloves.affiliateNote')}</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerIcon: {
    marginBottom: 16,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4fc3f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#a8d4ff',
    marginTop: 8,
    textAlign: 'center',
  },
  heroSection: {
    marginBottom: 24,
  },
  heroCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.3)',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffd700',
    marginTop: 12,
    textAlign: 'center',
  },
  heroText: {
    fontSize: 14,
    color: '#a8d4ff',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#a8d4ff',
    lineHeight: 22,
  },
  sensorsSection: {
    marginBottom: 24,
  },
  sensorCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.2)',
    position: 'relative',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a3a5c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  recommendedText: {
    color: '#ffd700',
    fontSize: 11,
    fontWeight: '700',
  },
  sensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sensorIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensorInfo: {
    marginLeft: 14,
    flex: 1,
  },
  sensorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  sensorPrice: {
    fontSize: 16,
    color: '#4fc3f7',
    fontWeight: '600',
    marginTop: 2,
  },
  sensorDescription: {
    fontSize: 14,
    color: '#a8d4ff',
    lineHeight: 20,
    marginBottom: 12,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  featureText: {
    color: '#a8d4ff',
    fontSize: 13,
  },
  buyButton: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  buyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  buyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  howItWorksSection: {
    marginBottom: 24,
  },
  stepsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  stepContent: {
    marginLeft: 14,
    flex: 1,
  },
  stepTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  stepText: {
    color: '#a8d4ff',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  stepConnector: {
    width: 2,
    height: 20,
    backgroundColor: 'rgba(79, 195, 247, 0.3)',
    marginLeft: 15,
    marginVertical: 8,
  },
  diySection: {
    marginBottom: 24,
  },
  diyCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 112, 67, 0.3)',
  },
  diyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ff7043',
    marginTop: 12,
  },
  diyText: {
    fontSize: 14,
    color: '#a8d4ff',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  setupButton: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#4fc3f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  setupButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 12,
  },
  setupButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(79, 195, 247, 0.1)',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  infoText: {
    flex: 1,
    color: '#a8d4ff',
    fontSize: 12,
    lineHeight: 18,
  },
});

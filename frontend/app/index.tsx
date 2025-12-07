import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Animations
  const snowflakeAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Snowflake rotation
    Animated.loop(
      Animated.timing(snowflakeAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    // Title fade in
    Animated.sequence([
      Animated.delay(300),
      Animated.spring(titleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Buttons slide up
    Animated.sequence([
      Animated.delay(600),
      Animated.spring(buttonsAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for main icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = snowflakeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#0a1628', '#1a3a5c', '#0d2137']}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      {/* Floating snowflakes background */}
      <View style={styles.snowflakesContainer}>
        {[...Array(15)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.snowflake,
              {
                left: Math.random() * width,
                top: Math.random() * height * 0.6,
                opacity: 0.1 + Math.random() * 0.3,
                transform: [{ scale: 0.3 + Math.random() * 0.7 }],
              },
            ]}
          >
            <Ionicons name="snow" size={24} color="#a8d4ff" />
          </Animated.View>
        ))}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Animated Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ rotate: spin }, { scale: pulseAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#4fc3f7', '#29b6f6', '#0288d1']}
            style={styles.iconGradient}
          >
            <Ionicons name="snow" size={80} color="#ffffff" />
          </LinearGradient>
        </Animated.View>

        {/* Title */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleAnim,
              transform: [
                {
                  translateY: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.title}>ZALEDJEN</Text>
          <Text style={styles.titleDivider}>-</Text>
          <Text style={styles.titleSecond}>ODLEDJEN</Text>
          <Text style={styles.subtitle}>Decija igra zamrzavanja</Text>
        </Animated.View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons name="people" size={20} color="#4fc3f7" />
            <Text style={styles.featureText}>Vise igraca</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="bluetooth" size={20} color="#4fc3f7" />
            <Text style={styles.featureText}>Bluetooth dodir</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="trophy" size={20} color="#4fc3f7" />
            <Text style={styles.featureText}>Rangiranje</Text>
          </View>
        </View>
      </View>

      {/* Buttons */}
      <Animated.View
        style={[
          styles.buttonsContainer,
          {
            opacity: buttonsAnim,
            transform: [
              {
                translateY: buttonsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#4fc3f7', '#0288d1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <Ionicons name="log-in-outline" size={24} color="#fff" />
            <Text style={styles.primaryButtonText}>Prijavi se</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/(auth)/register')}
          activeOpacity={0.8}
        >
          <Ionicons name="person-add-outline" size={24} color="#4fc3f7" />
          <Text style={styles.secondaryButtonText}>Registruj se</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Footer */}
      <Text style={styles.footer}>Verzija 1.0.0</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  snowflakesContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  snowflake: {
    position: 'absolute',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  iconGradient: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4fc3f7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 4,
    textShadowColor: '#4fc3f7',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  titleDivider: {
    fontSize: 32,
    color: '#4fc3f7',
    marginVertical: -5,
  },
  titleSecond: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 4,
    textShadowColor: '#ff7043',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#a8d4ff',
    marginTop: 10,
    letterSpacing: 2,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 20,
    marginTop: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(79, 195, 247, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.3)',
  },
  featureText: {
    color: '#ffffff',
    marginLeft: 8,
    fontSize: 14,
  },
  buttonsContainer: {
    paddingHorizontal: 30,
    paddingBottom: 30,
    gap: 15,
  },
  primaryButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#4fc3f7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
    gap: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#4fc3f7',
    gap: 10,
  },
  secondaryButtonText: {
    color: '#4fc3f7',
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    textAlign: 'center',
    color: '#5a7a9a',
    fontSize: 12,
    paddingBottom: 10,
  },
});

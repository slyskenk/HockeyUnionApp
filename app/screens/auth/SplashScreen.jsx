import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  View,
  Text,
  Image,
} from 'react-native';
import LottieView from 'lottie-react-native';

export default function SplashScreen() {
  const router = useRouter();

  // Animated values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const logoBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate logo with fade and bounce
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoBounce, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(textAnim, {
          toValue: 1,
          duration: 1500,
          delay: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const timer = setTimeout(() => {
      router.push('LoginScreen');
    }, 3500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      {/* Animated logo */}
      <Animated.Image
        source={require('../../../assets/images/logo.jpeg')}
        style={[
          styles.logo,
          {
            opacity: logoAnim,
            transform: [
              {
                translateY: logoBounce.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0], // bounce effect
                }),
              },
            ],
          },
        ]}
        resizeMode="contain"
      />

      {/* Animated Lottie animation */}
      <Animated.View style={{ opacity: fadeAnim }}>
        <LottieView
          source={require('../../../components/Skipping-man.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      </Animated.View>

      {/* Animated app title */}
      <Animated.Text style={[styles.title, { opacity: textAnim }]}>
        Hockey Union
      </Animated.Text>

      {/* Loading spinner */}
      <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  lottie: {
    width: 250,
    height: 250,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#1C1C1E',
  },
});

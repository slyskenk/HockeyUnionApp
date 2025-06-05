import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';

export default function SplashScreen() {
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const logoBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
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

    // Navigate to login after a short delay (e.g., 3 seconds)
    const timeout = setTimeout(() => {
      router.replace('/screens/auth/login');
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={styles.container}>
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
                  outputRange: [-50, 0],
                }),
              },
            ],
          },
        ]}
        resizeMode="contain"
      />

      <Animated.View style={{ opacity: fadeAnim }}>
        <LottieView
          source={require('../../../components/Skipping-man.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
      </Animated.View>

      <Animated.Text style={[styles.title, { opacity: textAnim }]}>
        Hockey Union
      </Animated.Text>

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

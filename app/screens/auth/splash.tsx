
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.shadow]}
          onPress={() => router.push('/screens/auth/login')}
        >
          <Ionicons name="log-in-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.signupButton, styles.shadow]}
          onPress={() => router.push('/screens/auth/signup')}
        >
          <Ionicons name="person-add-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
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
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  signupButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

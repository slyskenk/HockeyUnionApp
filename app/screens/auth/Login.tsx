import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import SocialButtons from '../../../components/SocialButton';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase/firebase'; // Adjust this path if needed


export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      // 🔐 Sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 🔍 Fetch role from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        throw new Error('User role not found in Firestore.');
      }

      const role = userDoc.data()?.role;

      // 🎯 Navigate based on role
      switch (role) {
        case 'Player':
          router.replace('/screens/player/Dashboard');
          break;
        case 'Coach':
          router.replace('/screens/coach/Dashboard');
          break;
        case 'Admin':
          router.replace('/screens/admin/Dashboard');
          break;
        case 'Supporter':
          router.replace('/screens/supporter/Dashboard');
          break;
        default:
          Alert.alert('Error', 'User role is undefined.');
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/images/logo.jpeg')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Please Sign In</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>SIGN IN</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.orText}>or sign in with</Text>
      <SocialButtons />

      <TouchableOpacity onPress={() => router.push('/screens/auth/signup')}>
        <Text style={styles.linkText}>
          Don't have an account?
          <Text style={styles.link}> SIGN UP</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 80,
    height: 80,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  button: {
    backgroundColor: '#005D8F',
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  orText: {
    marginVertical: 8,
  },
  linkText: {
    marginTop: 20,
  },
  link: {
    fontWeight: 'bold',
    color: '#005D8F',
  },
});

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import SocialButtons from '../../../components/SocialButton';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'; // Added setDoc, Timestamp
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
      // 🔐 Sign in the user with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; // Get the authenticated user object

      // 🔍 Try to fetch the user's profile from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      let userRole: string; // Variable to store the user's determined role

      if (!userDocSnap.exists()) {
        // 🚨 User document NOT found in Firestore, this is a first-time login after Firebase Auth signup
        console.warn(`Firestore user document not found for UID: ${user.uid}. Creating a default profile.`);

        // Assign a default role and name for new users
        userRole = 'Player'; // Or 'Fan', depending on your default for new sign-ups
        const defaultName = email.split('@')[0]; // Simple name from email for new users
        const defaultAvatar = `https://placehold.co/40x40/6633FF/FFFFFF?text=${defaultName.substring(0,2).toUpperCase()}`;

        // Create the user document in Firestore with default values
        await setDoc(userDocRef, {
          uid: user.uid,
          name: defaultName,
          email: user.email || email, // Use Firebase Auth email, fallback to input email
          role: userRole,
          createdAt: Timestamp.now(), // Use Firestore server timestamp
          avatar: defaultAvatar,
        });

        Alert.alert(
          'Welcome!',
          `Your basic profile as a '${userRole}' has been created. You can now use the forum!`
        );

      } else {
        // ✅ User document found in Firestore, get their existing role
        userRole = userDocSnap.data()?.role;
      }

      // 🎯 Navigate based on the determined role
      switch (userRole) {
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
          // If the role is still undefined or an unexpected value, show an error
          Alert.alert('Login Failed', 'User role is invalid or not set. Please contact support.');
      }
    } catch (error: any) {
      // Handle Firebase Auth errors (e.g., wrong password, user not found)
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false); // Always stop loading, regardless of success or failure
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

      <TouchableOpacity onPress={() => router.push('/screens/auth/SignUp')}>
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

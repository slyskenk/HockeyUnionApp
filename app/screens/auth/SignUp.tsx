import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import SocialButtons from '../../../components/SocialButton';

// 🔥 Firebase
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'; // Import sendEmailVerification
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase/firebase';

export default function SignupScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Dropdown state
  const [open, setOpen] = useState(false);
  const [userType, setUserType] = useState('Player');
  const [items, setItems] = useState([
    { label: 'Player', value: 'Player' },
    { label: 'Coach', value: 'Coach' },
    { label: 'Admin', value: 'Admin' },
    { label: 'Supporter', value: 'Supporter' },
  ]);

  const handleSignup = async () => {
    // Basic client-side email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address format.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // --- Send Email Verification ---
      await sendEmailVerification(user);

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        email,
        role: userType,
        createdAt: new Date().toISOString(),
        emailVerified: false, // Add a flag to track email verification status
      });

      // Inform the user about the verification email
      Alert.alert(
        'Account Created! Please Verify Your Email',
        `A verification email has been sent to ${email}. Please check your inbox (and spam folder) and click the link to verify your account before logging in.`
      );

      // Redirect after showing the alert
      // Consider always redirecting to login to enforce verification
      router.replace('/screens/auth/Login');

      // Removed direct dashboard redirection here, as verification is now required
      // You can implement checks on dashboard screens to ensure email is verified
      // For example, in Dashboard useEffect, you can check auth.currentUser?.emailVerified
    } catch (error) {
      const err = error as { code?: string; message: string }; // Use 'code' for specific Firebase errors
      let errorMessage = err.message;

      // Handle specific Firebase errors for better user feedback
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already in use. Please try logging in or use a different email.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'The email address is not valid.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      }

      Alert.alert('Signup Error', errorMessage);
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
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        placeholder="Name"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />
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
      <TextInput
        placeholder="Confirm password"
        secureTextEntry
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {/* Role Dropdown */}
      <View style={styles.dropdownWrapper}>
        <Text style={styles.dropdownLabel}>Select Role</Text>
        <DropDownPicker
          open={open}
          value={userType}
          items={items}
          setOpen={setOpen}
          setValue={setUserType}
          setItems={setItems}
          placeholder="Select a role"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          zIndex={1000} // Ensure dropdown is above other elements
          zIndexInverse={3000} // Ensure other elements don't overlap dropdown
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleSignup}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Signing up...' : 'SIGN UP'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.orText}>or sign up with</Text>
      <SocialButtons />

      <TouchableOpacity onPress={() => router.push('/screens/auth/Login')}>
        <Text style={styles.linkText}>
          Have an account? <Text style={styles.link}>SIGN IN</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', backgroundColor: '#fff' },
  logo: { width: 80, height: 80, marginTop: 30 },
  title: { fontSize: 24, fontWeight: 'bold', marginVertical: 20 },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  dropdownWrapper: { width: '100%', marginVertical: 8, zIndex: 1000 },
  dropdownLabel: {
    marginBottom: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dropdown: {
    backgroundColor: '#f0f0f0',
    borderColor: '#ccc',
  },
  dropdownContainer: {
    backgroundColor: '#fafafa',
    borderColor: '#ccc',
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
  buttonText: { color: '#fff', fontWeight: 'bold' },
  orText: { marginVertical: 8 },
  linkText: { marginTop: 20 },
  link: { fontWeight: 'bold', color: '#005D8F' },
});
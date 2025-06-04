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
import { Picker } from '@react-native-picker/picker';
import SocialButtons from '../../../components/SocialButton';
import { useRouter } from 'expo-router';


// 🔥 Firebase
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase/firebase'; // make sure these are correctly set up

export default function SignupScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'Player' | 'Coach' | 'Admin' | 'Supporter'>('Player');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // 🔥 Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 🔥 Save user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name,
        email,
        role: userType,
        createdAt: new Date().toISOString(),
      });

      Alert.alert('Success', `Account created for ${email} as ${userType}`);
      router.push('/screens/auth/LoginScreen');
    } catch (error) {
      const err = error as { message: string };
      Alert.alert('Signup Error', err.message);
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

      {/* Dropdown */}
      <View style={styles.dropdownWrapper}>
        <Text style={styles.dropdownLabel}>Select Role</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={userType}
            onValueChange={(itemValue) => setUserType(itemValue)}
            style={styles.picker}
            dropdownIconColor="#005D8F"
          >
            <Picker.Item label="Player" value="Player" />
            <Picker.Item label="Coach" value="Coach" />
            <Picker.Item label="Admin" value="Admin" />
            <Picker.Item label="Supporter" value="Supporter" />
          </Picker>
        </View>
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

      <TouchableOpacity onPress={() => router.push('/screens/auth/LoginScreen')}>
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
  dropdownWrapper: { width: '100%', marginVertical: 8 },
  dropdownLabel: {
    marginBottom: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
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

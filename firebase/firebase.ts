// Import Firebase modules
import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyA-Z-7mzFScX-BTDD85ShkGGL6iavxeIOE',
  authDomain: 'hockey-union.firebaseapp.com',
  projectId: 'hockey-union',
  storageBucket: 'hockey-union.appspot.com',
  messagingSenderId: '163997337297',
  appId: '1:163997337297:web:785da756306ed75686a7f0'
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence for React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

// Export everything you need
export {
  app,
  auth,
  db,
  storage,
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where
};

import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  getReactNativePersistence
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

const firebaseConfig = {
  apiKey: 'AIzaSyA-Z-7mzFScX-BTDD85ShkGGL6iavxeIOE',
  authDomain: 'hockey-union.firebaseapp.com',
  projectId: 'hockey-union',
  storageBucket: 'hockey-union.appspot.com',
  messagingSenderId: '163997337297',
  appId: '1:163997337297:web:785da756306ed75686a7f0'
};

const app = initializeApp(firebaseConfig);

// IMPORTANT: Use AsyncStorage persistence here to REMEMBER the user after app restarts
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);
const storage = getStorage(app);

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

import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react'; // Import useEffect
import {
  ActivityIndicator, // Import ActivityIndicator for loading state
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// 🔥 Firebase Imports
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase/firebase'; // ✅ Adjust path if needed

export default function PlayerProfileScreen() {
  const router = useRouter();

  const coachPhoneNumber = 'tel:+1234567890'; // Replace with the actual coach's phone number

  // State for the player's profile image and other details
  const [profileImage, setProfileImage] = useState<string | null>(
    'https://images.unsplash.com/photo-1617019114583-0b83f9c09d3d' // Initial dummy image
  );
  const [playerName, setPlayerName] = useState<string>('Player Name'); // Default name
  const [playerRole, setPlayerRole] = useState<string>('Role'); // e.g., "Forward"
  const [playerJerseyNumber, setPlayerJerseyNumber] = useState<string>('#00'); // e.g., "#17"
  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);

  // Effect to fetch player's name and other profile details from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setPlayerName(userData.name || 'Player');
            setPlayerRole(userData.role || 'Player'); // Assuming 'role' field exists
            setPlayerJerseyNumber(userData.jerseyNumber ? `#${userData.jerseyNumber}` : '#00'); // Assuming 'jerseyNumber' field exists
            // You can also fetch the profile image URI if stored in Firestore
            if (userData.profileImage) {
              setProfileImage(userData.profileImage);
            }
          } else {
            console.log('No user document found for UID:', user.uid);
            setPlayerName('Player Not Found');
          }
        } catch (error) {
          console.error('Error fetching player profile:', error);
          Alert.alert('Error', 'Failed to load player profile. Please try again.');
        } finally {
          setLoadingProfile(false);
        }
      } else {
        // No user is logged in
        setPlayerName('Guest Player');
        setLoadingProfile(false);
        // Optionally, redirect to login if no user is found
        // router.replace('/screens/auth/login');
      }
    });

    return unsubscribe; // Cleanup the listener on component unmount
  }, []);

  const handleCallCoach = async () => {
    try {
      const supported = await Linking.canOpenURL(coachPhoneNumber);

      if (supported) {
        await Linking.openURL(coachPhoneNumber);
      } else {
        Alert.alert('Error', `Phone calls are not supported on this device or the number is invalid: ${coachPhoneNumber}`);
      }
    } catch (error) {
      console.error('An error occurred while trying to make a call:', error);
      Alert.alert('Error', 'Could not initiate call. Please try again later.');
    }
  };

  // Function to pick an image from the device's library
  const pickImage = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant media library permissions to select a profile picture.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Allow user to crop/edit the image
      aspect: [1, 1], // Force a square aspect ratio for profile pictures
      quality: 1, // High quality
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri); // Set the selected image URI as the profile image
      // TODO: Implement image upload to Firebase Storage and update Firestore 'profileImage' field
      Alert.alert('Image Selected', 'You can now upload this image to Firebase Storage.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <LinearGradient
        colors={['#2E5AAC', '#3D7BE5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Player Profile</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          <Image
            source={{ uri: profileImage || 'https://placehold.co/120x120/CCCCCC/FFFFFF?text=No+Image' }}
            style={styles.avatar}
          />
          <View style={styles.editAvatarOverlay}>
            <MaterialIcons name="camera-alt" size={30} color="#fff" />
          </View>
        </TouchableOpacity>
        {loadingProfile ? (
          <ActivityIndicator size="large" color="#2E5AAC" style={{ marginTop: 10 }} />
        ) : (
          <>
            <Text style={styles.name}>{playerName}</Text>
            <Text style={styles.position}>{playerRole} | {playerJerseyNumber}</Text>
          </>
        )}
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Season Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>21</Text>
            <Text style={styles.statLabel}>Goals</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>14</Text>
            <Text style={styles.statLabel}>Assists</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>35</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.aboutSection}>
        <Text style={styles.sectionTitle}>About Me</Text>
        <Text style={styles.aboutText}>
          Passionate hockey player with a strong offensive mindset and dedication to teamwork. Always striving for
          improvement and bringing energy to the ice every game.
        </Text>
      </View>

      {/* Gallery Section */}
      <View style={styles.gallerySection}>
        <Text style={styles.sectionTitle}>Gallery</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1580927752452-89d86da3fa0e' }}
            style={styles.galleryImage}
          />
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1600788907411-045f4d4177d5' }}
            style={styles.galleryImage}
          />
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa' }}
            style={styles.galleryImage}
          />
        </ScrollView>
      </View>

      {/* Contact Coach Button */}
      <TouchableOpacity style={styles.contactButton} onPress={handleCallCoach}>
        <Ionicons name="call-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.contactButtonText}>Contact Coach</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F9' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    resizeMode: 'cover',
  },
  editAvatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E5AAC',
  },
  position: {
    fontSize: 16,
    color: '#555',
  },
  statsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E5AAC',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3D7BE5',
  },
  statLabel: {
    fontSize: 14,
    color: '#555',
  },
  aboutSection: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  aboutText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  gallerySection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  galleryImage: {
    width: 180,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#2E5AAC',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
// app/screens/player/Dashboard.tsx

import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert, // Import Alert for user feedback
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// 🔥 Firebase Imports
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Import signOut
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase/firebase'; // ✅ Adjust path if needed

const { width, height } = Dimensions.get('window');

// --- Interfaces for TypeScript ---
interface DashboardRole {
  label: string;
  route: string;
}

// --- Dummy Data (Player Specific - PLAYER_NAME will be dynamic) ---

const PLAYER_TEAM = 'Desert Scorpions (Men)';
const PLAYER_JERSEY_NUMBER = 7; // This could also be fetched from Firestore if stored

const DUMMY_PLAYER_STATS = {
  goals: 15,
  assists: 8,
  gamesPlayed: 10,
  manOfTheMatch: 3,
};

const DUMMY_UPCOMING_EVENTS = [
  { id: 'e1', date: 'June 10', time: '18:00', type: 'Match', opponent: 'Oryx Chargers', location: 'National Stadium' },
  { id: 'e2', date: 'June 12', time: '16:00', type: 'Training', focus: 'Attacking Drills', location: 'DTS Field' },
];

const DUMMY_TEAM_ANNOUNCEMENTS = [
  { id: 'a1', text: 'Important: Team meeting after practice on Friday.', type: 'alert' },
  { id: 'a2', text: 'New gym session schedule posted in Training Resources.', type: 'info' },
];

const DUMMY_TRAINING_FOCUS = 'Next Session Focus: Defensive Positioning & Set Pieces';

// Define the available dashboard roles and their corresponding routes
const DASHBOARD_ROLES: DashboardRole[] = [
  { label: 'Admin Dashboard', route: './../admin/Dashboard' },
  { label: 'Supporter Dashboard', route: './../supporter/Dashboard' },
  { label: 'Player Dashboard', route: './../player/Dashboard' },
  { label: 'Coach Dashboard', route: './../coach/Dashboard' },
];

// --- PlayerDashboard Component ---

const PlayerDashboard = () => {
  const router = useRouter();
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [currentRole, setCurrentRole] = useState<DashboardRole>(
    DASHBOARD_ROLES.find(role => role.label === 'Player Dashboard') || DASHBOARD_ROLES[0]
  );

  // New state for player's name and loading indicator
  const [playerName, setPlayerName] = useState<string>('');
  const [loadingPlayerName, setLoadingPlayerName] = useState(true);

  // Effect to fetch player's name from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setPlayerName(userData.name || 'Player'); // Set name from Firestore, fallback to 'Player'
          } else {
            setPlayerName('Player'); // User doc not found, fallback
          }
        } catch (error) {
          console.error('Error fetching player name:', error);
          setPlayerName('Player'); // Error fetching, fallback
        } finally {
          setLoadingPlayerName(false); // Stop loading regardless of success/failure
        }
      } else {
        setPlayerName(''); // No user, clear name
        setLoadingPlayerName(false); // Stop loading
        // Redirect to login if no user is found
        router.replace('/screens/auth/Login');
      }
    });

    return unsubscribe; // Cleanup the listener on component unmount
  }, []); // Run once on component mount

  const handleRoleChange = (role: DashboardRole) => {
    setCurrentRole(role);
    setShowRoleSelector(false);
    router.push(role.route as any); // Cast to any to bypass strict type checking for `router.push`
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      Alert.alert('Signed Out', 'You have been successfully signed out.');
      router.replace('/screens/auth/Login'); // Redirect to login screen
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Sign Out Error', 'Failed to sign out. Please try again.');
    }
  };

  // Navigation functions (Player specific)
  const handleViewMyStats = () => {
    console.log('Navigating to Player Profile for detailed stats');
    router.push('./../player/Profile' as any);
  };

  const handleViewTeamSchedule = () => {
    console.log('Navigating to Events (Fixtures & Training)');
    router.push('./../player/Events' as any);
  };

  const handleViewTeamMembers = () => {
    console.log('Navigating to My Team (Roster)');
    router.push('./../player/MyTeam' as any);
  };

  // Renamed function
  const handleViewTrainingSchedule = () => {
    console.log('Navigating to Training Schedule');
    router.push('./../player/TrainingScheduleScreen' as any);
  };

  const handleViewAllTeamNews = () => {
    console.log('Navigating to Player News Screen');
    router.push('./../player/News' as any);
  };

  const handleGoToChatbot = () => {
    console.log('Navigating to Chatbot');
    router.push('./../player/Chatbot' as any);
  };

  const handleGoToForum = () => {
    console.log('Navigating to Forum');
    router.push('./../player/Forum' as any);
  };

  const handleGoToPollsVoting = () => {
    console.log('Navigating to Polls Voting');
    router.push('./../player/PollsVoting' as any);
  };

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#4A90E2', '#283593']} // Consistent gradient
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.header}
      >
        <Image
          source={require('../../../assets/images/logo.jpeg')} // Your logo
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.welcomeText}>Welcome,</Text>
          {loadingPlayerName ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.headerTitle}>{playerName}</Text>
          )}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <MaterialIcons name="logout" size={24} color="#fff" />
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* My Performance Overview Card - Routable */}
        <TouchableOpacity onPress={handleViewMyStats} style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="person" size={24} color="#007AFF" />
            <Text style={styles.cardTitle}>My Performance</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{DUMMY_PLAYER_STATS.goals}</Text>
              <Text style={styles.statLabel}>Goals</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{DUMMY_PLAYER_STATS.assists}</Text>
              <Text style={styles.statLabel}>Assists</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{DUMMY_PLAYER_STATS.gamesPlayed}</Text>
              <Text style={styles.statLabel}>Games</Text>
            </View>
          </View>
          {/* Keep the specific button for clear action, but the whole card is now tappable */}
          <View style={styles.fullStatsButton}>
            <Text style={styles.fullStatsButtonText}>View My Full Profile</Text>
            <MaterialIcons name="arrow-forward-ios" size={14} color="#007AFF" />
          </View>
        </TouchableOpacity>

        {/* Upcoming Events Card - Routable */}
        <TouchableOpacity onPress={handleViewTeamSchedule} style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="event" size={24} color="#FF9500" />
            <Text style={styles.cardTitle}>Upcoming Events</Text>
          </View>
          {DUMMY_UPCOMING_EVENTS.map(event => (
            <View key={event.id} style={styles.fixtureItem}>
              <Text style={styles.fixtureDate}>{event.date}</Text>
              <View style={styles.fixtureDetails}>
                <Text style={styles.fixtureText}>{event.type === 'Match' ? `Match vs. ${event.opponent}` : `Training (${event.focus})`}</Text>
                <Text style={styles.fixtureLocation}>{event.location} at {event.time}</Text>
              </View>
            </View>
          ))}
          <View style={styles.viewAllButton}>
            <Text style={styles.viewAllButtonText}>View Full Team Schedule</Text>
            <MaterialIcons name="chevron-right" size={20} color="#007AFF" />
          </View>
        </TouchableOpacity>

        {/* My Team Card - Routable */}
        <TouchableOpacity onPress={handleViewTeamMembers} style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="groups" size={24} color="#34C759" />
            <Text style={styles.cardTitle}>My Team</Text>
          </View>
          <View style={styles.teamSnapshot}>
            <Text style={styles.teamSnapshotText}>You are part of the <Text style={{ fontWeight: 'bold' }}>{PLAYER_TEAM}</Text>.</Text>
            {/* If jersey number is static or fetched from user data, you can display it here */}
            <Text style={styles.teamSnapshotText}>Jersey Number: <Text style={{ fontWeight: 'bold', color: '#007AFF' }}>#{PLAYER_JERSEY_NUMBER}</Text></Text>
          </View>
          <View style={styles.viewAllButton}>
            <Text style={styles.viewAllButtonText}>View Team Roster</Text>
            <MaterialIcons name="chevron-right" size={20} color="#007AFF" />
          </View>
        </TouchableOpacity>

        {/* Training Schedule Card - Routable */}
        <TouchableOpacity onPress={handleViewTrainingSchedule} style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="fitness-center" size={24} color="#5856D6" />
            <Text style={styles.cardTitle}>Training Schedule</Text>
          </View>
          <View style={styles.trainingDetails}>
            <Text style={styles.trainingText}><MaterialIcons name="accessibility" size={16} color="#333" /> {DUMMY_TRAINING_FOCUS}</Text>
            <Text style={styles.trainingInfo}>View upcoming training sessions, drills, and fitness plans.</Text>
          </View>
          <View style={styles.viewAllButton}>
            <Text style={styles.viewAllButtonText}>View Training Schedule</Text>
            <MaterialIcons name="chevron-right" size={20} color="#007AFF" />
          </View>
        </TouchableOpacity>

        {/* Team Announcements Card - Routable */}
        <TouchableOpacity onPress={handleViewAllTeamNews} style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="campaign" size={24} color="#FF3B30" />
            <Text style={styles.cardTitle}>Team Announcements</Text>
          </View>
          {DUMMY_TEAM_ANNOUNCEMENTS.map(announcement => (
            <View key={announcement.id} style={styles.announcementItem}>
              <MaterialIcons
                name={announcement.type === 'info' ? 'info-outline' : 'warning-amber'}
                size={20}
                color={announcement.type === 'info' ? '#007AFF' : '#FF3B30'}
                style={{ marginRight: 10 }}
              />
              <Text style={styles.announcementText}>{announcement.text}</Text>
            </View>
          ))}
          <View style={styles.viewAllButton}>
            <Text style={styles.viewAllButtonText}>View All Team News</Text>
            <MaterialIcons name="chevron-right" size={20} color="#007AFF" />
          </View>
        </TouchableOpacity>

        {/* Communication & Engagement Hub Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="chat" size={24} color="#FFD700" />
            <Text style={styles.cardTitle}>Communication & Engagement</Text>
          </View>
          <TouchableOpacity style={styles.communicationButton} onPress={handleGoToChatbot}>
            <MaterialIcons name="message" size={20} color="#007AFF" />
            <Text style={styles.communicationButtonText}>AI Tactical Chatbot</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.communicationButton} onPress={handleGoToForum}>
            <MaterialIcons name="forum" size={20} color="#007AFF" />
            <Text style={styles.communicationButtonText}>Team Forum</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.communicationButton} onPress={handleGoToPollsVoting}>
            <MaterialIcons name="how-to-vote" size={20} color="#007AFF" />
            <Text style={styles.communicationButtonText}>Polls & Voting</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Role Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showRoleSelector}
        onRequestClose={() => setShowRoleSelector(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowRoleSelector(false)}>
          <View style={styles.modalContent}>
            {DASHBOARD_ROLES.map((role, index) => (
              <TouchableOpacity
                key={index}
                style={styles.modalRoleOption}
                onPress={() => handleRoleChange(role)}
              >
                <Text style={styles.modalRoleText}>{role.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Light background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Added to space out logo and toggle
    paddingTop: 50,
    paddingBottom: 20, // More padding for gradient effect
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20, // Rounded bottom corners for header
    borderBottomRightRadius: 20,
    overflow: 'hidden', // Ensures gradient respects border radius
  },
  headerLogo: {
    width: 60,
    height: 60,
    marginRight: 15,
    borderRadius: 30, // Made circular, consistent with coach dashboard
  },
  headerTextContainer: {
    flex: 1, // Allows text to take available space
    marginRight: 10, // Space between text and toggle
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  // New style for the sign out button
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)', // Slightly transparent white
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginLeft: 10, // Added margin for spacing
  },
  signOutButtonText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff', // White text for visibility on gradient
  },
  // Existing styles below this line (no changes to them)
  roleSelectorToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)', // Slightly transparent white for contrast
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  currentRoleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff', // White text on gradient background
    marginRight: 5,
  },
  scrollViewContent: {
    padding: 15,
    paddingBottom: 30, // Extra padding at bottom
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  fullStatsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#E6F3FA',
  },
  fullStatsButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 5,
  },
  fixtureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  fixtureDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    width: 80,
  },
  fixtureDetails: {
    flex: 1,
    marginLeft: 10,
  },
  fixtureText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  fixtureLocation: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
    paddingVertical: 5,
  },
  viewAllButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 5,
  },
  teamSnapshot: {
    marginBottom: 15,
    paddingVertical: 8,
  },
  teamSnapshotText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 5,
  },
  trainingDetails: {
    marginBottom: 15,
  },
  trainingText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trainingInfo: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 5,
  },
  announcementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  announcementText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  communicationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F3FA',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  communicationButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalRoleOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalRoleText: {
    fontSize: 16,
    color: '#333',
  },
});

export default PlayerDashboard;
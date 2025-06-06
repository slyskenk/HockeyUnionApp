// app/screens/coach/Dashboard.tsx

import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebase/firebase'; // ✅ Adjust path if needed

const { width, height } = Dimensions.get('window');

// --- Interfaces for TypeScript ---
interface DashboardRole {
  label: string;
  route: string;
}

// --- Dummy Data (COACH_NAME will be dynamic now) ---
const COACH_TEAM = 'Desert Scorpions (Men)';

const DUMMY_FIXTURES = [
  { id: 'f1', date: 'June 10', time: '18:00', opponent: 'Oryx Chargers', location: 'National Stadium' },
  { id: 'f2', date: 'June 17', time: '19:30', opponent: 'Windhoek Warriors', location: 'DTS Field' },
];

const DUMMY_TEAM_STATS = {
  wins: 8,
  losses: 2,
  draws: 1,
  goalsScored: 35,
  goalsConceded: 12,
  playersCount: 18,
};

const DUMMY_KEY_PLAYERS = [
  { id: 'p1', name: 'Player One', jersey: 7, status: 'Top Scorer', avatar: 'https://placehold.co/40x40/FF5733/FFFFFF?text=P1' },
  { id: 'p2', name: 'Player Two', jersey: 10, status: 'Injured (Minor)', avatar: 'https://placehold.co/40x40/33FF57/000000?text=P2' },
  { id: 'p3', name: 'Player Three', jersey: 1, status: 'Goalkeeper', avatar: 'https://placehold.co/40x40/3357FF/FFFFFF?text=P3' },
];

const DUMMY_TRAINING = {
  date: 'June 08, 2025',
  time: '16:00 - 17:30',
  location: 'National Hockey Stadium',
  focus: 'Defensive Drills & Set Pieces',
};

const DUMMY_ANNOUNCEMENTS = [
  { id: 'a1', text: 'Reminder: Coaching Clinic on June 20th. Register now!', type: 'info' },
  { id: 'a2', text: 'New FIH Rule updates available in the Resources section.', type: 'alert' },
];

// Define the available dashboard roles and their corresponding routes
const DASHBOARD_ROLES: DashboardRole[] = [
  { label: 'Admin Dashboard', route: './../admin/Dashboard' },
  { label: 'Supporter Dashboard', route: './../supporter/Dashboard' },
  { label: 'Player Dashboard', route: './../player/Dashboard' },
  { label: 'Coach Dashboard', route: './../coach/Dashboard' },
];

// --- CoachDashboard Component ---

const CoachDashboard = () => {
  const router = useRouter();
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [currentRole, setCurrentRole] = useState<DashboardRole>(
    DASHBOARD_ROLES.find(role => role.label === 'Coach Dashboard') || DASHBOARD_ROLES[0]
  );

  // New state for coach's name and loading indicator
  const [coachName, setCoachName] = useState<string>('');
  const [loadingCoachName, setLoadingCoachName] = useState(true);

  // Effect to fetch coach's name from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setCoachName(userData.name || 'Coach'); // Set name from Firestore, fallback to 'Coach'
          } else {
            setCoachName('Coach'); // User doc not found, fallback
          }
        } catch (error) {
          console.error('Error fetching coach name:', error);
          setCoachName('Coach'); // Error fetching, fallback
        } finally {
          setLoadingCoachName(false); // Stop loading regardless of success/failure
        }
      } else {
        setCoachName(''); // No user, clear name
        setLoadingCoachName(false); // Stop loading
        // Optionally, redirect to login if no user is found
        // router.replace('/screens/auth/login');
      }
    });

    return unsubscribe; // Cleanup the listener on component unmount
  }, []); // Run once on component mount

  const handleRoleChange = (role: DashboardRole) => {
    setCurrentRole(role);
    setShowRoleSelector(false);
    // Cast to any to bypass strict type checking for `router.push`
    router.push(role.route as any);
  };

  // Navigation functions
  const handleViewDetailedStats = () => {
    console.log('Navigating to Player Analytics/Team Stats');
    router.push('./../coach/PlayerAnalytics' as any);
  };

  const handleViewFullSchedule = () => {
    console.log('Navigating to Events Editor (Fixtures)');
    router.push('./../coach/EventsEditor' as any);
  };

  const handleManagePlayers = () => {
    console.log('Navigating to Roster Manager');
    router.push('./../coach/RosterManager' as any);
  };

  const handleViewTrainingPlan = () => {
    console.log('Navigating to TrainingPlanner');
    router.push('./../coach/TrainingPlanner' as any);
  };

  const handleViewAllAnnouncements = () => {
    console.log('Navigating to News Editor (Announcements)');
    router.push('./../coach/NewsEditor' as any);
  };

  const handleGoToTeamChat = () => {
    console.log('Navigating to Tactical Chatbot or dedicated chat');
    router.push('./../coach/TacticalChatbot' as any);
  };

  const handleGoToForum = () => {
    console.log('Navigating to Forum');
    router.push('./../coach/Forum' as any);
  };

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#4A90E2', '#283593']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.header}
      >
        <Image
          source={require('../../../assets/images/logo.jpeg')}
          style={styles.headerLogo}
          resizeMode="contain"
        />

        <View style={styles.headerTextContainer}>
          <Text style={styles.welcomeText}>Welcome, Coach</Text>
          {loadingCoachName ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.headerTitle}>{coachName}</Text>
          )}
        </View>

        {/* Role Selector Toggle */}
        
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Team Overview Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="sports-hockey" size={24} color="#007AFF" />
            <Text style={styles.cardTitle}>Team Overview: {COACH_TEAM}</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{DUMMY_TEAM_STATS.wins}</Text>
              <Text style={styles.statLabel}>Wins</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{DUMMY_TEAM_STATS.losses}</Text>
              <Text style={styles.statLabel}>Losses</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{DUMMY_TEAM_STATS.playersCount}</Text>
              <Text style={styles.statLabel}>Players</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.fullStatsButton} onPress={handleViewDetailedStats}>
            <Text style={styles.fullStatsButtonText}>View Detailed Stats</Text>
            <MaterialIcons name="arrow-forward-ios" size={14} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Upcoming Fixtures Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="event" size={24} color="#FF9500" />
            <Text style={styles.cardTitle}>Upcoming Fixtures</Text>
          </View>
          {DUMMY_FIXTURES.map(fixture => (
            <View key={fixture.id} style={styles.fixtureItem}>
              <Text style={styles.fixtureDate}>{fixture.date}</Text>
              <View style={styles.fixtureDetails}>
                <Text style={styles.fixtureText}>{fixture.opponent}</Text>
                <Text style={styles.fixtureLocation}>{fixture.location} at {fixture.time}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.viewAllButton} onPress={handleViewFullSchedule}>
            <Text style={styles.viewAllButtonText}>View Full Schedule</Text>
            <MaterialIcons name="chevron-right" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Quick Player Access Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="groups" size={24} color="#34C759" />
            <Text style={styles.cardTitle}>Quick Player Access</Text>
          </View>
          {DUMMY_KEY_PLAYERS.map(player => (
            <View key={player.id} style={styles.playerQuickItem}>
              <Image source={{ uri: player.avatar }} style={styles.playerAvatar} />
              <View style={styles.playerQuickInfo}>
                <Text style={styles.playerQuickName}>{player.name} #{player.jersey}</Text>
                <Text style={styles.playerQuickStatus}>{player.status}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity style={styles.viewAllButton} onPress={handleManagePlayers}>
            <Text style={styles.viewAllButtonText}>Manage My Players</Text>
            <MaterialIcons name="chevron-right" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Training Schedule Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="fitness-center" size={24} color="#5856D6" />
            <Text style={styles.cardTitle}>Next Training Session</Text>
          </View>
          <View style={styles.trainingDetails}>
            <Text style={styles.trainingText}><MaterialIcons name="date-range" size={16} color="#333" /> {DUMMY_TRAINING.date}</Text>
            <Text style={styles.trainingText}><MaterialIcons name="access-time" size={16} color="#333" /> {DUMMY_TRAINING.time}</Text>
            <Text style={styles.trainingText}><MaterialIcons name="location-on" size={16} color="#333" /> {DUMMY_TRAINING.location}</Text>
            <Text style={styles.trainingFocus}>Focus: {DUMMY_TRAINING.focus}</Text>
          </View>
          <TouchableOpacity style={styles.viewAllButton} onPress={handleViewTrainingPlan}>
            <Text style={styles.viewAllButtonText}>View Full Training Plan</Text>
            <MaterialIcons name="chevron-right" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Recent Coach Announcements Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="campaign" size={24} color="#FF3B30" />
            <Text style={styles.cardTitle}>Coach Announcements</Text>
          </View>
          {DUMMY_ANNOUNCEMENTS.map(announcement => (
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
          <TouchableOpacity style={styles.viewAllButton} onPress={handleViewAllAnnouncements}>
            <Text style={styles.viewAllButtonText}>View All Announcements</Text>
            <MaterialIcons name="chevron-right" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Communication Hub Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="chat" size={24} color="#FFD700" />
            <Text style={styles.cardTitle}>Communication Hub</Text>
          </View>
          <TouchableOpacity style={styles.communicationButton} onPress={handleGoToTeamChat}>
            <MaterialIcons name="message" size={20} color="#007AFF" />
            <Text style={styles.communicationButtonText}>AI Tactical Assistant</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.communicationButton} onPress={handleGoToForum}>
            <MaterialIcons name="forum" size={20} color="#007AFF" />
            <Text style={styles.communicationButtonText}>Team Forum</Text>
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
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  headerLogo: {
    width: 60,
    height: 60,
    borderRadius: 30, // Made circular
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1, // Allows the text to take up available space
    marginRight: 10,
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
  roleSelectorToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  currentRoleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 5,
  },
  scrollViewContent: {
    padding: 15,
    paddingBottom: 30,
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
  playerQuickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: '#ddd',
  },
  playerQuickInfo: {
    flex: 1,
  },
  playerQuickName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  playerQuickStatus: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
  trainingFocus: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
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

export default CoachDashboard;
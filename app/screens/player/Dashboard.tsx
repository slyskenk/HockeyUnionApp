// app/screens/player/Dashboard.tsx

import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router'; // For navigation
import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// --- Dummy Data (Player Specific) ---

const PLAYER_NAME = 'Alex "The Blitzer" Smith';
const PLAYER_TEAM = 'Desert Scorpions (Men)';
const PLAYER_JERSEY_NUMBER = 7;

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
  { id: 'a2', text: 'New gym session schedule posted in Training Resources.', type: 'info' }, // Keep as-is for now as it's dummy text.
];

const DUMMY_TRAINING_FOCUS = 'Next Session Focus: Defensive Positioning & Set Pieces';

// --- PlayerDashboard Component ---

const PlayerDashboard = () => {
  const router = useRouter();

  // Navigation functions (Player specific)
  const handleViewMyStats = () => {
    console.log('Navigating to Player Profile for detailed stats');
    router.push('./../player/Profile'); // Assuming Profile page shows detailed player stats
  };

  const handleViewTeamSchedule = () => {
    console.log('Navigating to Events (Fixtures & Training)');
    router.push('./../player/Events'); // Events page for full schedule
  };

  const handleViewTeamMembers = () => {
    console.log('Navigating to My Team (Roster)');
    router.push('./../player/MyTeam');
  };

  // Renamed function
  const handleViewTrainingSchedule = () => {
    console.log('Navigating to Training Schedule');
    router.push('./../player/TrainingScheduleScreen'); // Changed path to TrainingSchedule
  };

  const handleViewAllTeamNews = () => {
    console.log('Navigating to Player News Screen');
    router.push('./../player/News'); // Corrected path to News.tsx in the player directory
  };

  const handleGoToChatbot = () => {
    console.log('Navigating to Chatbot');
    router.push('./../player/Chatbot');
  };

  const handleGoToForum = () => {
    console.log('Navigating to Forum');
    router.push('./../player/Forum');
  };

  const handleGoToPollsVoting = () => {
    console.log('Navigating to Polls Voting');
    router.push('./../player/PollsVoting');
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
          <Text style={styles.welcomeText}>Hello, {PLAYER_NAME}!</Text>
          <Text style={styles.headerTitle}>Player Dashboard</Text>
        </View>
        {/* Optional: Add a profile icon or settings icon here */}
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
            <Text style={styles.cardTitle}>Training Schedule</Text>{/* Updated title */}
          </View>
          <View style={styles.trainingDetails}>
            <Text style={styles.trainingText}><MaterialIcons name="accessibility" size={16} color="#333" /> {DUMMY_TRAINING_FOCUS}</Text>
            <Text style={styles.trainingInfo}>View upcoming training sessions, drills, and fitness plans.</Text>{/* Updated text */}
          </View>
          <View style={styles.viewAllButton}>
            <Text style={styles.viewAllButtonText}>View Training Schedule</Text>{/* Updated button text */}
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

        {/* Communication & Engagement Hub Card (buttons inside are already routable, so the card itself doesn't need to be wrapped) */}
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
  },
  headerTextContainer: {
    flex: 1,
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

  // My Performance Styles (adapted from Team Overview)
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
    backgroundColor: '#E6F3FA', // Light blue background
  },
  fullStatsButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 5,
  },

  // Events Styles (adapted from Fixtures)
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
    width: 80, // Fixed width for date
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

  // Team Snapshot Styles (new)
  teamSnapshot: {
    marginBottom: 15,
    alignItems: 'center',
  },
  teamSnapshotText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },

  // Training Schedule Styles (adapted from Training Schedule)
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
    marginTop: 10,
  },

  // Announcements Styles (reused)
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

  // Communication & Engagement Hub Styles (reused and expanded)
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
});

export default PlayerDashboard;
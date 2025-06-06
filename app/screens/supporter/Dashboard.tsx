// app/screens/supporter/Dashboard.tsx

import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react'; // Added useState
import {
  Dimensions,
  Image,
  Modal, // Added Modal
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

// --- Interfaces for TypeScript ---
interface DashboardRole {
  label: string;
  route: string;
}

// --- Dummy Data for Supporters Dashboard ---

const FAN_NAME = 'Hockey Fan'; // Could be personalized later
const TEAM_NAME = 'Desert Scorpions'; // Or the user's favorite team

const DUMMY_UPCOMING_EVENTS = [
  { id: 'se1', title: 'Next Home Game: vs. Oryx Chargers', date: 'June 15, 2025', time: '19:00', location: 'National Arena' },
  { id: 'se2', title: 'Fan Meet & Greet', date: 'June 20, 2025', time: '17:00', location: 'Team Clubhouse' },
  { id: 'se3', title: 'Away Match: vs. Windhoek Titans', date: 'June 22, 2025', time: '16:00', location: 'Windhoek Sports Complex' },
];

const DUMMY_LATEST_NEWS = [
  { id: 'sn1', title: 'Scorpions Secure Playoff Berth!', snippet: 'A thrilling victory last night officially seals our spot in the playoffs...', imageUrl: 'https://picsum.photos/seed/playoff/300/200' },
  { id: 'sn2', title: 'Injury Update: Star Forward Returns', snippet: 'After weeks on the sidelines, our star forward is cleared to play...', imageUrl: 'https://picsum.photos/seed/injury/300/200' },
];

const DUMMY_LEADERBOARD = [
  { team: 'Desert Scorpions', points: 38, wins: 12, losses: 3 },
  { team: 'Oryx Chargers', points: 35, wins: 11, losses: 4 },
  { team: 'Windhoek Titans', points: 30, wins: 9, losses: 6 },
  { team: 'Coastal Sharks', points: 25, wins: 7, losses: 8 },
];

const DUMMY_POLL = {
  id: 'p1',
  question: 'Who will be the MVP of this season?',
  options: [
    { id: 'opt1', text: 'Alex "The Blitzer" Smith', votes: 150 },
    { id: 'opt2', text: 'Maria "The Wall" Garcia', votes: 120 },
    { id: 'opt3', text: 'Sam "The Sniper" Jones', votes: 90 },
  ],
  totalVotes: 360,
};

const DUMMY_MERCH_ITEMS = [
  { id: 'm1', name: 'Official Team Jersey', price: '$65.00', imageUrl: 'https://picsum.photos/seed/jersey/200/200' },
  { id: 'm2', name: 'Scorpions Fan Scarf', price: '$20.00', imageUrl: 'https://picsum.photos/seed/scarf/200/200' },
];

// Define the available dashboard roles and their corresponding routes
const DASHBOARD_ROLES: DashboardRole[] = [
  { label: 'Admin Dashboard', route: './../admin/Dashboard' },
  { label: 'Supporter Dashboard', route: './../supporter/Dashboard' },
  { label: 'Player Dashboard', route: './../player/Dashboard' },
  { label: 'Coach Dashboard', route: './../coach/Dashboard' },
];

// --- SupportersDashboard Component ---

const SupportersDashboard = () => {
  const router = useRouter();
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [currentRole, setCurrentRole] = useState<DashboardRole>(
    DASHBOARD_ROLES.find(role => role.label === 'Supporter Dashboard') || DASHBOARD_ROLES[0]
  );

  const handleRoleChange = (role: DashboardRole) => {
    setCurrentRole(role);
    setShowRoleSelector(false);
    router.push(role.route as any); // Cast to any to bypass strict type checking for `router.push`
  };

  // Navigation functions for supporters
  const handleViewEvents = () => {
    console.log('Navigating to Supporter Events');
    router.push('./Events' as any); // Assuming Events.tsx in same 'supporter' directory
  };

  const handleViewNews = () => {
    console.log('Navigating to Supporter News');
    router.push('./News' as any); // Assuming News.tsx in same 'supporter' directory
  };

  const handleGoToChatbot = () => {
    console.log('Navigating to Fan Chatbot');
    router.push('./FanChatbot' as any); // Assuming FanChatbot.tsx
  };

  const handleGoToForum = () => {
    console.log('Navigating to Fan Forum');
    router.push('./Forum' as any); // Assuming FanForum.tsx
  };

  const handleGoToMerchStore = () => {
    console.log('Navigating to Merch Store');
    router.push('./MerchStore' as any); // Assuming MerchStore.tsx
  };

  const handleGoToPollsVoting = () => {
    console.log('Navigating to Polls Voting');
    router.push('./PollsVoting' as any); // Assuming PollsVoting.tsx
  };

  const handleViewTeams = () => {
    console.log('Navigating to Teams Directory');
    router.push('./Teams' as any); // Assuming Teams.tsx
  };

  const handleViewLeaderboard = () => {
    console.log('Navigating to League Leaderboard');
    router.push('./Leaderboard' as any); // Assuming Leaderboard.tsx
  };

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#FF6F61', '#E63946']} // Warm, energetic colors
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.header}
      >
        <Image
          source={require('../../../assets/images/logo.jpeg')} // Your team logo
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <View style={styles.headerTextContainer}>
          <Text style={styles.welcomeText}>Welcome, {FAN_NAME}!</Text>
          <Text style={styles.headerTitle}>Your {TEAM_NAME} Hub</Text>
        </View>

        {/* Role Selector Toggle */}
      
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Quick Links / Main Actions Grid */}
        <View style={styles.quickLinksGrid}>
          <TouchableOpacity style={styles.quickLinkButton} onPress={handleViewEvents}>
            <MaterialIcons name="event" size={36} color="#FF6F61" />
            <Text style={styles.quickLinkText}>Events</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLinkButton} onPress={handleViewNews}>
            <MaterialIcons name="article" size={36} color="#4A90E2" />
            <Text style={styles.quickLinkText}>News</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLinkButton} onPress={handleGoToMerchStore}>
            <MaterialIcons name="shopping-cart" size={36} color="#34C759" />
            <Text style={styles.quickLinkText}>Merch Store</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickLinkButton} onPress={handleViewLeaderboard}>
            <MaterialIcons name="leaderboard" size={36} color="#FFC107" />
            <Text style={styles.quickLinkText}>Leaderboard</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Events Card */}
        <TouchableOpacity onPress={handleViewEvents} style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="sports-hockey" size={24} color="#E63946" />
            <Text style={styles.cardTitle}>Next Games & Events</Text>
            <MaterialIcons name="arrow-forward-ios" size={18} color="#999" />
          </View>
          {DUMMY_UPCOMING_EVENTS.slice(0, 2).map(event => ( // Show top 2
            <View key={event.id} style={styles.eventItem}>
              <View style={styles.eventDateBox}>
                <Text style={styles.eventDateDay}>{event.date.split(' ')[1].replace(',', '')}</Text>
                <Text style={styles.eventDateMonth}>{event.date.split(' ')[0]}</Text>
              </View>
              <View style={styles.eventDetails}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventInfo}>{event.location} at {event.time}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity onPress={handleViewEvents} style={styles.viewAllButton}>
            <Text style={styles.viewAllButtonText}>View All Events</Text>
            <MaterialIcons name="chevron-right" size={20} color="#E63946" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Latest News Card */}
        <TouchableOpacity onPress={handleViewNews} style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="newspaper" size={24} color="#4A90E2" />
            <Text style={styles.cardTitle}>Latest Team News</Text>
            <MaterialIcons name="arrow-forward-ios" size={18} color="#999" />
          </View>
          {DUMMY_LATEST_NEWS.map(news => (
            <View key={news.id} style={styles.newsItem}>
              {news.imageUrl && (
                <Image source={{ uri: news.imageUrl }} style={styles.newsThumbnail} />
              )}
              <View style={styles.newsContent}>
                <Text style={styles.newsItemTitle}>{news.title}</Text>
                <Text style={styles.newsItemSnippet}>{news.snippet}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity onPress={handleViewNews} style={styles.viewAllButton}>
            <Text style={styles.viewAllButtonText}>Read All News</Text>
            <MaterialIcons name="chevron-right" size={20} color="#4A90E2" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Polls Voting Card */}
        <TouchableOpacity onPress={handleGoToPollsVoting} style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="how-to-vote" size={24} color="#A726C2" />
            <Text style={styles.cardTitle}>Fan Polls</Text>
            <MaterialIcons name="arrow-forward-ios" size={18} color="#999" />
          </View>
          <Text style={styles.pollQuestion}>{DUMMY_POLL.question}</Text>
          {DUMMY_POLL.options.map(option => (
            <View key={option.id} style={styles.pollOption}>
              <Text style={styles.pollOptionText}>{option.text}</Text>
              <Text style={styles.pollOptionVotes}>
                {((option.votes / DUMMY_POLL.totalVotes) * 100).toFixed(0)}%
              </Text>
              <View style={[styles.pollBar, { width: `${(option.votes / DUMMY_POLL.totalVotes) * 100}%` }]} />
            </View>
          ))}
          <TouchableOpacity onPress={handleGoToPollsVoting} style={styles.viewAllButton}>
            <Text style={styles.viewAllButtonText}>Vote Now!</Text>
            <MaterialIcons name="chevron-right" size={20} color="#A726C2" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* League Leaderboard Card */}
        <TouchableOpacity onPress={handleViewLeaderboard} style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="emoji-events" size={24} color="#FFD700" />
            <Text style={styles.cardTitle}>League Standings</Text>
            <MaterialIcons name="arrow-forward-ios" size={18} color="#999" />
          </View>
          <View style={styles.leaderboardHeader}>
            <Text style={styles.leaderboardHeaderText}>Team</Text>
            <Text style={styles.leaderboardHeaderText}>W</Text>
            <Text style={styles.leaderboardHeaderText}>L</Text>
            <Text style={styles.leaderboardHeaderText}>Pts</Text>
          </View>
          {DUMMY_LEADERBOARD.map((team, index) => (
            <View key={team.team} style={[styles.leaderboardRow, index === 0 && styles.leaderboardTopRow]}>
              <Text style={[styles.leaderboardCell, styles.leaderboardTeamName, index === 0 && styles.leaderboardTopText]}>{team.team}</Text>
              <Text style={[styles.leaderboardCell, index === 0 && styles.leaderboardTopText]}>{team.wins}</Text>
              <Text style={[styles.leaderboardCell, index === 0 && styles.leaderboardTopText]}>{team.losses}</Text>
              <Text style={[styles.leaderboardCell, styles.leaderboardPoints, index === 0 && styles.leaderboardTopText]}>{team.points}</Text>
            </View>
          ))}
          <TouchableOpacity onPress={handleViewLeaderboard} style={styles.viewAllButton}>
            <Text style={styles.viewAllButtonText}>View Full Leaderboard</Text>
            <MaterialIcons name="chevron-right" size={20} color="#FFD700" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Merch Store Showcase Card */}
        <TouchableOpacity onPress={handleGoToMerchStore} style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="storefront" size={24} color="#34C759" />
            <Text style={styles.cardTitle}>Team Merch Store</Text>
            <MaterialIcons name="arrow-forward-ios" size={18} color="#999" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.merchScrollContainer}>
            {DUMMY_MERCH_ITEMS.map(item => (
              <View key={item.id} style={styles.merchItem}>
                <Image source={{ uri: item.imageUrl }} style={styles.merchImage} />
                <Text style={styles.merchName}>{item.name}</Text>
                <Text style={styles.merchPrice}>{item.price}</Text>
              </View>
            ))}
          </ScrollView>
          <TouchableOpacity onPress={handleGoToMerchStore} style={styles.viewAllButton}>
            <Text style={styles.viewAllButtonText}>Browse All Items</Text>
            <MaterialIcons name="chevron-right" size={20} color="#34C759" />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Community Hub (Chatbot & Forum) Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="groups" size={24} color="#5856D6" />
            <Text style={styles.cardTitle}>Community Hub</Text>
          </View>
          <TouchableOpacity style={styles.communityButton} onPress={handleGoToChatbot}>
            <MaterialIcons name="smart-toy" size={20} color="#5856D6" />
            <Text style={styles.communityButtonText}>Fan Chatbot</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.communityButton} onPress={handleGoToForum}>
            <MaterialIcons name="forum" size={20} color="#5856D6" />
            <Text style={styles.communityButtonText}>Fan Forum</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.communityButton} onPress={handleViewTeams}>
            <MaterialIcons name="people-alt" size={20} color="#5856D6" />
            <Text style={styles.communityButtonText}>Explore Teams</Text>
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
    backgroundColor: '#F7F7F7', // Lighter, more vibrant background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Space out logo, text, and toggle
    paddingTop: 50,
    paddingBottom: 25, // More vertical padding
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30, // More pronounced rounding
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 }, // Stronger shadow
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 12, // Higher elevation for Android
  },
  headerLogo: {
    width: 55,
    height: 55,
    borderRadius: 27.5, // Circular logo
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.7)',
    marginRight: 15,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 10, // Space between text and toggle
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    // fontFamily: 'Roboto-Medium', // Example font family
  },
  headerTitle: {
    fontSize: 26, // Larger title
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
    // fontFamily: 'Montserrat-Bold', // Example font family
  },
  // New styles for the role selector toggle
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
    paddingBottom: 40,
  },
  // --- Quick Links Grid ---
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickLinkButton: {
    width: (width - 45) / 2, // Two columns with padding
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  quickLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
  },
  // --- Card Styles ---
  card: {
    backgroundColor: '#fff',
    borderRadius: 20, // More rounded corners
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 }, // More prominent shadow
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: StyleSheet.hairlineWidth, // Subtle border
    borderColor: '#E0E0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Space out title and arrow
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, // Thinner separator
    borderBottomColor: '#F0F0F0',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
    flex: 1, // Take up remaining space
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 15,
    paddingVertical: 5,
  },
  viewAllButtonText: {
    color: '#E63946', // Match card theme or primary color
    fontSize: 15,
    fontWeight: '600',
    marginRight: 5,
  },

  // --- Events Card Specific Styles ---
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F8F8F8',
  },
  eventDateBox: {
    backgroundColor: '#FF6F61',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginRight: 15,
    width: 60, // Fixed width for date box
  },
  eventDateDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  eventDateMonth: {
    fontSize: 12,
    color: '#fff',
    textTransform: 'uppercase',
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  eventInfo: {
    fontSize: 13,
    color: '#666',
  },

  // --- News Card Specific Styles ---
  newsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F8F8F8',
  },
  newsThumbnail: {
    width: 80,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: '#eee',
  },
  newsContent: {
    flex: 1,
  },
  newsItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 3,
  },
  newsItemSnippet: {
    fontSize: 13,
    color: '#666',
  },

  // --- Polls Voting Card Specific Styles ---
  pollQuestion: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  pollOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    marginBottom: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    overflow: 'hidden', // To contain the bar
  },
  pollOptionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    zIndex: 1, // Ensure text is above bar
  },
  pollOptionVotes: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
    zIndex: 1,
  },
  pollBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(167, 38, 194, 0.2)', // Lighter version of icon color
    borderRadius: 10,
    zIndex: 0,
  },

  // --- Leaderboard Card Specific Styles ---
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  leaderboardHeaderText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  leaderboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F8F8F8',
  },
  leaderboardTopRow: {
    backgroundColor: '#FFFBE6', // Light gold background for top team
    borderRadius: 8,
    paddingVertical: 10,
    borderBottomWidth: 0,
  },
  leaderboardCell: {
    fontSize: 15,
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  leaderboardTeamName: {
    fontWeight: 'bold',
    textAlign: 'left',
    paddingLeft: 5,
  },
  leaderboardPoints: {
    fontWeight: 'bold',
    color: '#E63946', // Highlight points
  },
  leaderboardTopText: {
    color: '#E63946', // Make top team's text stand out
  },

  // --- Merch Store Card Specific Styles ---
  merchScrollContainer: {
    paddingRight: 10, // Provide some space at the end
  },
  merchItem: {
    alignItems: 'center',
    marginRight: 15,
    width: 120, // Fixed width for each merch item
  },
  merchImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginBottom: 8,
  },
  merchName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  merchPrice: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#E63946',
  },

  // --- Community Hub Specific Styles ---
  communityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF', // Light blue background
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
  communityButtonText: {
    fontSize: 16,
    color: '#5856D6',
    fontWeight: '600',
    marginLeft: 10,
  },
  // Modal specific styles (copied from other dashboards, adjust paddingTop/Right if needed)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80, // Adjust this to align with your header's height
    paddingRight: 20, // Adjust this to align with your header's padding
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

export default SupportersDashboard;
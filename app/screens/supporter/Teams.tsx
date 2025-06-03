// app/screens/supporter/Teams.tsx

import { MaterialIcons } from '@expo/vector-icons'; // For various icons
import { LinearGradient } from 'expo-linear-gradient'; // For a supporter-themed header
import { useRouter } from 'expo-router'; // Import useRouter for navigation
import React, { useCallback, useMemo, useState } from 'react';
import {
  Dimensions, // For responsive design if needed
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

// --- Type Definitions (re-used from admin's TeamsManager, but streamlined for display) ---
type Player = {
  id: string;
  name: string;
  jerseyNumber?: number;
  position?: string; // e.g., 'Forward', 'Defender', 'Goalkeeper'
  avatar?: string; // Player's profile picture URL
  // email is intentionally removed from display for supporter view
};

type Team = {
  id: string;
  name: string;
  coachName?: string; // Keeping, but perhaps less prominent or not displayed
  division?: string; // e.g., 'Senior Men', 'U16 Girls'
  teamLogo?: string; // Team logo URL
  players: Player[]; // Array of players belonging to this team
};

// --- Dummy Data (with more diverse/realistic image placeholders for variety) ---
const DUMMY_TEAMS: Team[] = [
  {
    id: 't1',
    name: 'Desert Scorpions (Men)',
    coachName: 'Coach John',
    division: 'Senior Men',
    teamLogo: 'https://picsum.photos/seed/scorpionteam/80/80', // More realistic placeholder
    players: [
      { id: 'p1', name: 'Kwame Nkrumah', jerseyNumber: 7, position: 'Forward', avatar: 'https://picsum.photos/seed/kwame/40/40' },
      { id: 'p2', name: 'Aisha Hassan', jerseyNumber: 10, position: 'Midfielder', avatar: 'https://picsum.photos/seed/aisha/40/40' },
      { id: 'p6', name: 'Jabu Mkhize', jerseyNumber: 1, position: 'Goalkeeper', avatar: 'https://picsum.photos/seed/jabu/40/40' },
      { id: 'p7', name: 'Lena Petrova', jerseyNumber: 11, position: 'Forward', avatar: 'https://picsum.photos/seed/lena/40/40' },
      { id: 'p8', name: 'Sipho Zulu', jerseyNumber: 4, position: 'Defender', avatar: 'https://picsum.photos/seed/sipho/40/40' },
    ],
  },
  {
    id: 't2',
    name: 'Oryx Chargers (Women)',
    coachName: 'Coach Sarah',
    division: 'Senior Women',
    teamLogo: 'https://picsum.photos/seed/oryxteam/80/80', // More realistic placeholder
    players: [
      { id: 'p3', name: 'Chisomo Banda', jerseyNumber: 5, position: 'Defender', avatar: 'https://picsum.photos/seed/chisomo/40/40' },
      { id: 'p4', name: 'Naledi Kgosi', jerseyNumber: 12, position: 'Goalkeeper', avatar: 'https://picsum.photos/seed/naledi/40/40' },
      { id: 'p9', name: 'Zara Singh', jerseyNumber: 8, position: 'Midfielder', avatar: 'https://picsum.photos/seed/zara/40/40' },
      { id: 'p10', name: 'Amara Khan', jerseyNumber: 9, position: 'Forward', avatar: 'https://picsum.photos/seed/amara/40/40' },
    ],
  },
  {
    id: 't3',
    name: 'Junior Falcons (U16 Boys)',
    coachName: 'Coach Mark',
    division: 'U16 Boys',
    teamLogo: 'https://picsum.photos/seed/falconsteam/80/80', // More realistic placeholder
    players: [
      { id: 'p5', name: 'Ethan Ngoma', jerseyNumber: 9, position: 'Forward', avatar: 'https://picsum.photos/seed/ethan/40/40' },
      { id: 'p11', name: 'Noah Davis', jerseyNumber: 3, position: 'Defender', avatar: 'https://picsum.photos/seed/noah/40/40' },
    ],
  },
  {
    id: 't4',
    name: 'Coastal Conquerors (Mixed)',
    coachName: 'Coach Alex',
    division: 'Mixed League',
    teamLogo: 'https://picsum.photos/seed/conquerorsteam/80/80',
    players: [
      { id: 'p12', name: 'Emma Wilson', jerseyNumber: 2, position: 'Defender', avatar: 'https://picsum.photos/seed/emma/40/40' },
      { id: 'p13', name: 'Daniel Brown', jerseyNumber: 14, position: 'Midfielder', avatar: 'https://picsum.photos/seed/daniel/40/40' },
    ],
  },
];


const SupporterTeams = () => {
  const router = useRouter();
  const [teams] = useState<Team[]>(DUMMY_TEAMS); // Teams data is static for supporters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null); // Manages current view: team list or player roster

  // Filter teams based on search query
  const filteredTeams = useMemo(() => {
    return teams.filter(team =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.division && team.division.toLowerCase().includes(searchQuery.toLowerCase()))
      // Coach name is less relevant for supporter search, so it's excluded here
    );
  }, [teams, searchQuery]);

  /**
   * Sets the selected team to view its player roster.
   */
  const handleViewTeamRoster = useCallback((team: Team) => {
    setSelectedTeam(team);
  }, []);

  /**
   * Renders a single Team Card for the supporter's team list.
   * Tapping the card navigates to the team's player roster.
   */
  const renderTeamCard = useCallback(({ item }: { item: Team }) => (
    <TouchableOpacity
      style={styles.teamCard}
      onPress={() => handleViewTeamRoster(item)} // Tap the card to view roster
    >
      <Image
        source={{ uri: item.teamLogo || 'https://picsum.photos/seed/generic_team/80/80' }}
        style={styles.teamLogo}
      />
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{item.name}</Text>
        {item.division && <Text style={styles.teamDetails}>{item.division}</Text>}
        <Text style={styles.teamPlayerCount}>{item.players.length} Players</Text>
      </View>
      <MaterialIcons name="arrow-forward-ios" size={20} color="#E63946" /> {/* Visual indicator */}
    </TouchableOpacity>
  ), [handleViewTeamRoster]);

  /**
   * Renders a single Player Item for a team's roster.
   */
  const renderPlayerItem = useCallback(({ item }: { item: Player }) => (
    <View style={styles.playerCard}>
      <Image
        source={{ uri: item.avatar || 'https://picsum.photos/seed/generic_player/50/50' }}
        style={styles.playerAvatar}
      />
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.name}</Text>
        <Text style={styles.playerDetails}>
          {item.jerseyNumber ? `#${item.jerseyNumber} ` : ''}
          {item.position || 'Player'}
        </Text>
      </View>
    </View>
  ), []);

  // Determine current header title and back button action based on the view
  const getHeaderContent = () => {
    let title = 'Our Teams'; // Default title for main team list
    let onBackPress = () => router.back(); // Default back to previous screen (Dashboard)

    if (selectedTeam) {
      title = selectedTeam.name; // When viewing a team's roster, show team name
      onBackPress = () => setSelectedTeam(null); // Back to the main team list
    }

    return { title, onBackPress };
  };

  const { title, onBackPress } = getHeaderContent();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      {/* Header with Gradient */}
      <StatusBar backgroundColor="#E63946" barStyle="light-content" />
      <LinearGradient
        colors={['#FF6F61', '#E63946']} // Warm, energetic colors
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Image
          source={require('../../../assets/images/logo.jpeg')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.backButtonPlaceholder} /> {/* For alignment on the right */}
      </LinearGradient>

      {/* Conditional Rendering of main content: Team List or Player Roster */}
      {!selectedTeam ? (
        // --- Main Team List View ---
        <>
          {/* Search Bar for Teams */}
          <TextInput
            style={styles.searchBar}
            placeholder="Search teams..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {/* Team List */}
          {filteredTeams.length === 0 ? (
            <View style={styles.emptyListContainer}>
              <MaterialIcons name="sports-hockey" size={60} color="#ccc" />
              <Text style={styles.emptyListText}>No teams found.</Text>
              <Text style={styles.emptyListSubText}>Try a different search or check back later!</Text>
            </View>
          ) : (
            <FlatList
              data={filteredTeams}
              keyExtractor={(item) => item.id}
              renderItem={renderTeamCard}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      ) : (
        // --- Player Roster View for Selected Team ---
        <FlatList
          data={selectedTeam.players}
          keyExtractor={(item) => item.id}
          renderItem={renderPlayerItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
              <MaterialIcons name="group-off" size={60} color="#ccc" />
              <Text style={styles.emptyListText}>No players registered for this team yet.</Text>
              <Text style={styles.emptyListSubText}>Stay tuned for roster updates!</Text>
            </View>
          }
        />
      )}
    </KeyboardAvoidingView>
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
    paddingTop: 50, // Accounts for status bar/notch
    paddingBottom: 20,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden', // Ensures gradient corners are respected
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8, // Android shadow
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  backButtonPlaceholder: {
    width: 24 + 10, // Match back button size (icon + margin) for symmetric header layout
    height: 24,
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1, // Allows title to take available space
    textAlign: 'center',
    marginLeft: -40, // Adjust to center the title despite logo/back button on left
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 15,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderColor: '#E63946', // Supporter theme border color
    borderWidth: 1,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingBottom: 20, // Ensures content isn't cut off by bottom padding
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200, // Ensures empty state is visible even if list is short
  },
  emptyListText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
  },
  emptyListSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },

  // --- Team Card Styles (Creative for Supporter View) ---
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderLeftWidth: 5, // A distinctive colored left border
    borderColor: '#E63946', // Strong supporter theme color
  },
  teamLogo: {
    width: 60, // Slightly smaller and more compact than admin view
    height: 60,
    borderRadius: 30, // Circular logo
    marginRight: 15,
    backgroundColor: '#ddd', // Fallback background
    borderWidth: 1,
    borderColor: '#eee',
  },
  teamInfo: {
    flex: 1, // Allows text to take available space
    marginRight: 10,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  teamDetails: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },
  teamPlayerCount: {
    fontSize: 12,
    color: '#E63946', // Highlighted with supporter theme color
    fontWeight: '600',
    marginTop: 5,
  },

  // --- Player Card Styles (for Supporter View) ---
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12, // Slightly less padding for a tighter list
    marginBottom: 8, // Less margin between items
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 3, // Smaller left border for players
    borderColor: '#FF6F61', // Lighter supporter theme color for players
  },
  playerAvatar: {
    width: 45, // Good size for player avatars
    height: 45,
    borderRadius: 22.5,
    marginRight: 15,
    backgroundColor: '#ddd',
    borderWidth: 1,
    borderColor: '#eee',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  playerDetails: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },
});

export default SupporterTeams;
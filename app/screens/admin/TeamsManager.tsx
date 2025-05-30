import { MaterialIcons } from '@expo/vector-icons'; // For various icons
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// --- Type Definitions ---

type Player = {
  id: string;
  name: string;
  jerseyNumber?: number;
  position?: string; // e.g., 'Forward', 'Defender', 'Goalkeeper'
  email?: string;
  avatar?: string; // Player's profile picture URL
};

type Team = {
  id: string;
  name: string;
  coachName?: string;
  division?: string; // e.g., 'Senior Men', 'U16 Girls'
  teamLogo?: string; // Team logo URL
  players: Player[]; // Array of players belonging to this team
};

// --- Dummy Data ---

const DUMMY_TEAMS: Team[] = [
  {
    id: 't1',
    name: 'Desert Scorpions (Men)',
    coachName: 'Coach John',
    division: 'Senior Men',
    teamLogo: 'https://placehold.co/80x80/FF5733/FFFFFF?text=DS',
    players: [
      { id: 'p1', name: 'Player One', jerseyNumber: 7, position: 'Forward', email: 'p1@example.com', avatar: 'https://placehold.co/40x40/FF5733/FFFFFF?text=P1' },
      { id: 'p2', name: 'Player Two', jerseyNumber: 10, position: 'Midfielder', email: 'p2@example.com', avatar: 'https://placehold.co/40x40/33FF57/000000?text=P2' },
    ],
  },
  {
    id: 't2',
    name: 'Oryx Chargers (Women)',
    coachName: 'Coach Sarah',
    division: 'Senior Women',
    teamLogo: 'https://placehold.co/80x80/3366FF/FFFFFF?text=OC',
    players: [
      { id: 'p3', name: 'Player Three', jerseyNumber: 5, position: 'Defender', email: 'p3@example.com', avatar: 'https://placehold.co/40x40/3357FF/FFFFFF?text=P3' },
      { id: 'p4', name: 'Player Four', jerseyNumber: 12, position: 'Goalkeeper', email: 'p4@example.com', avatar: 'https://placehold.co/40x40/FFD700/000000?text=P4' },
    ],
  },
  {
    id: 't3',
    name: 'Junior Falcons (U16 Boys)',
    coachName: 'Coach Mark',
    division: 'U16 Boys',
    teamLogo: 'https://placehold.co/80x80/8A2BE2/FFFFFF?text=JF',
    players: [
      { id: 'p5', name: 'Player Five', jerseyNumber: 9, position: 'Forward', email: 'p5@example.com', avatar: 'https://placehold.co/40x40/8A2BE2/FFFFFF?text=P5' },
    ],
  },
];

const TeamsManager = () => {
  const [teams, setTeams] = useState<Team[]>(DUMMY_TEAMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamForPlayers, setSelectedTeamForPlayers] = useState<Team | null>(null); // State to manage which team's players are being viewed/managed

  // Filter teams based on search query
  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (team.coachName && team.coachName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (team.division && team.division.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // --- Team Management Functions ---

  /**
   * Handles deleting a team.
   * @param teamId The ID of the team to delete.
   */
  const handleDeleteTeam = (teamId: string) => {
    Alert.alert(
      'Delete Team',
      'Are you sure you want to delete this team and all its associated players? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            setTeams(prevTeams => prevTeams.filter(team => team.id !== teamId));
            console.log(`Team ${teamId} deleted.`);
            // In a real app, call API to delete team and its players from backend
          },
          style: 'destructive',
        },
      ]
    );
  };

  /**
   * Placeholder for adding a new team.
   * In a real app, this would navigate to a form or open a modal.
   */
  const handleAddTeam = () => {
    console.log('Add new team');
    Alert.alert('Add Team', 'Functionality to add new team not implemented yet. (Would open a form/modal)');
    // Example: router.push('/admin/add-team');
  };

  /**
   * Placeholder for editing an existing team.
   * @param team The team object to edit.
   * In a real app, this would navigate to a form or open a modal, pre-filling data.
   */
  const handleEditTeam = (team: Team) => {
    console.log('Edit team:', team.name);
    Alert.alert('Edit Team', `Functionality to edit "${team.name}" not implemented yet. (Would open a form/modal)`);
    // Example: router.push({ pathname: '/admin/edit-team', params: { teamId: team.id } });
  };

  /**
   * Sets the selected team and effectively "opens" the player management view for that team.
   * @param team The team whose players are to be managed.
   */
  const handleManagePlayers = (team: Team) => {
    setSelectedTeamForPlayers(team);
    console.log(`Managing players for team: ${team.name}`);
    // In a real app, this might navigate to a new screen like '/admin/manage-players-for-team',
    // passing the team ID. For this demo, we'll simulate a modal by changing state.
  };

  // --- Player Management Functions (within selected team context) ---

  /**
   * Placeholder for adding a new player to the currently selected team.
   */
  const handleAddPlayerToTeam = () => {
    if (!selectedTeamForPlayers) return;
    console.log(`Add new player to ${selectedTeamForPlayers.name}`);
    Alert.alert('Add Player', `Functionality to add new player to ${selectedTeamForPlayers.name} not implemented yet. (Would open a form/modal)`);
    // In a real app, this would open a form to add a player, then update the 'teams' state.
  };

  /**
   * Placeholder for editing a player in the currently selected team.
   * @param player The player object to edit.
   */
  const handleEditPlayerInTeam = (player: Player) => {
    if (!selectedTeamForPlayers) return;
    console.log(`Edit player ${player.name} in ${selectedTeamForPlayers.name}`);
    Alert.alert('Edit Player', `Functionality to edit "${player.name}" not implemented yet. (Would open a form/modal)`);
    // In a real app, this would open a form to edit player, then update the 'teams' state.
  };

  /**
   * Handles removing a player from the currently selected team.
   * @param playerId The ID of the player to remove.
   */
  const handleRemovePlayerFromTeam = (playerId: string) => {
    if (!selectedTeamForPlayers) return;
    Alert.alert(
      'Remove Player',
      `Are you sure you want to remove this player from ${selectedTeamForPlayers.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          onPress: () => {
            setTeams(prevTeams =>
              prevTeams.map(team =>
                team.id === selectedTeamForPlayers.id
                  ? { ...team, players: team.players.filter(player => player.id !== playerId) }
                  : team
              )
            );
            // Update selectedTeamForPlayers state to reflect the change immediately
            setSelectedTeamForPlayers(prev => prev ? { ...prev, players: prev.players.filter(p => p.id !== playerId) } : null);
            console.log(`Player ${playerId} removed from ${selectedTeamForPlayers.name}.`);
            // In a real app, call API to update team's player list
          },
          style: 'destructive',
        },
      ]
    );
  };

  // --- Render Functions ---

  /**
   * Renders a single Team Card in the main FlatList.
   * @param item The Team object to render.
   */
  const renderTeamCard = ({ item }: { item: Team }) => (
    <View style={styles.teamCard}>
      <Image
        source={{ uri: item.teamLogo || 'https://placehold.co/80x80/CCCCCC/000000?text=Team' }}
        style={styles.teamLogo}
      />
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{item.name}</Text>
        <Text style={styles.teamDetails}>{item.division} | Coach: {item.coachName || 'N/A'}</Text>
        <Text style={styles.teamPlayerCount}>{item.players.length} Players</Text>
      </View>
      <View style={styles.teamActions}>
        <TouchableOpacity onPress={() => handleEditTeam(item)} style={styles.actionIcon}>
          <MaterialIcons name="edit" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteTeam(item.id)} style={styles.actionIcon}>
          <MaterialIcons name="delete" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.managePlayersButton}
        onPress={() => handleManagePlayers(item)}
      >
        <Text style={styles.managePlayersButtonText}>Manage Players</Text>
        <MaterialIcons name="arrow-forward-ios" size={16} color="#fff" style={{ marginLeft: 5 }} />
      </TouchableOpacity>
    </View>
  );

  /**
   * Renders a single Player Item when managing players for a specific team.
   * @param item The Player object to render.
   */
  const renderPlayerItem = ({ item }: { item: Player }) => (
    <View style={styles.playerCard}>
      <Image
        source={{ uri: item.avatar || 'https://placehold.co/40x40/CCCCCC/000000?text=P' }}
        style={styles.playerAvatar}
      />
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.name}</Text>
        <Text style={styles.playerDetails}>#{item.jerseyNumber} | {item.position || 'N/A'}</Text>
        {item.email && <Text style={styles.playerEmail}>{item.email}</Text>}
      </View>
      <View style={styles.playerActions}>
        <TouchableOpacity onPress={() => handleEditPlayerInTeam(item)} style={styles.actionIcon}>
          <MaterialIcons name="edit" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleRemovePlayerFromTeam(item.id)} style={styles.actionIcon}>
          <MaterialIcons name="person-remove" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // --- Main Component Render ---

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        {selectedTeamForPlayers ? (
          <TouchableOpacity onPress={() => setSelectedTeamForPlayers(null)} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} /> // Placeholder for alignment
        )}
        <Image
          source={require('../../../assets/images/logo.jpeg')} // Update this path
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>
          {selectedTeamForPlayers ? `Players for ${selectedTeamForPlayers.name}` : 'Manage Teams'}
        </Text>
        {selectedTeamForPlayers ? (
          <TouchableOpacity style={styles.addPlayerButton} onPress={handleAddPlayerToTeam}>
            <MaterialIcons name="person-add" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButtonPlaceholder} /> // Placeholder for alignment
        )}
      </View>

      {/* Conditional Rendering: Team List or Player List */}
      {selectedTeamForPlayers ? (
        // --- Player Management View ---
        <FlatList
          data={selectedTeamForPlayers.players}
          keyExtractor={(item) => item.id}
          renderItem={renderPlayerItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyListContainer}>
              <MaterialIcons name="group-off" size={60} color="#ccc" />
              <Text style={styles.emptyListText}>No players in this team yet.</Text>
              <Text style={styles.emptyListSubText}>Tap '+' above to add a new player.</Text>
            </View>
          }
        />
      ) : (
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
              <Text style={styles.emptyListSubText}>Tap '+' to add a new team.</Text>
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

          {/* Floating Add Team Button */}
          <TouchableOpacity style={styles.floatingAddButton} onPress={handleAddTeam}>
            <MaterialIcons name="group-add" size={30} color="#fff" />
          </TouchableOpacity>
        </>
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
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  headerLogo: {
    width: 50,
    height: 50,
    // No marginBottom here as it's inline with text
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1, // Allows title to take available space
    textAlign: 'center', // Center the text
    marginLeft: 10, // Adjust for logo
    marginRight: 10, // Adjust for buttons
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  backButtonPlaceholder: {
    width: 34, // Match back button size for alignment
    height: 34,
    marginRight: 10,
  },
  addPlayerButton: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
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
  },
  listContent: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingBottom: 80, // Space for floating button
  },

  // --- Team Card Styles ---
  teamCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    alignItems: 'center', // Center content horizontally
  },
  teamLogo: {
    width: 80,
    height: 80,
    borderRadius: 40, // Circular logo
    marginBottom: 10,
    backgroundColor: '#ddd',
    borderWidth: 2,
    borderColor: '#eee',
  },
  teamInfo: {
    alignItems: 'center', // Center text info
    marginBottom: 15,
  },
  teamName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  teamDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  teamPlayerCount: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: 'bold',
    marginTop: 8,
  },
  teamActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  actionIcon: {
    padding: 8,
    marginHorizontal: 10,
  },
  managePlayersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  managePlayersButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // --- Player Card Styles (for when a team is selected) ---
  playerCard: {
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
  },
  playerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: '#ddd',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  playerDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  playerEmail: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  playerActions: {
    flexDirection: 'row',
    marginLeft: 10,
  },

  // --- General & Empty List Styles ---
  floatingAddButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200, // Ensure it takes some vertical space
  },
  emptyListText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    fontWeight: 'bold',
  },
  emptyListSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default TeamsManager;

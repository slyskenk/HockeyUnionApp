import { MaterialIcons } from '@expo/vector-icons'; // For various icons
import { useRouter } from 'expo-router'; // Import useRouter for navigation
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform, // Import AlertButton type for explicit typing
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
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
      { id: 'p6', name: 'Player Six', jerseyNumber: 1, position: 'Goalkeeper', email: 'p6@example.com', avatar: 'https://placehold.co/40x40/FF5733/FFFFFF?text=P6' },
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
  const router = useRouter(); // Initialize useRouter
  const [teams, setTeams] = useState<Team[]>(DUMMY_TEAMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeamForPlayers, setSelectedTeamForPlayers] = useState<Team | null>(null); // State to manage which team's players are being viewed/managed

  // State for Add/Edit Team forms
  const [showAddTeamForm, setShowAddTeamForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null); // Stores team data for editing

  // State for Add/Edit Player forms
  const [showAddPlayerForm, setShowAddPlayerForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null); // Stores player data for editing

  // Filter teams based on search query (memoized for performance)
  const filteredTeams = useMemo(() => {
    return teams.filter(team =>
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.coachName && team.coachName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (team.division && team.division.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [teams, searchQuery]);

  // --- Team Management Functions ---

  /**
   * Handles deleting a team.
   * @param teamId The ID of the team to delete.
   */
  const handleDeleteTeam = useCallback((teamId: string) => {
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
  }, []);

  /**
   * Opens the form to add a new team.
   */
  const handleAddTeam = useCallback(() => {
    setShowAddTeamForm(true);
  }, []);

  /**
   * Opens the form to edit an existing team.
   * @param team The team object to edit.
   */
  const handleEditTeam = useCallback((team: Team) => {
    setEditingTeam(team);
  }, []);

  /**
   * Sets the selected team and effectively "opens" the player management view for that team.
   * @param team The team whose players are to be managed.
   */
  const handleManagePlayers = useCallback((team: Team) => {
    setSelectedTeamForPlayers(team);
    console.log(`Managing players for team: ${team.name}`);
  }, []);

  // --- Player Management Functions (within selected team context) ---

  /**
   * Opens the form to add a new player to the currently selected team.
   */
  const handleAddPlayerToTeam = useCallback(() => {
    if (!selectedTeamForPlayers) return;
    setShowAddPlayerForm(true);
  }, [selectedTeamForPlayers]);

  /**
   * Opens the form to edit a player in the currently selected team.
   * @param player The player object to edit.
   */
  const handleEditPlayerInTeam = useCallback((player: Player) => {
    if (!selectedTeamForPlayers) return;
    setEditingPlayer(player);
  }, [selectedTeamForPlayers]);

  /**
   * Handles removing a player from the currently selected team.
   * @param playerId The ID of the player to remove.
   */
  const handleRemovePlayerFromTeam = useCallback((playerId: string) => {
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
  }, [selectedTeamForPlayers]);

  // --- Render Functions ---

  /**
   * Renders a single Team Card in the main FlatList.
   * @param item The Team object to render.
   */
  const renderTeamCard = useCallback(({ item }: { item: Team }) => (
    <View style={styles.teamCard}>
      <Image
        source={{ uri: item.teamLogo || 'https://placehold.co/80x80/CCCCCC/000000?text=Team' }}
        style={styles.teamLogo}
      />
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{item.name}</Text>
        <Text style={styles.teamDetails}>Coach: {item.coachName || 'N/A'} | {item.division || 'N/A'}</Text>
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
  ), [handleEditTeam, handleDeleteTeam, handleManagePlayers]);

  /**
   * Renders a single Player Item when managing players for a specific team.
   * @param item The Player object to render.
   */
  const renderPlayerItem = useCallback(({ item }: { item: Player }) => (
    <View style={styles.playerCard}>
      <Image
        source={{ uri: item.avatar || 'https://placehold.co/40x40/CCCCCC/000000?text=P' }}
        style={styles.playerAvatar}
      />
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.name}</Text>
        <Text style={styles.playerDetails}>#{item.jerseyNumber || 'N/A'} | {item.position || 'N/A'}</Text>
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
  ), [handleEditPlayerInTeam, handleRemovePlayerFromTeam]);


  // --- Internal Form Components ---

  const AddTeamForm = useCallback(() => {
    const [name, setName] = useState('');
    const [coachName, setCoachName] = useState('');
    const [division, setDivision] = useState('');
    const [teamLogo, setTeamLogo] = useState('');

    const handleSave = () => {
      if (!name.trim() || !coachName.trim()) {
        Alert.alert('Missing Info', 'Team name and coach name are required.');
        return;
      }

      const newTeam: Team = {
        id: `t${Date.now()}`, // Simple unique ID
        name: name.trim(),
        coachName: coachName.trim(),
        division: division.trim() || undefined,
        teamLogo: teamLogo.trim() || undefined,
        players: [],
      };

      setTeams(prev => [...prev, newTeam]);
      Alert.alert('Success', `${name} added successfully!`);
      setShowAddTeamForm(false); // Close form
    };

    return (
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.formTitle}>Add New Team</Text>

        <Text style={styles.formLabel}>Team Name:</Text>
        <TextInput
          style={styles.formInput}
          value={name}
          onChangeText={setName}
          placeholder="e.g., Windhoek Giants"
          placeholderTextColor="#999"
        />

        <Text style={styles.formLabel}>Coach Name:</Text>
        <TextInput
          style={styles.formInput}
          value={coachName}
          onChangeText={setCoachName}
          placeholder="e.g., Jane Doe"
          placeholderTextColor="#999"
        />

        <Text style={styles.formLabel}>Division (Optional):</Text>
        <TextInput
          style={styles.formInput}
          value={division}
          onChangeText={setDivision}
          placeholder="e.g., U18 Girls, Senior Men"
          placeholderTextColor="#999"
        />

        <Text style={styles.formLabel}>Team Logo URL (Optional):</Text>
        <TextInput
          style={styles.formInput}
          value={teamLogo}
          onChangeText={setTeamLogo}
          placeholder="e.g., https://example.com/logo.png"
          placeholderTextColor="#999"
        />

        <View style={styles.formButtons}>
          <TouchableOpacity style={[styles.formButton, styles.cancelButton]} onPress={() => setShowAddTeamForm(false)}>
            <Text style={styles.formButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.formButton, styles.saveButton]} onPress={handleSave}>
            <Text style={styles.formButtonText}>Save Team</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }, []); // No dependencies as it manages its own internal state

  const EditTeamForm = useCallback(() => {
    if (!editingTeam) return null; // Should not happen if rendered correctly

    const [name, setName] = useState(editingTeam.name);
    const [coachName, setCoachName] = useState(editingTeam.coachName || '');
    const [division, setDivision] = useState(editingTeam.division || '');
    const [teamLogo, setTeamLogo] = useState(editingTeam.teamLogo || '');

    const handleSave = () => {
      if (!name.trim() || !coachName.trim()) {
        Alert.alert('Missing Info', 'Team name and coach name are required.');
        return;
      }

      setTeams(prevTeams =>
        prevTeams.map(team =>
          team.id === editingTeam.id
            ? {
                ...team,
                name: name.trim(),
                coachName: coachName.trim(),
                division: division.trim() || undefined,
                teamLogo: teamLogo.trim() || undefined,
              }
            : team
        )
      );
      Alert.alert('Success', `${name} updated successfully!`);
      setEditingTeam(null); // Close form
    };

    return (
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.formTitle}>Edit Team: {editingTeam.name}</Text>

        <Text style={styles.formLabel}>Team Name:</Text>
        <TextInput
          style={styles.formInput}
          value={name}
          onChangeText={setName}
          placeholderTextColor="#999"
        />

        <Text style={styles.formLabel}>Coach Name:</Text>
        <TextInput
          style={styles.formInput}
          value={coachName}
          onChangeText={setCoachName}
          placeholderTextColor="#999"
        />

        <Text style={styles.formLabel}>Division (Optional):</Text>
        <TextInput
          style={styles.formInput}
          value={division}
          onChangeText={setDivision}
          placeholderTextColor="#999"
        />

        <Text style={styles.formLabel}>Team Logo URL (Optional):</Text>
        <TextInput
          style={styles.formInput}
          value={teamLogo}
          onChangeText={setTeamLogo}
          placeholderTextColor="#999"
        />

        <View style={styles.formButtons}>
          <TouchableOpacity style={[styles.formButton, styles.cancelButton]} onPress={() => setEditingTeam(null)}>
            <Text style={styles.formButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.formButton, styles.saveButton]} onPress={handleSave}>
            <Text style={styles.formButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }, [editingTeam]); // Re-render if editingTeam changes

  const AddPlayerForm = useCallback(() => {
    if (!selectedTeamForPlayers) return null;

    const [name, setName] = useState('');
    const [jerseyNumber, setJerseyNumber] = useState('');
    const [position, setPosition] = useState('');
    const [email, setEmail] = useState('');
    const [avatar, setAvatar] = useState('');

    const handleSave = () => {
      if (!name.trim()) {
        Alert.alert('Missing Info', 'Player name is required.');
        return;
      }

      const newPlayer: Player = {
        id: `p${Date.now()}`, // Simple unique ID
        name: name.trim(),
        jerseyNumber: jerseyNumber ? parseInt(jerseyNumber, 10) : undefined,
        position: position.trim() || undefined,
        email: email.trim() || undefined,
        avatar: avatar.trim() || undefined,
      };

      setTeams(prevTeams =>
        prevTeams.map(team =>
          team.id === selectedTeamForPlayers.id
            ? { ...team, players: [...team.players, newPlayer] }
            : team
        )
      );
      // Update selectedTeamForPlayers to reflect the new player immediately
      setSelectedTeamForPlayers(prev => prev ? { ...prev, players: [...prev.players, newPlayer] } : null);

      Alert.alert('Success', `${name} added to ${selectedTeamForPlayers.name}!`);
      setShowAddPlayerForm(false); // Close form
    };

    return (
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.formTitle}>Add Player to {selectedTeamForPlayers.name}</Text>

        <Text style={styles.formLabel}>Player Name:</Text>
        <TextInput
          style={styles.formInput}
          value={name}
          onChangeText={setName}
          placeholder="e.g., Jane Smith"
          placeholderTextColor="#999"
        />

        <Text style={styles.formLabel}>Jersey Number (Optional):</Text>
        <TextInput
          style={styles.formInput}
          value={jerseyNumber}
          onChangeText={text => setJerseyNumber(text.replace(/[^0-9]/g, ''))} // Only allow numbers
          keyboardType="numeric"
          placeholder="e.g., 23"
          placeholderTextColor="#999"
        />

        <Text style={styles.formLabel}>Position (Optional):</Text>
        <TextInput
          style={styles.formInput}
          value={position}
          onChangeText={setPosition}
          placeholder="e.g., Forward, Goalkeeper"
          placeholderTextColor="#999"
        />

        <Text style={styles.formLabel}>Email (Optional):</Text>
        <TextInput
          style={styles.formInput}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="e.g., player@example.com"
          placeholderTextColor="#999"
        />

        <Text style={styles.formLabel}>Avatar URL (Optional):</Text>
        <TextInput
          style={styles.formInput}
          value={avatar}
          onChangeText={setAvatar}
          placeholder="e.g., https://example.com/avatar.png"
          placeholderTextColor="#999"
        />

        <View style={styles.formButtons}>
          <TouchableOpacity style={[styles.formButton, styles.cancelButton]} onPress={() => setShowAddPlayerForm(false)}>
            <Text style={styles.formButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.formButton, styles.saveButton]} onPress={handleSave}>
            <Text style={styles.formButtonText}>Add Player</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }, [selectedTeamForPlayers]); // Re-render if selectedTeamForPlayers changes

  const EditPlayerForm = useCallback(() => {
    if (!editingPlayer || !selectedTeamForPlayers) return null;

    const [name, setName] = useState(editingPlayer.name);
    const [jerseyNumber, setJerseyNumber] = useState(editingPlayer.jerseyNumber?.toString() || '');
    const [position, setPosition] = useState(editingPlayer.position || '');
    const [email, setEmail] = useState(editingPlayer.email || '');
    const [avatar, setAvatar] = useState(editingPlayer.avatar || '');

    const handleSave = () => {
      if (!name.trim()) {
        Alert.alert('Missing Info', 'Player name is required.');
        return;
      }

      setTeams(prevTeams =>
        prevTeams.map(team =>
          team.id === selectedTeamForPlayers.id
            ? {
                ...team,
                players: team.players.map(player =>
                  player.id === editingPlayer.id
                    ? {
                        ...player,
                        name: name.trim(),
                        jerseyNumber: jerseyNumber ? parseInt(jerseyNumber, 10) : undefined,
                        position: position.trim() || undefined,
                        email: email.trim() || undefined,
                        avatar: avatar.trim() || undefined,
                      }
                    : player
                ),
              }
            : team
        )
      );
      // Update selectedTeamForPlayers to reflect the changes immediately
      setSelectedTeamForPlayers(prev => {
        if (!prev) return null;
        return {
          ...prev,
          players: prev.players.map(p =>
            p.id === editingPlayer.id
              ? {
                  ...p,
                  name: name.trim(),
                  jerseyNumber: jerseyNumber ? parseInt(jerseyNumber, 10) : undefined,
                  position: position.trim() || undefined,
                  email: email.trim() || undefined,
                  avatar: avatar.trim() || undefined,
                }
              : p
          ),
        };
      });

      Alert.alert('Success', `${name} updated successfully!`);
      setEditingPlayer(null); // Close form
    };

    return (
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.formTitle}>Edit Player: {editingPlayer.name}</Text>

        <Text style={styles.formLabel}>Player Name:</Text>
        <TextInput
          style={styles.formInput}
          value={name}
          onChangeText={setName}
          placeholderTextColor="#999"
        />

        <Text style={styles.formLabel}>Jersey Number (Optional):</Text>
        <TextInput
          style={styles.formInput}
          value={jerseyNumber}
          onChangeText={text => setJerseyNumber(text.replace(/[^0-9]/g, ''))} // Only allow numbers
          keyboardType="numeric"
          placeholderTextColor="#999"
        />

        <Text style={styles.formLabel}>Position (Optional):</Text>
        <TextInput
          style={styles.formInput}
          value={position}
          onChangeText={setPosition}
          placeholderTextColor="#999"
        />

        <Text style={styles.formLabel}>Email (Optional):</Text>
        <TextInput
          style={styles.formInput}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#999"
        />

        <Text style={styles.formLabel}>Avatar URL (Optional):</Text>
        <TextInput
          style={styles.formInput}
          value={avatar}
          onChangeText={setAvatar}
          placeholder="e.g., https://example.com/avatar.png"
          placeholderTextColor="#999"
        />

        <View style={styles.formButtons}>
          <TouchableOpacity style={[styles.formButton, styles.cancelButton]} onPress={() => setEditingPlayer(null)}>
            <Text style={styles.formButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.formButton, styles.saveButton]} onPress={handleSave}>
            <Text style={styles.formButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }, [editingPlayer, selectedTeamForPlayers]); // Re-render if editingPlayer or selectedTeamForPlayers change

  // --- Determine current view and header content ---
  const getHeaderContent = () => {
    let title = 'Manage Teams';
    let showBackButton = true; // By default, show back button to dashboard
    let rightButton = <View style={styles.headerButtonPlaceholder} />; // Default: no right button

    let onBackPress = () => router.push('./../admin/Dashboard'); // Default back to Dashboard

    if (showAddTeamForm) {
      title = 'Add New Team';
      onBackPress = () => setShowAddTeamForm(false);
    } else if (editingTeam) {
      title = `Edit Team: ${editingTeam.name}`;
      onBackPress = () => setEditingTeam(null);
    } else if (showAddPlayerForm && selectedTeamForPlayers) {
      title = `Add Player to ${selectedTeamForPlayers.name}`;
      onBackPress = () => setShowAddPlayerForm(false);
    } else if (editingPlayer && selectedTeamForPlayers) {
      title = `Edit Player: ${editingPlayer.name}`;
      onBackPress = () => setEditingPlayer(null);
    } else if (selectedTeamForPlayers) {
      // Viewing players for a specific team
      title = `Players for ${selectedTeamForPlayers.name}`;
      rightButton = ( // Add Player button in header when viewing players
        <TouchableOpacity style={styles.addPlayerButton} onPress={handleAddPlayerToTeam}>
          <MaterialIcons name="person-add" size={24} color="#fff" />
        </TouchableOpacity>
      );
      onBackPress = () => setSelectedTeamForPlayers(null); // Back to team list
    }
    // For the main "Manage Teams" view, the add team button is now a floating button,
    // so no right button in the header is needed there.

    return { title, showBackButton, rightButton, onBackPress };
  };

  const { title, showBackButton, rightButton, onBackPress } = getHeaderContent();

  // --- Main Component Render ---
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        {showBackButton ? (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButtonPlaceholder} /> // Placeholder for alignment
        )}
        <Image
          source={require('../../../assets/images/logo.jpeg')} // Update this path
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>{title}</Text>
        {rightButton}
      </View>

      {/* Conditional Rendering of main content */}
      {showAddTeamForm ? (
        <AddTeamForm />
      ) : editingTeam ? (
        <EditTeamForm />
      ) : showAddPlayerForm ? (
        <AddPlayerForm />
      ) : editingPlayer ? (
        <EditPlayerForm />
      ) : selectedTeamForPlayers ? (
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
              <Text style={styles.emptyListSubText}>Tap '+' in header to add a new player.</Text>
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

          {/* Floating Add Team Button - Moved back to original position */}
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
    paddingTop: 50, // For iOS notch/status bar
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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1, // Allows title to take available space
    textAlign: 'center', // Center the text
    marginHorizontal: 10, // Space around title
  },
  backButton: {
    padding: 5,
    // No specific margin-right here, let header handle spacing
  },
  headerRightButton: {
    padding: 5,
    // No specific margin-left here
  },
  headerButtonPlaceholder: {
    width: 34, // Match back button size (24 icon + 5*2 padding) for alignment
    height: 34,
    // Maintain same margin as back button for alignment
  },
  addPlayerButton: { // Style for the Add Player button in the header (used when viewing players)
    backgroundColor: '#007AFF', // Example color
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    // margin-left auto could work, or just let space-between handle it
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
    paddingBottom: 20, // Enough space at bottom
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
    height: 50, // This was missing in your provided snippet
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

  // --- Forms Styles ---
  formContainer: {
    flexGrow: 1, // Allows scrolling for long forms
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
    marginTop: 10,
  },
  formInput: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  formButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    minWidth: 120,
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  formButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
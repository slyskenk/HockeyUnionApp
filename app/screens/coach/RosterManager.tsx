import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker'; // For position selection
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image, // For FAB animation
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// --- Types ---
type Player = {
  id: string;
  name: string;
  jerseyNumber: string; // Keep as string for flexible input (e.g., "00")
  position: 'Forward' | 'Midfielder' | 'Defender' | 'Goalkeeper' | 'Other';
  email: string;
  avatar?: string; // Optional avatar URL
};

// --- Dummy Data ---
const COACH_TEAM_NAME = 'Desert Scorpions (Men)';

const DUMMY_PLAYERS: Player[] = [
  { id: 'p1', name: 'Maria Silva', jerseyNumber: '7', position: 'Forward', email: 'maria.s@example.com', avatar: 'https://placehold.co/60x60/4A90E2/FFFFFF?text=MS' },
  { id: 'p2', name: 'David Jones', jerseyNumber: '10', position: 'Midfielder', email: 'david.j@example.com', avatar: 'https://placehold.co/60x60/283593/FFFFFF?text=DJ' },
  { id: 'p3', name: 'Sarah Khan', jerseyNumber: '4', position: 'Defender', email: 'sarah.k@example.com', avatar: 'https://placehold.co/60x60/FF5733/FFFFFF?text=SK' },
  { id: 'p4', name: 'Alex Lee', jerseyNumber: '1', position: 'Goalkeeper', email: 'alex.l@example.com', avatar: 'https://placehold.co/60x60/33FF57/000000?text=AL' },
  { id: 'p5', name: 'Chris Green', jerseyNumber: '9', position: 'Forward', email: 'chris.g@example.com', avatar: 'https://placehold.co/60x60/5856D6/FFFFFF?text=CG' },
  { id: 'p6', name: 'Emily Brown', jerseyNumber: '6', position: 'Midfielder', email: 'emily.b@example.com', avatar: 'https://placehold.co/60x60/C6C6C6/FFFFFF?text=EB' },
];

const POSITIONS = ['Forward', 'Midfielder', 'Defender', 'Goalkeeper', 'Other'];

const RosterManager = () => {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>(DUMMY_PLAYERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null); // For editing

  // Form states for Add/Edit Modal
  const [name, setName] = useState('');
  const [jerseyNumber, setJerseyNumber] = useState('');
  const [position, setPosition] = useState<Player['position']>('Forward');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');

  // Animation for FAB button
  const fabScale = useRef(new Animated.Value(1)).current;

  // Input focus states for styling
  const [nameFocused, setNameFocused] = useState(false);
  const [jerseyFocused, setJerseyFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [avatarFocused, setAvatarFocused] = useState(false);

  // Filter players based on search query
  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.jerseyNumber.includes(searchQuery) ||
    player.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort players by jersey number
  useEffect(() => {
    const sortedPlayers = [...players].sort((a, b) => {
      const numA = parseInt(a.jerseyNumber, 10) || Infinity;
      const numB = parseInt(b.jerseyNumber, 10) || Infinity;
      return numA - numB;
    });
    setPlayers(sortedPlayers);
  }, [players.length]); // Re-sort when player count changes

  const resetForm = () => {
    setCurrentPlayer(null);
    setName('');
    setJerseyNumber('');
    setPosition('Forward');
    setEmail('');
    setAvatar('');
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (player: Player) => {
    setCurrentPlayer(player);
    setName(player.name);
    setJerseyNumber(player.jerseyNumber);
    setPosition(player.position);
    setEmail(player.email);
    setAvatar(player.avatar || '');
    setModalVisible(true);
  };

  const handleSavePlayer = () => {
    if (!name.trim() || !jerseyNumber.trim() || !email.trim()) {
      Alert.alert('Missing Info', 'Please fill in player name, jersey number, and email.');
      return;
    }
    if (isNaN(Number(jerseyNumber)) || Number(jerseyNumber) < 0) {
        Alert.alert('Invalid Jersey Number', 'Jersey number must be a non-negative number.');
        return;
    }

    if (currentPlayer) {
      // Update existing player
      setPlayers(players.map(p =>
        p.id === currentPlayer.id
          ? { ...p, name: name.trim(), jerseyNumber: jerseyNumber.trim(), position, email: email.trim(), avatar: avatar.trim() || undefined }
          : p
      ));
      Alert.alert('Success', 'Player updated successfully!');
    } else {
      // Add new player
      const newPlayer: Player = {
        id: `player-${Date.now()}`,
        name: name.trim(),
        jerseyNumber: jerseyNumber.trim(),
        position,
        email: email.trim(),
        avatar: avatar.trim() || undefined,
      };
      setPlayers([...players, newPlayer]);
      Alert.alert('Success', 'Player added to roster!');
    }
    setModalVisible(false);
    resetForm();
  };

  const handleDeletePlayer = (id: string) => {
    Alert.alert(
      'Remove Player',
      'Are you sure you want to remove this player from the roster? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          onPress: () => {
            setPlayers(players.filter(p => p.id !== id));
            Alert.alert('Removed', 'Player has been removed from the roster.');
          },
          style: 'destructive',
        },
      ]
    );
  };

  // FAB animation
  const animateFabPress = () => {
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.spring(fabScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
    ]).start();
  };

  const renderPlayerCard = ({ item }: { item: Player }) => (
    <View style={styles.playerCard}>
      <Image
        source={{ uri: item.avatar || 'https://placehold.co/60x60/CCCCCC/000000?text=P' }}
        style={styles.playerCardAvatar}
      />
      <View style={styles.playerCardInfo}>
        <Text style={styles.playerCardName}>{item.name}</Text>
        <View style={styles.playerCardDetailsRow}>
          <Text style={styles.playerCardJersey}>#{item.jerseyNumber}</Text>
          <MaterialIcons name="circle" size={8} color="#ddd" style={{ marginHorizontal: 5 }} />
          <Text style={styles.playerCardPosition}>{item.position}</Text>
        </View>
        <Text style={styles.playerCardEmail}>{item.email}</Text>
      </View>
      <View style={styles.playerCardActions}>
        <TouchableOpacity onPress={() => openEditModal(item)} style={styles.actionButton}>
          <MaterialIcons name="edit" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeletePlayer(item.id)} style={[styles.actionButton, styles.deleteButton]}>
          <MaterialIcons name="person-remove" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#4A90E2', '#283593']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Image
          source={require('../../../assets/images/logo.jpeg')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Roster Manager</Text>
        <View style={styles.backButtonPlaceholder} />
      </LinearGradient>

      {/* Team Overview */}
      <View style={styles.teamOverviewCard}>
        <MaterialIcons name="groups" size={24} color="#6633FF" />
        <Text style={styles.teamNameText}>{COACH_TEAM_NAME}</Text>
        <Text style={styles.playerCountText}>{players.length} Players</Text>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search players by name, #, or position..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Player List */}
      {filteredPlayers.length === 0 && searchQuery.length > 0 ? (
        <View style={styles.emptyStateContainer}>
          <MaterialIcons name="person-search" size={100} color="#E0E0E0" />
          <Text style={styles.emptyStateText}>No players found matching your search.</Text>
          <Text style={styles.emptyStateSubText}>Try a different name or number.</Text>
        </View>
      ) : filteredPlayers.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name="account-group" size={100} color="#E0E0E0" />
          <Text style={styles.emptyStateText}>Your roster is empty!</Text>
          <Text style={styles.emptyStateSubText}>Tap the '+' button to add your first player.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {filteredPlayers.map((player) => renderPlayerCard({ item: player }))}
        </ScrollView>
      )}

      {/* Add New Player Floating Action Button */}
      <Animated.View style={[styles.fab, { transform: [{ scale: fabScale }] }]}>
        <TouchableOpacity
          onPress={() => {
            animateFabPress();
            openAddModal();
          }}
          style={styles.fabButton}
        >
          <MaterialIcons name="person-add" size={30} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Add/Edit Player Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentPlayer ? 'Edit Player' : 'Add New Player'}</Text>

            {/* Player Profile Preview in Modal */}
            {currentPlayer && (
              <View style={styles.modalPlayerPreview}>
                <Image
                  source={{ uri: avatar || 'https://placehold.co/60x60/CCCCCC/000000?text=P' }}
                  style={styles.modalPreviewAvatar}
                />
                <View style={styles.modalPreviewInfo}>
                  <Text style={styles.modalPreviewName}>{name || 'Player Name'}</Text>
                  <Text style={styles.modalPreviewDetails}>
                    #{jerseyNumber || 'XX'} - {position}
                  </Text>
                </View>
              </View>
            )}

            <TextInput
              style={[styles.input, nameFocused && styles.inputFocused]}
              placeholder="Player Name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
            />
            <TextInput
              style={[styles.input, jerseyFocused && styles.inputFocused]}
              placeholder="Jersey Number (e.g., 7)"
              placeholderTextColor="#999"
              value={jerseyNumber}
              onChangeText={setJerseyNumber}
              keyboardType="numeric"
              onFocus={() => setJerseyFocused(true)}
              onBlur={() => setJerseyFocused(false)}
            />
            <TextInput
              style={[styles.input, emailFocused && styles.inputFocused]}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
            <TextInput
              style={[styles.input, avatarFocused && styles.inputFocused]}
              placeholder="Avatar Image URL (Optional)"
              placeholderTextColor="#999"
              value={avatar}
              onChangeText={setAvatar}
              keyboardType="url"
              onFocus={() => setAvatarFocused(true)}
              onBlur={() => setAvatarFocused(false)}
            />

            <Text style={styles.pickerLabel}>Select Position:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={position}
                onValueChange={(itemValue: Player['position']) => setPosition(itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem} // For iOS
              >
                {POSITIONS.map(pos => (
                  <Picker.Item key={pos} label={pos} value={pos} />
                ))}
              </Picker>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSavePlayer}>
                <Text style={styles.saveButtonText}>{currentPlayer ? 'Update Player' : 'Add Player'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  backButtonPlaceholder: {
    width: 24 + 10,
    height: 24,
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 30,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginLeft: -40,
  },
  teamOverviewCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    margin: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderLeftWidth: 6,
    borderLeftColor: '#6633FF',
  },
  teamNameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  playerCountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  scrollViewContent: {
    paddingHorizontal: 15,
    paddingBottom: 80, // Space for FAB
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: height * 0.5,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  playerCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderLeftWidth: 5,
    borderLeftColor: '#4A90E2', // Accent color
  },
  playerCardAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: '#ddd',
    borderWidth: 1,
    borderColor: '#eee',
  },
  playerCardInfo: {
    flex: 1,
  },
  playerCardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  playerCardDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  playerCardJersey: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  playerCardPosition: {
    fontSize: 14,
    color: '#666',
  },
  playerCardEmail: {
    fontSize: 12,
    color: '#999',
  },
  playerCardActions: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
  deleteButton: {
    // Specific styling for delete if needed
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#6633FF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  fabButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalPlayerPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalPreviewAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
    backgroundColor: '#ddd',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  modalPreviewInfo: {
    flex: 1,
  },
  modalPreviewName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalPreviewDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputFocused: {
    borderColor: '#6633FF', // Highlight border on focus
    shadowColor: '#6633FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  pickerLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 10,
  },
  pickerContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 20,
    overflow: 'hidden', // Ensures picker content stays within border radius
  },
  picker: {
    height: 50, // Standard height for picker
    width: '100%',
    color: '#333',
  },
  pickerItem: {
    fontSize: 16, // For iOS picker items
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  cancelButtonText: {
    color: '#555',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#6633FF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RosterManager;

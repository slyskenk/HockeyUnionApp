// app/screens/player/MyTeam.tsx

import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // Import ImagePicker
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert, // Import Alert for permission feedback
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// --- Dummy Data (Player's Team Specific) ---

const PLAYER_TEAM = 'Desert Scorpions (Men)';
const TEAM_MOTTO = "Unleash the Sting!";

const DUMMY_PLAYERS = [
  { id: 'p1', name: 'Alex Smith', jersey: 7, position: 'Forward', isCaptain: true, avatar: 'https://placehold.co/40x40/FF5733/FFFFFF?text=AS', birthday: '07-20' },
  { id: 'p2', name: 'Ben Johnson', jersey: 10, position: 'Midfielder', isCaptain: false, avatar: 'https://placehold.co/40x40/33FF57/000000?text=BJ', birthday: '06-05' },
  { id: 'p3', name: 'Chris Evans', jersey: 1, position: 'Goalkeeper', isCaptain: false, avatar: 'https://placehold.co/40x40/3357FF/FFFFFF?text=CE', birthday: '01-15' },
  { id: 'p4', name: 'David Lee', jersey: 5, position: 'Defender', isCaptain: false, avatar: 'https://placehold.co/40x40/FFC300/000000?text=DL', birthday: '11-28' },
  { id: 'p5', name: 'Emily White', jersey: 12, position: 'Forward', isCaptain: false, avatar: 'https://placehold.co/40x40/DAF7A6/000000?text=EW', birthday: '06-10' },
  { id: 'p6', name: 'Frank Green', jersey: 8, position: 'Midfielder', isCaptain: false, avatar: 'https://placehold.co/40x40/C70039/FFFFFF?text=FG', birthday: '03-22' },
  { id: 'p7', name: 'Grace Hall', jersey: 2, position: 'Defender', isCaptain: true, avatar: 'https://placehold.co/40x40/900C3F/FFFFFF?text=GH', birthday: '09-01' },
  { id: 'p8', name: 'Henry King', jersey: 11, position: 'Forward', isCaptain: false, avatar: 'https://placehold.co/40x40/581845/FFFFFF?text=HK', birthday: '12-03' },
];

const DUMMY_TEAM_STATS = {
  wins: 8,
  losses: 2,
  draws: 1,
  goalsScored: 35,
  goalsConceded: 12,
  playersCount: DUMMY_PLAYERS.length,
};

const DEFAULT_TEAM_PHOTO = 'https://placehold.co/600x300/4A90E2/FFFFFF?text=Upload+Team+Photo';

// --- MyTeam Component ---

const MyTeam = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState(DUMMY_PLAYERS);
  const [upcomingBirthdays, setUpcomingBirthdays] = useState<typeof DUMMY_PLAYERS>([]);
  const [teamPhotoUri, setTeamPhotoUri] = useState<string | null>(DEFAULT_TEAM_PHOTO); // State for team photo

  useEffect(() => {
    // Filter players based on search query
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = DUMMY_PLAYERS.filter(player =>
      player.name.toLowerCase().includes(lowerCaseQuery) ||
      player.position.toLowerCase().includes(lowerCaseQuery) ||
      player.jersey.toString().includes(lowerCaseQuery)
    );
    setFilteredPlayers(filtered);
  }, [searchQuery]);

  useEffect(() => {
    // Calculate upcoming birthdays
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // getMonth() is 0-indexed
    const currentDay = today.getDate();

    const birthdays = DUMMY_PLAYERS.filter(player => {
      const [bMonth, bDay] = player.birthday.split('-').map(Number);
      // Consider birthdays in the current month or next month
      if (bMonth === currentMonth && bDay >= currentDay) return true;
      if (bMonth === currentMonth + 1) return true; // Next month
      if (currentMonth === 12 && bMonth === 1 && currentDay <= bDay) return true; // Dec to Jan wrap-around (future birthdays in Jan)
      return false;
    }).sort((a, b) => {
      const [aMonth, aDay] = a.birthday.split('-').map(Number);
      const [bMonth, bDay] = b.birthday.split('-').map(Number);
      if (aMonth !== bMonth) return aMonth - bMonth;
      return aDay - bDay;
    });
    setUpcomingBirthdays(birthdays);
  }, []);


  const handleViewPlayerProfile = (playerId: string) => {
    console.log(`Navigating to profile for player: ${playerId}`);
    // In a real app, you'd navigate to a PlayerProfileDetail screen with the player ID
    router.push(`../Profile?id=${playerId}`); // Example: Pass ID as param
  };

  const getBirthdayMonthDay = (birthday: string): string => {
    const [month, day] = birthday.split('-');
    const date = new Date(2000, parseInt(month) - 1, parseInt(day)); // Use a dummy year
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // --- Photo Upload Logic ---
  const pickImage = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to make this work!'
      );
      return;
    }

    // Launch image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Allow user to crop/edit
      aspect: [4, 3], // Maintain aspect ratio
      quality: 1, // High quality
    });

    if (!result.canceled) {
      // If an image was picked and not cancelled
      if (result.assets && result.assets.length > 0) {
        setTeamPhotoUri(result.assets[0].uri);
        // In a real app, you would now upload result.assets[0].uri to your backend
        // and potentially save the returned URL to your database.
        Alert.alert('Photo Uploaded', 'Team photo has been updated locally!');
      }
    }
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Image
          source={require('../../../assets/images/logo.jpeg')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>My Team</Text>
        <View style={styles.backButtonPlaceholder} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>

        {/* Team Overview Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="sports-hockey" size={24} color="#007AFF" />
            <Text style={styles.cardTitle}>Team: {PLAYER_TEAM}</Text>
          </View>
          <Text style={styles.teamMotto}>"{TEAM_MOTTO}"</Text>
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
        </View>

        {/* Team Roster Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="groups" size={24} color="#34C759" />
            <Text style={styles.cardTitle}>Team Roster</Text>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search players by name or number..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {filteredPlayers.length === 0 ? (
            <Text style={styles.noPlayersFound}>No players found matching your search.</Text>
          ) : (
            filteredPlayers.map(player => (
              <TouchableOpacity
                key={player.id}
                style={styles.playerItem}
                onPress={() => handleViewPlayerProfile(player.id)}
              >
                <Image source={{ uri: player.avatar }} style={styles.playerAvatar} />
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{player.name} #{player.jersey}</Text>
                  <Text style={styles.playerDetails}>{player.position}
                    {player.isCaptain && <Text style={styles.captainBadge}> (C)</Text>}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#ccc" />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Upcoming Team Birthdays Card */}
        {upcomingBirthdays.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MaterialIcons name="cake" size={24} color="#FFD700" />
              <Text style={styles.cardTitle}>Upcoming Birthdays</Text>
            </View>
            {upcomingBirthdays.map(player => (
              <View key={player.id} style={styles.birthdayItem}>
                <MaterialIcons name="celebration" size={20} color="#FFD700" style={{ marginRight: 10 }} />
                <Text style={styles.birthdayText}>{player.name} ({getBirthdayMonthDay(player.birthday)})</Text>
              </View>
            ))}
          </View>
        )}

        {/* Team Photo Card with Upload Option */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="photo-library" size={24} color="#5856D6" />
            <Text style={styles.cardTitle}>Team Photo</Text>
          </View>
          <Image
            source={{ uri: teamPhotoUri || DEFAULT_TEAM_PHOTO }} // Use uploaded URI or default
            style={styles.teamPhoto}
            resizeMode="cover"
          />
          <TouchableOpacity style={styles.uploadPhotoButton} onPress={pickImage}>
            <MaterialIcons name="cloud-upload" size={20} color="#fff" />
            <Text style={styles.uploadPhotoButtonText}>
              {teamPhotoUri === DEFAULT_TEAM_PHOTO ? 'Upload Team Photo' : 'Change Team Photo'}
            </Text>
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
    width: 24 + 10, // Width of icon + margin, for alignment
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
    flex: 1,
    textAlign: 'center',
    marginLeft: -40, // Adjust title position
  },
  scrollViewContent: {
    padding: 15,
    paddingBottom: 20,
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

  // Team Overview Styles
  teamMotto: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
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

  // Team Roster Styles
  searchInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  noPlayersFound: {
    textAlign: 'center',
    color: '#666',
    fontSize: 15,
    paddingVertical: 20,
  },
  playerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  playerAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 15,
    backgroundColor: '#ddd',
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  playerDetails: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  captainBadge: {
    fontWeight: 'bold',
    color: '#FFD700', // Gold color for captain
  },

  // Upcoming Birthdays Styles
  birthdayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  birthdayText: {
    fontSize: 15,
    color: '#333',
  },

  // Team Photo Styles (Updated)
  teamPhoto: { // Renamed from teamPhotoPlaceholder
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 15, // Increased margin for button
    backgroundColor: '#e0e0e0', // Light grey background while loading/no image
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPhotoButton: {
    backgroundColor: '#6633FF', // Consistent primary button color
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  uploadPhotoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default MyTeam;
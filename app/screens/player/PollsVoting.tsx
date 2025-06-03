import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// --- Type Definitions ---
type Player = {
  id: string;
  name: string;
  votes: number;
  image: string;
};

// --- Dummy Player Data for Voting ---
// In a real application, this data would be fetched from a backend.
const initialPlayers: Player[] = [
  { id: '1', name: 'Jason Carter', votes: 120, image: 'https://images.unsplash.com/photo-1617019114583-0b83f9c09d3d?auto=format&fit=crop&w=60&h=60&q=80' },
  { id: '2', name: 'Emily White', votes: 95, image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=60&h=60&q=80' },
  { id: '3', name: 'Michael Lee', votes: 80, image: 'https://images.unsplash.com/photo-1507003211169-e69adba4c2d9?auto=format&fit=crop&w=60&h=60&q=80' },
  { id: '4', name: 'Sophia Chen', votes: 70, image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=60&h=60&q=80' },
  { id: '5', name: 'Daniel Kim', votes: 60, image: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=60&h=60&q=80' },
  { id: '6', name: 'Olivia Davis', votes: 55, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=60&h=60&q=80' },
  { id: '7', name: 'William Brown', votes: 48, image: 'https://images.unsplash.com/photo-1520456206066-f761d153835f?auto=format&fit=crop&w=60&h=60&q=80' },
  { id: '8', name: 'Ava Wilson', votes: 40, image: 'https://images.unsplash.com/photo-1529626465-ee4c6ecc44b8?auto=format&fit=crop&w=60&h=60&q=80' },
];

export default function PollsVoting() {
  const router = useRouter();

  // State to hold player data, initially sorted by votes in descending order
  const [players, setPlayers] = useState<Player[]>(
    [...initialPlayers].sort((a, b) => b.votes - a.votes)
  );

  // State to track if a vote has been cast in the current session
  // In a real app, this would be persisted (e.g., via AsyncStorage or backend)
  // to prevent multiple votes from the same user.
  const [hasVoted, setHasVoted] = useState<boolean>(false);

  /**
   * Handles the voting action for a specific player.
   * Increments the vote count and re-sorts the players.
   * @param playerId The ID of the player to vote for.
   */
  const handleVote = (playerId: string) => {
    if (hasVoted) {
      Alert.alert('Already Voted!', 'You can only vote once per session.');
      return;
    }

    setPlayers((prevPlayers) => {
      const updatedPlayers = prevPlayers.map((player) =>
        player.id === playerId ? { ...player, votes: player.votes + 1 } : player
      );
      // Sort players by votes in descending order after a vote is cast
      return updatedPlayers.sort((a, b) => b.votes - a.votes);
    });

    setHasVoted(true); // Mark that the user has voted
    Alert.alert('Vote Cast!', 'Thank you for your vote!');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Status bar styling to match the header */}
      <StatusBar backgroundColor="#1A5DB5" barStyle="light-content" />

      {/* Header with gradient background and back button */}
      <LinearGradient
        colors={['#1A5DB5', '#103A70']} // Deep blue gradient, matching dashboard
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🌟 Player Popularity Poll</Text>
        <Text style={styles.headerSubtitle}>Vote for your favorite players!</Text>
      </LinearGradient>

      {/* Scrollable content area for player cards */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Current Standings</Text>

        {/* Render each player card */}
        {players.map((player, index) => (
          <View key={player.id} style={styles.playerCard}>
            <View style={styles.playerRank}>
              <Text style={styles.playerRankText}>#{index + 1}</Text>
            </View>
            <Image source={{ uri: player.image }} style={styles.playerAvatar} />
            <View style={styles.playerInfo}>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerVotes}>Votes: {player.votes}</Text>
            </View>
            <TouchableOpacity
              style={[styles.voteButton, hasVoted && styles.voteButtonDisabled]}
              onPress={() => handleVote(player.id)}
              disabled={hasVoted} // Disable button after voting
            >
              <Text style={styles.voteButtonText}>Vote</Text>
            </TouchableOpacity>
          </View>
        ))}

        {hasVoted && (
          <View style={styles.votedMessageContainer}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
            <Text style={styles.votedMessageText}>You have cast your vote!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8', // Light background, matching dashboard
  },
  header: {
    paddingVertical: Platform.OS === 'ios' ? 40 : 32, // Adjust padding for iOS/Android status bar
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20, // Spacing below header
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 32, // Position relative to header padding
    left: 15,
    zIndex: 1, // Ensure it's tappable
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    color: '#e0e0e0',
    fontSize: 16,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30, // Extra padding at bottom for scroll comfort
  },
  sectionTitle: {
    fontSize: 22, // Slightly larger for main section title
    fontWeight: 'bold',
    color: '#1A5DB5', // Primary blue
    marginBottom: 20,
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#D1E0F0',
    paddingBottom: 8,
  },
  playerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  playerRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E9F0FB', // Light blue background for rank
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#BCCFEF',
  },
  playerRankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A5DB5', // Primary blue for rank number
  },
  playerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30, // Circular avatar
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#2E5AAC', // Accent border
  },
  playerInfo: {
    flex: 1, // Allows text to take available space
  },
  playerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#343a40',
  },
  playerVotes: {
    marginTop: 4,
    color: '#6c757d',
    fontSize: 15,
    fontWeight: 'bold',
  },
  voteButton: {
    backgroundColor: '#2E5AAC', // Primary blue for vote button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  voteButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  voteButtonDisabled: {
    backgroundColor: '#A0A0A0', // Grey out when disabled
    opacity: 0.7,
  },
  votedMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4EDDA', // Light green background
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#28A745', // Green border
  },
  votedMessageText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28A745', // Green text
    marginLeft: 10,
  },
});

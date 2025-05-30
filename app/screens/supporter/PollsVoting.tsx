

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';


const initialPlayers = [
  { id: '1', name: 'Player A', votes: 0, image: 'https://via.placeholder.com/60x60.png?text=A' },
  { id: '2', name: 'Player B', votes: 0, image: 'https://via.placeholder.com/60x60.png?text=B' },
  { id: '3', name: 'Player C', votes: 0, image: 'https://via.placeholder.com/60x60.png?text=C' },
];

const initialTeams = [
  { id: '1', name: 'Team X', votes: 0, logo: 'https://via.placeholder.com/60x60.png?text=X' },
  { id: '2', name: 'Team Y', votes: 0, logo: 'https://via.placeholder.com/60x60.png?text=Y' },
  { id: '3', name: 'Team Z', votes: 0, logo: 'https://via.placeholder.com/60x60.png?text=Z' },
];

export default function PollingStationApp() {
  const [playerVotes, setPlayerVotes] = useState(initialPlayers);
  const [teamVotes, setTeamVotes] = useState(initialTeams);

  const votePlayer = (id) => {
    setPlayerVotes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, votes: p.votes + 1 } : p))
    );
  };

  const voteTeam = (id) => {
    setTeamVotes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, votes: t.votes + 1 } : t))
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#2E5AAC" barStyle="light-content" />

      <LinearGradient colors={['#2E5AAC', '#3D7BE5']} style={styles.header}>
        <Text style={styles.headerTitle}>🏆 Polling Station</Text>
        <Text style={styles.headerSubtitle}>Vote for your favorite players and teams!</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Players</Text>
        {playerVotes.map((player) => (
          <View key={player.id} style={styles.pollCard}>
            <View style={styles.row}>
              <Image source={{ uri: player.image }} style={styles.avatar} />
              <View>
                <Text style={styles.pollText}>{player.name}</Text>
                <Text style={styles.voteCount}>Votes: {player.votes}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.voteButton}
              onPress={() => votePlayer(player.id)}
            >
              <Text style={styles.voteButtonText}>Vote</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Teams</Text>
        {teamVotes.map((team) => (
          <View key={team.id} style={styles.pollCard}>
            <View style={styles.row}>
              <Image source={{ uri: team.logo }} style={styles.avatar} />
              <View>
                <Text style={styles.pollText}>{team.name}</Text>
                <Text style={styles.voteCount}>Votes: {team.votes}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.voteButton}
              onPress={() => voteTeam(team.id)}
            >
              <Text style={styles.voteButtonText}>Vote</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e0e0',
    marginTop: 4,
  },
  scroll: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E5AAC',
    marginTop: 20,
    marginBottom: 10,
  },
  pollCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#C7D2E4',
  },
  pollText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#444444',
  },
  voteButton: {
    backgroundColor: '#F0F4FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D2E4',
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  voteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2E5AAC',
  },
  voteCount: {
    marginTop: 4,
    color: '#333333',
    fontSize: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

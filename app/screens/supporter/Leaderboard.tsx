// app/screens/supporter/Leaderboards.tsx

import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// --- Types ---
type LeaderboardEntry = {
  id: string;
  name: string; // Team Name
  rank?: number; // Optional rank
  avatar?: string; // Team logo

  // For Team Standings
  teamStats?: {
    gp: number; // Games Played - Keeping in type for data integrity, but not displaying
    w: number; // Wins
    d: number; // Draws
    l: number; // Losses
    gf: number; // Goals For - Not displaying
    ga: number; // Goals Against - Not displaying
    gd: number; // Goal Difference - Not displaying
    pts: number; // Points
  };
};

// --- Dummy Data (Only Team Standings relevant for supporters) ---
const DUMMY_TEAM_STANDINGS: LeaderboardEntry[] = [
  { id: 't1', name: 'Desert Scorpions', avatar: 'https://picsum.photos/seed/scorpion/40/40', teamStats: { gp: 10, w: 9, d: 1, l: 0, gf: 35, ga: 10, gd: 25, pts: 28 } },
  { id: 't2', name: 'Oryx Chargers', avatar: 'https://picsum.photos/seed/oryx/40/40', teamStats: { gp: 10, w: 8, d: 1, l: 1, gf: 30, ga: 12, gd: 18, pts: 25 } },
  { id: 't3', name: 'Windhoek Warriors', avatar: 'https://picsum.photos/seed/warrior/40/40', teamStats: { gp: 10, w: 6, d: 2, l: 2, gf: 25, ga: 15, gd: 10, pts: 20 } },
  { id: 't4', name: 'Coastal Conquerors', avatar: 'https://picsum.photos/seed/conqueror/40/40', teamStats: { gp: 10, w: 4, d: 3, l: 3, gf: 20, ga: 20, gd: 0, pts: 15 } },
  { id: 't5', name: 'Northern Knights', avatar: 'https://picsum.photos/seed/knight/40/40', teamStats: { gp: 10, w: 2, d: 2, l: 6, gf: 15, ga: 25, gd: -10, pts: 8 } },
  { id: 't6', name: 'Southern Stingrays', avatar: 'https://picsum.photos/seed/stingray/40/40', teamStats: { gp: 10, w: 1, d: 4, l: 5, gf: 10, ga: 18, gd: -8, pts: 7 } },
  { id: 't7', name: 'Eastern Eagles', avatar: 'https://picsum.photos/seed/eagle/40/40', teamStats: { gp: 10, w: 0, d: 2, l: 8, gf: 8, ga: 30, gd: -22, pts: 2 } },
];

// Helper function to sort and rank team data
const sortAndRankTeams = (teams: LeaderboardEntry[]): LeaderboardEntry[] => {
  let sortedData = [...teams]; // Make a shallow copy to avoid mutating original data

  // Primary sort by points, then by goal difference, then by goals for
  sortedData.sort((a, b) => {
    if ((b.teamStats?.pts || 0) !== (a.teamStats?.pts || 0)) {
      return (b.teamStats?.pts || 0) - (a.teamStats?.pts || 0);
    }
    // Keeping GD and GF in sort logic for robust tie-breaking, even if not displayed
    if ((b.teamStats?.gd || 0) !== (a.teamStats?.gd || 0)) {
      return (b.teamStats?.gd || 0) - (a.teamStats?.gd || 0);
    }
    return (b.teamStats?.gf || 0) - (a.teamStats?.gf || 0);
  });

  const rankedData = sortedData.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
  return rankedData;
};


const SupporterLeaderboards = () => {
  const router = useRouter();
  // Initialize state directly with sorted and ranked data
  const [teamStandings] = useState<LeaderboardEntry[]>(() => sortAndRankTeams(DUMMY_TEAM_STANDINGS));

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#E63946" barStyle="light-content" />
      {/* Gradient Header - Supporter Theme */}
      <LinearGradient
        colors={['#FF6F61', '#E63946']} // Warm, energetic colors from Supporter Dashboard
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
        <Text style={styles.headerTitle}>League Standings</Text>
        <View style={styles.backButtonPlaceholder} />
      </LinearGradient>

      {/* Leaderboard Content */}
      {teamStandings.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name={"trophy-off" as any} size={100} color="#E0E0E0" />
          <Text style={styles.emptyStateText}>No team standings available yet!</Text>
          <Text style={styles.emptyStateSubText}>Check back after the season starts.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {/* Team Standings Table View */}
          <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.posCell]}>Pos</Text>
              <Text style={[styles.headerCell, styles.clubCell]}>Club</Text>
              <Text style={styles.headerCell}>W</Text> {/* Show Wins */}
              <Text style={styles.headerCell}>D</Text> {/* Show Draws */}
              <Text style={styles.headerCell}>L</Text> {/* Show Losses */}
              <Text style={[styles.headerCell, styles.ptsCell]}>Pts</Text> {/* Show Points */}
            </View>
            {/* Table Rows */}
            {teamStandings.map((entry: LeaderboardEntry) => (
              <View key={entry.id} style={styles.tableRow}>
                <Text style={[styles.dataCell, styles.posCell]}>{entry.rank}</Text>
                <View style={styles.clubDataCell}>
                  <Image
                    source={{ uri: entry.avatar || 'https://picsum.photos/seed/generic_team/30/30' }}
                    style={styles.teamAvatar}
                  />
                  <Text style={styles.clubNameText}>{entry.name}</Text>
                </View>
                <Text style={styles.dataCell}>{entry.teamStats?.w}</Text>
                <Text style={styles.dataCell}>{entry.teamStats?.d}</Text>
                <Text style={styles.dataCell}>{entry.teamStats?.l}</Text>
                <Text style={[styles.dataCell, styles.ptsCell]}>{entry.teamStats?.pts}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
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
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginLeft: -40,
  },
  scrollViewContent: {
    padding: 15,
    paddingBottom: 20,
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

  // --- Styles for Team Standings Table (adapted for display) ---
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E63946',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFC1C1',
  },
  headerCell: {
    flex: 1, // Adjusted flex for fewer columns
    fontSize: 12, // Adjusted font size
    fontWeight: 'bold',
    color: '#E63946',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  posCell: {
    flex: 0.6, // Smaller for rank
    fontSize: 12,
  },
  clubCell: {
    flex: 2.8, // Increased flex for club name as there are fewer columns
    textAlign: 'left',
    paddingLeft: 8,
    fontSize: 12,
  },
  ptsCell: {
    flex: 0.8, // Slightly larger for points
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FDF0F0',
    backgroundColor: '#fff',
  },
  dataCell: {
    flex: 1, // Adjusted flex for fewer columns
    fontSize: 13, // Slightly larger data font
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  clubDataCell: {
    flex: 2.8, // Increased flex for club name
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  teamAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    backgroundColor: '#ddd',
    borderWidth: 1,
    borderColor: '#eee',
  },
  clubNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    flexShrink: 1,
  },
});

export default SupporterLeaderboards;
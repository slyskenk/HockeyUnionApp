import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

// --- Types ---
type Player = {
  id: string;
  name: string;
  position: string;
  jerseyNumber: number;
  avatar: string;
};

type PlayerStat = {
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral'; // For visual trend indicator
  color?: string; // For visual color coding
};

type PlayerAnalyticsData = {
  overallRating: number; // Out of 100
  kpis: PlayerStat[];
  notes: string[];
};

// --- Dummy Data ---
const DUMMY_PLAYERS: Player[] = [
  { id: 'p1', name: 'Maria Silva', position: 'Forward', jerseyNumber: 7, avatar: 'https://placehold.co/40x40/4A90E2/FFFFFF?text=MS' },
  { id: 'p2', name: 'David Jones', position: 'Midfielder', jerseyNumber: 10, avatar: 'https://placehold.co/40x40/283593/FFFFFF?text=DJ' },
  { id: 'p3', name: 'Sarah Khan', position: 'Defender', jerseyNumber: 4, avatar: 'https://placehold.co/40x40/FF5733/FFFFFF?text=SK' },
  { id: 'p4', name: 'Alex Lee', position: 'Goalkeeper', jerseyNumber: 1, avatar: 'https://placehold.co/40x40/33FF57/000000?text=AL' },
  { id: 'p5', name: 'Chris Green', position: 'Forward', jerseyNumber: 9, avatar: 'https://placehold.co/40x40/5856D6/FFFFFF?text=CG' },
  { id: 'p6', name: 'Emily Brown', position: 'Midfielder', jerseyNumber: 6, avatar: 'https://placehold.co/40x40/C6C6C6/FFFFFF?text=EB' },
  { id: 'p7', name: 'Sam White', position: 'Defender', jerseyNumber: 2, avatar: 'https://placehold.co/40x40/007AFF/FFFFFF?text=SW' },
];

const DUMMY_ANALYTICS: { [key: string]: PlayerAnalyticsData } = {
  'p1': { // Maria Silva - Forward
    overallRating: 85,
    kpis: [
      { label: 'Goals', value: 8, unit: '', trend: 'up', color: '#34C759' },
      { label: 'Assists', value: 5, unit: '', trend: 'up', color: '#34C759' },
      { label: 'Shots on Target', value: 25, unit: '', trend: 'neutral', color: '#FF9500' },
      { label: 'Dribble Success', value: 75, unit: '%', trend: 'up', color: '#34C759' },
      { label: 'Penalty Corners Won', value: 12, unit: '', trend: 'up', color: '#34C759' },
      { label: 'Tackles Won', value: 10, unit: '', trend: 'neutral', color: '#FF9500' },
      { label: 'Interceptions', value: 7, unit: '', trend: 'neutral', color: '#FF9500' },
      { label: 'Minutes Played (Avg)', value: 55, unit: 'min', trend: 'up', color: '#34C759' },
    ],
    notes: [
      "Excellent offensive presence. Needs to improve conversion rate on close-range shots.",
      "Good team player, always looking for assists.",
    ],
  },
  'p2': { // David Jones - Midfielder
    overallRating: 78,
    kpis: [
      { label: 'Goals', value: 3, unit: '', trend: 'neutral', color: '#FF9500' },
      { label: 'Assists', value: 8, unit: '', trend: 'up', color: '#34C759' },
      { label: 'Pass Accuracy', value: 88, unit: '%', trend: 'up', color: '#34C759' },
      { label: 'Tackles Won', value: 20, unit: '', trend: 'up', color: '#34C759' },
      { label: 'Interceptions', value: 15, unit: '', trend: 'up', color: '#34C759' },
      { label: 'Clearances', value: 5, unit: '', trend: 'neutral', color: '#FF9500' },
      { label: 'Distance Covered (Avg)', value: 8.5, unit: 'km', trend: 'up', color: '#34C759' },
      { label: 'Minutes Played (Avg)', value: 65, unit: 'min', trend: 'up', color: '#34C759' },
    ],
    notes: [
      "Engine of the midfield. Work rate is exceptional.",
      "Could be more assertive in shooting opportunities.",
      "Leadership qualities developing well.",
    ],
  },
  'p3': { // Sarah Khan - Defender
    overallRating: 70,
    kpis: [
      { label: 'Goals', value: 1, unit: '', trend: 'neutral', color: '#FF9500' },
      { label: 'Assists', value: 2, unit: '', trend: 'neutral', color: '#FF9500' },
      { label: 'Tackles Won', value: 30, unit: '', trend: 'up', color: '#34C759' },
      { label: 'Interceptions', value: 22, unit: '', trend: 'up', color: '#34C759' },
      { label: 'Clearances', value: 18, unit: '', trend: 'up', color: '#34C759' },
      { label: 'Defensive Blocks', value: 10, unit: '', trend: 'up', color: '#34C759' },
      { label: 'Discipline (Cards)', value: '1 Yellow', unit: '', trend: 'neutral', color: '#FF3B30' },
      { label: 'Minutes Played (Avg)', value: 60, unit: 'min', trend: 'neutral', color: '#FF9500' },
    ],
    notes: [
      "Solid defender. Reliable in 1-on-1 situations.",
      "Needs to work on offensive outlet passes.",
      "Great communication with the goalkeeper.",
    ],
  },
  'p4': { // Alex Lee - Goalkeeper
    overallRating: 80,
    kpis: [
      { label: 'Saves', value: 45, unit: '', trend: 'up', color: '#34C759' },
      { label: 'Save %', value: 78, unit: '%', trend: 'up', color: '#34C759' },
      { label: 'Clean Sheets', value: 4, unit: '', trend: 'neutral', color: '#FF9500' },
      { label: 'Goals Conceded (Avg)', value: 1.2, unit: '', trend: 'down', color: '#FF3B30' },
      { label: 'Clearances (by GK)', value: 15, unit: '', trend: 'up', color: '#34C759' },
      { label: 'Penalty Save %', value: 50, unit: '%', trend: 'up', color: '#34C759' },
      { label: 'Minutes Played (Avg)', value: 70, unit: 'min', trend: 'up', color: '#34C759' },
    ],
    notes: [
      "Strong command of the D. Good shot stopper.",
      "Distribution needs consistency under pressure.",
      "Always positive and vocal.",
    ],
  },
  'p5': { // Chris Green - Forward
    overallRating: 72,
    kpis: [
      { label: 'Goals', value: 4, unit: '', trend: 'neutral', color: '#FF9500' },
      { label: 'Assists', value: 2, unit: '', trend: 'neutral', color: '#FF9500' },
      { label: 'Shots on Target', value: 18, unit: '', trend: 'down', color: '#FF3B30' },
      { label: 'Offsides', value: 5, unit: '', trend: 'up', color: '#FF3B30' }, // More offsides = bad
      { label: 'Penalty Corners Won', value: 7, unit: '', trend: 'neutral', color: '#FF9500' },
      { label: 'Minutes Played (Avg)', value: 45, unit: 'min', trend: 'down', color: '#FF3B30' },
    ],
    notes: [
      "Good pace and positioning, but needs to work on finishing.",
      "Tends to drift offside too often.",
    ],
  },
  'p6': { // Emily Brown - Midfielder
    overallRating: 81,
    kpis: [
      { label: 'Goals', value: 6, unit: '', trend: 'up', color: '#34C759' },
      { label: 'Assists', value: 10, unit: '', trend: 'up', color: '#34C759' },
      { label: 'Pass Accuracy', value: 92, unit: '%', trend: 'up', color: '#34C759' },
      { label: 'Interceptions', value: 18, unit: '', trend: 'up', color: '#34C759' },
      { label: 'Tackles Won', value: 15, unit: '', trend: 'neutral', color: '#FF9500' },
      { label: 'Distance Covered (Avg)', value: 9.1, unit: 'km', trend: 'up', color: '#34C759' },
      { label: 'Minutes Played (Avg)', value: 68, unit: 'min', trend: 'up', color: '#34C759' },
    ],
    notes: [
      "Excellent vision and passing range. Very influential in attack.",
      "Needs to work on tracking back quicker after offensive plays.",
    ],
  },
  'p7': { // Sam White - Defender
    overallRating: 75,
    kpis: [
      { label: 'Goals', value: 0, unit: '', trend: 'neutral', color: '#FF9500' },
      { label: 'Assists', value: 1, unit: '', trend: 'neutral', color: '#FF9500' },
      { label: 'Tackles Won', value: 28, unit: '', trend: 'up', color: '#34C759' },
      { label: 'Interceptions', value: 20, unit: '', trend: 'up', color: '#34C759' },
      { label: 'Clearances', value: 25, unit: '', trend: 'up', color: '#34C759' },
      { label: 'Defensive Blocks', value: 7, unit: '', trend: 'neutral', color: '#FF9500' },
      { label: 'Discipline (Cards)', value: '0', unit: '', trend: 'up', color: '#34C759' },
      { label: 'Minutes Played (Avg)', value: 70, unit: 'min', trend: 'up', color: '#34C759' },
    ],
    notes: [
      "Reliable and consistent defender. Rarely out of position.",
      "Can contribute more to offensive build-up plays.",
    ],
  },
};

const CoachPlayerAnalytics = () => {
  const router = useRouter();
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Set first player as default selected if available
  useEffect(() => {
    if (!selectedPlayerId && DUMMY_PLAYERS.length > 0) {
      setSelectedPlayerId(DUMMY_PLAYERS[0].id);
    }
  }, [selectedPlayerId]); // Only run once on mount if no player is selected

  const selectedPlayer = DUMMY_PLAYERS.find(p => p.id === selectedPlayerId);
  const playerAnalytics = selectedPlayerId ? DUMMY_ANALYTICS[selectedPlayerId] : null;

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return <MaterialIcons name="arrow-drop-up" size={24} color="#34C759" />; // Green up arrow
      case 'down': return <MaterialIcons name="arrow-drop-down" size={24} color="#FF3B30" />; // Red down arrow
      case 'neutral': return <MaterialIcons name="remove" size={20} color="#FF9500" />; // Orange neutral line
      default: return null;
    }
  };

  const getOverallRatingColor = (rating: number) => {
    if (rating >= 80) return '#34C759'; // Green (Excellent)
    if (rating >= 60) return '#FF9500'; // Orange (Good)
    return '#FF3B30'; // Red (Needs Improvement)
  };

  const getProgressBarValue = (label: string, value: number | string) => {
    const numValue = Number(value);
    if (isNaN(numValue)) return 0; // Handle non-numeric values

    if (label.includes('%')) {
      return numValue; // Percentage values are already out of 100
    }
    if (label.includes('min')) {
      return Math.min(numValue / 90 * 100, 100); // Max minutes for avg could be ~90
    }
    if (label.includes('km')) {
      return Math.min(numValue / 10 * 100, 100); // Max distance could be ~10km
    }
    // For other stats, estimate a reasonable max value for the progress bar visually
    if (label === 'Goals') return Math.min(numValue / 15 * 100, 100);
    if (label === 'Assists') return Math.min(numValue / 10 * 100, 100);
    if (label === 'Tackles Won') return Math.min(numValue / 40 * 100, 100);
    if (label === 'Interceptions') return Math.min(numValue / 30 * 100, 100);
    if (label === 'Saves') return Math.min(numValue / 60 * 100, 100);
    if (label === 'Shots on Target') return Math.min(numValue / 30 * 100, 100);
    if (label === 'Penalty Corners Won') return Math.min(numValue / 15 * 100, 100);
    if (label === 'Clearances') return Math.min(numValue / 30 * 100, 100);
    if (label === 'Defensive Blocks') return Math.min(numValue / 15 * 100, 100);

    return Math.min(numValue / 100 * 100, 100); // Default to out of 100 if no specific range
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
        <Text style={styles.headerTitle}>Player Analytics</Text>
        {/* Placeholder to balance the header layout if no right icon is needed */}
        <View style={styles.backButtonPlaceholder} />
      </LinearGradient>

      {/* Player Selector - Horizontal Scroll for Player Avatars */}
      <View style={styles.playerSelectorWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.playerSelectorContainer}
        >
          {DUMMY_PLAYERS.map((player) => (
            <TouchableOpacity
              key={player.id}
              style={[
                styles.playerAvatarTouch,
                selectedPlayerId === player.id && styles.playerAvatarSelectedOutline,
              ]}
              onPress={() => setSelectedPlayerId(player.id)}
            >
              <Image source={{ uri: player.avatar }} style={styles.playerAvatar} />
              <Text
                style={[
                  styles.playerAvatarName,
                  selectedPlayerId === player.id && styles.playerAvatarNameSelected,
                ]}
              >
                {player.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Analytics Content */}
      {selectedPlayer && playerAnalytics ? (
        <ScrollView contentContainerStyle={styles.analyticsContent}>
          {/* Player Profile Summary Card */}
          <View style={styles.playerSummaryCard}>
            <Image source={{ uri: selectedPlayer.avatar }} style={styles.summaryAvatar} />
            <View style={styles.summaryTextContainer}>
              <Text style={styles.summaryPlayerName}>{selectedPlayer.name}</Text>
              <Text style={styles.summaryPlayerDetails}>
                #{selectedPlayer.jerseyNumber} - {selectedPlayer.position}
              </Text>
            </View>
            <View style={[styles.overallRatingBadge, { backgroundColor: getOverallRatingColor(playerAnalytics.overallRating) }]}>
              <Text style={styles.overallRatingValue}>{playerAnalytics.overallRating}</Text>
              <Text style={styles.overallRatingLabel}>Overall</Text>
            </View>
          </View>

          {/* KPIs Section */}
          <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
          <View style={styles.kpisGrid}>
            {playerAnalytics.kpis.map((kpi) => (
              <View key={kpi.label} style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>{kpi.label}</Text>
                <View style={styles.kpiValueRow}>
                  <Text style={[styles.kpiValue, { color: kpi.color || '#333' }]}>
                    {kpi.value}
                    {kpi.unit ? ` ${kpi.unit}` : ''}
                  </Text>
                  {getTrendIcon(kpi.trend)}
                </View>
                {/* Visual progress bar */}
                <View style={styles.kpiProgressBarBackground}>
                  <View
                    style={[
                      styles.kpiProgressBarFill,
                      {
                        width: `${getProgressBarValue(kpi.label, kpi.value)}%`,
                        backgroundColor: kpi.color || '#4A90E2',
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Coach's Notes Section */}
          {playerAnalytics.notes.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Coach's Notes</Text>
              <View style={styles.notesCard}>
                {playerAnalytics.notes.map((note, index) => (
                  <View key={index} style={styles.noteItem}>
                    <MaterialIcons name="sticky-note-2" size={18} color="#666" />
                    <Text style={styles.noteText}>{note}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      ) : (
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name="chart-bar" size={100} color="#E0E0E0" />
          <Text style={styles.emptyStateText}>Select a player to view their analytics!</Text>
          <Text style={styles.emptyStateSubText}>Tap on a player's avatar above to get started.</Text>
        </View>
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
    width: 24 + 10, // To align title, assuming a 24px icon + 10px padding
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
    marginLeft: -40, // Adjust to center the title taking into account back button
  },
  playerSelectorWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    paddingVertical: 8,
  },
  playerSelectorContainer: {
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  playerAvatarTouch: {
    alignItems: 'center',
    marginHorizontal: 8,
    paddingBottom: 5, // Space for name
  },
  playerAvatar: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    borderWidth: 2,
    borderColor: 'transparent', // Default transparent
    backgroundColor: '#ddd',
  },
  playerAvatarSelectedOutline: {
    borderColor: '#4A90E2', // Highlight color for selected player
  },
  playerAvatarName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginTop: 5,
  },
  playerAvatarNameSelected: {
    color: '#4A90E2', // Highlight name color for selected player
    fontWeight: '700',
  },
  analyticsContent: {
    padding: 15,
    paddingBottom: 30,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: height * 0.6,
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
  playerSummaryCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
    borderLeftWidth: 6,
    borderLeftColor: '#6633FF', // This will be overridden by dynamic color
  },
  summaryAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
    backgroundColor: '#eee',
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryPlayerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryPlayerDetails: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
  overallRatingBadge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor will be dynamic
  },
  overallRatingValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff', // White text for rating badge
  },
  overallRatingLabel: {
    fontSize: 10,
    color: '#fff', // White text for rating badge
    fontWeight: 'bold',
    marginTop: -3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  kpisGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  kpiCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    width: '48%', // Roughly half width for two columns
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#E0E0E0', // Default border color, can be customized
  },
  kpiLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500',
  },
  kpiValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginRight: 5,
    // Color will be dynamic from kpi.color
  },
  kpiProgressBarBackground: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginTop: 5,
    overflow: 'hidden',
  },
  kpiProgressBarFill: {
    height: '100%',
    borderRadius: 3,
    // backgroundColor will be dynamic from kpi.color
  },
  notesCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  noteText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 10,
    flexShrink: 1,
    lineHeight: 20,
  },
});

export default CoachPlayerAnalytics;
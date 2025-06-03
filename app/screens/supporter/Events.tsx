// app/screens/supporter/Events.tsx

import { MaterialIcons } from '@expo/vector-icons';
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

// Define Event Type for Supporters (only matches are relevant here)
type MatchEventType = 'Friendly Match' | 'Official Match';

// Define Match Event Structure
type MatchEvent = {
  id: string;
  title: string;
  description: string;
  date: string; // e.g., "2025-06-15"
  time: string; // e.g., "16:00"
  location: string;
  type: MatchEventType; // Explicitly only match types
  opponent: string; // Added opponent for matches
};

// --- Helper for formatting dates/times ---
const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const formatTimeForDisplay = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

// --- Dummy Data (Only Match Fixtures) ---
// Note: Adjusted dates to be in the future relative to current time (June 3, 2025)
const DUMMY_MATCH_FIXTURES: MatchEvent[] = [
  {
    id: 'm1',
    title: 'League Showdown vs. Oryx Chargers',
    description: 'Don\'t miss this critical league game! Our toughest rivals.',
    date: '2025-06-08',
    time: '18:30',
    location: 'National Hockey Stadium',
    type: 'Official Match',
    opponent: 'Oryx Chargers',
  },
  {
    id: 'm2',
    title: 'Friendly Clash vs. Windhoek Warriors',
    description: 'A pre-season friendly to test new strategies.',
    date: '2025-06-15',
    time: '19:00',
    location: 'Windhoek Sports Club',
    type: 'Friendly Match',
    opponent: 'Windhoek Warriors',
  },
  {
    id: 'm3',
    title: 'Quarter-Finals: Scorpions vs. Coastal Sharks',
    description: 'Playoff intensity! Every goal counts.',
    date: '2025-06-22',
    time: '16:00',
    location: 'Coastal Arena',
    type: 'Official Match',
    opponent: 'Coastal Sharks',
  },
  {
    id: 'm4',
    title: 'Exhibition Game: Team vs. Alumni',
    description: 'A fun match against some of our legends! Charity event.',
    date: '2025-07-01',
    time: '17:30',
    location: 'National Hockey Stadium',
    type: 'Friendly Match',
    opponent: 'Team Alumni',
  },
  {
    id: 'm5',
    title: 'Semi-Finals: Scorpions vs. Mountain Bears',
    description: 'Winner goes to the finals! Pack the stadium!',
    date: '2025-07-09',
    time: '20:00',
    location: 'Grand Arena',
    type: 'Official Match',
    opponent: 'Mountain Bears',
  },
];

const SupporterEvents = () => {
  const router = useRouter();
  const [fixtures, setFixtures] = useState<MatchEvent[]>([]);

  useEffect(() => {
    // Filter for only 'Official Match' and 'Friendly Match' types
    // and ensure they are future events.
    const now = new Date();
    const futureFixtures = DUMMY_MATCH_FIXTURES.filter(event => {
      const eventDateTime = new Date(`${event.date}T${event.time}`);
      return eventDateTime >= now;
    });

    const sortedFixtures = [...futureFixtures].sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`);
      const dateTimeB = new Date(`${b.date}T${b.time}`);
      return dateTimeA.getTime() - dateTimeB.getTime();
    });
    setFixtures(sortedFixtures);
  }, []);

  const getMatchIcon = (matchType: MatchEventType) => {
    switch (matchType) {
      case 'Friendly Match': return 'sports-soccer'; // A generic sports icon
      case 'Official Match': return 'emoji-events'; // Trophy icon for official matches
      default: return 'event';
    }
  };

  const getMatchColor = (matchType: MatchEventType) => {
    switch (matchType) {
      case 'Friendly Match': return '#FF9500'; // Orange
      case 'Official Match': return '#DC3545'; // Red for important matches
      default: return '#333';
    }
  };

  return (
    <View style={styles.container}>
      {/* Gradient Header - Adjusted for Supporter theme */}
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
        <Text style={styles.headerTitle}>Upcoming Matches</Text> {/* Fan-centric title */}
        <View style={styles.backButtonPlaceholder} /> {/* Spacer */}
      </LinearGradient>

      {/* Match Fixtures List */}
      {fixtures.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <MaterialIcons name="sports-hockey" size={80} color="#ccc" />
          <Text style={styles.emptyStateText}>No upcoming match fixtures!</Text>
          <Text style={styles.emptyStateSubText}>Stay tuned for game announcements.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {fixtures.map((match) => (
            <View key={match.id} style={styles.matchCard}>
              <View style={styles.matchCardHeader}>
                <MaterialIcons name={getMatchIcon(match.type)} size={28} color={getMatchColor(match.type)} />
                <View style={styles.matchTitleContainer}>
                  <Text style={styles.matchTitle}>{match.title}</Text>
                  <Text style={[styles.matchTypeBadge, { backgroundColor: getMatchColor(match.type) }]}>
                    {match.type === 'Official Match' ? 'OFFICIAL GAME' : 'FRIENDLY'}
                  </Text>
                </View>
              </View>
              <Text style={styles.matchDescription}>{match.description}</Text>
              <View style={styles.matchDetailsRow}>
                <MaterialIcons name="calendar-today" size={16} color="#666" />
                <Text style={styles.matchDetailText}>{formatDateForDisplay(match.date)}</Text>
              </View>
              <View style={styles.matchDetailsRow}>
                <MaterialIcons name="access-time" size={16} color="#666" />
                <Text style={styles.matchDetailText}>{formatTimeForDisplay(match.time)}</Text>
              </View>
              <View style={styles.matchDetailsRow}>
                <MaterialIcons name="location-on" size={16} color="#666" />
                <Text style={styles.matchDetailText}>{match.location}</Text>
              </View>
              <View style={styles.matchDetailsRow}>
                <MaterialIcons name="groups" size={16} color="#666" />
                <Text style={styles.matchDetailText}>Opponent: {match.opponent}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
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
    width: 24 + 10, // Width of icon + margin, for alignment with back button
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
    marginLeft: -40, // Adjust title position due to back button/logo
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
    minHeight: height * 0.7, // Ensure it's centered vertically if few events
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
  matchCard: { // Renamed from eventCard
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
  matchCardHeader: { // Renamed from eventCardHeader
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  matchTitleContainer: { // Renamed from eventTitleContainer
    marginLeft: 15,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  matchTitle: { // Renamed from eventTitle
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flexShrink: 1,
    marginRight: 10,
  },
  matchTypeBadge: { // Renamed from eventTypeBadge
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  matchDescription: { // Renamed from eventDescription
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  matchDetailsRow: { // Renamed from eventDetailsRow
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  matchDetailText: { // Renamed from eventDetailText
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
});

export default SupporterEvents;
import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Image,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function EventsScreen() {
  const router = useRouter();

  const events = [
    {
      id: 1,
      date: 'June 10, 2025',
      opponent: 'Opponent A',
      yourTeamLogo: require('../../../assets/images/team-A.jpg'),
      opponentLogo: require('../../../assets/images/team-A.jpg'),
    },
    {
      id: 2,
      date: 'June 15, 2025',
      opponent: 'Opponent B',
      yourTeamLogo: require('../../../assets/images/team-A.jpg'),
      opponentLogo: require('../../../assets/images/team-A.jpg'),
    },
    {
      id: 3,
      date: 'June 20, 2025',
      opponent: 'Opponent C',
      yourTeamLogo: require('../../../assets/images/team-A.jpg'),
      opponentLogo: require('../../../assets/images/team-A.jpg'),
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Back Arrow */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back-outline" size={28} color="#1A5DB5" />
      </TouchableOpacity>

      <Text style={styles.header}>📅 Upcoming Games</Text>

      {events.map((event) => (
        <View key={event.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar-outline" size={20} color="#2E5AAC" />
            <Text style={styles.cardTitle}>{event.date}</Text>
          </View>

          <View style={styles.teamRow}>
            <Image source={event.yourTeamLogo} style={styles.teamLogo} />
            <Text style={styles.vsText}>Your Team vs {event.opponent}</Text>
            <Image source={event.opponentLogo} style={styles.teamLogo} />
          </View>

          <Text style={styles.locationText}>🏟 Location: Home Stadium</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 16,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A5DB5',
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 40, // Adjust to push header below the back button
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#1A5DB5',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderColor: '#DEE2E6',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  teamLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  vsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
    textAlign: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 8,
  },
});

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const teamNews = [
  {
    id: '1',
    title: 'Intense Practice Session Ahead of the Tournament',
    summary: 'Coach Mike pushes the team to their limits with new drills.',
    date: 'May 29, 2025',
    image: 'https://images.unsplash.com/photo-1599058917212-dc8531f4e861',
  },
  {
    id: '2',
    title: 'New Goalie Joins the Team',
    summary: 'Coach welcomes Jacob, a promising goalie from the junior league.',
    date: 'May 27, 2025',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b',
  },
];

const playerRoster = [
  {
    name: 'Jacob',
    position: 'Goalie',
    number: 1,
    image: 'https://images.unsplash.com/photo-1600180758890-59e5f5d9f7f1',
  },
  {
    name: 'Liam',
    position: 'Defense',
    number: 5,
    image: 'https://images.unsplash.com/photo-1627328715728-7bcc1b5db87d',
  },
  {
    name: 'Noah',
    position: 'Forward',
    number: 10,
    image: 'https://images.unsplash.com/photo-1619715221817-360b87868f46',
  },
  {
    name: 'Mason',
    position: 'Center',
    number: 8,
    image: 'https://images.unsplash.com/photo-1553830591-42b5697c1d99',
  },
];

const upcomingEvents = [
  {
    date: 'June 5, 2025',
    event: 'Scrimmage Match vs IceKings',
    image: 'https://images.unsplash.com/photo-1584466977771-bb6c0da0dc2c',
  },
  {
    date: 'June 10, 2025',
    event: 'Off-Ice Training Workshop',
    image: 'https://images.unsplash.com/photo-1590080874697-53ca06dba325',
  },
  {
    date: 'June 15, 2025',
    event: 'Team Building Retreat',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
  },
];

export default function MyTeamScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <LinearGradient
        colors={['#2E5AAC', '#3D7BE5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>My Team</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.teamIdentity}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1600783963303-0090e7c3e331' }}
          style={styles.teamLogo}
        />
        <Text style={styles.teamName}>Hockey Warriors</Text>
        <Text style={styles.teamMotto}>"Skate Hard. Shoot Fast. Win Big."</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Player Roster</Text>
        {playerRoster.map((player, index) => (
          <View key={index} style={styles.rosterItem}>
            <Image source={{ uri: player.image }} style={styles.mediumImage} />
            <Text style={styles.rosterText}>#{player.number} {player.name} - {player.position}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        {upcomingEvents.map((event, index) => (
          <View key={index} style={styles.eventItem}>
            <Image source={{ uri: event.image }} style={styles.mediumImage} />
            <Text style={styles.eventDate}>{event.date}</Text>
            <Text style={styles.eventDesc}>{event.event}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coach's Notes</Text>
        {teamNews.map((news) => (
          <View key={news.id} style={styles.newsCard}>
            <Image source={{ uri: news.image }} style={styles.mediumImage} />
            <Text style={styles.newsTitle}>{news.title}</Text>
            <Text style={styles.newsSummary}>{news.summary}</Text>
            <Text style={styles.newsDate}>{news.date}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.contactButton}>
        <Ionicons name="chatbox-ellipses-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.contactButtonText}>Contact Coach</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F9' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
  },
  teamIdentity: { alignItems: 'center', marginBottom: 24 },
  teamLogo: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  teamName: { fontSize: 22, fontWeight: 'bold', color: '#2E5AAC' },
  teamMotto: { fontSize: 14, color: '#555', fontStyle: 'italic' },
  section: { marginHorizontal: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2E5AAC', marginBottom: 12 },
  rosterItem: { paddingVertical: 8, flexDirection: 'row', alignItems: 'center' },
  rosterText: { fontSize: 15, color: '#333', marginLeft: 10 },
  eventItem: { marginBottom: 16 },
  eventDate: { fontSize: 14, fontWeight: 'bold', color: '#2E5AAC', marginTop: 6 },
  eventDesc: { fontSize: 14, color: '#444' },
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  newsTitle: { fontSize: 16, fontWeight: 'bold', color: '#2E5AAC' },
  newsSummary: { fontSize: 14, color: '#333', marginBottom: 4 },
  newsDate: { fontSize: 12, color: '#777' },
  contactButton: {
    flexDirection: 'row',
    backgroundColor: '#2E5AAC',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  contactButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  mediumImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 10,
  },
});

import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';

function DashboardCard({
  children,
  delay,
  icon,
  title,
  onPress,
}: {
  children: React.ReactNode;
  delay?: number;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress?: () => void;
}) {
  const content = (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 500 }}
      delay={delay || 0}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={20} color="#2E5AAC" />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </MotiView>
  );

  return onPress ? <TouchableOpacity activeOpacity={0.8} onPress={onPress}>{content}</TouchableOpacity> : content;
}

export default function PlayerDashboardScreen() {
  const router = useRouter();
  const playerName = "Player Name";

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header */}
      <LinearGradient
        colors={['#1A5DB5', '#103A70']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🏒 Welcome, {playerName}!</Text>
        <Text style={styles.headerSubtitle}>Your player dashboard</Text>
      </LinearGradient>

      {/* Upcoming Games */}
      <DashboardCard delay={0} icon="calendar-outline" title="Upcoming Games" onPress={() => router.push('/screens/supporter/Events')}>
        <TouchableOpacity style={styles.eventRow}>
          <View style={styles.eventContent}>
            <Image source={require('../../../assets/images/team-A.jpg')} style={styles.logo} />
            <Text style={styles.buttonText}>Your Team vs Opponent A – June 10</Text>
            <Image source={require('../../../assets/images/team-A.jpg')} style={styles.logo} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.eventRow}>
          <View style={styles.eventContent}>
            <Image source={require('../../../assets/images/team-A.jpg')} style={styles.logo} />
            <Text style={styles.buttonText}>Your Team vs Opponent B – June 15</Text>
            <Image source={require('../../../assets/images/team-A.jpg')} style={styles.logo} />
          </View>
        </TouchableOpacity>
        <Text style={styles.viewMoreText}>View all games...</Text>
      </DashboardCard>

      {/* Training Schedules */}
      <DashboardCard delay={100} icon="barbell-outline" title="Training Schedules" onPress={() => router.push('/screens/player/TrainingScheduleScreen')}>
        <View style={styles.scheduleItem}>
          <Ionicons name="time-outline" size={18} color="#4F4F4F" style={styles.scheduleIcon} />
          <Text style={styles.scheduleText}>Strength & Conditioning: Mon, Wed, Fri - 07:00 AM</Text>
        </View>
        <View style={styles.scheduleItem}>
          <Ionicons name="analytics-outline" size={18} color="#4F4F4F" style={styles.scheduleIcon} />
          <Text style={styles.scheduleText}>Skills Practice: Tue, Thu - 09:00 AM</Text>
        </View>
        <Text style={styles.viewMoreText}>View full schedule...</Text>
      </DashboardCard>

      {/* Practice Sessions */}
      <DashboardCard delay={200} icon="clipboard-outline" title="Practice Sessions" onPress={() => router.push('/screens/player/PracticeSessions')}>
        <View style={styles.scheduleItem}>
          <Ionicons name="play-circle-outline" size={18} color="#4F4F4F" style={styles.scheduleIcon} />
          <Text style={styles.scheduleText}>Team Drills: Today - 4:00 PM, Pitch 2</Text>
        </View>
        <View style={styles.scheduleItem}>
          <Ionicons name="videocam-outline" size={18} color="#4F4F4F" style={styles.scheduleIcon} />
          <Text style={styles.scheduleText}>Video Analysis: Tomorrow - 10:00 AM, Meeting Room</Text>
        </View>
        <Text style={styles.viewMoreText}>View all sessions...</Text>
      </DashboardCard>

      {/* Team News */}
      <DashboardCard delay={300} icon="megaphone-outline" title="Team News" onPress={() => router.push('/screens/player/TeamsNews')}>
        <Image source={require('../../../assets/images/d-news.png')} style={styles.image} />
        <Text style={styles.cardText}>Coach announces new strategy for upcoming away game.</Text>
        <Text style={styles.viewMoreText}>Read more team articles...</Text>
      </DashboardCard>

      {/* Featured League News */}
      <DashboardCard delay={400} icon="newspaper-outline" title="Featured League News" onPress={() => router.push('/screens/supporter/News')}>
        <Image source={require('../../../assets/images/d-news.png')} style={styles.image} />
        <Text style={styles.cardText}>League Update: New transfer window rules announced.</Text>
        <Text style={styles.viewMoreText}>View all news...</Text>
      </DashboardCard>

      {/* Poll Results */}
      <DashboardCard delay={500} icon="stats-chart-outline" title="Top Player Poll Results" onPress={() => router.push('/screens/player/PollsVoting')}>
        <Text style={styles.cardText}>🏆 Current Standings:</Text>
        <View style={styles.pollRow}>
          <Image source={require('../../../assets/icons/avatar.jpg')} style={styles.playerImage} />
          <Text style={styles.pollText}>Alex Z.</Text>
          <Text style={styles.pollText}>42%</Text>
        </View>
        <View style={styles.pollRow}>
          <Image source={require('../../../assets/icons/avatar.jpg')} style={styles.playerImage} />
          <Text style={styles.pollText}>Maria K. (You)</Text>
          <Text style={styles.pollText}>35%</Text>
        </View>
        <View style={styles.pollRow}>
          <Image source={require('../../../assets/icons/avatar.jpg')} style={styles.playerImage} />
          <Text style={styles.pollText}>Sam P.</Text>
          <Text style={styles.pollText}>23%</Text>
        </View>
        <Text style={styles.viewMoreText}>View full poll details...</Text>
      </DashboardCard>

      {/* Fan Forum */}
      <DashboardCard delay={600} icon="chatbubble-ellipses-outline" title="Fan Forum" onPress={() => router.push('/screens/player/Forum')}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Recent Discussions 💬</Text>
        </TouchableOpacity>
        <Text style={styles.cardTextSmall}>See what the fans are saying about the last game!</Text>
      </DashboardCard>

      {/* Ask HockeyBot */}
      <DashboardCard delay={700} icon="extension-puzzle-outline" title="Ask our HockeyBot" onPress={() => router.push('/screens/player/PlayerChatbot')}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Get Quick Info 🤖</Text>
        </TouchableOpacity>
        <Text style={styles.cardTextSmall}>Ask about rules, history, or team stats.</Text>
      </DashboardCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  header: {
    paddingVertical: Platform.OS === 'ios' ? 40 : 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: '#e0e0e0',
    marginTop: 6,
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
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
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#1A5DB5',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#e9ecef',
  },
  cardText: {
    fontSize: 15,
    color: '#343a40',
    marginBottom: 8,
    lineHeight: 22,
  },
  cardTextSmall: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#E9F0FB',
    borderColor: '#BCCFEF',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginTop: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#1A5DB5',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 5,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  eventRow: {
    marginTop: 8,
    backgroundColor: '#F8F9FA',
    borderColor: '#DEE2E6',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  eventContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pollRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  pollText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#495057',
    flex: 1,
    textAlign: 'left',
    paddingHorizontal: 5,
  },
  playerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  viewMoreText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 10,
    textAlign: 'right',
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  scheduleIcon: {
    marginRight: 10,
  },
  scheduleText: {
    fontSize: 15,
    color: '#343A40',
  },
});

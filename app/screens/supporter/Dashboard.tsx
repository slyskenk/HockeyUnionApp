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

export default function UserDashboardScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header */}
      <LinearGradient
        colors={['#2E5AAC', '#3D7BE5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>🏒 Welcome, Supporter Name!</Text>
        <Text style={styles.headerSubtitle}>Your hockey hub</Text>
      </LinearGradient>

      {/* Featured News */}
      <DashboardCard delay={0} icon="newspaper" title="Featured News" onPress={() => router.push('/screens/supporter/News')}>
        <Image source={require('../../../assets/images/d-news.png')} style={styles.image} />
        <Text style={styles.cardText}>Latest: Namibia Hawks Win Regional Championship!</Text>
      </DashboardCard>

      {/* Upcoming Events */}
      <DashboardCard delay={100} icon="calendar" title="Upcoming Events" onPress={() => router.push('/screens/supporter/Events')}>
        <TouchableOpacity style={styles.eventRow}>
          <Image source={require('../../../assets/images/team-A.jpg')} style={styles.logo} />
          <Text style={styles.buttonText}>Team A vs Team B – June 1</Text>
          <Image source={require('../../../assets/images/team-B.png')} style={styles.logo} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.eventRow}>
          <Image source={require('../../../assets/images/team-A.jpg')} style={styles.logo} />
          <Text style={styles.buttonText}>Team C vs Team D – June 5</Text>
          <Image source={require('../../../assets/images/team-B.png')} style={styles.logo} />
        </TouchableOpacity>
      </DashboardCard>

      {/* Favorite Teams */}
      <DashboardCard delay={200} icon="sports-hockey" title="Favorite Teams" onPress={() => router.push('/screens/supporter/PollsVoting')}>
        <TouchableOpacity style={styles.teamRow}>
          <Image source={require('../../../assets/images/team-B.png')} style={styles.logo} />
          <Text style={styles.buttonText}>Namibia Hawks</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.teamRow}>
          <Image source={require('../../../assets/images/team-B.png')} style={styles.logo} />
          <Text style={styles.buttonText}>Desert Blazers</Text>
        </TouchableOpacity>
      </DashboardCard>

      {/* Fan Forum */}
      <DashboardCard delay={300} icon="chat" title="Fan Forum" onPress={() => router.push('/screens/supporter/Forum')}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Top Discussions 🔥</Text>
        </TouchableOpacity>
      </DashboardCard>

      {/* Ask HockeyBot */}
      <DashboardCard delay={400} icon="robot" title="Ask our HockeyBot" onPress={() => router.push('/screens/supporter/FanChatbot')}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Ask a Question 🤖</Text>
        </TouchableOpacity>
      </DashboardCard>

      {/* Player Poll */}
      <DashboardCard delay={500} icon="bar-chart" title="Top Player Poll" onPress={() => router.push('/screens/supporter/PollsVoting')}>
        <Text style={styles.cardText}>🏆 Current Votes:</Text>
        <View style={styles.pollRow}>
          <Image source={require('../../../assets/images/player.jpg')} style={styles.playerImage} />
          <Text style={styles.pollText}>Player A</Text>
          <Text style={styles.pollText}>42%</Text>
        </View>
        <View style={styles.pollRow}>
          <Image source={require('../../../assets/images/player.jpg')} style={styles.playerImage} />
          <Text style={styles.pollText}>Player B</Text>
          <Text style={styles.pollText}>35%</Text>
        </View>
        <View style={styles.pollRow}>
          <Image source={require('../../../assets/images/player.jpg')} style={styles.playerImage} />
          <Text style={styles.pollText}>Player C</Text>
          <Text style={styles.pollText}>23%</Text>
        </View>
      </DashboardCard>
    </ScrollView>
  );
}

function DashboardCard({
  children,
  delay,
  icon,
  title,
  onPress,
}: {
  children: React.ReactNode;
  delay?: number;
  icon: any;
  title: string;
  onPress?: () => void;
}) {
  const content = (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
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

  return onPress ? <TouchableOpacity activeOpacity={0.9} onPress={onPress}>{content}</TouchableOpacity> : content;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F4F6F9',
  },
  header: {
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#e0e0e0',
    marginTop: 4,
    fontSize: 14,
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
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#2E5AAC',
  },
  image: {
    height: 160,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#ccc',
  },
  cardText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#F0F4FF',
    borderColor: '#C7D2E4',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: '#2E5AAC',
    fontWeight: '600',
    fontSize: 15,
  },
  logo: {
    width: 50,
    height: 50,
    marginHorizontal: 6,
    borderRadius: 20,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    borderColor: '#C7D2E4',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
    justifyContent: 'space-between',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F4FF',
    borderColor: '#C7D2E4',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  pollRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pollText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#444',
    flex: 1,
    textAlign: 'center',
  },
  playerImage: {
    width: 80,
    height: 80,
    borderRadius: 15,
    marginRight: 6,
  },
});

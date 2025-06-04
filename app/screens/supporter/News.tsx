// app/screens/supporter/News.tsx

import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

// --- Types ---
type NewsItem = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  author: string;
  publishDate: number; // Unix timestamp
};

// --- Helper for formatting dates ---
const formatDateForDisplay = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// --- Dummy News Data (Fan-Centric) ---
// Dates are set relative to the current time (June 3, 2025, 5:37 PM CAT) for relevance.
const DUMMY_FAN_NEWS_DATA: NewsItem[] = [
  {
    id: 'fn1',
    title: 'Scorpions Dominate Rivals in Thrilling Match!',
    content: 'Our beloved Desert Scorpions delivered a spectacular performance last night, securing a decisive victory against our fierce rivals, the Oryx Chargers. The atmosphere was electric! Read the full match report and see highlights.',
    imageUrl: 'https://picsum.photos/seed/fanmatch/700/400',
    author: 'Club Reporter',
    publishDate: new Date('2025-06-03T10:00:00Z').getTime(), // Published today
  },
  {
    id: 'fn2',
    title: 'Fan Zone Festivities Announced for Next Home Game!',
    content: 'Get ready for an unforgettable fan experience! Our next home game on June 8th will feature enhanced Fan Zone activities, including player autographs, mascot appearances, and exciting giveaways. Arrive early!',
    imageUrl: 'https://picsum.photos/seed/fanzone/700/400',
    author: 'Fan Engagement Team',
    publishDate: new Date('2025-06-02T15:30:00Z').getTime(), // 1 day ago
  },
  {
    id: 'fn3',
    title: 'Youth Hockey Program Sees Record Sign-Ups!',
    content: 'The future of hockey is bright! We\'re thrilled to announce a record number of participants in our youth development program. Thanks to all the parents and volunteers for their incredible support.',
    imageUrl: 'https://picsum.photos/seed/youthhockey/700/400',
    author: 'Community Outreach',
    publishDate: new Date('2025-05-30T09:00:00Z').getTime(), // 4 days ago
  },
  {
    id: 'fn4',
    title: 'New Merch Drop: Limited Edition Playoff Gear!',
    content: 'Show your team pride with our brand-new limited edition playoff merchandise! Jerseys, scarves, and hats are now available in the official club store. Don\'t miss out!',
    imageUrl: 'https://picsum.photos/seed/newmerch/700/400',
    author: 'Merchandise Dept.',
    publishDate: new Date('2025-05-28T11:00:00Z').getTime(), // 6 days ago
  },
  {
    id: 'fn5',
    title: 'Coach Discusses Team Strategy After Recent Win',
    content: 'Our head coach shares insights into the team\'s recent success and outlines the strategic focus for the upcoming challenges. A must-read for true hockey strategists!',
    imageUrl: null, // No image for this one
    author: 'Media Team',
    publishDate: new Date('2025-05-25T14:00:00Z').getTime(), // 9 days ago
  },
];

const SupporterNewsScreen = () => {
  const router = useRouter();

  // Sort by publishDate in descending order (most recent first).
  const sortedNewsItems = [...DUMMY_FAN_NEWS_DATA].sort((a, b) => b.publishDate - a.publishDate);

  return (
    <View style={styles.container}>
      {/* Gradient Header - Matches Supporter Dashboard Theme */}
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
        <Text style={styles.headerTitle}>Team News & Fan Updates</Text> {/* Fan-centric title */}
        <View style={styles.backButtonPlaceholder} />
      </LinearGradient>

      {/* News List */}
      {sortedNewsItems.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <MaterialIcons name="campaign" size={100} color="#E0E0E0" />
          <Text style={styles.emptyStateText}>No fan news yet!</Text>
          <Text style={styles.emptyStateSubText}>Stay tuned for exciting updates and announcements.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {sortedNewsItems.map((item) => (
            <View key={item.id} style={styles.newsCard}>
              {item.imageUrl && (
                <Image source={{ uri: item.imageUrl }} style={styles.newsImage} />
              )}
              <View style={styles.newsContent}>
                <Text style={styles.newsTitle}>{item.title}</Text>
                <Text style={styles.newsFullContent}>{item.content}</Text>
                <View style={styles.newsFooter}>
                  <Text style={styles.newsDate}>
                    <MaterialIcons name="calendar-today" size={12} color="#999" /> {formatDateForDisplay(item.publishDate)}
                  </Text>
                  <Text style={styles.newsAuthor}>
                    <MaterialIcons name="person" size={12} color="#999" /> By {item.author}
                  </Text>
                </View>
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
    minHeight: width * 0.8,
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
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
    overflow: 'hidden',
  },
  newsImage: {
    width: '100%',
    height: width * 0.5,
    backgroundColor: '#eee',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  newsContent: {
    padding: 15,
  },
  newsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  newsFullContent: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 15,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  newsDate: {
    fontSize: 13,
    color: '#999',
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsAuthor: {
    fontSize: 13,
    color: '#999',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default SupporterNewsScreen;
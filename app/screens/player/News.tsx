// app/screens/player/News.tsx

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

// --- Dummy News Data (Now defined directly in News.tsx) ---
const DUMMY_NEWS_DATA: NewsItem[] = [
  {
    id: 'n1',
    title: 'Season Kick-off Announced!',
    content: 'Get ready, team! The new hockey season officially kicks off on September 1st. Pre-season training schedules will be released next week. Let\'s aim for gold!',
    imageUrl: 'https://picsum.photos/seed/hockey1/700/400', // Example image URL
    author: 'Coach Admin',
    publishDate: Date.now() - (1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    id: 'n2',
    title: 'New Sponsorship Deal Secured!',
    content: 'We are thrilled to announce a new partnership with "Sporting Goods Co." Their support will greatly enhance our team\'s resources and equipment. More details to follow.',
    imageUrl: 'https://picsum.photos/seed/hockey2/700/400', // Example image URL
    author: 'Management',
    publishDate: Date.now() - (3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
  {
    id: 'n3',
    title: 'Open Tryouts for Junior Players',
    content: 'Calling all aspiring young hockey stars! We\'re holding open tryouts for our junior development program on June 15th at the Community Rink. Register online now!',
    imageUrl: 'https://picsum.photos/seed/hockey3/700/400', // Example image URL
    author: 'Junior League Coordinator',
    publishDate: Date.now() - (7 * 24 * 60 * 60 * 1000), // 7 days ago
  },
  {
    id: 'n4',
    title: 'Fitness Tips from Our Captain!',
    content: 'Our team captain shares their top 5 fitness tips for staying in peak condition during the off-season. Check out the full article on our blog for drills and advice.',
    imageUrl: null, // No image for this one
    author: 'Team Captain',
    publishDate: Date.now() - (10 * 24 * 60 * 60 * 1000), // 10 days ago
  },
];

const PlayerNewsScreen = () => {
  const router = useRouter();

  // Use the internally defined dummy news data.
  // Sort by publishDate in descending order (most recent first).
  const sortedNewsItems = [...DUMMY_NEWS_DATA].sort((a, b) => b.publishDate - a.publishDate);

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
        <Text style={styles.headerTitle}>Team News & Announcements</Text>
        <View style={styles.backButtonPlaceholder} />
      </LinearGradient>

      {/* News List */}
      {sortedNewsItems.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <MaterialIcons name="campaign" size={100} color="#E0E0E0" />
          <Text style={styles.emptyStateText}>No announcements yet!</Text>
          <Text style={styles.emptyStateSubText}>Stay tuned for updates from your coach.</Text>
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
    minHeight: width * 0.8, // Adjust as needed
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
    height: width * 0.5, // Make images slightly larger for viewing
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

export default PlayerNewsScreen;
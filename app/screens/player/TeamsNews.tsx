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

const newsArticles = [
  {
    id: '1',
    title: 'Intense Practice Session Ahead of the Tournament',
    summary: 'Coach Mike pushes the team to their limits with new drills.',
    image: 'https://images.unsplash.com/photo-1600783963303-0090e7c3e331',
    date: 'May 29, 2025',
  },
  {
    id: '2',
    title: 'New Goalie Joins the Team',
    summary: 'Coach welcomes Jacob, a promising goalie from the junior league.',
    image: 'https://images.unsplash.com/photo-1605478525403-3f18e4280a17',
    date: 'May 27, 2025',
  },
  {
    id: '3',
    title: 'Team Strategy Meeting Recap',
    summary: 'Key takeaways from this week’s strategy session with the coach.',
    image: 'https://images.unsplash.com/photo-1619785291427-3e99a01c568b',
    date: 'May 25, 2025',
  },
];

export default function TeamNewsScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <LinearGradient
        colors={['#2E5AAC', '#3D7BE5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Team News</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.newsSection}>
        {newsArticles.map((article) => (
          <View key={article.id} style={styles.newsCard}>
            <Image source={{ uri: article.image }} style={styles.newsImage} />
            <View style={styles.newsContent}>
              <Text style={styles.newsTitle}>{article.title}</Text>
              <Text style={styles.newsSummary}>{article.summary}</Text>
              <Text style={styles.newsDate}>{article.date}</Text>
            </View>
          </View>
        ))}
      </View>
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
  newsSection: {
    marginHorizontal: 16,
  },
  newsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  newsImage: {
    width: '100%',
    height: 180,
  },
  newsContent: {
    padding: 16,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E5AAC',
    marginBottom: 6,
  },
  newsSummary: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  newsDate: {
    fontSize: 12,
    color: '#777',
  },
});

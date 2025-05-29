import { MaterialIcons } from '@expo/vector-icons'; // For icons like edit, delete, add
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Define NewsItem type (consistent with your news.tsx)
type NewsItem = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType: 'image' | 'video';
  timestamp: number; // Unix timestamp
};

// Dummy data for news articles
const DUMMY_NEWS_ARTICLES: NewsItem[] = [
  {
    id: 'n1',
    title: 'Namibia Hockey Union Announces New Season Dates',
    content: 'The NHU has officially released the schedule for the upcoming hockey season, promising an exciting year of competition.',
    imageUrl: 'https://placehold.co/100x70/007AFF/FFFFFF?text=Season',
    mediaType: 'image',
    timestamp: 1678886400000, // March 15, 2023
  },
  {
    id: 'n2',
    title: 'U16 National Team Tryouts Conclude Successfully',
    content: 'Young talents showcased their skills during the recent U16 tryouts, with coaches expressing optimism for the future.',
    imageUrl: 'https://placehold.co/100x70/33FF57/000000?text=Tryouts',
    mediaType: 'image',
    timestamp: 1679577600000, // March 23, 2023
  },
  {
    id: 'n3',
    title: 'Interview with Coach Jane Doe on Team Preparation',
    content: 'Coach Jane Doe shares insights into the rigorous training regimes and strategic plans for the senior women\'s team.',
    imageUrl: 'https://placehold.co/100x70/FFCC00/000000?text=Coach',
    mediaType: 'image',
    timestamp: 1680272000000, // March 31, 2023
  },
  {
    id: 'n4',
    title: 'Highlights: Men\'s League Matchday 3',
    content: 'Watch the best moments from the thrilling matches played on the third matchday of the men\'s national league.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Dummy YouTube URL
    mediaType: 'video',
    timestamp: 1680960000000, // April 8, 2023
  },
  {
    id: 'n5',
    title: 'Community Outreach Program Kicks Off in Rural Areas',
    content: 'NHU launches new initiative to promote hockey in underserved communities, fostering grassroots development.',
    imageUrl: 'https://placehold.co/100x70/8A2BE2/FFFFFF?text=Outreach',
    mediaType: 'image',
    timestamp: 1681651200000, // April 16, 2023
  },
];

const NewsManager = () => {
  const [newsArticles, setNewsArticles] = useState<NewsItem[]>(DUMMY_NEWS_ARTICLES);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter news articles based on search query
  const filteredNews = newsArticles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /**
   * Handles deleting a news article.
   * @param articleId The ID of the article to delete.
   */
  const handleDeleteArticle = (articleId: string) => {
    Alert.alert(
      'Delete Article',
      'Are you sure you want to delete this news article? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            setNewsArticles(prevArticles => prevArticles.filter(article => article.id !== articleId));
            console.log(`Article ${articleId} deleted.`);
            // In a real app, you would also call an API to delete the article from the backend
          },
          style: 'destructive',
        },
      ]
    );
  };

  /**
   * Handles editing a news article (placeholder for navigation to an edit screen).
   * @param article The news article object to edit.
   */
  const handleEditArticle = (article: NewsItem) => {
    console.log('Edit article:', article.title);
    // Implement navigation to a news article edit screen, passing the article object
    // router.push({ pathname: '/admin/edit-article', params: { articleId: article.id } });
    Alert.alert('Edit Article', `Functionality to edit "${article.title}" not implemented.`);
  };

  /**
   * Handles adding a new news article (placeholder for navigation to an add screen).
   */
  const handleAddArticle = () => {
    console.log('Add new article');
    // Implement navigation to a new news article creation screen
    // router.push('/admin/add-article');
    Alert.alert('Add Article', 'Functionality to add new article not implemented.');
  };

  /**
   * Renders a single news article item in the FlatList.
   * @param item The NewsItem object to render.
   */
  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <View style={styles.newsCard}>
      <Image
        source={{ uri: item.imageUrl || 'https://placehold.co/100x70/CCCCCC/000000?text=No+Image' }}
        style={styles.newsImage}
      />
      <View style={styles.newsInfo}>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsType}>
          {item.mediaType === 'video' ? 'Video News' : 'Article'}
        </Text>
      </View>
      <View style={styles.newsActions}>
        <TouchableOpacity onPress={() => handleEditArticle(item)} style={styles.actionButton}>
          <MaterialIcons name="edit" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteArticle(item.id)} style={styles.actionButton}>
          <MaterialIcons name="delete" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../../assets/images/logo.jpeg')} // Update this path
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Manage News</Text>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search news articles..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* News List */}
      {filteredNews.length === 0 ? (
        <View style={styles.emptyListContainer}>
          <Text style={styles.emptyListText}>No news articles found matching your search.</Text>
          <Text style={styles.emptyListText}>Tap '+' to add a new article.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredNews}
          keyExtractor={(item) => item.id}
          renderItem={renderNewsItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Add News Button */}
      <TouchableOpacity style={styles.floatingAddButton} onPress={handleAddArticle}>
        <MaterialIcons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Light background
  },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  headerLogo: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 15,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 80, // Space for the floating button
  },
  newsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  newsImage: {
    width: 80, // Fixed width for the image thumbnail
    height: 60, // Fixed height for the image thumbnail
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#ddd',
    resizeMode: 'cover',
  },
  newsInfo: {
    flex: 1, // Allows info to take up available space
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  newsType: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  newsActions: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007AFF', // Blue color
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyListText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default NewsManager;

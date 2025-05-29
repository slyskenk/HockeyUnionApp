import { Entypo, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import allNews from '../news/news.json'; // Import full JSON

// Type definition for a NewsItem
type NewsItem = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType: 'image' | 'video';
  timestamp: number;
};

// Placeholder for MiniSearchBar component
// This component should ideally be defined in '../../components/ui/MiniSearchBar'
// For this self-contained example, we'll provide a basic implementation.
const MiniSearchBar = ({ placeholder }: { placeholder: string }) => (
  <View style={miniSearchBarStyles.container}>
    <MaterialIcons name="search" size={20} color="#888" style={miniSearchBarStyles.icon} />
    <Text style={miniSearchBarStyles.input}>{placeholder}</Text>
  </View>
);

const miniSearchBarStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});

const BookmarksScreen = () => {
  const router = useRouter();
  const { ids } = useLocalSearchParams();

  // State to hold the current list of bookmarked IDs.
  // It initializes from the 'ids' parameter passed via navigation.
  // If 'ids' is null/undefined or an empty JSON string, it defaults to an empty array.
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(
    ids ? JSON.parse(ids as string) : []
  );

  // Filters 'allNews' to display only the articles whose IDs are in 'bookmarkedIds'.
  const bookmarkedArticles: NewsItem[] = (allNews as NewsItem[]).filter(article =>
    bookmarkedIds.includes(article.id)
  );

  /**
   * Handles the removal of a bookmark.
   * Prompts the user for confirmation and updates the state if confirmed.
   * @param id The ID of the article to be removed.
   */
  const handleRemove = (id: string) => {
    Alert.alert(
      'Remove Bookmark',
      'Are you sure you want to remove this article from your bookmarks?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          onPress: () => {
            // Update the state to filter out the removed ID
            setBookmarkedIds(prevIds => prevIds.filter(bookmarkId => bookmarkId !== id));
            console.log(`Bookmark with ID ${id} removed.`);
            // IMPORTANT: To make this change persistent across app sessions,
            // you would typically save the 'bookmarkedIds' to AsyncStorage here.
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  /**
   * Navigates back to the previous screen (typically news.tsx).
   */
  const handleGoBack = () => {
    router.back();
  };

  /**
   * Navigates to the detailed article view.
   * @param item The NewsItem object to display.
   */
  const handleViewArticle = (item: NewsItem) => {
    router.push({
      pathname: '/news/article',
      params: {
        title: item.title,
        content: item.content,
        imageUrl: item.imageUrl,
      },
    });
  };

  /**
   * Renders a single news article card for the FlatList.
   * @param item The NewsItem object to render.
   */
  const renderItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleViewArticle(item)}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.image}
        onError={(e) => console.log('Image loading error:', e.nativeEvent.error)}
      />
      <View style={styles.info}>
        <Text style={styles.title}>{item.title}</Text>
        <TouchableOpacity
          onPress={() => handleRemove(item.id)}
          style={styles.optionsButton}
        >
          <Entypo name="dots-three-vertical" size={18} color="#333" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Bookmarks</Text>
        <View style={styles.backButtonPlaceholder} />
      </View>

      {/* Search Bar Section */}
      <MiniSearchBar placeholder="Search bookmarks..." />

      {/* Conditional Rendering for Bookmarks List or Empty State */}
      {bookmarkedArticles.length === 0 ? (
        <View style={styles.emptyListContainer}>
          <Text style={styles.emptyListText}>
            You don't have any bookmarks yet!
            Go back to the news feed to add some articles.
          </Text>
          <TouchableOpacity style={styles.goBackButton} onPress={handleGoBack}>
            <Text style={styles.goBackButtonText}>Go to News Feed</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookmarkedArticles}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default BookmarksScreen;

// StyleSheet for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F0FA',
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  backButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  info: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    paddingRight: 8,
    color: '#333',
  },
  optionsButton: {
    padding: 5,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  emptyListText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  goBackButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  goBackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

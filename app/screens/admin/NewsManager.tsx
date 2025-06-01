import { MaterialIcons } from '@expo/vector-icons'; // For icons like edit, delete, add
import { useRouter } from 'expo-router'; // Import useRouter for navigation
import React, { useEffect, useState } from 'react'; // Added useEffect
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform, // Import Modal
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Import Picker for role selection
import { Picker } from '@react-native-picker/picker'; // <--- ADDED THIS LINE

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
    content:
      'The NHU has officially released the schedule for the upcoming hockey season, promising an exciting year of competition.',
    imageUrl: 'https://placehold.co/100x70/007AFF/FFFFFF?text=Season',
    mediaType: 'image',
    timestamp: 1678886400000, // March 15, 2023
  },
  {
    id: 'n2',
    title: 'U16 National Team Tryouts Conclude Successfully',
    content:
      'Young talents showcased their skills during the recent U16 tryouts, with coaches expressing optimism for the future.',
    imageUrl: 'https://placehold.co/100x70/33FF57/000000?text=Tryouts',
    mediaType: 'image',
    timestamp: 1679577600000, // March 23, 2023
  },
  {
    id: 'n3',
    title: 'Interview with Coach Jane Doe on Team Preparation',
    content:
      "Coach Jane Doe shares insights into the rigorous training regimes and strategic plans for the senior women's team.",
    imageUrl: 'https://placehold.co/100x70/FFCC00/000000?text=Coach',
    mediaType: 'image',
    timestamp: 1680272000000, // March 31, 2023
  },
  {
    id: 'n4',
    title: "Highlights: Men's League Matchday 3",
    content:
      'Watch the best moments from the thrilling matches played on the third matchday of the men\'s national league.',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Dummy YouTube URL
    mediaType: 'video',
    timestamp: 1680960000000, // April 8, 2023
  },
  {
    id: 'n5',
    title: 'Community Outreach Program Kicks Off in Rural Areas',
    content:
      'NHU launches new initiative to promote hockey in underserved communities, fostering grassroots development.',
    imageUrl: 'https://placehold.co/100x70/8A2BE2/FFFFFF?text=Outreach',
    mediaType: 'image',
    timestamp: 1681651200000, // April 16, 2023
  },
];

const NewsManager = () => {
  const router = useRouter(); // Initialize useRouter
  const [newsArticles, setNewsArticles] = useState<NewsItem[]>(
    DUMMY_NEWS_ARTICLES
  );
  const [searchQuery, setSearchQuery] = useState('');

  // --- State for the Modal Form ---
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState<NewsItem | null>(null); // Holds article data for editing or null for new article
  const [formData, setFormData] = useState<Partial<NewsItem>>({}); // State for form inputs

  // Effect to initialize form data when modal opens or articleToEdit changes
  useEffect(() => {
    if (isModalVisible) {
      if (articleToEdit) {
        setFormData(articleToEdit); // Populate with existing article data
      } else {
        // Initialize for a new article
        setFormData({
          id: `new-${Date.now()}`, // Generate a temporary ID for new article
          title: '',
          content: '',
          imageUrl: '',
          videoUrl: '',
          mediaType: 'image', // Default media type
          timestamp: Date.now(), // Current timestamp
        });
      }
    }
  }, [isModalVisible, articleToEdit]);

  // Filter news articles based on search query
  const filteredNews = newsArticles.filter(
    (article) =>
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
            setNewsArticles((prevArticles) =>
              prevArticles.filter((article) => article.id !== articleId)
            );
            console.log(`Article ${articleId} deleted.`);
            // In a real app, you would also call an API to delete the article from the backend
          },
          style: 'destructive',
        },
      ]
    );
  };

  /**
   * Opens the modal to add a new news article.
   */
  const handleAddArticle = () => {
    setArticleToEdit(null); // No article to edit, so it's a new one
    setIsModalVisible(true);
  };

  /**
   * Opens the modal to edit an existing news article.
   * @param article The news article object to edit.
   */
  const handleEditArticle = (article: NewsItem) => {
    setArticleToEdit(article); // Set the article data to pre-fill the form
    setIsModalVisible(true);
  };

  // --- Modal Form Handlers ---

  /**
   * Updates a specific field of the modal form data.
   */
  const handleChangeFormData = (
    field: keyof NewsItem,
    value: string | number | 'image' | 'video'
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Handles saving the news article data from the modal form.
   */
  const handleSaveModal = () => {
    // Basic validation
    if (!formData.title || !formData.content || !formData.mediaType) {
      Alert.alert(
        'Missing Information',
        'Please fill in Title, Content, and Media Type.'
      );
      return;
    }

    // Ensure all required fields for NewsItem type are present
    const finalData: NewsItem = {
      id: formData.id || `n${Date.now()}`, // Ensure ID exists for new articles
      title: formData.title,
      content: formData.content,
      imageUrl: formData.imageUrl || '',
      videoUrl: formData.videoUrl || '',
      mediaType: formData.mediaType,
      timestamp: formData.timestamp || Date.now(),
    };

    const isNew = !articleToEdit; // If articleToEdit was null, it's a new article

    if (isNew) {
      setNewsArticles((prevArticles) => [finalData, ...prevArticles]); // Add new article to the beginning
    } else {
      setNewsArticles((prevArticles) =>
        prevArticles.map((article) =>
          article.id === finalData.id ? finalData : article
        )
      );
    }
    setIsModalVisible(false); // Close the modal
    setArticleToEdit(null); // Clear the article being edited
    Alert.alert('Success', `Article ${isNew ? 'added' : 'updated'} successfully!`);
    // In a real app, send data to your backend API here
  };

  /**
   * Handles canceling the modal form.
   */
  const handleCancelModal = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard unsaved changes?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            setIsModalVisible(false); // Close the modal
            setArticleToEdit(null); // Clear any pending article to edit
          },
          style: 'destructive',
        },
      ]
    );
  };

  /**
   * Renders a single news article item in the FlatList.
   * @param item The NewsItem object to render.
   */
  const renderNewsItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity
      style={styles.newsCard}
      onPress={() => handleEditArticle(item)} // Tapping card opens edit modal
      activeOpacity={0.8}
    >
      <Image
        source={{
          uri:
            item.imageUrl ||
            'https://placehold.co/100x70/CCCCCC/000000?text=No+Image',
        }}
        style={styles.newsImage}
      />
      <View style={styles.newsInfo}>
        <Text style={styles.newsTitle}>{item.title}</Text>
        <Text style={styles.newsType}>
          {item.mediaType === 'video' ? 'Video News' : 'Article'}
        </Text>
      </View>
      <View style={styles.newsActions}>
        <TouchableOpacity
          onPress={() => handleEditArticle(item)}
          style={styles.actionButton}
        >
          <MaterialIcons name="edit" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteArticle(item.id)}
          style={styles.actionButton}
        >
          <MaterialIcons name="delete" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.push('./../admin/Dashboard')}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
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
          <Text style={styles.emptyListText}>
            No news articles found matching your search.
          </Text>
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

      {/* --- Modal Form for Add/Edit News Article (All within NewsManager.tsx) --- */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={isModalVisible}
        onRequestClose={handleCancelModal}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={handleCancelModal}
              style={styles.closeButton}
            >
              <MaterialIcons name="close" size={24} color="#FF3B30" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {articleToEdit ? 'Edit Article' : 'Add New Article'}
            </Text>
            <TouchableOpacity
              onPress={handleSaveModal}
              style={styles.saveButton}
            >
              <MaterialIcons name="check" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.formContainer}>
            <Text style={styles.label}>Title:</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => handleChangeFormData('title', text)}
              placeholder="News Article Title"
            />

            <Text style={styles.label}>Content:</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={formData.content}
              onChangeText={(text) => handleChangeFormData('content', text)}
              placeholder="Detailed content of the news article"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Media Type:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.mediaType}
                onValueChange={(itemValue: 'image' | 'video') =>
                  handleChangeFormData('mediaType', itemValue)
                }
                style={styles.picker}
              >
                <Picker.Item label="Image" value="image" />
                <Picker.Item label="Video" value="video" />
              </Picker>
            </View>

            {formData.mediaType === 'image' && (
              <>
                <Text style={styles.label}>Image URL:</Text>
                <TextInput
                  style={styles.input}
                  value={formData.imageUrl}
                  onChangeText={(text) =>
                    handleChangeFormData('imageUrl', text)
                  }
                  placeholder="URL for the image"
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </>
            )}

            {formData.mediaType === 'video' && (
              <>
                <Text style={styles.label}>Video URL:</Text>
                <TextInput
                  style={styles.input}
                  value={formData.videoUrl}
                  onChangeText={(text) =>
                    handleChangeFormData('videoUrl', text)
                  }
                  placeholder="URL for the video (e.g., YouTube)"
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
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
    flexDirection: 'row', // Added for back button positioning
    justifyContent: 'center', // Center content
  },
  backButton: {
    position: 'absolute', // Position absolutely
    left: 15,
    top: 50, // Align with header padding
    zIndex: 10, // Ensure it's above other elements
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 8,
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
    marginLeft: 10, // Adjust for logo and back button
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
  // --- Modal Specific Styles (copied from previous event manager file) ---
  modalContainer: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  saveButton: {
    padding: 5,
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 5,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: '100%',
  },
});

export default NewsManager;
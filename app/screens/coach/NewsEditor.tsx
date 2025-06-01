// app/screens/coach/NewsEditor.tsx (Final version with fixes)

import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // Import ImagePicker
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// --- Types ---
type NewsItem = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null; // Allow null here for imageUrl
  author: string;
  publishDate: number; // Unix timestamp
};

// --- Dummy Data (Using let so we can modify it for demonstration) ---
// Define COACH_NAME before DUMMY_NEWS_DATA
const COACH_NAME = 'Coach John Doe';

let DUMMY_NEWS_DATA: NewsItem[] = [
  {
    id: 'n1',
    title: 'Training Location Change for Friday',
    content: 'Due to unforeseen maintenance at National Hockey Stadium, Friday\'s training session (May 31st) will be moved to the DTS Field at the usual time (16:00). Please ensure all players are aware.',
    imageUrl: 'https://placehold.co/400x200/4A90E2/FFFFFF?text=Field+Change',
    author: COACH_NAME,
    publishDate: Date.now() - (1000 * 60 * 60 * 24 * 1), // 1 day ago
  },
  {
    id: 'n2',
    title: 'Match Day 5 Line-up Announced',
    content: 'The starting line-up for our upcoming match against Oryx Chargers on June 5th has been finalized. Please check your emails for individual confirmations. Let\'s bring our A-game!',
    imageUrl: 'https://placehold.co/400x200/283593/FFFFFF?text=Line-up+Update',
    author: COACH_NAME,
    publishDate: Date.now() - (1000 * 60 * 60 * 24 * 3), // 3 days ago
  },
  {
    id: 'n3',
    title: 'Post-Match Analysis: Key Takeaways',
    content: 'Review of our last game: excellent defensive effort, but we need to improve our attacking penalty corner conversion. Video session scheduled for next Monday.',
    author: COACH_NAME,
    publishDate: Date.now() - (1000 * 60 * 60 * 24 * 7), // 7 days ago
  },
];

// --- Helper for formatting dates ---
const formatDateForDisplay = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};


const CoachNewsEditor = () => {
  const router = useRouter();
  const [newsItems, setNewsItems] = useState<NewsItem[]>(DUMMY_NEWS_DATA); // Use the mutable dummy data
  const [modalVisible, setModalVisible] = useState(false);
  const [currentNewsItem, setCurrentNewsItem] = useState<NewsItem | null>(null); // For editing

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null); // State for the image URL, explicitly allowing null

  // Sort news items by publish date, newest first
  useEffect(() => {
    // Only sort if newsItems has changed significantly (e.g., length change or actual item change)
    // To prevent infinite loop with setNewsItems
    const sortedNews = [...newsItems].sort((a, b) => b.publishDate - a.publishDate);
    // Only update if the sorted array is different to avoid re-renders if order is already correct
    if (JSON.stringify(sortedNews) !== JSON.stringify(newsItems)) {
        setNewsItems(sortedNews);
    }
  }, [newsItems]); // Depend on newsItems directly, and use the check above

  const resetForm = () => {
    setCurrentNewsItem(null);
    setTitle('');
    setContent('');
    setImageUrl(null); // Reset image URL to null
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (item: NewsItem) => {
    setCurrentNewsItem(item);
    setTitle(item.title);
    setContent(item.content);
    setImageUrl(item.imageUrl || null); // Set existing image URL, or null
    setModalVisible(true);
  };

  const handleSaveNews = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing Information', 'Please fill in the title and content for your announcement.');
      return;
    }

    // Determine the final imageUrl to save.
    // If imageUrl state is null, it means no image or removed image.
    // If imageUrl state is an empty string (e.g., from an empty text input for a URL, though we removed that), treat as null.
    // Otherwise, use the string value.
    const finalImageUrl = imageUrl; // imageUrl state now directly reflects desired value (string or null)


    if (currentNewsItem) {
      // Update existing item
      const updatedItem = newsItems.map(item =>
        item.id === currentNewsItem.id
          ? { ...item, title: title.trim(), content: content.trim(), imageUrl: finalImageUrl, publishDate: Date.now() }
          : item
      );
      setNewsItems(updatedItem);
      // Update the global dummy data as well for persistence across renders (in this demo)
      DUMMY_NEWS_DATA = updatedItem;
      Alert.alert('Success', 'Announcement updated successfully!');
    } else {
      // Add new item
      const newItem: NewsItem = {
        id: `news-${Date.now()}`,
        title: title.trim(),
        content: content.trim(),
        imageUrl: finalImageUrl, // Use the finalImageUrl
        author: COACH_NAME,
        publishDate: Date.now(),
      };
      setNewsItems([...newsItems, newItem]);
      // Update the global dummy data as well for persistence across renders (in this demo)
      DUMMY_NEWS_DATA = [...newsItems, newItem];
      Alert.alert('Success', 'New announcement published!');
    }
    setModalVisible(false);
    resetForm();
  };

  const handleDeleteNews = (id: string) => {
    Alert.alert(
      'Delete Announcement',
      'Are you sure you want to delete this announcement? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            const filteredNews = newsItems.filter(item => item.id !== id);
            setNewsItems(filteredNews);
            // Update the global dummy data as well
            DUMMY_NEWS_DATA = filteredNews;
            Alert.alert('Deleted', 'Announcement has been deleted.');
          },
          style: 'destructive',
        },
      ]
    );
  };

  // --- Image Picker Function ---
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant media library permissions to pick an image.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3], // Common aspect ratio for images
      quality: 1, // High quality
    });

    if (!result.canceled) {
      setImageUrl(result.assets[0].uri); // Set the selected image URI to state
    }
  };

  const removeImage = () => {
    setImageUrl(null); // Clear the image URL by setting it to null
  };


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
        <Text style={styles.headerTitle}>Team Announcements</Text>
        <View style={styles.backButtonPlaceholder} />
      </LinearGradient>

      {/* News List */}
      {newsItems.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <MaterialIcons name="campaign" size={100} color="#E0E0E0" />
          <Text style={styles.emptyStateText}>No announcements yet!</Text>
          <Text style={styles.emptyStateSubText}>Tap the '+' button to share updates with your team.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {newsItems.map((item) => (
            <View key={item.id} style={styles.newsCard}>
              {item.imageUrl && ( // Conditionally render image if imageUrl exists
                <Image source={{ uri: item.imageUrl }} style={styles.newsImage} />
              )}
              <View style={styles.newsContent}>
                <Text style={styles.newsTitle}>{item.title}</Text>
                <Text style={styles.newsSnippet} numberOfLines={3}>
                  {item.content}
                </Text>
                <View style={styles.newsFooter}>
                  <Text style={styles.newsDate}>
                    <MaterialIcons name="calendar-today" size={12} color="#999" /> {formatDateForDisplay(item.publishDate)}
                  </Text>
                  <Text style={styles.newsAuthor}>
                    <MaterialIcons name="person" size={12} color="#999" /> By {item.author}
                  </Text>
                </View>
                <View style={styles.newsActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => openEditModal(item)}
                  >
                    <MaterialIcons name="edit" size={18} color="#007AFF" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteNews(item.id)}
                  >
                    <MaterialIcons name="delete" size={18} color="#FF3B30" />
                    <Text style={[styles.actionButtonText, { color: '#FF3B30' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add New Announcement Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <MaterialIcons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Add/Edit Announcement Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentNewsItem ? 'Edit Announcement' : 'New Announcement'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Announcement Title"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
              placeholder="Announcement Details..."
              placeholderTextColor="#999"
              multiline
              value={content}
              onChangeText={setContent}
            />
            {/* Removed the TextInput for imageUrl because we're using ImagePicker now */}
            {/* If you still want to allow manual URL input, you can re-add it, but manage its interaction with ImagePicker carefully */}


            {/* --- Image Picker Integration --- */}
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                <MaterialIcons name="image" size={24} color="#666" />
                <Text style={styles.imagePickerButtonText}>
                    {imageUrl ? 'Change Image' : 'Select Image'}
                </Text>
            </TouchableOpacity>

            {imageUrl && (
                <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
                    <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                        <MaterialIcons name="close" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>
            )}
            {/* --- End Image Picker Integration --- */}


            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveNews}>
                <Text style={styles.saveButtonText}>{currentNewsItem ? 'Update' : 'Publish'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    marginLeft: -40, // Adjust to center title more
  },
  scrollViewContent: {
    padding: 15,
    paddingBottom: 80, // Space for FAB
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: height * 0.7,
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
    overflow: 'hidden', // Ensures image respects border radius
  },
  newsImage: {
    width: '100%',
    height: width * 0.45, // Responsive image height
    backgroundColor: '#eee',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  newsContent: {
    padding: 15,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  newsSnippet: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  newsDate: {
    fontSize: 12,
    color: '#999',
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsAuthor: {
    fontSize: 12,
    color: '#999',
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
    marginTop: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#E6F3FA',
  },
  actionButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#6633FF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    justifyContent: 'center',
  },
  imagePickerButtonText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
  },
  imagePreviewContainer: {
    marginBottom: 15,
    alignItems: 'center',
    position: 'relative', // For absolute positioning of remove button
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#eee',
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  cancelButtonText: {
    color: '#555',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#6633FF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CoachNewsEditor;
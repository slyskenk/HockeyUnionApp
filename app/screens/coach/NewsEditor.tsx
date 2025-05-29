import { MaterialIcons } from '@expo/vector-icons';
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
  imageUrl?: string;
  author: string;
  publishDate: number; // Unix timestamp
};

// --- Dummy Data ---
const COACH_NAME = 'Coach John Doe';

const DUMMY_NEWS: NewsItem[] = [
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
  const [newsItems, setNewsItems] = useState<NewsItem[]>(DUMMY_NEWS);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentNewsItem, setCurrentNewsItem] = useState<NewsItem | null>(null); // For editing

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // Mock for image URL

  // Sort news items by publish date, newest first
  useEffect(() => {
    const sortedNews = [...newsItems].sort((a, b) => b.publishDate - a.publishDate);
    setNewsItems(sortedNews);
  }, [newsItems.length]); // Re-sort when news item count changes

  const resetForm = () => {
    setCurrentNewsItem(null);
    setTitle('');
    setContent('');
    setImageUrl('');
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (item: NewsItem) => {
    setCurrentNewsItem(item);
    setTitle(item.title);
    setContent(item.content);
    setImageUrl(item.imageUrl || '');
    setModalVisible(true);
  };

  const handleSaveNews = () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing Information', 'Please fill in the title and content for your announcement.');
      return;
    }

    if (currentNewsItem) {
      // Update existing item
      setNewsItems(newsItems.map(item =>
        item.id === currentNewsItem.id
          ? { ...item, title: title.trim(), content: content.trim(), imageUrl: imageUrl.trim(), publishDate: Date.now() }
          : item
      ));
      Alert.alert('Success', 'Announcement updated successfully!');
    } else {
      // Add new item
      const newItem: NewsItem = {
        id: `news-${Date.now()}`,
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim() || undefined,
        author: COACH_NAME,
        publishDate: Date.now(),
      };
      setNewsItems([...newsItems, newItem]);
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
            setNewsItems(newsItems.filter(item => item.id !== id));
            Alert.alert('Deleted', 'Announcement has been deleted.');
          },
          style: 'destructive',
        },
      ]
    );
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
              {item.imageUrl && (
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
            <TextInput
              style={styles.input}
              placeholder="Image URL (Optional)"
              placeholderTextColor="#999"
              value={imageUrl}
              onChangeText={setImageUrl}
              keyboardType="url"
            />
            {/* You would integrate an actual image picker here */}
            <TouchableOpacity style={styles.imagePickerButton}>
                <MaterialIcons name="image" size={24} color="#666" />
                <Text style={styles.imagePickerButtonText}>Select Image</Text>
            </TouchableOpacity>

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
    marginLeft: -40,
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
// app/coach/Forum.tsx
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
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
type ForumPost = {
  id: string;
  author: string;
  authorAvatar: string;
  timestamp: number; // Unix timestamp
  content: string;
  likes?: number; // Added for creativity
};

type ForumTopic = {
  id: string;
  title: string;
  initialPost: ForumPost;
  replies: ForumPost[];
  lastActivity: number; // Unix timestamp of last reply or initial post
  views?: number; // Added for creativity
};

// --- Helper for formatting dates/times ---
const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "Just Now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour ago`;

  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return `Today ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// --- Dummy Data ---
const CURRENT_COACH_NAME = 'Coach Alex';
const CURRENT_COACH_AVATAR = 'https://placehold.co/40x40/6633FF/FFFFFF?text=AA'; // Using a color from the gradient

const DUMMY_TOPICS: ForumTopic[] = [
  {
    id: 't1',
    title: 'Strategies for Defensive Pressing in Half-Court',
    initialPost: {
      id: 'p1_1',
      author: 'Coach Maria',
      authorAvatar: 'https://placehold.co/40x40/FF5733/FFFFFF?text=MM',
      timestamp: Date.now() - (1000 * 60 * 60 * 24 * 3), // 3 days ago
      content: "I'm looking for effective drills and tactical approaches for high-intensity defensive pressing when the opponent is in our half. Any insights or recommended video resources?",
      likes: 15,
    },
    replies: [
      {
        id: 'r1_1',
        author: 'Coach David',
        authorAvatar: 'https://placehold.co/40x40/33FF57/000000?text=DD',
        timestamp: Date.now() - (1000 * 60 * 60 * 24 * 2), // 2 days ago
        content: "We've had success with a 2-3 zonal press. It requires good communication but can really suffocate the opposition. I can share some diagrams.",
        likes: 8,
      },
      {
        id: 'r1_2',
        author: 'Coach Maria',
        authorAvatar: 'https://placehold.co/40x40/FF5733/FFFFFF?text=MM',
        timestamp: Date.now() - (1000 * 60 * 60 * 1), // 1 hour ago
        content: "That would be great, David! Especially on how to transition from a full press to a half-court trap.",
        likes: 5,
      },
      {
        id: 'r1_3',
        author: CURRENT_COACH_NAME,
        authorAvatar: CURRENT_COACH_AVATAR,
        timestamp: Date.now() - (1000 * 60 * 5), // 5 minutes ago
        content: "I agree, zonal press works well. Key is anticipating the pass and cutting off passing lanes. What are your thoughts on individual responsibilities?",
        likes: 12,
      },
    ],
    lastActivity: Date.now() - (1000 * 60 * 5),
    views: 120,
  },
  {
    id: 't2',
    title: 'Best Practices for Youth Player Development',
    initialPost: {
      id: 'p2_1',
      author: 'Coach Sarah',
      authorAvatar: 'https://placehold.co/40x40/3357FF/FFFFFF?text=SS',
      timestamp: Date.now() - (1000 * 60 * 60 * 24 * 7), // 7 days ago
      content: "For U12 players, what are the most crucial skills to focus on, beyond basic stick work? And how do you keep them engaged?",
      likes: 20,
    },
    replies: [
      {
        id: 'r2_1',
        author: CURRENT_COACH_NAME,
        authorAvatar: CURRENT_COACH_AVATAR,
        timestamp: Date.now() - (1000 * 60 * 60 * 24 * 6), // 6 days ago
        content: "Fun is key! We integrate small-sided games heavily. Also, focus on decision-making and spatial awareness through modified games.",
        likes: 10,
      },
    ],
    lastActivity: Date.now() - (1000 * 60 * 60 * 24 * 6),
    views: 85,
  },
  {
    id: 't3',
    title: 'Injury Prevention Drills for Goalkeepers',
    initialPost: {
      id: 'p3_1',
      author: 'Coach Ben',
      authorAvatar: 'https://placehold.co/40x40/FF33A0/FFFFFF?text=BB',
      timestamp: Date.now() - (1000 * 60 * 60 * 24 * 10), // 10 days ago
      content: "My goalkeepers are prone to knee and wrist injuries. Any specific warm-ups or conditioning drills you recommend?",
      likes: 7,
    },
    replies: [],
    lastActivity: Date.now() - (1000 * 60 * 60 * 24 * 10),
    views: 45,
  },
];

const Forum = () => { // Component name remains 'Forum'
  const router = useRouter();
  const [topics, setTopics] = useState<ForumTopic[]>(DUMMY_TOPICS);
  const [createTopicModalVisible, setCreateTopicModalVisible] = useState(false);
  const [viewTopicModalVisible, setViewTopicModalVisible] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [newReplyContent, setNewReplyContent] = useState('');

  // Animation for FAB button
  const fabScale = useRef(new Animated.Value(1)).current;

  // Animation for input focus
  const [titleInputFocused, setTitleInputFocused] = useState(false);
  const [contentInputFocused, setContentInputFocused] = useState(false);
  const [replyInputFocused, setReplyInputFocused] = useState(false);

  // Sort topics by last activity, newest first
  useEffect(() => {
    // Only sort if topics has changed significantly (e.g., length change or actual item change)
    const sortedTopics = [...topics].sort((a, b) => b.lastActivity - a.lastActivity);
    // Deep comparison to prevent re-rendering if only the order of already sorted elements is unchanged
    if (JSON.stringify(sortedTopics) !== JSON.stringify(topics)) {
        setTopics(sortedTopics);
    }
  }, [topics]); // Depend on topics array, use stringify for deep check

  const handleCreateNewTopic = () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim()) {
      Alert.alert('Missing Info', 'Please provide both a title and content for your topic.');
      return;
    }

    const newTopic: ForumTopic = {
      id: `t-${Date.now()}`,
      title: newTopicTitle.trim(),
      initialPost: {
        id: `p-${Date.now()}`,
        author: CURRENT_COACH_NAME,
        authorAvatar: CURRENT_COACH_AVATAR,
        timestamp: Date.now(),
        content: newTopicContent.trim(),
        likes: 0,
      },
      replies: [],
      lastActivity: Date.now(),
      views: 1, // Start with 1 view
    };

    setTopics(prev => [...prev, newTopic]);
    setNewTopicTitle('');
    setNewTopicContent('');
    setCreateTopicModalVisible(false);
    Alert.alert('Success', 'New topic created!');
  };

  const handleAddReply = () => {
    if (!newReplyContent.trim() || !selectedTopic) {
      Alert.alert('Empty Reply', 'Please type something before replying.');
      return;
    }

    const newReply: ForumPost = {
      id: `r-${Date.now()}`,
      author: CURRENT_COACH_NAME,
      authorAvatar: CURRENT_COACH_AVATAR,
      timestamp: Date.now(),
      content: newReplyContent.trim(),
      likes: 0,
    };

    setTopics(prevTopics =>
      prevTopics.map(topic =>
        topic.id === selectedTopic.id
          ? { ...topic, replies: [...topic.replies, newReply], lastActivity: newReply.timestamp }
          : topic
      )
    );
    setSelectedTopic(prevTopic =>
      prevTopic ? { ...prevTopic, replies: [...prevTopic.replies, newReply], lastActivity: newReply.timestamp } : null
    );
    setNewReplyContent('');
  };

  const openTopicDetails = (topic: ForumTopic) => {
    // Increment views (dummy logic)
    setTopics(prevTopics =>
      prevTopics.map(t =>
        t.id === topic.id ? { ...t, views: (t.views || 0) + 1 } : t
      )
    );
    setSelectedTopic({ ...topic, views: (topic.views || 0) + 1 }); // Update selected topic
    setViewTopicModalVisible(true);
  };

  const closeTopicDetails = () => {
    setSelectedTopic(null);
    setNewReplyContent('');
    setViewTopicModalVisible(false);
  };

  const handleLike = (postId: string, isInitialPost: boolean) => {
    if (!selectedTopic) return;

    if (isInitialPost) {
      const updatedInitialPost = { ...selectedTopic.initialPost, likes: (selectedTopic.initialPost.likes || 0) + 1 };
      setSelectedTopic(prev => prev ? { ...prev, initialPost: updatedInitialPost } : null);
      setTopics(prevTopics => prevTopics.map(t => t.id === selectedTopic.id ? { ...t, initialPost: updatedInitialPost } : t));
    } else {
      const updatedReplies = selectedTopic.replies.map(reply =>
        reply.id === postId ? { ...reply, likes: (reply.likes || 0) + 1 } : reply
      );
      setSelectedTopic(prev => prev ? { ...prev, replies: updatedReplies } : null);
      setTopics(prevTopics => prevTopics.map(t => t.id === selectedTopic.id ? { ...t, replies: updatedReplies } : t));
    }
  };

  // FAB animation
  const animateFabPress = () => {
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.spring(fabScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
    ]).start();
  };

  const MAX_POST_LENGTH = 500;

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
        <Text style={styles.headerTitle}>Coach Forum</Text>
        <TouchableOpacity style={styles.headerSearch}>
          <MaterialIcons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Forum Topics List */}
      {topics.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name="forum" size={100} color="#E0E0E0" />
          <Text style={styles.emptyStateText}>The forum is a bit quiet...</Text>
          <Text style={styles.emptyStateSubText}>Be the first to ignite a discussion!</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {topics.map((topic) => (
            <TouchableOpacity
              key={topic.id}
              style={styles.topicCard}
              onPress={() => openTopicDetails(topic)}
              activeOpacity={0.7} // Add touch feedback
            >
              <View style={styles.topicHeader}>
                <Text style={styles.topicCardTitle}>{topic.title}</Text>
                {/* Hot Topic Indicator */}
                {topic.replies.length > 2 && ( // Example: "Hot" if more than 2 replies
                  <View style={styles.hotTopicBadge}>
                    <MaterialCommunityIcons name="fire" size={16} color="#FF4500" />
                    <Text style={styles.hotTopicText}>Hot!</Text>
                  </View>
                )}
              </View>
              <Text style={styles.topicInitialPostSnippet} numberOfLines={2}>
                {topic.initialPost.content}
              </Text>
              <View style={styles.topicFooter}>
                <View style={styles.topicMetaGroup}>
                  <MaterialIcons name="person" size={14} color="#666" />
                  <Text style={styles.topicAuthor}> {topic.initialPost.author}</Text>
                </View>
                <View style={styles.topicMetaGroup}>
                  <MaterialIcons name="chat-bubble-outline" size={14} color="#666" />
                  <Text style={styles.topicReplies}> {topic.replies.length}</Text>
                </View>
                <View style={styles.topicMetaGroup}>
                  <MaterialIcons name="visibility" size={14} color="#666" />
                  <Text style={styles.topicViews}> {topic.views || 0}</Text>
                </View>
                <Text style={styles.topicLastActivity}>
                  {formatTimeAgo(topic.lastActivity)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Floating Action Button to Create New Topic */}
      <Animated.View style={[styles.fab, { transform: [{ scale: fabScale }] }]}>
        <TouchableOpacity
          onPress={() => {
            animateFabPress();
            setCreateTopicModalVisible(true);
          }}
          style={styles.fabButton}
        >
          <MaterialIcons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Create New Topic Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={createTopicModalVisible}
        onRequestClose={() => setCreateTopicModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Start a New Discussion</Text>
            <TextInput
              style={[styles.input, titleInputFocused && styles.inputFocused]}
              placeholder="Catchy Topic Title (e.g., 'Best Drills for Attackers')"
              placeholderTextColor="#999"
              value={newTopicTitle}
              onChangeText={setNewTopicTitle}
              onFocus={() => setTitleInputFocused(true)}
              onBlur={() => setTitleInputFocused(false)}
            />
            <TextInput
              style={[styles.input, styles.textArea, contentInputFocused && styles.inputFocused]}
              placeholder="Share your thoughts or question here..."
              placeholderTextColor="#999"
              multiline
              value={newTopicContent}
              onChangeText={(text) => {
                if (text.length <= MAX_POST_LENGTH) setNewTopicContent(text);
              }}
              onFocus={() => setContentInputFocused(true)}
              onBlur={() => setContentInputFocused(false)}
            />
            <Text style={styles.characterCount}>
              {newTopicContent.length}/{MAX_POST_LENGTH} characters
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setCreateTopicModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleCreateNewTopic}>
                <Text style={styles.saveButtonText}>Post Topic</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* View Topic Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={viewTopicModalVisible}
        onRequestClose={closeTopicDetails}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          {selectedTopic && (
            <View style={styles.topicDetailModalContent}>
              <View style={styles.topicDetailHeader}>
                <Text style={styles.topicDetailTitle} numberOfLines={1} ellipsizeMode="tail">
                  {selectedTopic.title}
                </Text>
                <TouchableOpacity onPress={closeTopicDetails} style={styles.closeButton}>
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.postsScrollView} contentContainerStyle={styles.postsScrollViewContent}>
                {/* Initial Post */}
                <View style={[
                  styles.postCard,
                  selectedTopic.initialPost.author === CURRENT_COACH_NAME && styles.myPostCard
                ]}>
                  <View style={styles.postHeader}>
                    <Image source={{ uri: selectedTopic.initialPost.authorAvatar }} style={styles.postAvatar} />
                    <View style={styles.postAuthorInfo}>
                      <Text style={styles.postAuthor}>{selectedTopic.initialPost.author}</Text>
                      <Text style={styles.postTimestamp}>{formatTimeAgo(selectedTopic.initialPost.timestamp)}</Text>
                    </View>
                  </View>
                  <Text style={styles.postContent}>{selectedTopic.initialPost.content}</Text>
                  <TouchableOpacity style={styles.likeButton} onPress={() => handleLike(selectedTopic.initialPost.id, true)}>
                    <MaterialIcons name="thumb-up" size={16} color="#6633FF" />
                    <Text style={styles.likeButtonText}>{selectedTopic.initialPost.likes || 0}</Text>
                  </TouchableOpacity>
                </View>

                {/* Replies */}
                {selectedTopic.replies.map(reply => (
                  <View key={reply.id} style={[
                    styles.postCard,
                    styles.replyCard,
                    reply.author === CURRENT_COACH_NAME && styles.myPostCard
                  ]}>
                    <View style={styles.postHeader}>
                      <Image source={{ uri: reply.authorAvatar }} style={styles.postAvatar} />
                      <View style={styles.postAuthorInfo}>
                        <Text style={styles.postAuthor}>{reply.author}</Text>
                        <Text style={styles.postTimestamp}>{formatTimeAgo(reply.timestamp)}</Text>
                      </View>
                    </View>
                    <Text style={styles.postContent}>{reply.content}</Text>
                    <TouchableOpacity style={styles.likeButton} onPress={() => handleLike(reply.id, false)}>
                      <MaterialIcons name="thumb-up" size={16} color="#6633FF" />
                      <Text style={styles.likeButtonText}>{reply.likes || 0}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>

              {/* Reply Input */}
              <View style={styles.replyInputContainer}>
                <TextInput
                  style={[styles.replyInput, replyInputFocused && styles.inputFocused]}
                  placeholder="Type your reply..."
                  placeholderTextColor="#999"
                  value={newReplyContent}
                  onChangeText={setNewReplyContent}
                  multiline
                  maxHeight={80}
                  minHeight={45}
                  onFocus={() => setReplyInputFocused(true)}
                  onBlur={() => setReplyInputFocused(false)}
                />
                <TouchableOpacity
                  style={[styles.replySendButton, !newReplyContent.trim() && { opacity: 0.5 }]}
                  onPress={handleAddReply}
                  disabled={!newReplyContent.trim()}
                >
                  <MaterialIcons name="send" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
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
  headerSearch: {
    padding: 5,
    marginLeft: 10,
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
  topicCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderLeftWidth: 6, // Thicker accent border
    borderLeftColor: '#4A90E2', // Accent color
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  hotTopicBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderColor: '#FF4500',
    borderWidth: 1,
  },
  hotTopicText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF4500',
    marginLeft: 4,
  },
  topicInitialPostSnippet: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  topicFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
    paddingTop: 10,
    marginTop: 5,
  },
  topicMetaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  topicAuthor: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  topicReplies: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  topicViews: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  topicLastActivity: {
    fontSize: 12,
    color: '#999',
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
  fabButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
    maxHeight: '80%',
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
  inputFocused: {
    borderColor: '#6633FF', // Highlight border on focus
    shadowColor: '#6633FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: -10,
    marginBottom: 10,
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
  topicDetailModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '95%',
    height: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  topicDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  topicDetailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  closeButton: {
    padding: 5,
  },
  postsScrollView: {
    flex: 1,
    marginBottom: 15,
  },
  postsScrollViewContent: {
    paddingBottom: 20, // Add padding at the bottom of scroll view
  },
  postCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    borderLeftWidth: 4, // Accent border for posts
    borderLeftColor: '#E0E0E0',
  },
  myPostCard: {
    backgroundColor: '#E6F3FA', // Lighter blue background for own posts
    borderLeftColor: '#4A90E2', // Stronger accent for own posts
  },
  replyCard: {
    marginLeft: 20, // Indent replies slightly
    backgroundColor: '#F3F6F9', // Slightly different background for replies
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  postAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    marginRight: 10,
    backgroundColor: '#ddd',
    borderWidth: 1,
    borderColor: '#eee',
  },
  postAuthorInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  postTimestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    marginBottom: 10,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
    alignSelf: 'flex-start', // Align to start of post card
  },
  likeButtonText: {
    fontSize: 13,
    color: '#6633FF',
    marginLeft: 5,
    fontWeight: 'bold',
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Align items to the bottom (for multiline input)
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  replyInput: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    color: '#333',
    marginRight: 10,
    maxHeight: 80,
    minHeight: 45, // Ensure min height for single line
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  replySendButton: {
    backgroundColor: '#6633FF',
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 0 : 5, // Adjust for Android keyboard alignment
  },
});

export default Forum;
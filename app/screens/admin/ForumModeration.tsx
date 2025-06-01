import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Import useRouter for navigation
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  AlertButton,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Define message types for the forum
type ForumMessage = {
  id: string;
  text: string;
  senderId: string; // Unique ID for the sender
  senderName: string; // Display name of the sender
  senderAvatar?: string; // Optional avatar URL for the sender
  timestamp: string; // e.g., "08:15 AM", "Just Now"
};

// Define a User type for clarity, now including 'Unknown' role
type User = {
  name: string;
  avatar: string;
  role: 'Admin' | 'Other Admin' | 'Coach' | 'Player' | 'Supporter' | 'Fan' | 'Unknown';
};

// Define the type for DUMMY_USERS with an index signature
type DummyUsers = {
  [key: string]: User; // Allows string indexing
};

// Dummy data for users and their avatars and roles
const DUMMY_USERS: DummyUsers = {
  'user1': { name: 'Slysken Kakuva', avatar: 'https://placehold.co/40x40/FF5733/FFFFFF?text=SK', role: 'Admin' },
  'user2': { name: 'Admin User', avatar: 'https://placehold.co/40x40/33FF57/000000?text=AU', role: 'Other Admin' },
  'user3': { name: 'Hockey Fan', avatar: 'https://placehold.co/40x40/3357FF/FFFFFF?text=HF', role: 'Fan' },
  'user4': { name: 'Coach Mike', avatar: 'https://placehold.co/40x40/FFD700/000000?text=CM', role: 'Coach' },
  'user5': { name: 'Player Ace', avatar: 'https://placehold.co/40x40/8A2BE2/FFFFFF?text=PA', role: 'Player' },
  'user6': { name: 'Supporter Sam', avatar: 'https://placehold.co/40x40/FF00FF/FFFFFF?text=SS', role: 'Supporter' },
};

// Simulate the current logged-in user (Admin for moderation purposes)
const CURRENT_USER_ID = 'user1';
const CURRENT_USER_NAME = DUMMY_USERS[CURRENT_USER_ID].name;
const CURRENT_USER_AVATAR = DUMMY_USERS[CURRENT_USER_ID].avatar;
const CURRENT_USER_ROLE = DUMMY_USERS[CURRENT_USER_ID].role; // Get current user's role

const ForumModeration = () => {
  const router = useRouter(); // Initialize useRouter
  const [messages, setMessages] = useState<ForumMessage[]>([
    {
      id: '1',
      text: 'Welcome to the Namibia Hockey Union Forum! Feel free to ask questions and share updates.',
      senderId: 'admin',
      senderName: 'Forum Admin',
      senderAvatar: 'https://placehold.co/40x40/8A2BE2/FFFFFF?text=ADM',
      timestamp: 'Yesterday 10:00 AM',
    },
    {
      id: '2',
      text: 'Hello everyone! Excited for the upcoming season.',
      senderId: 'user1',
      senderName: DUMMY_USERS['user1'].name,
      senderAvatar: DUMMY_USERS['user1'].avatar,
      timestamp: '09:30 AM',
    },
    {
      id: '3',
      text: 'Does anyone know the schedule for the U16 league tryouts?',
      senderId: 'user3',
      senderName: DUMMY_USERS['user3'].name,
      senderAvatar: DUMMY_USERS['user3'].avatar,
      timestamp: '10:15 AM',
    },
    {
      id: '4',
      text: 'I believe the tryouts are next Saturday. Check the events section of the app for details!',
      senderId: 'user2',
      senderName: DUMMY_USERS['user2'].name,
      senderAvatar: DUMMY_USERS['user2'].avatar,
      timestamp: '10:20 AM',
    },
    {
      id: '5',
      text: 'This is a test message from a coach. Looking forward to the new season!',
      senderId: 'user4',
      senderName: DUMMY_USERS['user4'].name,
      senderAvatar: DUMMY_USERS['user4'].avatar,
      timestamp: '11:00 AM',
    },
    {
      id: '6',
      text: 'Great to see so much activity here! Any tips for new players?',
      senderId: 'user6',
      senderName: DUMMY_USERS['user6'].name,
      senderAvatar: DUMMY_USERS['user6'].avatar,
      timestamp: '11:30 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // New state for search
  const flatListRef = useRef<FlatList<ForumMessage>>(null); // Explicitly type FlatList ref

  // Scroll to the bottom of the chat when messages update
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Memoized filtered messages based on search query
  const filteredMessages = useMemo(() => {
    return messages.filter(message =>
      message.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.senderName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messages, searchQuery]);

  // Function to format timestamp
  const formatTimestamp = useCallback((date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  }, []);

  const handleSend = useCallback(() => {
    if (inputText.trim()) {
      const newMessage: ForumMessage = {
        id: Date.now().toString(),
        text: inputText.trim(),
        senderId: CURRENT_USER_ID,
        senderName: CURRENT_USER_NAME,
        senderAvatar: CURRENT_USER_AVATAR,
        timestamp: formatTimestamp(new Date()),
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setInputText('');
      // In a real app, you would send this message to a backend/database
    }
  }, [inputText, formatTimestamp]);

  // --- Admin Moderation Actions ---

  /**
   * Handles deleting a message.
   * Only accessible by Admin/Other Admin.
   * @param messageId The ID of the message to delete.
   */
  const handleDeleteMessage = useCallback((messageId: string) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
            console.log(`Message ${messageId} deleted.`);
            // In a real app, call API to delete message from backend
          },
          style: 'destructive',
        },
      ]
    );
  }, []);

  /**
   * Placeholder for editing a message.
   * Only accessible by Admin/Other Admin.
   * @param message The message object to edit.
   */
  const handleEditMessage = useCallback((message: ForumMessage) => {
    console.log('Edit message:', message.id);
    Alert.alert('Edit Message', `Functionality to edit message "${message.text.substring(0, 20)}..." not implemented.`);
    // In a real app, this would open a text input or modal to allow editing.
  }, []);

  /**
   * Placeholder for reporting a user.
   * Only accessible by Admin/Other Admin.
   * @param userId The ID of the user to report.
   * @param userName The name of the user to report.
   */
  const handleReportUser = useCallback((userId: string, userName: string) => {
    console.log('Report user:', userName);
    Alert.alert('Report User', `Functionality to report user "${userName}" not implemented.`);
    // In a real app, this would open a form to specify report details.
  }, []);

  /**
   * Placeholder for muting/banning a user.
   * Only accessible by Admin.
   * @param userId The ID of the user to mute/ban.
   * @param userName The name of the user to mute/ban.
   */
  const handleMuteBanUser = useCallback((userId: string, userName: string) => {
    console.log('Mute/Ban user:', userName);
    Alert.alert('Mute/Ban User', `Functionality to mute/ban user "${userName}" not implemented.`);
    // In a real app, this would trigger backend moderation actions.
  }, []);

  /**
   * Helper function to get the role badge style dynamically.
   * @param role The user's role.
   * @returns The corresponding StyleSheet style object.
   */
  const getRoleBadgeStyle = useCallback((role: User['role']): ViewStyle => {
    switch (role) {
      case 'Admin': return styles.roleBadgeAdmin;
      case 'Other Admin': return styles.roleBadgeOtherAdmin;
      case 'Coach': return styles.roleBadgeCoach;
      case 'Player': return styles.roleBadgePlayer;
      case 'Supporter': return styles.roleBadgeSupporter;
      case 'Fan': return styles.roleBadgeFan;
      case 'Unknown': return {}; // No specific badge for unknown
      default: return {}; // Fallback
    }
  }, []);

  // Determine if the current logged-in user can moderate
  const canModerate = useMemo(() => {
    return CURRENT_USER_ROLE === 'Admin' || CURRENT_USER_ROLE === 'Other Admin';
  }, [CURRENT_USER_ROLE]);


  const renderMessage = useCallback(({ item }: { item: ForumMessage }) => {
    const isCurrentUser = item.senderId === CURRENT_USER_ID;
    // Safely access senderInfo. If senderId is 'admin' (not in DUMMY_USERS), use item's name/avatar.
    const senderInfo = DUMMY_USERS[item.senderId] || { name: item.senderName, avatar: item.senderAvatar, role: 'Unknown' as User['role'] };

    // Construct the moderation actions array
    const moderationActions: AlertButton[] = [
      { text: 'Edit Message', onPress: () => handleEditMessage(item) },
      { text: 'Delete Message', onPress: () => handleDeleteMessage(item.id), style: 'destructive' },
      { text: 'Report User', onPress: () => handleReportUser(item.senderId, item.senderName) },
    ];

    // Conditionally add the Mute/Ban User button for Admin
    if (CURRENT_USER_ROLE === 'Admin') {
      moderationActions.push({ text: 'Mute/Ban User', onPress: () => handleMuteBanUser(item.senderId, item.senderName), style: 'destructive' });
    }

    // Add the Cancel button last
    moderationActions.push({ text: 'Cancel', style: 'cancel' });


    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessageContainer : styles.otherUserMessageContainer,
      ]}>
        {/* Avatar for all users (including current user for moderation context if desired) */}
        <Image
          source={{ uri: item.senderAvatar || 'https://placehold.co/40x40/CCCCCC/FFFFFF?text=?' }} // Fallback avatar
          style={[
            styles.avatar,
            isCurrentUser ? styles.currentUserAvatar : styles.otherUserAvatar,
          ]}
        />

        <View style={styles.messageContent}>
          <View style={[
            styles.senderHeader,
            isCurrentUser ? styles.currentUserSenderHeader : styles.otherUserSenderHeader,
          ]}>
            <Text style={styles.senderName}>{item.senderName}</Text>
            {/* Display role badge if known and not 'Unknown' */}
            {senderInfo.role !== 'Unknown' && (
              <View style={[
                styles.roleBadge,
                getRoleBadgeStyle(senderInfo.role),
              ]}>
                <Text style={styles.roleBadgeText}>{senderInfo.role}</Text>
              </View>
            )}
          </View>
          <View style={[
            styles.messageBubble,
            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
          ]}>
            <Text style={isCurrentUser ? styles.currentUserText : styles.otherUserText}>
              {item.text}
            </Text>
          </View>
          <Text style={[
            styles.timestamp,
            isCurrentUser ? styles.currentUserTimestamp : styles.otherUserTimestamp,
          ]}>
            {item.timestamp}
          </Text>
        </View>

        {/* Moderation Options Button (only for Admin/Other Admin) */}
        {canModerate && (
          <TouchableOpacity
            style={[
              styles.moderationOptionsButton,
              isCurrentUser ? styles.currentUserModerationButton : styles.otherUserModerationButton,
            ]}
            onPress={() => Alert.alert(
              'Moderation Actions',
              `Actions for message by ${item.senderName}`,
              moderationActions // Pass the pre-constructed array
            )}
          >
            <Entypo name="dots-three-vertical" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>
    );
  }, [canModerate, CURRENT_USER_ID, CURRENT_USER_ROLE, getRoleBadgeStyle, handleDeleteMessage, handleEditMessage, handleReportUser, handleMuteBanUser]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} // Adjust as needed
    >
      {/* Header with Logo, Title, and Back Button */}
      <View style={styles.header}>
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.push('./../admin/Dashboard')} // Navigate back to Admin Dashboard
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Image
          source={require('../../../assets/images/logo.jpeg')} // Update this path
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Forum Discussion</Text>
      </View>

      {/* Search Bar for Messages */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search forum messages..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Message List */}
      {filteredMessages.length === 0 && searchQuery.length > 0 ? (
        <View style={styles.emptyListContainer}>
          <MaterialIcons name="search-off" size={60} color="#ccc" />
          <Text style={styles.emptyListText}>No messages found for your search.</Text>
          <Text style={styles.emptyListSubText}>Try a different keyword.</Text>
        </View>
      ) : filteredMessages.length === 0 ? (
        <View style={styles.emptyListContainer}>
          <Ionicons name="chatbox-outline" size={60} color="#ccc" />
          <Text style={styles.emptyListText}>No messages in this forum yet.</Text>
          <Text style={styles.emptyListSubText}>Be the first to start a discussion!</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={filteredMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageListContent}
          inverted={false} // Set to true if you want chat to start from bottom
          // Optional performance props for larger lists:
          // initialNumToRender={10}
          // maxToRenderPerBatch={5}
          // windowSize={21}
        />
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.inputIcon}>
          <Entypo name="emoji-happy" size={24} color="#888" />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder="Type your message..."
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity style={styles.inputIcon}>
          <MaterialIcons name="image" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <MaterialIcons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Light background for the chat screen
  },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    alignItems: 'center',
    backgroundColor: '#fff', // White header background
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
    backgroundColor: '#007AFF', // Blue circle background
    borderRadius: 20, // Make it a circle
    padding: 8, // Padding inside the circle
  },
  headerLogo: {
    width: 60, // Smaller logo for the header
    height: 60,
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    // Removed marginLeft to allow auto-centering with `justifyContent: 'center'`
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
  messageListContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  messageContainer: {
    flexDirection: 'row', // Default to row for avatar and message
    marginBottom: 10,
    alignItems: 'flex-start', // Align items to the top
  },
  currentUserMessageContainer: {
    alignSelf: 'flex-end', // Align current user messages to the right
    flexDirection: 'row-reverse', // Reverse order for current user to put avatar on left
    alignItems: 'flex-start',
  },
  otherUserMessageContainer: {
    alignSelf: 'flex-start', // Align other user messages to the left
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ddd', // Placeholder background for avatar
  },
  currentUserAvatar: {
    marginLeft: 8, // Space between avatar and bubble for current user
  },
  otherUserAvatar: {
    marginRight: 8, // Space between avatar and bubble for other users
  },
  messageContent: {
    flexDirection: 'column',
    maxWidth: '75%', // Limit message bubble width
  },
  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  currentUserSenderHeader: {
    justifyContent: 'flex-end', // Align sender name/role to the right for current user
    marginRight: 5, // Small indent for readability
  },
  otherUserSenderHeader: {
    justifyContent: 'flex-start', // Align sender name/role to the left for other users
    marginLeft: 5, // Small indent for readability
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
    marginRight: 5,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  roleBadgeAdmin: { backgroundColor: '#FF3B30' },
  roleBadgeOtherAdmin: { backgroundColor: '#FF9500' },
  roleBadgeCoach: { backgroundColor: '#007AFF' },
  roleBadgePlayer: { backgroundColor: '#5856D6' },
  roleBadgeSupporter: { backgroundColor: '#34C759' },
  roleBadgeFan: { backgroundColor: '#C6C6C6' },

  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  currentUserBubble: {
    backgroundColor: '#6633FF', // Blue for current user messages
    borderBottomRightRadius: 2, // Sharper corner at the bottom right
  },
  otherUserBubble: {
    backgroundColor: '#e0e0e0', // Gray for other user messages
    borderBottomLeftRadius: 2, // Sharper corner at the bottom left
  },
  currentUserText: {
    color: '#fff',
    fontSize: 16,
  },
  otherUserText: {
    color: '#333',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  currentUserTimestamp: {
    alignSelf: 'flex-end', // Align current user timestamp to the right
    marginRight: 5, // Small margin to align with bubble
  },
  otherUserTimestamp: {
    alignSelf: 'flex-start', // Align other user timestamp to the left
    marginLeft: 5, // Small margin to align with bubble
  },
  moderationOptionsButton: {
    padding: 5,
    alignSelf: 'flex-start', // Align with the top of the message
  },
  currentUserModerationButton: {
    marginLeft: 5, // Space when current user message is on the right
  },
  otherUserModerationButton: {
    marginRight: 5, // Space when other user message is on the left
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    color: '#333',
    marginHorizontal: 8,
    maxHeight: 100,
  },
  inputIcon: {
    padding: 5,
  },
  sendButton: {
    backgroundColor: '#6633FF',
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: height * 0.5, // Ensure it takes up enough space
  },
  emptyListText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    fontWeight: 'bold',
  },
  emptyListSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default ForumModeration;
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
  ActivityIndicator, // Added for loading indicator
} from 'react-native';

// Import Firebase modules
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  Timestamp, // Import Firebase Timestamp type
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth'; // Import for auth state listening

// Import your Firebase initialization (adjust path if needed)
import { db, auth } from '../../../firebase/firebase';

const { width, height } = Dimensions.get('window');

// Define message types for the forum
type ForumMessage = {
  id: string; // Document ID from Firestore
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string; // Formatted timestamp for display
  createdAt: Timestamp; // Firebase Timestamp for sorting
  senderRole?: User['role']; // Role of the sender, fetched from 'users' collection
};

// Define a User type for clarity, now including 'Unknown' role
type User = {
  uid: string; // Firebase Auth UID
  name: string;
  email: string;
  role: 'Admin' | 'Other Admin' | 'Coach' | 'Player' | 'Supporter' | 'Fan' | 'Unknown';
  createdAt: string | Timestamp; // Can be ISO string or Firebase Timestamp
  avatar?: string; // Optional avatar URL for the user
};

const ForumModeration = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const flatListRef = useRef<FlatList<ForumMessage>>(null);

  // States for current user (from Firebase Auth and Firestore)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserData, setCurrentUserData] = useState<User | null>(null);
  const [loadingInitialData, setLoadingInitialData] = useState(true); // For overall initial load

  // --- Auth State Listener ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
        setCurrentUserData(null); // Clear user data if logged out
      }
      // No need to set loadingInitialData here directly,
      // as the subsequent useEffect for fetching user data will handle it.
    });

    return () => unsubscribeAuth(); // Cleanup auth listener
  }, []); // Runs once on mount

  // --- Fetch Current User Data from Firestore ---
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!currentUserId) {
        // If no user is logged in, or logout happened
        setCurrentUserData(null);
        setLoadingInitialData(false); // Done loading user data (or lack thereof)
        return;
      }

      setLoadingInitialData(true); // Indicate that user data is being fetched
      try {
        const userDocRef = doc(db, 'users', currentUserId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data() as User;
          setCurrentUserData(userData);
        } else {
          console.warn(`User document not found in Firestore for UID: ${currentUserId}. Please ensure the user's profile exists.`);
          setCurrentUserData(null); // User document missing
          // You might want to redirect to a profile creation screen or show an error
        }
      } catch (error) {
        console.error("Error fetching current user data:", error);
        Alert.alert("Error", "Failed to load your profile data. Please try again.");
        setCurrentUserData(null);
      } finally {
        setLoadingInitialData(false); // Finished fetching user data
      }
    };

    fetchCurrentUser();
  }, [currentUserId]); // Re-run when currentUserId changes

  // --- Real-time Message Listener ---
  useEffect(() => {
    // Only fetch messages if the current user data has been loaded (or confirmed null)
    if (loadingInitialData) return;

    const q = query(collection(db, 'forumMessages'), orderBy('createdAt', 'asc'));

    const unsubscribeMessages = onSnapshot(q, async (snapshot) => {
      const fetchedMessages: ForumMessage[] = [];
      const userPromises: Promise<void>[] = [];
      const userCache = new Map<string, User>(); // Cache fetched user data to avoid redundant reads

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const messageId = docSnapshot.id;
        const senderId = data.senderId;

        let senderName = data.senderName || 'Unknown User';
        let senderAvatar = data.senderAvatar || 'https://placehold.co/40x40/CCCCCC/FFFFFF?text=?';
        let senderRole: User['role'] = 'Unknown';

        // Use a cache to avoid re-fetching user data for the same sender
        if (userCache.has(senderId)) {
          const cachedUser = userCache.get(senderId)!;
          senderName = cachedUser.name;
          senderAvatar = cachedUser.avatar || senderAvatar;
          senderRole = cachedUser.role;
        } else {
          // Fetch sender's current data from 'users' collection for up-to-date info
          userPromises.push(
            (async () => {
              try {
                const userDocRef = doc(db, 'users', senderId);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                  const userData = userDocSnap.data() as User;
                  userCache.set(senderId, userData); // Cache the data
                  senderName = userData.name;
                  senderAvatar = userData.avatar || senderAvatar;
                  senderRole = userData.role;
                } else {
                  console.warn(`User document for senderId ${senderId} not found.`);
                }
              } catch (error) {
                console.error(`Error fetching user data for ${senderId}:`, error);
              }
              // Push message after potential user data update
              fetchedMessages.push({
                id: messageId,
                text: data.text,
                senderId: senderId,
                senderName: senderName,
                senderAvatar: senderAvatar,
                timestamp: formatTimestamp(data.createdAt?.toDate ? data.createdAt.toDate() : new Date()),
                createdAt: data.createdAt,
                senderRole: senderRole,
              });
            })()
          );
        }
      }

      await Promise.all(userPromises); // Wait for all user data to be fetched
      // Sort messages by createdAt timestamp after all user data is ready
      fetchedMessages.sort((a, b) => (a.createdAt as Timestamp).toDate().getTime() - (b.createdAt as Timestamp).toDate().getTime());
      setMessages(fetchedMessages);
    }, (error) => {
      console.error("Error fetching messages:", error);
      Alert.alert("Error", "Failed to load forum messages. Please try again later.");
    });

    return () => unsubscribeMessages(); // Cleanup messages listener
  }, [loadingInitialData]); // Depend on loadingInitialData to ensure user data is ready

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
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      return "Invalid Date";
    }
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  }, []);

  const handleSend = useCallback(async () => {
    if (inputText.trim() && currentUserId && currentUserData) {
      try {
        await addDoc(collection(db, 'forumMessages'), {
          text: inputText.trim(),
          senderId: currentUserId,
          senderName: currentUserData.name,
          senderAvatar: currentUserData.avatar || 'https://placehold.co/40x40/CCCCCC/FFFFFF?text=?',
          createdAt: serverTimestamp(), // Firebase server timestamp
        });
        setInputText('');
      } catch (error) {
        console.error("Error sending message:", error);
        Alert.alert("Error", "Failed to send message. Please try again.");
      }
    } else if (!currentUserId) {
      Alert.alert("Authentication Required", "Please log in to send messages.");
    } else if (!currentUserData) {
      Alert.alert("Profile Missing", "Your user profile is incomplete. Please complete your profile to send messages.");
    }
  }, [inputText, currentUserId, currentUserData]);

  // --- Admin Moderation Actions ---

  const handleDeleteMessage = useCallback((messageId: string) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'forumMessages', messageId));
              console.log(`Message ${messageId} deleted from Firestore.`);
            } catch (error) {
              console.error("Error deleting message:", error);
              Alert.alert("Error", "Failed to delete message. Please try again.");
            }
          },
          style: 'destructive',
        },
      ]
    );
  }, []);

  const handleEditMessage = useCallback((message: ForumMessage) => {
    Alert.prompt(
      'Edit Message',
      'Enter new message text:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (newText) => {
            if (newText && newText.trim()) {
              try {
                const messageRef = doc(db, 'forumMessages', message.id);
                await updateDoc(messageRef, {
                  text: newText.trim(),
                  // Optionally add a 'lastEdited' timestamp if needed
                });
                console.log(`Message ${message.id} updated in Firestore.`);
              } catch (error) {
                console.error("Error updating message:", error);
                Alert.alert("Error", "Failed to update message. Please try again.");
              }
            }
          },
        },
      ],
      'plain-text',
      message.text
    );
  }, []);

  const handleReportUser = useCallback((userId: string, userName: string) => {
    console.log('Report user:', userName);
    Alert.alert('Report User', `Functionality to report user "${userName}" not implemented in backend.`);
    // In a real app, this would typically involve adding a document to a 'reports' collection
    // or calling a Firebase Cloud Function.
  }, []);

  const handleMuteBanUser = useCallback((userId: string, userName: string) => {
    console.log('Mute/Ban user:', userName);
    Alert.alert('Mute/Ban User', `Functionality to mute/ban user "${userName}" not implemented in backend.`);
    // In a real app, this would update the user's status in the 'users' collection
    // and might trigger a Cloud Function to enforce the mute/ban.
  }, []);

  const getRoleBadgeStyle = useCallback((role: User['role']): ViewStyle => {
    switch (role) {
      case 'Admin': return styles.roleBadgeAdmin;
      case 'Other Admin': return styles.roleBadgeOtherAdmin;
      case 'Coach': return styles.roleBadgeCoach;
      case 'Player': return styles.roleBadgePlayer;
      case 'Supporter': return styles.roleBadgeSupporter;
      case 'Fan': return styles.roleBadgeFan;
      case 'Unknown': return {};
      default: return {};
    }
  }, []);

  // Determine if the current logged-in user can moderate
  const canModerate = useMemo(() => {
    return currentUserData?.role === 'Admin' || currentUserData?.role === 'Other Admin';
  }, [currentUserData]);


  const renderMessage = useCallback(({ item }: { item: ForumMessage }) => {
    const isCurrentUser = item.senderId === currentUserId;

    // Determine the sender's role for display
    const senderRole = item.senderRole || 'Unknown';

    const moderationActions: AlertButton[] = [];

    // Allow edit/delete if the current user is a moderator OR the sender of the message
    if (canModerate || isCurrentUser) {
        moderationActions.push({ text: 'Edit Message', onPress: () => handleEditMessage(item) });
        moderationActions.push({ text: 'Delete Message', onPress: () => handleDeleteMessage(item.id), style: 'destructive' });
    }

    // Allow Admins/Other Admins to report other users
    if (canModerate && !isCurrentUser) {
        moderationActions.push({ text: 'Report User', onPress: () => handleReportUser(item.senderId, item.senderName) });
    }

    // Only 'Admin' role can mute/ban other users
    if (currentUserData?.role === 'Admin' && !isCurrentUser) {
      moderationActions.push({ text: 'Mute/Ban User', onPress: () => handleMuteBanUser(item.senderId, item.senderName), style: 'destructive' });
    }

    // Add the Cancel button if there are any other actions present
    if (moderationActions.length > 0) {
        moderationActions.push({ text: 'Cancel', style: 'cancel' });
    }

    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessageContainer : styles.otherUserMessageContainer,
      ]}>
        <Image
          source={{ uri: item.senderAvatar || 'https://placehold.co/40x40/CCCCCC/FFFFFF?text=?' }}
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
            {senderRole !== 'Unknown' && (
              <View style={[
                styles.roleBadge,
                getRoleBadgeStyle(senderRole),
              ]}>
                <Text style={styles.roleBadgeText}>{senderRole}</Text>
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

        {/* Moderation Options Button (only show if there are actual actions available) */}
        {moderationActions.length > 1 && ( // > 1 because 'Cancel' is always an action if others exist
          <TouchableOpacity
            style={[
              styles.moderationOptionsButton,
              isCurrentUser ? styles.currentUserModerationButton : styles.otherUserModerationButton,
            ]}
            onPress={() => Alert.alert(
              'Moderation Actions',
              `Actions for message by ${item.senderName}`,
              moderationActions
            )}
          >
            <Entypo name="dots-three-vertical" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>
    );
  }, [currentUserId, currentUserData, canModerate, getRoleBadgeStyle, handleDeleteMessage, handleEditMessage, handleReportUser, handleMuteBanUser]);

  // --- Main Render Logic ---
  if (loadingInitialData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6633FF" />
        <Text style={styles.loadingText}>Loading forum...</Text>
      </View>
    );
  }

  if (!currentUserId || !currentUserData) {
    return (
      <View style={styles.authRequiredContainer}>
        <MaterialIcons name="lock" size={60} color="#ccc" />
        <Text style={styles.authRequiredText}>Authentication Required</Text>
        <Text style={styles.authRequiredSubText}>Please log in to participate in the forum.</Text>
        {/* You might add a button to navigate to a login screen here */}
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push('./../auth/Login')} // Adjust path to your login screen
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      {/* Header with Logo, Title, and Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('./../admin/Dashboard')}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Image
          source={require('../../../assets/images/logo.jpeg')}
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
          inverted={false}
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
          editable={!!currentUserData} // Disable input if no user data
        />
        <TouchableOpacity style={styles.inputIcon}>
          <MaterialIcons name="image" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={!currentUserData}>
          <MaterialIcons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6633FF',
  },
  authRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  authRequiredText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
  },
  authRequiredSubText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#6633FF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: 50,
    zIndex: 10,
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
    fontSize: 18,
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
  messageListContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  currentUserMessageContainer: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
  },
  otherUserMessageContainer: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ddd',
  },
  currentUserAvatar: {
    marginLeft: 8,
  },
  otherUserAvatar: {
    marginRight: 8,
  },
  messageContent: {
    flexDirection: 'column',
    maxWidth: '75%',
  },
  senderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  currentUserSenderHeader: {
    justifyContent: 'flex-end',
    marginRight: 5,
  },
  otherUserSenderHeader: {
    justifyContent: 'flex-start',
    marginLeft: 5,
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
    backgroundColor: '#6633FF',
    borderBottomRightRadius: 2,
  },
  otherUserBubble: {
    backgroundColor: '#e0e0e0',
    borderBottomLeftRadius: 2,
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
    alignSelf: 'flex-end',
    marginRight: 5,
  },
  otherUserTimestamp: {
    alignSelf: 'flex-start',
    marginLeft: 5,
  },
  moderationOptionsButton: {
    padding: 5,
    alignSelf: 'flex-start',
  },
  currentUserModerationButton: {
    marginLeft: 5,
  },
  otherUserModerationButton: {
    marginRight: 5,
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
    minHeight: height * 0.5,
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
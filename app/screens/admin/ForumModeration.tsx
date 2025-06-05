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
  ActivityIndicator // Import ActivityIndicator for loading state
} from 'react-native';

// Import Firebase
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
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth'; // Import onAuthStateChanged
import { db, auth } from '../../../firebase/firebase'; // Ensure auth is imported

const { width, height } = Dimensions.get('window');

// Define message types for the forum
type ForumMessage = {
  id: string; // Document ID from Firestore
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: string; // This will be formatted from a Firebase Timestamp
  createdAt: any; // Firebase Timestamp
  senderRole?: User['role']; // Add senderRole here for rendering
};

// Define a User type for clarity
type User = {
  uid: string; // Firebase Auth UID
  name: string;
  avatar: string;
  role: 'Admin' | 'Other Admin' | 'Coach' | 'Player' | 'Supporter' | 'Fan' | 'Unknown';
  email: string;
  createdAt: any; // Firebase Timestamp or Date
};

const ForumModeration = () => {
  const router = useRouter();
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const flatListRef = useRef<FlatList<ForumMessage>>(null);

  // State for the currently logged-in user's AUTH UID
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  // State to hold current user's profile data from Firestore
  const [currentUserData, setCurrentUserData] = useState<User | null>(null);
  // State to manage loading of initial user data
  const [loadingInitialData, setLoadingInitialData] = useState(true);

  // --- 1. Listen for Firebase Auth State Changes ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      console.log("ForumModeration: Auth State Changed. User UID:", user?.uid || "Logged out");
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
        setCurrentUserData(null); // Clear user data if logged out
        setLoadingInitialData(false); // No user, so initial data is "loaded" (as null)
      }
    });

    return () => unsubscribeAuth(); // Cleanup auth listener
  }, []);

  // --- 2. Fetch Current User Data from Firestore when currentUserId changes ---
  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      if (!currentUserId) {
        // If no user is logged in, or currentUserId is null, we're done loading this part
        setCurrentUserData(null); // Ensure currentUserData is null
        setLoadingInitialData(false);
        console.log("ForumModeration: No current user ID to fetch profile for.");
        return;
      }

      setLoadingInitialData(true); // Start loading user profile
      try {
        const userDocRef = doc(db, 'users', currentUserId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = { id: userDocSnap.id, ...userDocSnap.data() } as User; // Cast to User
          setCurrentUserData(userData);
          console.log("ForumModeration: User profile loaded for UID:", currentUserId, "Data:", userData);
        } else {
          console.warn(`ForumModeration: User document not found in Firestore for UID: ${currentUserId}. Creating a placeholder or prompting signup/profile completion.`);
          // IMPORTANT: If a user logs in but doesn't have a profile, create a default
          // This ensures they can interact if your rules allow defaults.
          // This part should ideally be handled during SIGNUP, but as a fallback:
          const defaultUser: User = {
            uid: currentUserId,
            name: "New User", // Or prompt for name
            email: auth.currentUser?.email || "",
            avatar: `https://placehold.co/40x40/6633FF/FFFFFF?text=${auth.currentUser?.email?.substring(0,1).toUpperCase() || '?' }`,
            role: 'Fan', // Default role for new users without a full profile
            createdAt: serverTimestamp(),
          };
          await setDoc(userDocRef, defaultUser);
          setCurrentUserData(defaultUser);
          console.log("ForumModeration: Default user profile created for UID:", currentUserId);
          Alert.alert("Welcome!", "A basic profile has been created for you. You can now send messages!");
        }
      } catch (error) {
        console.error("ForumModeration: Error fetching current user data:", error);
        setCurrentUserData(null); // Clear data on error
        Alert.alert("Error", "Failed to load your profile data. Please try again or contact support.");
      } finally {
        setLoadingInitialData(false); // End loading user profile
      }
    };

    fetchCurrentUserProfile();
  }, [currentUserId]); // Re-run when currentUserId changes

  // --- Real-time message listener (adjusted to fetch sender roles) ---
  useEffect(() => {
    const q = query(collection(db, 'forumMessages'), orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const fetchedMessages: ForumMessage[] = [];
      const userPromises: Promise<void>[] = [];
      const userDataCache: { [key: string]: User } = {}; // Cache to avoid redundant fetches

      for (const docSnapshot of snapshot.docs) {
        const data = docSnapshot.data();
        const senderId = data.senderId;

        let senderName = data.senderName || 'Unknown User';
        let senderAvatar = data.senderAvatar || 'https://placehold.co/40x40/CCCCCC/FFFFFF?text=?';
        let senderRole: User['role'] = 'Unknown';

        // Check cache first
        if (userDataCache[senderId]) {
          const cachedUser = userDataCache[senderId];
          senderName = cachedUser.name;
          senderAvatar = cachedUser.avatar || senderAvatar;
          senderRole = cachedUser.role;
        } else {
          // If not in cache, fetch user data and add to cache
          userPromises.push((async () => {
            try {
              const userDocRef = doc(db, 'users', senderId);
              const userDocSnap = await getDoc(userDocRef);
              if (userDocSnap.exists()) {
                const userData = userDocSnap.data() as User;
                userDataCache[senderId] = userData; // Store in cache
                senderName = userData.name;
                senderAvatar = userData.avatar || senderAvatar;
                senderRole = userData.role;
              } else {
                console.warn(`User document for senderId ${senderId} not found.`);
              }
            } catch (error) {
              console.error(`Error fetching user data for ${senderId}:`, error);
            }
          })());
        }

        fetchedMessages.push({
          id: docSnapshot.id,
          text: data.text,
          senderId: data.senderId,
          senderName: senderName, // Placeholder for now, updated after promises resolve
          senderAvatar: senderAvatar, // Placeholder for now, updated after promises resolve
          timestamp: formatTimestamp(data.createdAt?.toDate ? data.createdAt.toDate() : new Date()),
          createdAt: data.createdAt,
          senderRole: senderRole, // Placeholder for now, updated after promises resolve
        });
      }

      await Promise.all(userPromises); // Wait for all user data fetches to complete

      // Now, update messages with the fetched (or cached) sender details
      const finalMessages = fetchedMessages.map(msg => {
        const cachedUser = userDataCache[msg.senderId];
        if (cachedUser) {
          return {
            ...msg,
            senderName: cachedUser.name,
            senderAvatar: cachedUser.avatar || msg.senderAvatar,
            senderRole: cachedUser.role,
          };
        }
        return msg; // Return as is if user data wasn't found
      });
      setMessages(finalMessages);
    }, (error) => {
      console.error("Error fetching messages:", error);
      Alert.alert("Error", "Failed to load forum messages. Please try again later.");
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, [formatTimestamp]); // Add formatTimestamp to dependency array

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const filteredMessages = useMemo(() => {
    return messages.filter(message =>
      message.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.senderName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messages, searchQuery]);

  const formatTimestamp = useCallback((date: Date) => {
    if (!(date instanceof Date)) {
      console.warn("Invalid date object passed to formatTimestamp:", date);
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
    // Only allow sending if there's text, user is logged in, and user data is loaded
    if (inputText.trim() && currentUserId && currentUserData) {
      try {
        await addDoc(collection(db, 'forumMessages'), {
          text: inputText.trim(),
          senderId: currentUserId,
          senderName: currentUserData.name,
          senderAvatar: currentUserData.avatar || 'https://placehold.co/40x40/CCCCCC/FFFFFF?text=?',
          createdAt: serverTimestamp(),
        });
        setInputText('');
      } catch (error) {
        console.error("Error sending message:", error);
        Alert.alert("Error", "Failed to send message. Please try again.");
      }
    } else if (!currentUserId) {
      Alert.alert("Authentication Required", "Please log in to send messages.");
    } else if (!currentUserData) {
      Alert.alert("Profile Missing", "Your user profile is incomplete. Cannot send message.");
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
  }, []);

  const handleMuteBanUser = useCallback((userId: string, userName: string) => {
    console.log('Mute/Ban user:', userName);
    Alert.alert('Mute/Ban User', `Functionality to mute/ban user "${userName}" not implemented in backend.`);
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
    const isCurrentUser = item.senderId === currentUserId; // Use currentUserId state
    const senderRole = item.senderRole || 'Unknown'; // Ensure senderRole is accessible

    const moderationActions: AlertButton[] = [];

    // Only allow edit/delete if the current user is an admin/other admin OR the sender of the message
    if ((canModerate || isCurrentUser) && (item.senderId === currentUserId || canModerate)) {
        moderationActions.push({ text: 'Edit Message', onPress: () => handleEditMessage(item) });
        moderationActions.push({ text: 'Delete Message', onPress: () => handleDeleteMessage(item.id), style: 'destructive' });
    }

    if (canModerate && !isCurrentUser) {
        moderationActions.push({ text: 'Report User', onPress: () => handleReportUser(item.senderId, item.senderName) });
    }

    if (currentUserData?.role === 'Admin' && !isCurrentUser) {
      moderationActions.push({ text: 'Mute/Ban User', onPress: () => handleMuteBanUser(item.senderId, item.senderName), style: 'destructive' });
    }

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

        {/* Moderation Options Button (only if actions are available) */}
        {moderationActions.length > 1 && ( // >1 because 'Cancel' is always there if other actions exist
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
  }, [canModerate, currentUserId, currentUserData, getRoleBadgeStyle, handleDeleteMessage, handleEditMessage, handleReportUser, handleMuteBanUser]);


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      {/* Header with Logo, Title, and Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('./../admin/Dashboard')} // Adjust navigation target as needed
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

      <TextInput
        style={styles.searchBar}
        placeholder="Search forum messages..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Conditional rendering for messages or empty state */}
      {loadingInitialData ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6633FF" />
          <Text style={styles.loadingText}>Loading forum...</Text>
        </View>
      ) : filteredMessages.length === 0 && searchQuery.length > 0 ? (
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

      {/* Input container - disabled if not authenticated or data loading */}
      <View style={[
        styles.inputContainer,
        (!currentUserId || !currentUserData || loadingInitialData) && { opacity: 0.6 } // Dim if not ready
      ]}>
        <TouchableOpacity style={styles.inputIcon} disabled={!currentUserId || !currentUserData || loadingInitialData}>
          <Entypo name="emoji-happy" size={24} color="#888" />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder={
            loadingInitialData
              ? "Loading user data..."
              : !currentUserId
                ? "Please log in to send messages"
                : !currentUserData
                  ? "Your profile is missing. Cannot send."
                  : "Type your message..."
          }
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={setInputText}
          multiline
          editable={!!currentUserId && !!currentUserData && !loadingInitialData} // Only editable if user and data are ready
        />
        <TouchableOpacity style={styles.inputIcon} disabled={!currentUserId || !currentUserData || loadingInitialData}>
          <MaterialIcons name="image" size={24} color="#888" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={!currentUserId || !currentUserData || loadingInitialData || !inputText.trim()} // Disable if not ready or no text
        >
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
    padding: 20,
    minHeight: height * 0.5,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
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
    backgroundColor: '#007AFF', // Example color
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
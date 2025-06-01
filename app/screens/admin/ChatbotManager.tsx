import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons'; // Added Ionicons for empty state icon
import { LinearGradient } from 'expo-linear-gradient'; // Assuming LinearGradient is used for header
import { useRouter } from 'expo-router'; // Import useRouter for navigation
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
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

const { width, height } = Dimensions.get('window');

// Define message types
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: number; // Storing as Unix timestamp for easier comparison
};

// Dummy assistant avatar
const ASSISTANT_AVATAR = 'https://placehold.co/40x40/CCCCCC/000000?text=AI'; // Placeholder for assistant avatar

const ChatBotManager = () => {
  const router = useRouter(); // Initialize router for navigation

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: 'Hello, how are you doing?', sender: 'user', timestamp: Date.now() - (1000 * 60 * 10) }, // 10 mins ago
    { id: '2', text: "I'm doing well, thank you! How can I help you today?", sender: 'assistant', timestamp: Date.now() - (1000 * 60 * 9) }, // 9 mins ago
    { id: '3', text: 'I have a question about the return policy for a product I purchased.', sender: 'user', timestamp: Date.now() - (1000 * 60 * 2) }, // 2 mins ago
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false); // State for assistant typing indicator
  const flatListRef = useRef<FlatList>(null);
  const sendButtonScale = useRef(new Animated.Value(1)).current; // Animation for send button


  // Scroll to the bottom of the chat when messages update
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  /**
   * Formats a Unix timestamp into a relative time string (e.g., "Just Now", "5 min ago", "Yesterday").
   * @param timestamp The Unix timestamp to format.
   * @returns Formatted time string.
   */
  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return "Just Now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;

    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  /**
   * Handles sending a user message and triggering an assistant response.
   */
  const handleSend = async () => {
    if (inputText.trim()) {
      // Animate send button press
      Animated.sequence([
        Animated.timing(sendButtonScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
        Animated.timing(sendButtonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();

      const newUserMessage: Message = {
        id: `user-${Date.now()}`, // More robust ID than just Date.now() alone
        text: inputText.trim(),
        sender: 'user',
        timestamp: Date.now(),
      };
      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      setInputText('');

      // Simulate assistant typing and response
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 1000)); // Simulate typing delay (1-2 seconds)

      const assistantResponses = [
        "I'm processing your request. Please wait a moment.",
        "Understood. Let me look into that for you.",
        "Thank you for the information. I'm formulating a response.",
        "One moment, please. I'm retrieving the relevant data.",
        "Got it! I'll get back to you shortly.",
      ];
      const randomResponse = assistantResponses[Math.floor(Math.random() * assistantResponses.length)];

      const assistantMessage: Message = {
        id: `assistant-${Date.now() + 1}`, // Ensure unique ID for assistant message
        text: randomResponse,
        sender: 'assistant',
        timestamp: Date.now(),
      };
      setIsTyping(false);
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    }
  };

  /**
   * Component for Assistant Typing Indicator (animated dots).
   */
  const TypingIndicator = () => {
    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    const animateDot = (dot: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            delay: delay,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.2, // Fade out slightly
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    useEffect(() => {
      animateDot(dot1, 0);
      animateDot(dot2, 150);
      animateDot(dot3, 300);
      return () => {
        // Stop animations on unmount
        dot1.stopAnimation();
        dot2.stopAnimation();
        dot3.stopAnimation();
      };
    }, []);

    return (
      <View style={styles.typingIndicatorContainer}>
        <Animated.View style={[styles.typingDot, { opacity: dot1 }]} />
        <Animated.View style={[styles.typingDot, { opacity: dot2 }]} />
        <Animated.View style={[styles.typingDot, { opacity: dot3 }]} />
      </View>
    );
  };

  /**
   * Renders a single message item in the FlatList.
   * @param item The Message object to render.
   */
  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessageContainer : styles.assistantMessageContainer,
    ]}>
      {item.sender === 'assistant' && (
        <Image source={{ uri: ASSISTANT_AVATAR }} style={styles.avatar} />
      )}
      <View style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.assistantBubble,
      ]}>
        <Text style={item.sender === 'user' ? styles.userText : styles.assistantText}>
          {item.text}
        </Text>
      </View>
      <Text style={[
        styles.timestamp,
        item.sender === 'user' ? styles.userTimestamp : styles.assistantTimestamp,
      ]}>
        {formatTimeAgo(item.timestamp)}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} // Adjust as needed
    >
      {/* Header with Back Button and Logo */}
      <LinearGradient
        colors={['#4A90E2', '#283593']} // Gradient from bright blue to dark purple-blue
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.push('../admin/Dashboard')} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Image
          source={require('../../../assets/images/logo.jpeg')} // Updated path for consistency
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Chat with AI</Text>
        <View style={styles.backButtonPlaceholder} /> {/* Placeholder to balance back button */}
      </LinearGradient>

      {/* Message List */}
      {messages.length === 0 ? (
        <View style={styles.emptyChatContainer}>
          <Ionicons name="chatbox-ellipses-outline" size={80} color="#ccc" />
          <Text style={styles.emptyChatText}>Start a conversation with our AI assistant!</Text>
          <Text style={styles.emptyChatSubText}>Ask about rules, events, or anything hockey-related.</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messageListContent}
        />
      )}

      {/* Assistant Typing Indicator */}
      {isTyping && (
        <View style={styles.assistantTypingRow}>
          <Image source={{ uri: ASSISTANT_AVATAR }} style={styles.avatar} />
          <View style={styles.assistantBubble}>
            <TypingIndicator />
          </View>
        </View>
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.inputIcon}>
          <Entypo name="emoji-happy" size={24} color="#888" />
        </TouchableOpacity>
        <TextInput
          style={styles.textInput} // maxHeight is now correctly inside style
          placeholder="Reply ..."
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxHeight={100} // Prevent input from growing too large
        />
        <TouchableOpacity style={styles.inputIcon}>
          <MaterialIcons name="image" size={24} color="#888" />
        </TouchableOpacity>
        <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
          <TouchableOpacity
            style={[styles.sendButton, inputText.trim().length === 0 && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={inputText.trim().length === 0}
          >
            <MaterialIcons name="send" size={24} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15, // Increased padding for gradient effect
    paddingHorizontal: 15,
    // Removed backgroundColor and shadow, replaced by LinearGradient
  },
  backButton: {
    padding: 5,
  },
  backButtonPlaceholder: {
    width: 34, // To balance the back button
    height: 34,
  },
  headerLogo: {
    width: 50, // Smaller logo for the header
    height: 50,
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff', // White text for gradient header
    flex: 1, // Allow title to take available space
    textAlign: 'center',
  },
  messageListContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  messageContainer: {
    flexDirection: 'column',
    marginBottom: 10,
    maxWidth: '80%', // Limit message bubble width
  },
  userMessageContainer: {
    alignSelf: 'flex-end', // Align user messages to the right
    alignItems: 'flex-end', // Align timestamp to the right of user bubble
  },
  assistantMessageContainer: {
    alignSelf: 'flex-start', // Align assistant messages to the left
    flexDirection: 'row', // For avatar and bubble side-by-side
    alignItems: 'flex-start',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    backgroundColor: '#ddd', // Placeholder background for avatar
    borderWidth: 1,
    borderColor: '#eee',
  },
  messageBubble: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15, // Increased shadow for depth
    shadowRadius: 3,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#6633FF', // Blue for user messages
    borderBottomRightRadius: 5, // Sharper corner at the bottom right
  },
  assistantBubble: {
    backgroundColor: '#e0e0e0', // Gray for assistant messages
    borderBottomLeftRadius: 5, // Sharper corner at the bottom left
  },
  userText: {
    color: '#fff',
    fontSize: 16,
  },
  assistantText: {
    color: '#333',
    fontSize: 16,
  },
  timestamp: {
    fontSize: 11,
    color: '#888',
  },
  userTimestamp: {
    alignSelf: 'flex-end', // Align user timestamp to the right
    marginRight: 10, // Small margin to align with bubble
  },
  assistantTimestamp: {
    alignSelf: 'flex-start', // Align assistant timestamp to the left
    marginLeft: 40, // Margin to align with bubble (avatar width + margin)
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
    backgroundColor: '#f8f8f8', // Slightly different background for input
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8, // Adjust vertical padding for better look
    fontSize: 16,
    color: '#333',
    marginHorizontal: 8,
    maxHeight: 100, // Prevent input from growing too large
    borderWidth: 1,
    borderColor: '#e0e0e0', // Subtle border
  },
  inputIcon: {
    padding: 5,
  },
  sendButton: {
    backgroundColor: '#6633FF', // Blue send button
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#A0A0A0', // Grey when disabled
  },
  assistantTypingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginLeft: 15,
    marginBottom: 10,
  },
  typingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#888',
    marginHorizontal: 2,
  },
  emptyChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: height * 0.1, // Push content up slightly
  },
  emptyChatText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 28,
  },
  emptyChatSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default ChatBotManager;

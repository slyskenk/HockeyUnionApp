import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated, // ADDED: Import ActivityIndicator
  Dimensions,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Import Gemini API functions and ChatSession type
import { ChatSession } from '@google/generative-ai';
import { sendMessageInChat, startNewGeminiChatSession } from '../../../services/geminiService'; // Adjust path if needed

const { width, height } = Dimensions.get('window');

// Define message types
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'assistant'; // Using 'assistant' for consistency with ChatBotManager
  timestamp: number;
};

// Dummy assistant avatar (adjust color/style for supporter theme if desired)
const ASSISTANT_AVATAR = 'https://placehold.co/40x40/2563EB/FFFFFF?text=AI'; // Blue for supporter AI

const FanChatbot = () => { // Changed component name to FanChatbot
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const sendButtonScale = useRef(new Animated.Value(1)).current;

  // --- Initialize Chat Session on Component Mount ---
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Start a new Gemini chat session specifically for 'supporter'
        // FIX 1: 'supporter' argument is now expected by the updated geminiService.ts
        const session = await startNewGeminiChatSession('supporter');
        setChatSession(session);
        // Add an initial welcome message from the AI
        setMessages([
          {
            id: 'welcome-ai',
            text: "Hi there! I'm your HockeyUnion AI. Ask me anything about Namibian hockey, international events, coaching tips, player advice, or general hockey info!",
            sender: 'assistant',
            timestamp: Date.now(),
          },
        ]);
        setChatError(null);
      } catch (error) {
        console.error("Failed to start Gemini chat session for supporters:", error);
        setChatError("Failed to connect to the Hockey AI. Please check your internet connection or API key.");
      }
    };
    initializeChat();
  }, []);

  // Scroll to the bottom of the chat when messages update
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, isTyping]); // Also scroll when typing indicator appears/disappears

  /**
   * Formats a Unix timestamp into a relative time string.
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
   * Handles sending a user message and getting an assistant response from Gemini.
   * @param messageText Optional text to send, used for quick prompts.
   */
  const handleSend = async (messageText?: string) => { // Added optional messageText for quick prompts
    const textToSend = messageText || inputText.trim();

    if (!textToSend || !chatSession) {
      return;
    }

    // Animate send button press
    Animated.sequence([
      Animated.timing(sendButtonScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.timing(sendButtonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: textToSend,
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInputText('');
    setIsTyping(true);
    setChatError(null);

    try {
      const aiResponseText = await sendMessageInChat(chatSession, userMessage.text);

      const assistantMessage: Message = {
        id: `assistant-${Date.now() + 1}`,
        text: aiResponseText,
        sender: 'assistant',
        timestamp: Date.now(),
      };
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error("Gemini API error during send (Supporter Chat):", error);
      setChatError("Sorry, I'm having trouble connecting right now. Please try again.");
      setMessages(prevMessages => [...prevMessages, {
        id: `error-${Date.now()}`,
        text: "I couldn't get a response from the AI. Please try again or check your connection.",
        sender: 'assistant',
        timestamp: Date.now(),
      }]);
    } finally {
      setIsTyping(false);
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
            toValue: 0.2,
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

  const quickPrompts = [
    "Tell me about Namibian hockey.",
    "What are the main FIH tournaments?",
    "Tips for improving shooting accuracy.",
    "How to manage team motivation?",
    "History of field hockey?",
    "What is the current FIH ranking for Namibia?",
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      {/* Gradient Header - Blue theme for supporter */}
      <LinearGradient
        colors={['#2563EB', '#004080']} // Supporter-centric gradient (blue tones)
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
        <Text style={styles.headerTitle}>HockeyUnion AI</Text>
        <View style={styles.backButtonPlaceholder} />
      </LinearGradient>

      {/* Message List / Empty State / Error State */}
      {chatError ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={50} color="#FF6347" />
          <Text style={styles.errorText}>{chatError}</Text>
          <Text style={styles.errorSubText}>Please ensure your Gemini API key is correct and you have an internet connection.</Text>
        </View>
      ) : messages.length === 0 && !chatSession ? (
        <View style={styles.loadingChatContainer}>
          <Ionicons name="chatbubbles-outline" size={80} color="#ccc" />
          <Text style={styles.loadingChatText}>Initializing HockeyUnion AI...</Text>
          <Text style={styles.loadingChatSubText}>This may take a moment.</Text>
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 20 }} /> {/* ADDED: ActivityIndicator */}
        </View>
      ) : (
        <>
          {messages.length === 1 && messages[0].id === 'welcome-ai' && ( // Show quick prompts only on initial welcome
            <View style={styles.quickPromptsWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickPromptsContainer}>
                {quickPrompts.map((prompt, index) => (
                  <TouchableOpacity key={index} style={styles.quickPromptButton} onPress={() => handleSend(prompt)}>
                    <Text style={styles.quickPromptText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageListContent}
          />
        </>
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
          <Ionicons name="happy-outline" size={24} color="#888" /> {/* Changed from Entypo for consistency */}
        </TouchableOpacity>
        <TextInput
          style={styles.textInput}
          placeholder={chatSession ? "Ask about hockey..." : "Connecting to AI..."}
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={setInputText}
          multiline
          // REMOVED: maxHeight={100} - it's already in styles.textInput
          editable={!!chatSession && !isTyping}
        />
        <TouchableOpacity style={styles.inputIcon}>
          <MaterialIcons name="image" size={24} color="#888" />
        </TouchableOpacity>
        <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
          <TouchableOpacity
            style={[styles.sendButton, (!chatSession || isTyping || inputText.trim().length === 0) && styles.sendButtonDisabled]}
            onPress={() => handleSend()} // Call handleSend
            disabled={!chatSession || isTyping || inputText.trim().length === 0}
          >
            <Ionicons name="send" size={24} color="#fff" /> {/* Changed from MaterialIcons for consistency */}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 15,
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
  },
  backButtonPlaceholder: {
    width: 34,
    height: 34,
  },
  headerLogo: {
    width: 50,
    height: 50,
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  messageListContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexGrow: 1,
  },
  messageContainer: {
    flexDirection: 'column',
    marginBottom: 10,
    maxWidth: '80%',
  },
  userMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    backgroundColor: '#ddd',
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
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#2563EB', // Supporter user bubble color (blue)
    borderBottomRightRadius: 5,
  },
  assistantBubble: {
    backgroundColor: '#e0e0e0',
    borderBottomLeftRadius: 5,
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
    alignSelf: 'flex-end',
    marginRight: 10,
  },
  assistantTimestamp: {
    alignSelf: 'flex-start',
    marginLeft: 40,
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
    backgroundColor: '#f8f8f8',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    color: '#333',
    marginHorizontal: 8,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  inputIcon: {
    padding: 5,
  },
  sendButton: {
    backgroundColor: '#2563EB', // Supporter send button color (blue)
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#A0A0A0',
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
  // Empty/Loading/Error States (consistent naming)
  loadingChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: height * 0.1,
  },
  loadingChatText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 28,
  },
  loadingChatSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#FFEEEE',
    borderRadius: 10,
    margin: 20,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6347',
    textAlign: 'center',
    marginTop: 15,
  },
  errorSubText: {
    fontSize: 14,
    color: '#FF6347',
    textAlign: 'center',
    marginTop: 10,
  },
  // Quick Prompts
  quickPromptsWrapper: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f0f2f5',
  },
  quickPromptsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 10,
  },
  quickPromptButton: {
    backgroundColor: '#E0F2FF', // Light blue
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#2563EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickPromptText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
});

export default FanChatbot;
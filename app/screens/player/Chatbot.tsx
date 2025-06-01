// app/player/Chatbot.tsx
import { Entypo, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
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

const { width, height } = Dimensions.get('window');

// --- Types ---
type Message = {
  id: string;
  text: string;
  sender: 'user' | 'player_assistant'; // Changed sender type
  timestamp: number; // Storing as Unix timestamp
};

// Dummy player assistant avatar
const PLAYER_ASSISTANT_AVATAR = 'https://placehold.co/40x40/8A2BE2/FFFFFF?text=AI'; // Player-centric purple for AI

const Chatbot = () => { // Component name changed to Chatbot
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]); // Start with empty messages
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const sendButtonScale = useRef(new Animated.Value(1)).current;

  // Scroll to the bottom of the chat when messages update
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  /**
   * Formats a Unix timestamp into a relative time string.
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
   * @param messageText Optional text to send, used for quick prompts.
   */
  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || inputText.trim();

    if (textToSend) {
      // Animate send button press
      Animated.sequence([
        Animated.timing(sendButtonScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
        Animated.timing(sendButtonScale, { toValue: 1, duration: 100, useNativeDriver: true }),
      ]).start();

      const newUserMessage: Message = {
        id: `user-${Date.now()}`,
        text: textToSend,
        sender: 'user',
        timestamp: Date.now(),
      };
      setMessages(prevMessages => [...prevMessages, newUserMessage]);
      setInputText(''); // Clear input after sending

      // Simulate player assistant typing and response
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 1000)); // Simulate typing delay (1-2 seconds)

      const playerResponses = [
        "To boost your fitness, try interval training with short bursts of high intensity followed by recovery. It mimics game situations!",
        "Improving your dribbling skills requires practice with both feet. Set up cones and weave through them, keeping the ball close.",
        "For better passing accuracy, focus on your plant foot placement and follow through towards your target. Practice against a wall!",
        "Dealing with pre-game nerves? Try deep breathing exercises or visualizing successful plays. Trust your training!",
        "To enhance your game awareness, constantly scan the field. Know where teammates and opponents are, even when you don't have the ball.",
        "Strengthening your core can significantly improve your balance and power. Planks and Russian twists are great exercises.",
        "What position do you play? I can offer tips specific to your role.",
        "Are you looking to improve a specific skill, like shooting or defending?",
        "Remember to stay hydrated and get enough rest, especially before a big game!",
        "Don't be afraid to try new moves in practice. That's where you learn and grow!",
      ];
      const randomResponse = playerResponses[Math.floor(Math.random() * playerResponses.length)];

      const assistantMessage: Message = {
        id: `assistant-${Date.now() + 1}`,
        text: randomResponse,
        sender: 'player_assistant', // Corrected sender type
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
   * @param item The Message object to render.
   */
  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessageContainer : styles.assistantMessageContainer,
    ]}>
      {item.sender === 'player_assistant' && ( // Corrected sender type
        <Image source={{ uri: PLAYER_ASSISTANT_AVATAR }} style={styles.avatar} />
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
    "How can I improve my speed?",
    "Best drills for ball control?",
    "Tips for better passing?",
    "How to stay motivated?",
    "What exercises help with endurance?",
    "How to recover faster after training?",
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      {/* Gradient Header */}
      <LinearGradient
        colors={['#8A2BE2', '#4B0082']} // Player-centric gradient (purple tones)
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
        <Text style={styles.headerTitle}>Player Assistant</Text>
        <View style={styles.backButtonPlaceholder} />
      </LinearGradient>

      {/* Message List */}
      {messages.length === 0 ? (
        <View style={styles.emptyChatContainer}>
          <MaterialCommunityIcons name="soccer-field" size={100} color="#E0E0E0" /> {/* Player-focused icon */}
          <Text style={styles.emptyChatText}>Ready to level up your game?</Text>
          <Text style={styles.emptyChatSubText}>Ask me about training, skills, fitness, or mindset!</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickPromptsContainer}>
            {quickPrompts.map((prompt, index) => (
              <TouchableOpacity key={index} style={styles.quickPromptButton} onPress={() => handleSend(prompt)}>
                <Text style={styles.quickPromptText}>{prompt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
          <Image source={{ uri: PLAYER_ASSISTANT_AVATAR }} style={styles.avatar} />
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
          style={styles.textInput}
          placeholder="Ask a question about your training..."
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxHeight={100}
        />
        <TouchableOpacity style={styles.inputIcon}>
          <MaterialIcons name="image" size={24} color="#888" />
        </TouchableOpacity>
        <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
          <TouchableOpacity
            style={[styles.sendButton, inputText.trim().length === 0 && styles.sendButtonDisabled]}
            onPress={() => handleSend()} // Call with no argument to use inputText
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
    backgroundColor: '#8A2BE2', // Player user bubble color
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
  },
  inputIcon: {
    padding: 5,
  },
  sendButton: {
    backgroundColor: '#8A2BE2', // Player send button color
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
  emptyChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: height * 0.1,
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
    marginBottom: 30,
  },
  quickPromptsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  quickPromptButton: {
    backgroundColor: '#F0EFFF', // Light purple
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#8A2BE2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickPromptText: {
    fontSize: 14,
    color: '#8A2BE2',
    fontWeight: '600',
  },
});

export default Chatbot;
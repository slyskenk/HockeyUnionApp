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
  sender: 'user' | 'tactical_assistant';
  timestamp: number; // Storing as Unix timestamp
};

// Dummy tactical assistant avatar
const TACTICAL_ASSISTANT_AVATAR = 'https://placehold.co/40x40/007AFF/FFFFFF?text=AI'; // Blue for tactical AI

const TacticalChatbot = () => {
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

      // Simulate tactical assistant typing and response
      setIsTyping(true);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 1000)); // Simulate typing delay (1-2 seconds)

      const tacticalResponses = [
        "For a strong defense, consider a compact 4-4-2 formation. It emphasizes zonal marking and quick transitions.",
        "To improve attacking fluidity, focus on triangle passing drills and overlapping runs from midfielders.",
        "When facing a high press, quick one-touch passing and utilizing the width of the field can help break through.",
        "A key to successful penalty corners is variation. Practice different routines and disguises.",
        "Player positioning during defensive corners is crucial. Ensure strong first runners and clear roles for each player.",
        "To enhance team cohesion, consider small-sided games that encourage constant communication and quick decision-making.",
        "Counter-attacking effectively requires anticipation and quick releases. Drills focusing on transition from defense to attack are beneficial.",
        "What specific formation are you interested in discussing? I can provide pros and cons.",
        "Could you tell me more about the challenge you're facing? For example, against what type of opponent?",
        "Remember to adapt tactics based on your players' strengths and weaknesses.",
      ];
      const randomResponse = tacticalResponses[Math.floor(Math.random() * tacticalResponses.length)];

      const assistantMessage: Message = {
        id: `assistant-${Date.now() + 1}`,
        text: randomResponse,
        sender: 'tactical_assistant',
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
      {item.sender === 'tactical_assistant' && (
        <Image source={{ uri: TACTICAL_ASSISTANT_AVATAR }} style={styles.avatar} />
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
    "Explain 3-4-3 formation.",
    "Drills for improving passing accuracy?",
    "How to defend against a strong forward?",
    "Tips for effective penalty corners?",
    "Best way to build attack from defense?",
    "What is zonal marking?",
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
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
        <Text style={styles.headerTitle}>Tactical Assistant</Text>
        <View style={styles.backButtonPlaceholder} />
      </LinearGradient>

      {/* Message List */}
      {messages.length === 0 ? (
        <View style={styles.emptyChatContainer}>
          <MaterialCommunityIcons name="strategy" size={100} color="#E0E0E0" />
          <Text style={styles.emptyChatText}>Unleash your tactical brilliance!</Text>
          <Text style={styles.emptyChatSubText}>Ask me about formations, drills, or game strategies.</Text>
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
          <Image source={{ uri: TACTICAL_ASSISTANT_AVATAR }} style={styles.avatar} />
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
          placeholder="Ask a tactical question..."
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
    backgroundColor: '#6633FF',
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
    backgroundColor: '#6633FF',
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
    backgroundColor: '#E6F3FA', // Light blue
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickPromptText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default TacticalChatbot;

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';

// Typing indicator animation
const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  const animateDot = (dot, delay) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dot, {
          toValue: 1,
          duration: 300,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0.3,
          duration: 300,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    animateDot(dot1, 0);
    animateDot(dot2, 150);
    animateDot(dot3, 300);
  }, []);

  return (
    <View style={styles.typingIndicator}>
      {[dot1, dot2, dot3].map((dot, index) => (
        <Animated.View key={index} style={[styles.dot, { opacity: dot }]} />
      ))}
    </View>
  );
};

// Static mock user
const mockCurrentUser = {
  uid: 'u1',
  displayName: 'Tuupoo',
  photoURL: 'https://i.pravatar.cc/150?img=1',
};

// Initial mock messages
const mockMessagesData = [
  {
    id: '1',
    text: 'Welcome to the community!',
    user: 'John',
    profilePic: 'https://i.pravatar.cc/150?img=2',
    uid: 'u2',
    likes: 2,
    timestamp: new Date(),
  },
  {
    id: '2',
    text: 'Glad to be here!',
    user: 'Tuupoo',
    profilePic: 'https://i.pravatar.cc/150?img=1',
    uid: 'u1',
    likes: 0,
    timestamp: new Date(),
  },
];

const CommunityForumScreen = () => {
  const [messages, setMessages] = useState(mockMessagesData);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    let timeout;
    if (typing) {
      timeout = setTimeout(() => setTyping(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [typing]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const newMsg = {
      id: Date.now().toString(),
      text: newMessage.trim(),
      user: mockCurrentUser.displayName,
      profilePic: mockCurrentUser.photoURL,
      uid: mockCurrentUser.uid,
      likes: 0,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setNewMessage('');
    setTyping(false);
    Keyboard.dismiss();
  };

  const handleLike = (id) => {
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === id ? { ...msg, likes: msg.likes + 1 } : msg
      )
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        onScrollBeginDrag={() => setTyping(false)}
        renderItem={({ item }) => {
          const isOwnMessage = item.uid === mockCurrentUser.uid;
          return (
            <View
              style={[
                styles.messageBox,
                isOwnMessage ? styles.myMessageBox : styles.otherMessageBox,
              ]}
            >
              {!isOwnMessage && (
                <Image source={{ uri: item.profilePic }} style={styles.avatar} />
              )}
              <View
                style={[
                  styles.messageContent,
                  isOwnMessage ? styles.myMessageContent : null,
                ]}
              >
                {!isOwnMessage && <Text style={styles.username}>{item.user}</Text>}

                <Text
                  style={[
                    styles.messageText,
                    isOwnMessage ? styles.myMessageText : null,
                  ]}
                >
                  {item.text}
                </Text>

                <Text style={styles.timestamp}>
                  {item.timestamp
                    ? new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </Text>

                <TouchableOpacity
                  onPress={() => handleLike(item.id)}
                  style={[
                    styles.likeRow,
                    isOwnMessage ? { justifyContent: 'flex-end' } : null,
                  ]}
                >
                  <AntDesign
                    name="hearto"
                    size={16}
                    color={isOwnMessage ? '#1E40AF' : '#2563EB'}
                  />
                  <Text style={styles.likes}>{item.likes}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />

      {typing && <TypingIndicator />}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          placeholder="Type a message..."
          onChangeText={(text) => {
            setNewMessage(text);
            setTyping(true);
          }}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <AntDesign name="arrowright" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CommunityForumScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFF6FF',
  },
  messageList: {
    padding: 16,
    paddingBottom: 100,
  },
  messageBox: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  myMessageBox: {
    alignSelf: 'flex-end',
    backgroundColor: '#93C5FD',
    flexDirection: 'row-reverse',
  },
  otherMessageBox: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  messageContent: {
    flex: 1,
  },
  myMessageContent: {
    alignItems: 'flex-end',
  },
  username: {
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  messageText: {
    color: '#1E40AF',
    marginTop: 4,
  },
  myMessageText: {
    textAlign: 'right',
    color: '#1E3A8A',
  },
  timestamp: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'right',
  },
  likeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  likes: {
    marginLeft: 6,
    color: '#2563EB',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#60A5FA',
    marginHorizontal: 3,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#BFDBFE',
    width: '100%',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: '#2563EB',
    marginLeft: 10,
    padding: 10,
    borderRadius: 20,
  },
});

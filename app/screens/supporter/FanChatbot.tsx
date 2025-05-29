import { Ionicons } from '@expo/vector-icons';
import { ChatSession } from '@google/generative-ai';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { sendMessageInChat, startNewGeminiChatSession } from '../../../services/geminiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export default function HelpDesk() {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    (async () => {
      try {
        const newSession = await startNewGeminiChatSession();
        setSession(newSession);
      } catch (error) {
        console.error('Failed to start Gemini chat session:', error);
        setMessages([{ id: 'error', text: 'Failed to start chat session.', sender: 'bot' }]);
      }
    })();
  }, []);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || !session) return;
    const userMsg: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const reply = await sendMessageInChat(session, userMsg.text);
      setMessages((prev) => [...prev, { id: Date.now().toString(), text: reply, sender: 'bot' }]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: error.message || 'Error getting response.', sender: 'bot' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.message,
        item.sender === 'user' ? styles.userMessage : styles.botMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chat}
      />
      {loading && <ActivityIndicator size="small" color="#2563EB" />}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          placeholder="Ask about hockey..."
          onChangeText={setInput}
        />
        <TouchableOpacity onPress={send} disabled={loading}>
          <Ionicons name="send" size={24} color="#2563EB" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  chat: { paddingBottom: 80 },
  message: {
    marginVertical: 4,
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  userMessage: { backgroundColor: '#2563EB', alignSelf: 'flex-end' },
  botMessage: { backgroundColor: '#E5E7EB', alignSelf: 'flex-start' },
  messageText: { color: '#000' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    backgroundColor: '#fff',
  },
  input: { flex: 1, marginRight: 10, fontSize: 16 },
});

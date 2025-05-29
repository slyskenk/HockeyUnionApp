import { ChatSession, GoogleGenerativeAI } from '@google/generative-ai';
import Constants from 'expo-constants';

const apiKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('⚠️ Gemini API Key is missing!');
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function startNewGeminiChatSession(): Promise<ChatSession> {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  const chatSession = await model.startChat({});
  return chatSession;
}

export async function sendMessageInChat(chatSession: ChatSession, prompt: string): Promise<string> {
  try {
    const result = await chatSession.sendMessage(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

// app/services/gemini.ts

import { ChatSession, Content, GenerationConfig, GoogleGenerativeAI, HarmBlockThreshold, HarmCategory, SafetySetting } from '@google/generative-ai';
import Constants from 'expo-constants';

const apiKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('⚠️ Gemini API Key is missing! Please set EXPO_PUBLIC_GEMINI_API_KEY in .env or app.json extra field.');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

const defaultGenerationConfig: GenerationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
};

const defaultSafetySettings: SafetySetting[] = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// --- UPDATED System Instructions ---
const systemInstructions: Content = {
  role: 'system',
  parts: [{ text: "You are a highly knowledgeable and enthusiastic AI assistant for the HockeyUnionApp, specializing in field hockey. Your primary role is to answer supporter questions comprehensively and accurately across several key areas:\n\n1.  **Namibian Hockey:** Provide information on local teams, leagues, national teams, significant events, and player development in Namibia.\n2.  **International Federation of Hockey (FIH):** Answer questions about the FIH's structure, tournaments (like the Olympics, World Cups, Pro League), rules, rankings, and global hockey initiatives.\n3.  **Hockey Coaching Tips:** Offer advice and strategies for coaches of all levels, covering areas like drills, tactics, player development, team management, and motivation.\n4.  **Hockey Player Tips:** Provide guidance for players on skills (e.g., hitting, passing, tackling), fitness, mental preparation, nutrition, injury prevention, and general improvement.\n5.  **General Hockey Knowledge:** Address any other questions related to the sport of field hockey, its history, rules, equipment, famous players, and notable moments.\n\nMaintain a friendly, encouraging, and informative tone. Always strive for accuracy and provide as much detail as possible to help the supporters." }],
};


export async function startNewGeminiChatSession(): Promise<ChatSession> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    generationConfig: defaultGenerationConfig,
    safetySettings: defaultSafetySettings,
    systemInstruction: systemInstructions, // System instructions applied here
  });

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
    // You might want to check for specific error types, e.g., if content was blocked
    // if (error.response && error.response.promptFeedback && error.response.promptFeedback.blockReason) {
    //   console.warn("Prompt was blocked due to safety settings:", error.response.promptFeedback.blockReason);
    //   // You can return a specific message to the user in this case
    //   return "I'm sorry, I cannot respond to that message due to my safety guidelines.";
    // }
    throw error;
  }
}
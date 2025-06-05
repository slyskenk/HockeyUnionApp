import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './app/screens/auth/splash';
import LoginScreen from './app/screens/auth/login'; // make sure this exists
import PlayerNavigator from './navigation/PlayerNavigator'; // Player tab navigator
import Dashboard from './app/screens/admin/ChatbotManager';
import Events from './app/screens/supporter/Events';
import Fanchat from './app/screens/supporter/FanChatbot';
import Forum from './app/screens/supporter/Forum';
import MerchStore from './app/screens/supporter/MerchStore';
import News from './app/screens/supporter/News';
import PollsVoting from './app/screens/supporter/PollsVoting';
import Teams from './app/screens/supporter/Teams';
import BookmarksScreen from './app/screens/supporter/news/BookmarksScreen';
import ArticlePage from './app/screens/supporter/news/article';
import CoachDashboard from './app/screens/coach/Dashboard'; // ✅ Add this if needed

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SplashScreen" screenOptions={{ headerShown: false }}>
        {/* Initial screen */}
        <Stack.Screen name="SplashScreen" component={SplashScreen} />

        {/* Role-based destinations */}
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="Player" component={PlayerNavigator} />
        <Stack.Screen name="CoachDashboard" component={CoachDashboard} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="News" component={News} />

        {/* Supporter features */}
        <Stack.Screen name="Events" component={Events} />
        <Stack.Screen name="FanChatBot" component={Fanchat} />
        <Stack.Screen name="Forum" component={Forum} />
        <Stack.Screen name="MerchStore" component={MerchStore} />
        <Stack.Screen name="PollsVoting" component={PollsVoting} />
        <Stack.Screen name="Teams" component={Teams} />
        <Stack.Screen name="BookmarksScreen" component={BookmarksScreen} />
        <Stack.Screen name="ArticlePage" component={ArticlePage} />

        {/* Player features */}
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

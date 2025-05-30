import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
import EditTrainingPlanScreen from './app/screens/player/EditTrainingSchedulePlanScreen';
import PlayerNavigator from './navigation/PlayerNavigator'; // ✅ Make sure the path is correct
import PlayerTrainingResources from './app/screens/player/TrainingResources';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Player">
        {/* Main Player App with Tabs */}
        <Stack.Screen name="Player" component={PlayerNavigator} options={{ headerShown: false }} />

        {/* Admin/Supporter Screens */}
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Events" component={Events} />
        <Stack.Screen name="FanChatBot" component={Fanchat} />
        <Stack.Screen name="Forum" component={Forum} />
        <Stack.Screen name="MerchStore" component={MerchStore} />
        <Stack.Screen name="News" component={News} />
        <Stack.Screen name="PollsVoting" component={PollsVoting} />
        <Stack.Screen name="Teams" component={Teams} />
        <Stack.Screen name="BookmarksScreen" component={BookmarksScreen} />
        <Stack.Screen name="ArticlePage" component={ArticlePage} />
        <Stack.Screen name="PlayerTrainingResources" component={PlayerTrainingResources} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

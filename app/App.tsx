import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Dashboard from '../app/screens/admin/ChatbotManager';
import Events from '../app/screens/supporter/Events';
import Fanchat from '../app/screens/supporter/FanChatbot';
import Forum from '../app/screens/supporter/Forum';
import Highlights from '../app/screens/supporter/Highlights';
import MerchStore from '../app/screens/supporter/MerchStore';
import News from '../app/screens/supporter/News';
import PollsVoting from '../app/screens/supporter/PollsVoting';
import Teams from '../app/screens/supporter/Teams';
import BookmarksScreen from '../app/screens/supporter/news/BookmarksScreen';
import ArticlePage from '../app/screens/supporter/news/article';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Dashboard">
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="Events" component={Events} />
      <Stack.Screen name="FanChatBot" component={Fanchat} />
      <Stack.Screen name="Forum" component={Forum} />
      <Stack.Screen name="Highlights" component={Highlights} />
      <Stack.Screen name="MerchStore" component={MerchStore} />
      <Stack.Screen name="News" component={News} />
      <Stack.Screen name="PollsVoting" component={PollsVoting} />
      <Stack.Screen name="Teams" component={Teams} />
      <Stack.Screen name="BookmarksScreen" component={BookmarksScreen} />
      <Stack.Screen name="ArticlePage" component={ArticlePage} />
    </Stack.Navigator>
  );
}

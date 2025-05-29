// ../navigation/PlayerNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Events from '../app/screens/supporter/Events';
import FanChatbot from '../app/screens/supporter/FanChatbot';
import Forum from '../app/screens/supporter/Forum';
import Highlights from '../app/screens/supporter/Highlights';
import MerchStore from '../app/screens/supporter/MerchStore';
import News from '../app/screens/supporter/News';
import PollsVoting from '../app/screens/supporter/PollsVoting';
import Teams, { default as Dashboard } from '../app/screens/supporter/Teams';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator (main player tabs)


// Full Stack with tabs + extras
export default function PlayerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="PlayerTabs">
      <Stack.Screen name="Dashboard" component={Dashboard}/>
      <Stack.Screen name="Events" component={Events}/>
      <Stack.Screen name="FanChatbot" component={FanChatbot}/>
      <Stack.Screen name="Forum" component={Forum}/>
      <Stack.Screen name="Highlights" component={Highlights}/>
      <Stack.Screen name="MerchStore" component={MerchStore}/>
      <Stack.Screen name="News" component={News}/>
      <Stack.Screen name="PollsVoting" component={PollsVoting}/>
      <Stack.Screen name="Teams" component={Teams}/>
    </Stack.Navigator>
  );
}

// ../navigation/PlayerNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Dashboard from './Dashboard';
import Events from './Events';
import FanChatbot from './FanChatbot';
import Forum from './Forum';
import Leaderboard from './Leaderboard';
import MerchStore from './MerchStore';
import News from './News';
import PollsVoting from './PollsVoting';
import Teams from './Teams';



const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator (main player tabs)
function SupportersTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="FanChatbot" component={FanChatbot}/>
      <Tab.Screen name="News" component={News}/>
      <Tab.Screen name="Forum" component={Forum} />
      <Tab.Screen name="Events" component={Events} />
      <Tab.Screen name="MerchStore" component={MerchStore} />
      <Tab.Screen name="PollsVoting" component={PollsVoting} />
      <Tab.Screen name="Teams" component={Teams} />
      <Tab.Screen name="Leaderboard" component={Leaderboard}/>
    </Tab.Navigator>
  );
}

// Full Stack with tabs + extras
export default function SupportersNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="SupportersTabs">
      <Stack.Screen name="SupportersTabs" component={SupportersTabs} />
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="FanChatbot" component={FanChatbot} />
      <Stack.Screen name="Forum" component={Forum}/>
      <Stack.Screen name="News" component={News}/>
      <Stack.Screen name="Events" component={Events} />
      <Stack.Screen name="MerchStore" component={MerchStore} />
      <Stack.Screen name="PollsVoting" component={PollsVoting} />
      <Stack.Screen name = "Teams" component={Teams} />
      <Stack.Screen name="Leaderboard" component={Leaderboard} />
    </Stack.Navigator>
  );
}

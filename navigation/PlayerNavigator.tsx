// ../navigation/PlayerNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Chatbot from '../app/screens/player/Chatbot';
import Dashboard from '../app/screens/player/Dashboard';
import Events from '../app/screens/player/Events';
import Forum from '../app/screens/player/Forum';
import MyTeam from '../app/screens/player/MyTeam';
import News from '../app/screens/player/News';
import Profile from '../app/screens/player/Profile';
import TrainingResources from '../app/screens/player/TrainingResources';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator (main player tabs)


// Full Stack with tabs + extras
export default function PlayerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="PlayerTabs">
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="Forum" component={Forum} />
      <Stack.Screen name="MyTeam" component={MyTeam} />
      <Stack.Screen name="News" component={News} />
      <Stack.Screen name="Events" component={Events} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="TrainingResources" component={TrainingResources} />
      <Stack.Screen name="Chatbot" component={Chatbot}/>
    </Stack.Navigator>
  );
}

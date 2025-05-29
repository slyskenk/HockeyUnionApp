// ../navigation/PlayerNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Chatbot from './Chatbot';
import Dashboard from './Dashboard';
import Events from './Events';
import Forum from './Forum';
import MyTeam from './MyTeam';
import News from './News';
import Profile from './Profile';
import TrainingResources from './TrainingResources';

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

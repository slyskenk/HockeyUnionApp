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
import PollsVoting from './PollsVoting';
import Profile from './Profile';
import TrainingScheduleScreen from './TrainingScheduleScreen';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator (main player tabs)
function PlayerTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Chatbot" component={Chatbot}/>
      <Tab.Screen name="News" component={News}/>
      <Tab.Screen name="Forum" component={Forum} />
      <Tab.Screen name="Events" component={Events} />
      <Tab.Screen name="MyTeam" component={MyTeam} />
      <Tab.Screen name="PollsVoting" component={PollsVoting} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="TrainingScheduleScreen" component={TrainingScheduleScreen} />
    </Tab.Navigator>
  );
}

// Full Stack with tabs + extras
export default function PlayerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="PlayerTabs">
      <Stack.Screen name="PlayerTabs" component={PlayerTabs} />
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="Chatbot" component={Chatbot} />
      <Stack.Screen name="Forum" component={Forum}/>
      <Stack.Screen name="News" component={News}/>
      <Stack.Screen name="Events" component={Events} />
      <Stack.Screen name="MyTeam" component={MyTeam} />
      <Stack.Screen name="PollsVoting" component={PollsVoting} />
      <Stack.Screen name = "Profile" component={Profile} />
      <Stack.Screen name="TrainingScheduleScreen" component={TrainingScheduleScreen} />
    </Stack.Navigator>
  );
}

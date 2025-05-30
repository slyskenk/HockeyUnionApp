// ../navigation/PlayerNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons'; // Make sure you have @expo/vector-icons installed

import Chatbot from './Chatbot';
import Dashboard from './Dashboard';
import Events from './Events';
import Forum from './Forum';
import TrainingResources from './TrainingResources';
import TrainingScheduleScreen from './TrainingScheduleScreen';
import EditTrainingSchedulePlanScreen from './EditTrainingSchedulePlanScreen';
import PlayerTrainingResources from './TrainingResources';
import TeamNewsScreen from './TeamsNews';
import MyTeamScreen from './MyTeam';
import PlayerProfileScreen from './Profile';
import NewsScreen from '../supporter/News';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Bottom Tabs (main player sections)
function PlayerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Forum':
              iconName = focused ? 'chatbox' : 'chatbox-outline';
              break;
            case 'MyTeam':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'News':
              iconName = focused ? 'newspaper' : 'newspaper-outline';
              break;
            case 'Chatbot':
              iconName = focused ? 'chatbubble' : 'chatbubble-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Forum" component={Forum} />
      <Tab.Screen name="MyTeam" component={MyTeamScreen} />
      <Tab.Screen name="News" component={NewsScreen} />
      <Tab.Screen name="Chatbot" component={Chatbot} />
      <Tab.Screen name="Profile" component={PlayerProfileScreen} />

       

    </Tab.Navigator>
  );
}

// Full Stack with tabs + extras
export default function PlayerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlayerTabs" component={PlayerTabs} />
      <Stack.Screen name="Events" component={Events} />
      <Stack.Screen name="TrainingResources" component={TrainingResources} />
      <Stack.Screen name="TrainingScheduleScreen" component={TrainingScheduleScreen} />
      <Stack.Screen name="EditTraininSchedulePlanScreen" component={EditTrainingSchedulePlanScreen} />
       <Stack.Screen name="PlayerTrainingResources" component={PlayerTrainingResources} />
        <Stack.Screen name="TeamsNews" component={TeamNewsScreen} />
         


       
    </Stack.Navigator>
  );
}

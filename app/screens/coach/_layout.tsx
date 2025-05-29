// ../navigation/CoachNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Dashboard from './Dashboard';
import EventsEditor from './EventsEditor';
import Forum from './Forum';
import NewsEditor from './NewsEditor';
import PlayerAnalytics from './PlayerAnalytics';
import RosterManager from './RosterManager';
import TacticalChatbot from "./TacticalChatbot";
import TrainingPlanner from "./TrainingPlanner";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator (main player tabs)
//function CoachTabs() {
  //return (
    //<Tab.Navigator screenOptions={{ headerShown: true }}>
    //  <Tab.Screen name="Dashboard" component={Dashboard} />
     // <Tab.Screen name="Forum" component={Forum} />
     // <Tab.Screen name="NewsEditor" component={NewsEditor} />
     // <Tab.Screen name="EventsEditor" component={EventsEditor} />
     // <Tab.Screen name="PlayerAnalytics" component={PlayerAnalytics} />
     // <Tab.Screen name="RosterManager" component={RosterManager} />
     // <Tab.Screen name="TacticalChatbot" component={TacticalChatbot} />
     // <Tab.Screen name="TrainingPlanner" component={TrainingPlanner} />
    //</Tab.Navigator>
 // );
//}

// Full Stack with tabs + extras
export default function CoachNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="CoachTabs">
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="Forum" component={Forum}/>
      <Stack.Screen name="NewsEditor" component={NewsEditor}/>
      <Stack.Screen name="EventsEditor" component={EventsEditor} />
      <Stack.Screen name="PlayerAnalytics" component={PlayerAnalytics} />
      <Stack.Screen name="RosterManager" component={RosterManager} />
      <Stack.Screen name = "TacticalChatbot" component={TacticalChatbot} />
      <Stack.Screen name="TrainingPlanner" component={TrainingPlanner} />
    </Stack.Navigator>
  );
}

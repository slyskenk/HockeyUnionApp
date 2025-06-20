// ../navigation/AdminNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import ChatbotManager from "../app/screens/admin/ChatbotManager";
import Dashboard from '../app/screens/admin/Dashboard';
import EventsManager from '../app/screens/admin/EventsManager';
import forumModeration from '../app/screens/admin/ForumModeration';
import ManageUsers from '../app/screens/admin/ManageUsers';
import NewsManager from '../app/screens/admin/NewsManager';
import Notification from '../app/screens/admin/Notification';
import Reports from '../app/screens/admin/Reports';
import RoleAccess from '../app/screens/admin/RoleAccess';
import TeamsManager from '../app/screens/admin/TeamsManager';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator (main Admin tabs)
function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="ChatbotManager" component={ChatbotManager} />
      <Tab.Screen name="EventsManager" component={EventsManager} />
      <Tab.Screen name="forumModeration" component={forumModeration} />
      <Tab.Screen name="ManageUsers" component={ManageUsers} />
      <Tab.Screen name="NewsManager" component={NewsManager} />
      <Tab.Screen name="Notification" component={Notification} />
      <Tab.Screen name="Reports" component={Reports} />
      <Tab.Screen name="RoleAccess" component={RoleAccess}/>
      <Tab.Screen name="TeamsManager" component={TeamsManager}/>
    </Tab.Navigator>
  );
}

// Full Stack with tabs + extras
export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="AdminTabs">
      <Stack.Screen name="AdminTabs" component={AdminTabs} />
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="ChatbotManager" component={ChatbotManager} />
      <Stack.Screen name="EventsManager" component={EventsManager}/>
      <Stack.Screen name="forumModeration" component={forumModeration}/>
      <Stack.Screen name="ManageUsers" component={ManageUsers}/>
      <Stack.Screen name="NewsManager" component={NewsManager}/>
      <Stack.Screen name="Notification" component={Notification} />
      <Stack.Screen name="Reports" component={Reports}/>
      <Stack.Screen name="RoleAccess" component={RoleAccess} />
    </Stack.Navigator>
  );
}

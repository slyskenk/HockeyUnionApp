import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet } from 'react-native';

import Events from './Events';
import Teams from './Teams';
import BookmarksScreen from '../supporter/news/BookmarksScreen';
import ArticlePage from '../supporter/news/article';
import PollingStationApp from './PollsVoting';


import Dashboard from './Dashboard';
import Fanchat from './FanChatbot';
import Forum from './Forum';
import MerchStore from './MerchStore';
import News from './News';



const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const icons = {
  Dashboard: require('../../../assets/icons/home.png'),
  FanChat: require('../../../assets/icons/bot.png'),
  Forum: require('../../../assets/icons/live-chat.png'),
  MerchStore: require('../../../assets/icons/shopping-cart.png'),
  News: require('../../../assets/icons/megaphone.png')
};

export default function SupporterTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          const icon = icons[route.name as keyof typeof icons];
          return (
            <Image
              source={icon}
              style={[
                styles.icon,
                { tintColor: focused ? '#007bff' : 'black' }
              ]}
            />
          );
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'black',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="News" component={News} options={{ tabBarLabel: 'News' }} />
      <Tab.Screen name="Forum" component={Forum} options={{ tabBarLabel: 'Forum' }} />
      <Tab.Screen name="FanChat" component={Fanchat} options={{ tabBarLabel: 'Chat' }} />
      <Tab.Screen name="MerchStore" component={MerchStore} options={{ tabBarLabel: 'Store' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 30,
    height: 28,
    resizeMode: 'contain',
  },
});

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Bottom tab navigator as the main screen */}
      <Stack.Screen name="MainTabs" component={BottomTabs} />

      {/* Screens outside the tabs */}
      <Stack.Screen name="Events" component={Events} />
      <Stack.Screen name="Teams" component={Teams} />
      <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
      <Stack.Screen name="Article" component={ArticlePage} />
      <Stack.Screen name="PollingStation" component={PollingStationApp} />
    </Stack.Navigator>
  );
}

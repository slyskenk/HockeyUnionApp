import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet } from 'react-native';

import Dashboard from './Dashboard';
import Fanchat from './FanChatbot';
import Forum from './Forum';
import MerchStore from './MerchStore';
import News from './News';

const Tab = createBottomTabNavigator();

const icons = {
  Dashboard: require('../../../assets/icons/home.png'),
  FanChat: require('../../../assets/icons/bot.png'),
  Forum: require('../../../assets/icons/live-chat.png'),
  MerchStore: require('../../../assets/icons/shopping-cart.png'),
  News: require('../../../assets/icons/megaphone.png')
};

export default function BottomTabs() {
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

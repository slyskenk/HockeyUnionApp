import React from 'react';
import { Platform, Image, View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Slot } from 'expo-router';

import Dashboard from './Dashboard';
import News from './News';
import Forum from './Forum';
import Fanchat from './FanChatbot';
import MerchStore from './MerchStore';

const Tab = createBottomTabNavigator();

const icons = {
  Dashboard: require('../../../assets/icons/home.png'),
  FanChat: require('../../../assets/icons/bot.png'),
  Forum: require('../../../assets/icons/live-chat.png'),
  MerchStore: require('../../../assets/icons/shopping-cart.png'),
  News: require('../../../assets/icons/megaphone.png'),
};

const unreadCount = 3;

export default function Layout() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          const icon = icons[route.name as keyof typeof icons];
          return (
            <View style={styles.iconContainer}>
              <Image
                source={icon}
                style={[
                  styles.icon,
                  { tintColor: focused ? '#007bff' : 'black' },
                ]}
              />
              {route.name === 'FanChat' && unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          );
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'black',
        tabBarHideOnKeyboard: true,
        animationEnabled: true,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
            },
            android: {
              elevation: 5,
            },
          }),
        },
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
  iconContainer: {
    width: 30,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 30,
    height: 28,
    resizeMode: 'contain',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

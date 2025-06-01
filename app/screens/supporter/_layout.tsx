import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Added this import
import React from 'react';
import { Image, StyleSheet } from 'react-native';

// Import your screen components
import BookmarksScreen from '../supporter/news/BookmarksScreen';
import ArticlePage from '../supporter/news/article';
import Dashboard from './Dashboard';
import Events from './Events';
import Fanchat from './FanChatbot'; // Assuming this is the correct component name for FanChat
import Forum from './Forum';
import MerchStore from './MerchStore';
import News from './News';
import PollingStationApp from './PollsVoting';
import Teams from './Teams';

const Tab = createBottomTabNavigator();

// Icon definitions for the tab bar
const icons = {
  Dashboard: require('../../../assets/icons/home.png'),
  News: require('../../../assets/icons/megaphone.png'), // Matched key to screen name "News"
  Forum: require('../../../assets/icons/live-chat.png'),
  FanChat: require('../../../assets/icons/bot.png'), // Matched key to screen name "FanChat"
  MerchStore: require('../../../assets/icons/shopping-cart.png'),
};

// Styles for the tab bar icons
const styles = StyleSheet.create({
  icon: {
    width: 30,
    height: 28,
    resizeMode: 'contain',
  },
});

// Tab Navigator for the main supporter sections
function SupporterTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          // Ensure the route name exists as a key in the icons object
          const iconName = route.name as keyof typeof icons;
          const icon = icons[iconName];
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
        headerShown: false, // As per your original supporter tab navigator
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

// Main Stack Navigator for the Supporter section
export default function SupporterNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ headerShown: false }} 
      initialRouteName="SupporterMainTabs" // Changed to a more descriptive initial route
    >
      {/* The Tab Navigator is a screen in the Stack Navigator */}
      <Stack.Screen 
        name="SupporterMainTabs" 
        component={SupporterTabs} 
        // options={{ headerShown: false }} // Redundant if stack screenOptions.headerShown is false
      />

      {/* Screens also accessible via Tabs (for direct stack navigation if needed) */}
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="News" component={News} />
      <Stack.Screen name="Forum" component={Forum} />
      <Stack.Screen name="FanChat" component={Fanchat} /> 
      <Stack.Screen name="MerchStore" component={MerchStore} />

      {/* Screens outside the tabs */}
      <Stack.Screen name="Events" component={Events} />
      <Stack.Screen name="Teams" component={Teams} />
      <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
      <Stack.Screen name="Article" component={ArticlePage} />
      <Stack.Screen name="PollingStation" component={PollingStationApp} />
    </Stack.Navigator>
  );
}

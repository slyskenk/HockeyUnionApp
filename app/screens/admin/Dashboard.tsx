import { MaterialCommunityIcons } from '@expo/vector-icons'; // Using MaterialCommunityIcons for 'home-outline'
import { useRouter } from 'expo-router'; // Import useRouter for navigation
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Get screen width for responsive sizing of grid items
const { width } = Dimensions.get('window');
const screenPaddingHorizontal = 20; // Padding from the sides of the screen
const numColumns = 3;
const itemGap = 10; // This will be the desired gap between items AND from edges

// Calculate item size for 'space-evenly' distribution
const availableWidthForGrid = width - (2 * screenPaddingHorizontal);
// With 'space-evenly', there are (numColumns + 1) equal gaps (before first, between, after last)
const itemSize = (availableWidthForGrid - ((numColumns + 1) * itemGap)) / numColumns;


// Reusable component for a single dashboard tab
const DashboardTab = ({ iconName, label, onPress }) => (
  <TouchableOpacity style={styles.tabButton} onPress={onPress}>
    <MaterialCommunityIcons name={iconName} size={itemSize * 0.4} color="#555" />
    <Text style={styles.tabLabel}>{label}</Text>
  </TouchableOpacity>
);

const DashboardScreen = () => {
  const router = useRouter(); // Initialize router for navigation

  // Updated tabsData with new pages, icons, and navigation links
  const tabsData = [
    // Removed the Dashboard tab as requested
    { iconName: 'robot-outline', label: 'Chatbot', onPress: () => router.push('./../admin/ChatbotManager') },
    { iconName: 'calendar-edit', label: 'Events', onPress: () => router.push('./../admin/EventsManager') },
    { iconName: 'forum-outline', label: 'Forum', onPress: () => router.push('./../admin/ForumModeration') },
    { iconName: 'account-multiple-outline', label: 'Manage Users', onPress: () => router.push('./../admin/ManageUsers') },
    { iconName: 'newspaper-variant-outline', label: 'News', onPress: () => router.push('./../admin/NewsManager') },
    { iconName: 'bell-outline', label: 'Notifications', onPress: () => router.push('./../admin/Notification') },
    { iconName: 'chart-bar', label: 'Reports', onPress: () => router.push('./../admin/Reports') },
    { iconName: 'key-chain', label: 'Role Access', onPress: () => router.push('./../admin/RoleAccess') },
    { iconName: 'account-group-outline', label: 'Teams', onPress: () => router.push('./../admin/TeamsManager') },
    { iconName: 'trophy-outline', label: 'Leaderboards', onPress: () => router.push('./../admin/Leaderboards') }, // New page
  ];

  return (
    <View style={styles.rootContainer}> {/* This is now the main full-screen container */}
      {/* Namibia Hockey Union Logo */}
      <Image
        source={require('./../../../assets/images/logo.jpeg')} // Updated path to your logo
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Welcome Admin Text */}
      <Text style={styles.welcomeText}>Welcome Admin</Text>
      <Text style={styles.adminName}>SLYSKEN KAKUVA</Text>

      {/* Grid of Tabs */}
      <View style={styles.tabsGrid}>
        {tabsData.map((tab, index) => (
          <DashboardTab
            key={index}
            iconName={tab.iconName}
            label={tab.label}
            onPress={tab.onPress}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#fff', // White background fills the entire screen
    paddingTop: 50, // Space from the top edge of the screen
    paddingHorizontal: screenPaddingHorizontal, // Apply horizontal padding to the whole screen
    alignItems: 'center', // Centers content horizontally within the screen's padding
  },
  logo: {
    width: 120, // Adjust size as needed
    height: 120, // Adjust size as needed
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  adminName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 30,
    textTransform: 'uppercase',
  },
  tabsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allow items to wrap to the next line
    justifyContent: 'space-evenly', // Changed to space-evenly for more consistent spacing
    width: '100%', // Ensure grid takes full width available within screen's padding
  },
  tabButton: {
    width: itemSize, // Use calculated item size
    height: itemSize, // Make it square
    backgroundColor: '#f0f0f0', // Light gray background for tabs
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: itemGap, // Use itemGap for vertical spacing as well
    // Add subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabLabel: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
    fontWeight: '500',
    textAlign: 'center', // Ensure label is centered
  },
});

export default DashboardScreen;

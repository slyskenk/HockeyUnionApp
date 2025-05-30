import { MaterialCommunityIcons } from '@expo/vector-icons'; // Using MaterialCommunityIcons for 'home-outline'
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
  // Dummy data for the tabs. You can customize iconName, label, and onPress function.
  const tabsData = [
    { iconName: 'home-outline', label: 'Home', onPress: () => console.log('Home Pressed') },
    { iconName: 'newspaper-variant-outline', label: 'News', onPress: () => console.log('News Pressed') },
    { iconName: 'calendar-month-outline', label: 'Events', onPress: () => console.log('Events Pressed') },
    { iconName: 'account-group-outline', label: 'Teams', onPress: () => console.log('Teams Pressed') },
    { iconName: 'trophy-outline', label: 'Fixtures', onPress: () => console.log('Fixtures Pressed') },
    { iconName: 'information-outline', label: 'About Us', onPress: () => console.log('About Us Pressed') },
    { iconName: 'image-multiple-outline', label: 'Gallery', onPress: () => console.log('Gallery Pressed') },
    { iconName: 'email-outline', label: 'Contact', onPress: () => console.log('Contact Pressed') },
    { iconName: 'cog-outline', label: 'Settings', onPress: () => console.log('Settings Pressed') },
  ];

  return (
    <View style={styles.rootContainer}> {/* This is now the main full-screen container */}
      {/* Namibia Hockey Union Logo */}
      {/* Replace with your actual logo path or URI */}
      <Image
        source={require('../../../assets/images/logo.jpeg')} // Update this path to your logo
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
  },
  tabLabel: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
    fontWeight: '500',
  },
});

export default DashboardScreen;

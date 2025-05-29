import { Ionicons, MaterialIcons } from '@expo/vector-icons'; // For icons
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  ScrollView // Using ScrollView for empty state and for filter tabs
  ,

  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Define Notification type with added relatedUserRole
type NotificationItem = {
  id: string;
  type: 'New User' | 'New Forum Post' | 'Reported Content' | 'Event Update';
  title: string;
  description: string;
  timestamp: number; // Unix timestamp
  read: boolean;
  actionable: boolean; // Can the admin take an immediate action?
  relatedUserRole?: 'Admin' | 'Coach' | 'Player' | 'Supporter'; // New field for filtering
};

// Dummy data for admin notifications with relatedUserRole
const DUMMY_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif1',
    type: 'New User',
    title: 'New Player Registration',
    description: 'A new player, John Doe, has registered. Review and approve their profile.',
    timestamp: Date.now() - (1000 * 60 * 30), // 30 minutes ago
    read: false,
    actionable: true,
    relatedUserRole: 'Player',
  },
  {
    id: 'notif2',
    type: 'New Forum Post',
    title: 'New Post in "General Discussion"',
    description: 'User Jane Smith created a new post: "Thoughts on the upcoming season?"',
    timestamp: Date.now() - (1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    actionable: true,
    relatedUserRole: 'Supporter', // Example: a supporter posted
  },
  {
    id: 'notif3',
    type: 'Reported Content',
    title: 'Content Reported in Forum',
    description: 'A comment in "Rules Clarification" has been reported for inappropriate language.',
    timestamp: Date.now() - (1000 * 60 * 60 * 24), // 1 day ago
    read: false,
    actionable: true,
    relatedUserRole: 'Admin', // Admin needs to moderate this
  },
  {
    id: 'notif4',
    type: 'Event Update',
    title: 'Training Session Rescheduled',
    description: 'Coach Peter Jones updated the U14 training session for next Tuesday.',
    timestamp: Date.now() - (1000 * 60 * 60 * 48), // 2 days ago
    read: true,
    actionable: false,
    relatedUserRole: 'Coach', // A coach made this update
  },
  {
    id: 'notif5',
    type: 'New User',
    title: 'New Supporter Registration',
    description: 'A new supporter, Alice Brown, has joined the app.',
    timestamp: Date.now() - (1000 * 60 * 60 * 72), // 3 days ago
    read: true,
    actionable: true,
    relatedUserRole: 'Supporter',
  },
  {
    id: 'notif6',
    type: 'New User',
    title: 'New Coach Registration',
    description: 'A new coach, Mark Venter, has registered. Review and approve their credentials.',
    timestamp: Date.now() - (1000 * 60 * 60 * 96), // 4 days ago
    read: true,
    actionable: true,
    relatedUserRole: 'Coach',
  },
];

type RoleFilter = 'All' | 'Admin' | 'Coach' | 'Player' | 'Supporter';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(DUMMY_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<RoleFilter>('All'); // Default filter

  // Filter notifications based on the selected role
  const filteredNotifications = notifications.filter(notif => {
    if (selectedRoleFilter === 'All') {
      return true; // Show all notifications
    }
    // Only show notifications that have a matching relatedUserRole
    return notif.relatedUserRole === selectedRoleFilter;
  });

  // Function to format timestamp for display
  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    let interval = seconds / 31536000; // years
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000; // months
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400; // days
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600; // hours
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60; // minutes
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  /**
   * Marks a notification as read.
   * @param id The ID of the notification to mark as read.
   */
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, read: true } : notif))
    );
    // In a real app, send update to backend
  };

  /**
   * Handles viewing details of a notification.
   * @param notification The notification item to view.
   */
  const handleViewDetails = (notification: NotificationItem) => {
    markAsRead(notification.id); // Mark as read when viewed
    Alert.alert(
      `Notification: ${notification.type}`,
      `${notification.description}\n\nTime: ${formatTimeAgo(notification.timestamp)}`,
      [
        { text: 'Dismiss', onPress: () => handleDismiss(notification.id) },
        { text: 'Go to Item', onPress: () => console.log(`Navigating to ${notification.type} for ${notification.id}`) },
      ]
    );
    // In a real app, navigate to the specific screen (e.g., User Details, Forum Post)
  };

  /**
   * Handles dismissing (removing) a notification.
   * @param id The ID of the notification to dismiss.
   */
  const handleDismiss = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    console.log(`Notification ${id} dismissed.`);
    // In a real app, send update to backend
  };

  /**
   * Simulates refreshing notifications (e.g., fetching new data from a server).
   */
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate fetching new data
    setTimeout(() => {
      // Example: Add a new dummy notification on refresh
      const newNotif: NotificationItem = {
        id: `new-${Date.now()}`,
        type: 'New Forum Post',
        title: 'New Comment on Your Post',
        description: 'User Admin Two replied to your forum post.',
        timestamp: Date.now(),
        read: false,
        actionable: true,
        relatedUserRole: 'Admin', // Assign a role for the new notification
      };
      setNotifications(prev => [newNotif, ...prev]);
      setRefreshing(false);
    }, 1500);
  }, []);


  const renderNotificationItem = ({ item }: { item: NotificationItem }) => (
    <TouchableOpacity
      style={[styles.notificationCard, item.read ? styles.readCard : styles.unreadCard]}
      onPress={() => handleViewDetails(item)}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        {item.type === 'New User' && <MaterialIcons name="person-add" size={24} color="#007AFF" />}
        {item.type === 'New Forum Post' && <MaterialIcons name="forum" size={24} color="#FF9500" />}
        {item.type === 'Reported Content' && <MaterialIcons name="report" size={24} color="#FF3B30" />}
        {item.type === 'Event Update' && <MaterialIcons name="event" size={24} color="#5856D6" />}
        {!item.read && <View style={styles.unreadDot} />}
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.notificationTime}>{formatTimeAgo(item.timestamp)}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDismiss(item.id)} style={styles.dismissButton}>
        <Ionicons name="close-circle-outline" size={24} color="#999" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../../assets/images/logo.jpeg')} // Update this path
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {/* Role Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollViewContent}>
          {['All', 'Admin', 'Coach', 'Player', 'Supporter'].map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.filterButton,
                selectedRoleFilter === role && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedRoleFilter(role as RoleFilter)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedRoleFilter === role && styles.filterButtonTextActive,
              ]}>
                {role}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>


      {/* Notification List or Empty State */}
      {filteredNotifications.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyListContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
          }
        >
          <MaterialIcons name="notifications-off" size={60} color="#ccc" />
          <Text style={styles.emptyListText}>No notifications for this category.</Text>
          <Text style={styles.emptyListSubText}>Pull down to refresh.</Text>
        </ScrollView>
      ) : (
        <FlatList
          data={filteredNotifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Light background
  },
  header: {
    paddingTop: 50,
    paddingBottom: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  headerLogo: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  filterScrollViewContent: {
    paddingHorizontal: 15,
    alignItems: 'center', // Center tabs if there are few
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  unreadCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#007AFF', // Highlight unread notifications
  },
  readCard: {
    borderLeftWidth: 5,
    borderLeftColor: 'transparent', // No highlight for read
  },
  iconContainer: {
    position: 'relative',
    marginRight: 15,
    width: 30, // Fixed width for icon area
    alignItems: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30', // Red dot for unread
    borderWidth: 1,
    borderColor: '#fff',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    alignSelf: 'flex-end', // Align time to the right
  },
  dismissButton: {
    padding: 5,
    marginLeft: 10,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyListText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 15,
    fontWeight: 'bold',
  },
  emptyListSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
});

export default NotificationScreen;

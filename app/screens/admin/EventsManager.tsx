import { MaterialIcons } from '@expo/vector-icons'; // For various icons
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// --- Type Definitions ---

// Define possible statuses for an event
type EventStatus = 'Draft' | 'Published' | 'Completed' | 'Cancelled';

// Define the structure for an Event item
type EventItem = {
  id: string;
  title: string;
  description: string;
  startDate: number; // Unix timestamp
  endDate: number; // Unix timestamp
  location: string;
  organizer?: string;
  audience?: 'All' | 'Players' | 'Coaches' | 'Supporters';
  registrationLink?: string;
  imageUrl?: string; // Optional event banner/image
  status: EventStatus;
};

// --- Dummy Data ---

const DUMMY_EVENTS: EventItem[] = [
  {
    id: 'e1',
    title: 'Senior Men\'s League Matchday 5',
    description: 'Crucial matches for the top teams in the senior men\'s division. Come support your favorite team!',
    startDate: new Date('2025-06-15T14:00:00').getTime(),
    endDate: new Date('2025-06-15T18:00:00').getTime(),
    location: 'National Hockey Stadium, Windhoek',
    organizer: 'NHU',
    audience: 'All',
    imageUrl: 'https://placehold.co/100x70/007AFF/FFFFFF?text=Match',
    status: 'Published',
  },
  {
    id: 'e2',
    title: 'U16 Girls Training Camp',
    description: 'Intensive training camp for selected U16 girls squad members. Focus on skill development and teamwork.',
    startDate: new Date('2025-07-01T09:00:00').getTime(),
    endDate: new Date('2025-07-05T17:00:00').getTime(),
    location: 'DTS Sports Club, Windhoek',
    organizer: 'NHU Coaching Staff',
    audience: 'Players',
    status: 'Published',
  },
  {
    id: 'e3',
    title: 'NHU Annual Gala Dinner',
    description: 'A night to celebrate the achievements of Namibian hockey. Awards ceremony and fundraising.',
    startDate: new Date('2025-05-20T19:00:00').getTime(), // Past event
    endDate: new Date('2025-05-20T23:00:00').getTime(),
    location: 'Safari Hotel & Conference Centre',
    organizer: 'NHU Board',
    status: 'Completed',
  },
  {
    id: 'e4',
    title: 'Coaches Workshop: Modern Tactics',
    description: 'A workshop for all registered coaches on modern hockey tactics and player development strategies.',
    startDate: new Date('2025-08-10T10:00:00').getTime(),
    endDate: new Date('2025-08-10T16:00:00').getTime(),
    location: 'Online (Zoom Link Provided)',
    organizer: 'NHU Technical Committee',
    audience: 'Coaches',
    status: 'Draft', // Not yet published
  },
  {
    id: 'e5',
    title: 'Youth Hockey Festival',
    description: 'A fun festival for young hockey enthusiasts, focusing on participation and enjoyment.',
    startDate: new Date('2025-09-01T08:30:00').getTime(),
    endDate: new Date('2025-09-01T14:00:00').getTime(),
    location: 'UNAM Hockey Fields',
    organizer: 'NHU Development',
    status: 'Cancelled', // Cancelled event
  },
];

const EventsManager = () => {
  const [events, setEvents] = useState<EventItem[]>(DUMMY_EVENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Filter events based on search query
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /**
   * Formats a Unix timestamp into a readable date and time string.
   * @param timestamp The Unix timestamp.
   * @returns Formatted date and time string.
   */
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Gets the appropriate style for an event's status.
   * @param status The status of the event.
   * @returns Style object for the status text.
   */
  const getStatusStyle = (status: EventStatus) => {
    switch (status) {
      case 'Published': return styles.statusPublished;
      case 'Completed': return styles.statusCompleted;
      case 'Cancelled': return styles.statusCancelled;
      case 'Draft': return styles.statusDraft;
      default: return {};
    }
  };

  /**
   * Handles deleting an event.
   * @param eventId The ID of the event to delete.
   */
  const handleDeleteEvent = (eventId: string) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
            console.log(`Event ${eventId} deleted.`);
            // In a real app, call API to delete the event from the backend
          },
          style: 'destructive',
        },
      ]
    );
  };

  /**
   * Placeholder for adding a new event.
   * In a real app, this would navigate to a detailed form or open a modal.
   */
  const handleAddEvent = () => {
    console.log('Add new event');
    Alert.alert('Add Event', 'Functionality to add new event not implemented yet. (Would open a form/modal)');
    // Example: router.push('/admin/add-event');
  };

  /**
   * Placeholder for editing an existing event.
   * @param event The event object to edit.
   * In a real app, this would navigate to a detailed form or open a modal, pre-filling data.
   */
  const handleEditEvent = (event: EventItem) => {
    console.log('Edit event:', event.title);
    Alert.alert('Edit Event', `Functionality to edit "${event.title}" not implemented yet. (Would open a form/modal)`);
    // Example: router.push({ pathname: '/admin/edit-event', params: { eventId: event.id } });
  };

  /**
   * Simulates refreshing events (e.g., fetching new data from a server).
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate fetching new data
    setTimeout(() => {
      const newEvent: EventItem = {
        id: `new-${Date.now()}`,
        title: 'New Friendly Match Announced!',
        description: 'A friendly match between local clubs has been scheduled for next month.',
        startDate: Date.now() + (1000 * 60 * 60 * 24 * 30), // 30 days from now
        endDate: Date.now() + (1000 * 60 * 60 * 24 * 30) + (1000 * 60 * 60 * 3), // 3 hours duration
        location: 'Local Club Field',
        status: 'Published',
      };
      setEvents(prev => [newEvent, ...prev]);
      setRefreshing(false);
    }, 1500);
  }, []);

  /**
   * Renders a single Event Card in the FlatList.
   * @param item The EventItem object to render.
   */
  const renderEventCard = ({ item }: { item: EventItem }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => handleEditEvent(item)} // Tapping card previews/edits
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.imageUrl || 'https://placehold.co/100x70/CCCCCC/000000?text=Event' }}
        style={styles.eventImage}
      />
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDetails}>
          <MaterialIcons name="calendar-today" size={12} color="#666" /> {formatDate(item.startDate)}
        </Text>
        <Text style={styles.eventDetails}>
          <MaterialIcons name="location-on" size={12} color="#666" /> {item.location}
        </Text>
        <Text style={[styles.eventStatus, getStatusStyle(item.status)]}>
          {item.status}
        </Text>
      </View>
      <View style={styles.eventActions}>
        <TouchableOpacity onPress={() => handleEditEvent(item)} style={styles.actionIcon}>
          <MaterialIcons name="edit" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteEvent(item.id)} style={styles.actionIcon}>
          <MaterialIcons name="delete" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../../assets/images/logo.jpeg')} // Update this path
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Manage Events</Text>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search events..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Event List or Empty State */}
      {filteredEvents.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyListContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
          }
        >
          <MaterialIcons name="event-busy" size={60} color="#ccc" />
          <Text style={styles.emptyListText}>No events found.</Text>
          <Text style={styles.emptyListSubText}>Pull down to refresh or tap '+' to add a new event.</Text>
        </ScrollView>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          renderItem={renderEventCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
          }
        />
      )}

      {/* Floating Add Event Button */}
      <TouchableOpacity style={styles.floatingAddButton} onPress={handleAddEvent}>
        <MaterialIcons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </KeyboardAvoidingView>
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
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 15,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingBottom: 80, // Space for the floating button
  },
  eventCard: {
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
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: '#ddd',
    resizeMode: 'cover',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventDetails: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'flex-start', // Align status to the left
    marginTop: 8,
  },
  statusPublished: {
    backgroundColor: '#D0EAFB',
    color: '#007AFF',
  },
  statusCompleted: {
    backgroundColor: '#E6FBE6',
    color: '#28a745',
  },
  statusCancelled: {
    backgroundColor: '#FFEBEE',
    color: '#FF3B30',
  },
  statusDraft: {
    backgroundColor: '#FFFBE6',
    color: '#FF9500',
  },
  eventActions: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  actionIcon: {
    padding: 8,
    marginLeft: 5,
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007AFF',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
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

export default EventsManager;

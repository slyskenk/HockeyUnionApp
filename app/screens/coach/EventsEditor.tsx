import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
// For a real app, uncomment and use a date/time picker library:
// import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

// Define Event Type
export type EventType = 'Practice' | 'Friendly Match' | 'Team Meeting' | 'Video Analysis' | 'Other'; // Exported EventType

// Define Event Structure
export type TeamEvent = { // Exported TeamEvent
  id: string;
  title: string;
  description: string;
  date: string; // e.g., "2025-06-15"
  time: string; // e.g., "16:00"
  location: string;
  type: EventType;
};

// --- Helper for formatting dates/times ---
export const formatDateForDisplay = (dateString: string): string => { // Exported
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

export const formatTimeForDisplay = (timeString: string): string => { // Exported
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

// --- Dummy Data (Adjusted for current date/time) ---
export const DUMMY_EVENTS: TeamEvent[] = [ // Changed to export
  {
    id: 'e1',
    title: 'Morning Training Session',
    description: 'Focus on offensive strategies and penalty corners.',
    date: '2025-05-30', // Tomorrow
    time: '09:00',
    location: 'National Hockey Stadium',
    type: 'Practice',
  },
  {
    id: 'e2',
    title: 'Friendly vs. Young Gladiators',
    description: 'Pre-season friendly match to test new formations.',
    date: '2025-06-05', // Next week
    time: '18:30',
    location: 'DTS Field',
    type: 'Friendly Match',
  },
  {
    id: 'e3',
    title: 'Team Video Analysis',
    description: 'Review of last season\'s key matches.',
    date: '2025-06-02', // Early next week
    time: '14:00',
    location: 'Team Meeting Room (Online)',
    type: 'Video Analysis',
  },
  {
    id: 'e4',
    title: 'Team Dinner',
    description: 'Casual team dinner to boost morale.',
    date: '2025-06-15',
    time: '19:00',
    location: 'Joe\'s Beerhouse',
    type: 'Other',
  },
  {
    id: 'e5',
    title: 'Board Meeting with Captains',
    description: 'Discuss upcoming league challenges.',
    date: '2025-05-29', // Today (past)
    time: '20:00',
    location: 'Clubhouse',
    type: 'Team Meeting',
  },
];

const CoachEventsEditor = () => {
  const router = useRouter();
  const [events, setEvents] = useState<TeamEvent[]>(DUMMY_EVENTS);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<TeamEvent | null>(null); // For editing

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date()); // Date object for picker
  const [time, setTime] = useState(new Date()); // Date object for picker (time part)
  const [location, setLocation] = useState('');
  const [type, setType] = useState<EventType>('Practice');

  // For Android DateTimePicker mode 'date' and 'time'
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    // Sort events by date and time when they change
    const sortedEvents = [...events].sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`);
      const dateTimeB = new Date(`${b.date}T${b.time}`);
      return dateTimeA.getTime() - dateTimeB.getTime();
    });
    setEvents(sortedEvents);
  }, [events.length]); // Re-sort when event count changes

  const resetForm = () => {
    setCurrentEvent(null);
    setTitle('');
    setDescription('');
    setDate(new Date());
    setTime(new Date());
    setLocation('');
    setType('Practice');
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (event: TeamEvent) => {
    setCurrentEvent(event);
    setTitle(event.title);
    setDescription(event.description);
    setDate(new Date(`${event.date}T${event.time}`));
    setTime(new Date(`${event.date}T${event.time}`));
    setLocation(event.location);
    setType(event.type);
    setModalVisible(true);
  };

  const handleSaveEvent = () => {
    if (!title.trim() || !location.trim()) {
      Alert.alert('Missing Info', 'Please fill in event title and location.');
      return;
    }

    const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const formattedTime = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`; // HH:MM

    if (currentEvent) {
      // Update existing event
      setEvents(events.map(e =>
        e.id === currentEvent.id
          ? { ...e, title, description, date: formattedDate, time: formattedTime, location, type }
          : e
      ));
      Alert.alert('Success', 'Event updated successfully!');
    } else {
      // Add new event
      const newEvent: TeamEvent = {
        id: `event-${Date.now()}`,
        title,
        description,
        date: formattedDate,
        time: formattedTime,
        location,
        type,
      };
      setEvents([...events, newEvent]);
      Alert.alert('Success', 'Event added successfully!');
    }
    setModalVisible(false);
    resetForm();
  };

  const handleDeleteEvent = (id: string) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            setEvents(events.filter(e => e.id !== id));
            Alert.alert('Deleted', 'Event has been deleted.');
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Mock DateTimePicker functions (replace with real ones)
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep picker open on iOS
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios'); // Keep picker open on iOS
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const showTimepicker = () => {
    setShowTimePicker(true);
  };

  const getEventIcon = (eventType: EventType) => {
    switch (eventType) {
      case 'Practice': return 'sports-hockey';
      case 'Friendly Match': return 'sports-soccer'; // Using soccer icon for match
      case 'Team Meeting': return 'groups';
      case 'Video Analysis': return 'videocam';
      case 'Other': return 'event';
      default: return 'event';
    }
  };

  const getEventTypeColor = (eventType: EventType) => {
    switch (eventType) {
      case 'Practice': return '#007AFF'; // Blue
      case 'Friendly Match': return '#FF9500'; // Orange
      case 'Team Meeting': return '#34C759'; // Green
      case 'Video Analysis': return '#5856D6'; // Purple
      case 'Other': return '#C6C6C6'; // Grey
      default: return '#333';
    }
  };

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#4A90E2', '#283593']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Image
          source={require('../../../assets/images/logo.jpeg')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Event Editor</Text>
        <View style={styles.backButtonPlaceholder} />
      </LinearGradient>

      {/* Events List */}
      {events.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <MaterialIcons name="event-note" size={80} color="#ccc" />
          <Text style={styles.emptyStateText}>No team events scheduled yet!</Text>
          <Text style={styles.emptyStateSubText}>Tap the '+' button to add your first event.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {events.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventCardHeader}>
                <MaterialIcons name={getEventIcon(event.type)} size={28} color={getEventTypeColor(event.type)} />
                <View style={styles.eventTitleContainer}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={[styles.eventTypeBadge, { backgroundColor: getEventTypeColor(event.type) }]}>
                    {event.type}
                  </Text>
                </View>
              </View>
              <Text style={styles.eventDescription}>{event.description}</Text>
              <View style={styles.eventDetailsRow}>
                <MaterialIcons name="calendar-today" size={16} color="#666" />
                <Text style={styles.eventDetailText}>{formatDateForDisplay(event.date)}</Text>
              </View>
              <View style={styles.eventDetailsRow}>
                <MaterialIcons name="access-time" size={16} color="#666" />
                <Text style={styles.eventDetailText}>{formatTimeForDisplay(event.time)}</Text>
              </View>
              <View style={styles.eventDetailsRow}>
                <MaterialIcons name="location-on" size={16} color="#666" />
                <Text style={styles.eventDetailText}>{event.location}</Text>
              </View>
              <View style={styles.eventActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => openEditModal(event)}
                >
                  <MaterialIcons name="edit" size={20} color="#007AFF" />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteEvent(event.id)}
                >
                  <MaterialIcons name="delete" size={20} color="#FF3B30" />
                  <Text style={[styles.actionButtonText, { color: '#FF3B30' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add New Event Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <MaterialIcons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Add/Edit Event Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentEvent ? 'Edit Event' : 'Add New Event'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Event Title"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Description (Optional)"
              placeholderTextColor="#999"
              multiline
              value={description}
              onChangeText={setDescription}
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              placeholderTextColor="#999"
              value={location}
              onChangeText={setLocation}
            />

            {/* Date Picker (Mock or real) */}
            <TouchableOpacity onPress={showDatepicker} style={styles.dateTimeButton}>
              <MaterialIcons name="calendar-today" size={20} color="#666" />
              <Text style={styles.dateTimeButtonText}>
                {date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              // Replace this mock with real DateTimePicker
              <View style={styles.mockDatePicker}>
                <Text>Mock Date Picker: {date.toDateString()}</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={{ color: '#007AFF' }}>Select Date</Text>
                </TouchableOpacity>
              </View>
              /*
              <DateTimePicker
                testID="datePicker"
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
              */
            )}

            {/* Time Picker (Mock or real) */}
            <TouchableOpacity onPress={showTimepicker} style={styles.dateTimeButton}>
              <MaterialIcons name="access-time" size={20} color="#666" />
              <Text style={styles.dateTimeButtonText}>
                {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              // Replace this mock with real DateTimePicker
              <View style={styles.mockDatePicker}>
                <Text>Mock Time Picker: {time.toLocaleTimeString()}</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={{ color: '#007AFF' }}>Select Time</Text>
                </TouchableOpacity>
              </View>
              /*
              <DateTimePicker
                testID="timePicker"
                value={time}
                mode="time"
                display="default"
                onChange={onTimeChange}
              />
              */
            )}

            {/* Event Type Selection */}
            <Text style={styles.label}>Event Type:</Text>
            <View style={styles.typeSelectionContainer}>
              {['Practice', 'Friendly Match', 'Team Meeting', 'Video Analysis', 'Other'].map((typeOption) => (
                <TouchableOpacity
                  key={typeOption}
                  style={[
                    styles.typeOptionButton,
                    type === typeOption && { backgroundColor: getEventTypeColor(typeOption as EventType), borderColor: getEventTypeColor(typeOption as EventType) }
                  ]}
                  onPress={() => setType(typeOption as EventType)}
                >
                  <Text style={[
                    styles.typeOptionText,
                    type === typeOption && { color: '#fff' }
                  ]}>
                    {typeOption}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEvent}>
                <Text style={styles.saveButtonText}>{currentEvent ? 'Update' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5', // Light background
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  backButtonPlaceholder: {
    width: 24 + 10, // Width of icon + margin
    height: 24,
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginLeft: -40, // Adjust title position due to back button/logo
  },
  scrollViewContent: {
    padding: 15,
    paddingBottom: 80, // Space for FAB
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: height * 0.7, // Ensure it's centered vertically if few events
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },
  eventCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  eventTitleContainer: {
    marginLeft: 15,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flexShrink: 1,
    marginRight: 10,
  },
  eventTypeBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: 'hidden', // Ensures text stays within rounded border
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
  eventDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  eventDetailText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  eventActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: '#E6F3FA', // Light blue background
  },
  actionButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE', // Light red background
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#6633FF', // Primary purple-blue
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 5,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  mockDatePicker: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  typeSelectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    justifyContent: 'center',
  },
  typeOptionButton: {
    backgroundColor: '#eee',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  cancelButtonText: {
    color: '#555',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#6633FF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CoachEventsEditor;
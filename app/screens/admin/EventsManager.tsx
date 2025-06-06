import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';

// --- Firebase Imports ---
import { db } from '../../../firebase/firebase';
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';

// --- Type Definitions ---
type EventStatus = 'Draft' | 'Published' | 'Completed' | 'Cancelled';
type EventAudience = 'All' | 'Players' | 'Coaches' | 'Supporters';

type EventItem = {
  id: string; // Firestore document ID
  title: string;
  description: string;
  startDate: number; // Unix timestamp (milliseconds)
  endDate: number; // Unix timestamp (milliseconds)
  location: string;
  organizer?: string;
  audience?: EventAudience;
  registrationLink?: string;
  imageUrl?: string;
  status: EventStatus;
};

const EventsManager = () => {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);
  const [formData, setFormData] = useState<Partial<EventItem>>({});

  // State to hold string representations of dates for TextInput
  const [startDateString, setStartDateString] = useState<string>('');
  const [endDateString, setEndDateString] = useState<string>('');

  const eventsCollectionRef = collection(db, 'events');

  // --- Firebase Data Fetching (Real-time) ---
  useEffect(() => {
    setLoading(true);
    const q = query(eventsCollectionRef, orderBy('startDate', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedEvents: EventItem[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedEvents.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            startDate: data.startDate,
            endDate: data.endDate,
            location: data.location,
            organizer: data.organizer,
            audience: data.audience,
            registrationLink: data.registrationLink,
            imageUrl: data.imageUrl,
            status: data.status,
          } as EventItem);
        });
        setEvents(fetchedEvents);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching events: ', error);
        Alert.alert('Error', 'Could not fetch events from the database.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Effect to initialize form data and date strings when modal opens or eventToEdit changes
  useEffect(() => {
    if (isModalVisible) {
      if (eventToEdit) {
        setFormData({
          ...eventToEdit,
        });
        // Convert Unix timestamps back to a displayable string for the TextInput
        setStartDateString(formatDateForInput(eventToEdit.startDate));
        setEndDateString(formatDateForInput(eventToEdit.endDate));
      } else {
        const now = Date.now();
        const oneHourLater = now + 3600000;
        setFormData({
          title: '',
          description: '',
          startDate: now, // Initialize with current timestamp
          endDate: oneHourLater, // Initialize with 1 hour later
          location: '',
          status: 'Draft',
          audience: 'All',
          organizer: '',
          registrationLink: '',
          imageUrl: '',
        });
        // Initialize string inputs with formatted current times
        setStartDateString(formatDateForInput(now));
        setEndDateString(formatDateForInput(oneHourLater));
      }
    }
  }, [isModalVisible, eventToEdit]);

  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  // Helper to format date for TextInput (e.g., "YYYY-MM-DD HH:mm")
  const formatDateForInput = (timestamp: number): string => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const getStatusStyle = (status: EventStatus) => {
    switch (status) {
      case 'Published':
        return styles.statusPublished;
      case 'Completed':
        return styles.statusCompleted;
      case 'Cancelled':
        return styles.statusCancelled;
      case 'Draft':
        return styles.statusDraft;
      default:
        return {};
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const eventDocRef = doc(db, 'events', eventId);
              await deleteDoc(eventDocRef);
              console.log(`Event ${eventId} deleted from Firestore.`);
              Alert.alert('Success', 'Event deleted successfully.');
            } catch (error) {
              console.error('Error deleting event: ', error);
              Alert.alert('Error', 'Could not delete the event. Please try again.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleAddEvent = () => {
    setEventToEdit(null);
    setIsModalVisible(true);
  };

  const handleEditEvent = (event: EventItem) => {
    setEventToEdit(event);
    setIsModalVisible(true);
  };

  const handleChangeFormData = (
    field: keyof EventItem,
    value: string | number | EventStatus | EventAudience
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // New function to handle date string input and convert it to timestamp
  const handleDateStringChange = (
    field: 'startDate' | 'endDate',
    value: string
  ) => {
    // Update the string state
    if (field === 'startDate') {
      setStartDateString(value);
    } else {
      setEndDateString(value);
    }

    // Attempt to parse the date string. This is a crucial part where validation
    // and specific formatting (e.g., "YYYY-MM-DD HH:mm") are important.
    const parsedDate = new Date(value);

    if (!isNaN(parsedDate.getTime())) {
      handleChangeFormData(field, parsedDate.getTime());
    } else {
      // Handle invalid date input (e.g., show an error, keep old value)
      console.warn(`Invalid date input for ${field}: ${value}`);
      // Optionally, you might want to clear the timestamp in formData or keep the old one
      // setFormData((prev) => ({ ...prev, [field]: undefined })); // Or prev[field]
    }
  };

  const handleSaveModal = async () => {
    // Before saving, ensure the dates from string inputs are converted to numbers
    // and that they are valid.
    const startTimestamp = new Date(startDateString).getTime();
    const endTimestamp = new Date(endDateString).getTime();

    if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
        Alert.alert('Invalid Date Format', 'Please enter dates in a valid format, e.g., "YYYY-MM-DD HH:mm".');
        return;
    }

    if (
      !formData.title ||
      !formData.description ||
      !formData.location
    ) {
      Alert.alert('Missing Information', 'Please fill in Title, Description, and Location.');
      return;
    }

    if (startTimestamp > endTimestamp) {
      Alert.alert('Invalid Dates', 'End Date cannot be before Start Date.');
      return;
    }

    // Prepare data for Firestore, using the parsed timestamps
    const eventDataPayload: Omit<EventItem, 'id'> = {
      title: formData.title!,
      description: formData.description!,
      startDate: startTimestamp, // Use the parsed timestamp
      endDate: endTimestamp, // Use the parsed timestamp
      location: formData.location!,
      organizer: formData.organizer || '',
      audience: formData.audience || 'All',
      registrationLink: formData.registrationLink || '',
      imageUrl: formData.imageUrl || '',
      status: formData.status || 'Draft',
    };

    setLoading(true);

    try {
      if (eventToEdit && eventToEdit.id) {
        const eventDocRef = doc(db, 'events', eventToEdit.id);
        await updateDoc(eventDocRef, eventDataPayload);
        Alert.alert('Success', 'Event updated successfully!');
      } else {
        await addDoc(eventsCollectionRef, eventDataPayload);
        Alert.alert('Success', 'Event added successfully!');
      }
      setIsModalVisible(false);
      setEventToEdit(null);
      // Clear date strings on modal close
      setStartDateString('');
      setEndDateString('');
    } catch (error) {
      console.error('Error saving event: ', error);
      Alert.alert('Error', 'Could not save the event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelModal = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard unsaved changes?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            setIsModalVisible(false);
            setEventToEdit(null);
            setStartDateString(''); // Clear on cancel
            setEndDateString('');   // Clear on cancel
          },
          style: 'destructive',
        },
      ]
    );
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    console.log('Pull-to-refresh triggered.');
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const renderEventCard = ({ item }: { item: EventItem }) => (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => handleEditEvent(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{
          uri:
            item.imageUrl ||
            'https://placehold.co/100x70/CCCCCC/000000?text=Event',
        }}
        style={styles.eventImage}
      />
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventDetails}>
          <MaterialIcons name="calendar-today" size={12} color="#666" />{' '}
          {formatDate(item.startDate)}
        </Text>
        <Text style={styles.eventDetails}>
          <MaterialIcons name="location-on" size={12} color="#666" />{' '}
          {item.location}
        </Text>
        <Text style={[styles.eventStatus, getStatusStyle(item.status)]}>
          {item.status}
        </Text>
      </View>
      <View style={styles.eventActions}>
        <TouchableOpacity
          onPress={() => handleEditEvent(item)}
          style={styles.actionIcon}
        >
          <MaterialIcons name="edit" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteEvent(item.id)}
          style={styles.actionIcon}
        >
          <MaterialIcons name="delete" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading && events.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading Events...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push('./../admin/Dashboard')}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Image
          source={require('../../../assets/images/logo.jpeg')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Manage Events</Text>
      </View>

      <TextInput
        style={styles.searchBar}
        placeholder="Search events..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {filteredEvents.length === 0 && !loading ? (
        <ScrollView
          contentContainerStyle={styles.emptyListContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#007AFF" />
          }
        >
          <MaterialIcons name="event-busy" size={60} color="#ccc" />
          <Text style={styles.emptyListText}>No events found.</Text>
          <Text style={styles.emptyListSubText}>
            Pull down to refresh or tap '+' to add a new event.
          </Text>
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

      <TouchableOpacity style={styles.floatingAddButton} onPress={handleAddEvent}>
        <MaterialIcons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={isModalVisible}
        onRequestClose={handleCancelModal}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCancelModal} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#FF3B30" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {eventToEdit ? 'Edit Event' : 'Add New Event'}
            </Text>
            <TouchableOpacity onPress={handleSaveModal} style={styles.saveButton} disabled={loading}>
              {loading && isModalVisible ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <MaterialIcons name="check" size={24} color="#007AFF" />
              )}
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.formContainer}>
            <Text style={styles.label}>Title:</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => handleChangeFormData('title', text)}
              placeholder="Event Title"
            />

            <Text style={styles.label}>Description:</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={formData.description}
              onChangeText={(text) => handleChangeFormData('description', text)}
              placeholder="Detailed description of the event"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Location:</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => handleChangeFormData('location', text)}
              placeholder="e.g., National Hockey Stadium"
            />

            {/* --- Manual Start Date & Time Input --- */}
            <Text style={styles.label}>Start Date & Time (YYYY-MM-DD HH:mm):</Text>
            <TextInput
              style={styles.input}
              value={startDateString}
              onChangeText={(text) => handleDateStringChange('startDate', text)}
              placeholder="e.g., 2025-06-06 14:30"
              keyboardType="default" // Consider 'datetime' if you want more specific keyboard on some devices
            />

            {/* --- Manual End Date & Time Input --- */}
            <Text style={styles.label}>End Date & Time (YYYY-MM-DD HH:mm):</Text>
            <TextInput
              style={styles.input}
              value={endDateString}
              onChangeText={(text) => handleDateStringChange('endDate', text)}
              placeholder="e.g., 2025-06-06 16:00"
              keyboardType="default" // Consider 'datetime' if you want more specific keyboard on some devices
            />

            <Text style={styles.label}>Organizer (Optional):</Text>
            <TextInput
              style={styles.input}
              value={formData.organizer}
              onChangeText={(text) => handleChangeFormData('organizer', text)}
              placeholder="e.g., NHU Coaching Staff"
            />

            <Text style={styles.label}>Audience:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.audience}
                onValueChange={(itemValue: EventAudience) =>
                  handleChangeFormData('audience', itemValue)
                }
                style={styles.picker}
              >
                <Picker.Item label="All" value="All" />
                <Picker.Item label="Players" value="Players" />
                <Picker.Item label="Coaches" value="Coaches" />
                <Picker.Item label="Supporters" value="Supporters" />
              </Picker>
            </View>

            <Text style={styles.label}>Registration Link (Optional):</Text>
            <TextInput
              style={styles.input}
              value={formData.registrationLink}
              onChangeText={(text) => handleChangeFormData('registrationLink', text)}
              placeholder="URL for registration"
              keyboardType="url"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Image URL (Optional):</Text>
            <TextInput
              style={styles.input}
              value={formData.imageUrl}
              onChangeText={(text) => handleChangeFormData('imageUrl', text)}
              placeholder="Link to event banner image"
              keyboardType="url"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Status:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.status}
                onValueChange={(itemValue: EventStatus) =>
                  handleChangeFormData('status', itemValue)
                }
                style={styles.picker}
              >
                <Picker.Item label="Draft" value="Draft" />
                <Picker.Item label="Published" value="Published" />
                <Picker.Item label="Completed" value="Completed" />
                <Picker.Item label="Cancelled" value="Cancelled" />
              </Picker>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  loadingContainer: { // Added for initial full screen loading
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  loadingText: { // Added
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 25 : 50, // Adjust for status bar
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 15,
    top: Platform.OS === 'android' ? 28 : 50, // Align with header padding
    zIndex: 10,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 8,
  },
  headerLogo: {
    width: Platform.OS === 'android' ? 40 : 50, // Adjusted size
    height: Platform.OS === 'android' ? 40 : 50, // Adjusted size
    // marginBottom: 5, // Removed to align better with title
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10, // OS specific padding
    margin: 15,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    color: '#333', // Text color
  },
  listContent: {
    paddingHorizontal: 15,
    paddingTop: 0, // Removed top padding as searchBar has margin
    paddingBottom: 80,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12, // Increased margin
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, // Slightly reduced opacity
    shadowRadius: 4, // Slightly increased radius
    elevation: 3,
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: '#e9ecef', // Lighter placeholder
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 17, // Slightly larger
    fontWeight: '600',
    color: '#212529', // Darker title
    marginBottom: 5,
  },
  eventDetails: {
    fontSize: 13,
    color: '#495057', // Softer detail color
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 10, // More padding
    paddingVertical: 5,    // More padding
    borderRadius: 15,      // More rounded
    overflow: 'hidden',
    alignSelf: 'flex-start',
    marginTop: 10, // More margin top
    textTransform: 'uppercase', // Uppercase status
    letterSpacing: 0.5,       // Slight letter spacing
  },
  statusPublished: {
    backgroundColor: '#e7f5ff', // Lighter blue
    color: '#007bff',
  },
  statusCompleted: {
    backgroundColor: '#e6f9f0', // Lighter green
    color: '#20c997',
  },
  statusCancelled: {
    backgroundColor: '#fff0f1', // Lighter red
    color: '#dc3545',
  },
  statusDraft: {
    backgroundColor: '#fff9e6', // Lighter orange
    color: '#fd7e14',
  },
  eventActions: {
    flexDirection: 'column', // Changed to column for potentially more actions
    justifyContent: 'space-around', // Space them out
    marginLeft: 10,
    height: '100%', // Take full height of card for alignment
  },
  actionIcon: {
    padding: 6, // Slightly smaller padding
    // Removed marginLeft for column layout
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
    flexGrow: 1, // Use flexGrow to allow scrolling even when content is small
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: Platform.OS === 'ios' ? 300 : 250, // Ensure it takes up some space
  },
  emptyListText: {
    fontSize: 18,
    color: '#6c757d', // Softer color
    textAlign: 'center',
    marginTop: 15,
    fontWeight: '600', // Slightly bolder
  },
  emptyListSubText: {
    fontSize: 14,
    color: '#adb5bd', // Lighter subtext
    textAlign: 'center',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa', // Lighter modal background
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 25 : 50,
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6', // Softer border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600', // Bolder title
    color: '#343a40', // Darker title
  },
  closeButton: {
    padding: 8, // More touch area
  },
  saveButton: {
    padding: 8, // More touch area
    minWidth: 30, // Ensure it has some width for activity indicator
    alignItems: 'center',
  },
  formContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 60 : 40, // More padding at bottom for scroll
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#495057', // Softer label color
    marginBottom: 8, // Increased margin
    marginTop: 18, // Increased margin
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10, // OS specific padding
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ced4da', // Softer border
    marginBottom: 10, // Increased margin
    color: '#495057', // Input text color
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12, // Adjust padding for multiline
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12, // OS specific padding
    borderWidth: 1,
    borderColor: '#ced4da',
    marginBottom: 10,
  },
  datePickerButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#495057',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
    overflow: 'hidden', // Important for Picker border radius on Android
    marginBottom: 10,
    justifyContent: 'center', // Center picker text on Android
  },
  picker: {
    height: Platform.OS === 'ios' ? undefined : 50, // iOS height is intrinsic
    width: '100%',
    color: '#495057', // Picker text color
    backgroundColor: Platform.OS === 'android' ? '#fff' : undefined, // Android needs explicit background
  },
});

export default EventsManager;
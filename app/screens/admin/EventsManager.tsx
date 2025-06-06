import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

// --- Firebase Imports ---
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../../../firebase/firebase';

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

  // States to control date/time picker visibility
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false); // For Android time picker
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false); // For Android time picker


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

  // Effect to initialize form data when modal opens or eventToEdit changes
  useEffect(() => {
    if (isModalVisible) {
      if (eventToEdit) {
        setFormData({
          ...eventToEdit,
        });
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
      }
      // Ensure all pickers are hidden when modal opens/resets
      setShowStartDatePicker(false);
      setShowStartTimePicker(false);
      setShowEndDatePicker(false);
      setShowEndTimePicker(false);
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

  // Helper to format date for display in input (from timestamp)
  const formatTimestampToDisplay = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // Use 24-hour format
    });
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

  const handleStartDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowStartDatePicker(false); // Always hide the date picker

    if (event.type === 'set' && selectedDate) {
      // If a date was picked, update the form data.
      // We only update the date part, keeping the time if it was already set.
      const currentStart = formData.startDate ? new Date(formData.startDate) : new Date();
      currentStart.setFullYear(selectedDate.getFullYear());
      currentStart.setMonth(selectedDate.getMonth());
      currentStart.setDate(selectedDate.getDate());
      
      handleChangeFormData('startDate', currentStart.getTime());

      // On Android, after picking the date, immediately show the time picker
      if (Platform.OS === 'android') {
        setShowStartTimePicker(true);
      }
    }
  };

  const handleStartTimeChange = (event: any, selectedTime: Date | undefined) => {
    setShowStartTimePicker(false); // Always hide the time picker

    if (event.type === 'set' && selectedTime) {
      // If a time was picked, update the form data.
      // We only update the time part, keeping the date.
      const currentStart = formData.startDate ? new Date(formData.startDate) : new Date();
      currentStart.setHours(selectedTime.getHours());
      currentStart.setMinutes(selectedTime.getMinutes());
      currentStart.setSeconds(0);
      currentStart.setMilliseconds(0);

      handleChangeFormData('startDate', currentStart.getTime());
    }
  };

  const handleEndDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowEndDatePicker(false); // Always hide the date picker

    if (event.type === 'set' && selectedDate) {
      const currentEnd = formData.endDate ? new Date(formData.endDate) : new Date();
      currentEnd.setFullYear(selectedDate.getFullYear());
      currentEnd.setMonth(selectedDate.getMonth());
      currentEnd.setDate(selectedDate.getDate());

      handleChangeFormData('endDate', currentEnd.getTime());

      if (Platform.OS === 'android') {
        setShowEndTimePicker(true);
      }
    }
  };

  const handleEndTimeChange = (event: any, selectedTime: Date | undefined) => {
    setShowEndTimePicker(false); // Always hide the time picker

    if (event.type === 'set' && selectedTime) {
      const currentEnd = formData.endDate ? new Date(formData.endDate) : new Date();
      currentEnd.setHours(selectedTime.getHours());
      currentEnd.setMinutes(selectedTime.getMinutes());
      currentEnd.setSeconds(0);
      currentEnd.setMilliseconds(0);

      handleChangeFormData('endDate', currentEnd.getTime());
    }
  };


  const handleSaveModal = async () => {
    // Ensure required fields are filled
    if (
      !formData.title ||
      !formData.description ||
      !formData.location ||
      !formData.startDate ||
      !formData.endDate
    ) {
      Alert.alert('Missing Information', 'Please fill in Title, Description, Location, and both Dates.');
      return;
    }

    // Validate dates
    if (formData.startDate > formData.endDate) {
      Alert.alert('Invalid Dates', 'End Date cannot be before Start Date.');
      return;
    }

    // Prepare data for Firestore
    const eventDataPayload: Omit<EventItem, 'id'> = {
      title: formData.title,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      location: formData.location,
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
            // Ensure all pickers are hidden when modal closes
            setShowStartDatePicker(false);
            setShowStartTimePicker(false);
            setShowEndDatePicker(false);
            setShowEndTimePicker(false);
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

  const now = new Date();
  // Set seconds and milliseconds to 0 for a cleaner comparison and to avoid issues
  now.setSeconds(0);
  now.setMilliseconds(0);

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

            {/* --- Start Date & Time Pickers --- */}
            <Text style={styles.label}>Start Date & Time:</Text>
            <TouchableOpacity
              onPress={() => setShowStartDatePicker(true)}
              style={styles.datePickerButton}
            >
              <MaterialIcons name="event" size={20} color="#666" />
              <Text style={styles.datePickerButtonText}>
                {formData.startDate ? formatTimestampToDisplay(formData.startDate) : 'Select Start Date & Time'}
              </Text>
            </TouchableOpacity>
            {showStartDatePicker && (
              <DateTimePicker
                value={formData.startDate ? new Date(formData.startDate) : now}
                mode="date" // Always 'date' for initial selection
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleStartDateChange}
                minimumDate={now} // Forbid past dates
              />
            )}
            {Platform.OS === 'android' && showStartTimePicker && (
              <DateTimePicker
                value={formData.startDate ? new Date(formData.startDate) : now}
                mode="time" // Separate time picker for Android
                display="default"
                onChange={handleStartTimeChange}
              />
            )}

            {/* --- End Date & Time Pickers --- */}
            <Text style={styles.label}>End Date & Time:</Text>
            <TouchableOpacity
              onPress={() => setShowEndDatePicker(true)}
              style={styles.datePickerButton}
            >
              <MaterialIcons name="event" size={20} color="#666" />
              <Text style={styles.datePickerButtonText}>
                {formData.endDate ? formatTimestampToDisplay(formData.endDate) : 'Select End Date & Time'}
              </Text>
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                value={formData.endDate ? new Date(formData.endDate) : formData.startDate ? new Date(formData.startDate) : now}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleEndDateChange}
                minimumDate={formData.startDate ? new Date(formData.startDate) : now} // Ensure end date is not before start date, and not in the past
              />
            )}
             {Platform.OS === 'android' && showEndTimePicker && (
              <DateTimePicker
                value={formData.endDate ? new Date(formData.endDate) : formData.startDate ? new Date(formData.startDate) : now}
                mode="time"
                display="default"
                onChange={handleEndTimeChange}
              />
            )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 25 : 50,
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
    top: Platform.OS === 'android' ? 28 : 50,
    zIndex: 10,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 8,
  },
  headerLogo: {
    width: Platform.OS === 'android' ? 40 : 50,
    height: Platform.OS === 'android' ? 40 : 50,
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
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    margin: 15,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    color: '#333',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingTop: 0,
    paddingBottom: 80,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: '#e9ecef',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 5,
  },
  eventDetails: {
    fontSize: 13,
    color: '#495057',
    marginTop: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusPublished: {
    backgroundColor: '#e7f5ff',
    color: '#007bff',
  },
  statusCompleted: {
    backgroundColor: '#e6f9f0',
    color: '#20c997',
  },
  statusCancelled: {
    backgroundColor: '#fff0f1',
    color: '#dc3545',
  },
  statusDraft: {
    backgroundColor: '#fff9e6',
    color: '#fd7e14',
  },
  eventActions: {
    flexDirection: 'column',
    justifyContent: 'space-around',
    marginLeft: 10,
    height: '100%',
  },
  actionIcon: {
    padding: 6,
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
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: Platform.OS === 'ios' ? 300 : 250,
  },
  emptyListText: {
    fontSize: 18,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 15,
    fontWeight: '600',
  },
  emptyListSubText: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
    marginTop: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    borderBottomColor: '#dee2e6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#343a40',
  },
  closeButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
    minWidth: 30,
    alignItems: 'center',
  },
  formContainer: {
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 60 : 40,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
    marginTop: 18,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ced4da',
    marginBottom: 10,
    color: '#495057',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
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
    overflow: 'hidden',
    marginBottom: 10,
    justifyContent: 'center',
  },
  picker: {
    height: Platform.OS === 'ios' ? undefined : 50,
    width: '100%',
    color: '#495057',
    backgroundColor: Platform.OS === 'android' ? '#fff' : undefined,
  },
});

export default EventsManager;
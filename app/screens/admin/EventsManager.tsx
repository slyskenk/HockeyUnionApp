import { MaterialIcons } from '@expo/vector-icons'; // For various icons
import { useRouter } from 'expo-router'; // Import useRouter
import React, { useCallback, useEffect, useState } from 'react'; // Added useEffect
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
} from 'react-native';

// Import for date/time pickers and dropdowns
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

// --- Type Definitions ---

// Define possible statuses for an event
type EventStatus = 'Draft' | 'Published' | 'Completed' | 'Cancelled';
type EventAudience = 'All' | 'Players' | 'Coaches' | 'Supporters'; // Define Audience type

// Define the structure for an Event item
type EventItem = {
  id: string;
  title: string;
  description: string;
  startDate: number; // Unix timestamp
  endDate: number; // Unix timestamp
  location: string;
  organizer?: string;
  audience?: EventAudience; // Use the defined type
  registrationLink?: string;
  imageUrl?: string; // Optional event banner/image
  status: EventStatus; // Use the defined type
};

// --- Dummy Data ---

const DUMMY_EVENTS: EventItem[] = [
  {
    id: 'e1',
    title: "Senior Men's League Matchday 5",
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
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>(DUMMY_EVENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // --- State for the Modal Form ---
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null); // Holds event data for editing or null for new event
  const [formData, setFormData] = useState<Partial<EventItem>>({}); // State for form inputs
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Effect to initialize form data when modal opens or eventToEdit changes
  useEffect(() => {
    if (isModalVisible) {
      if (eventToEdit) {
        setFormData(eventToEdit); // Populate with existing event data
      } else {
        // Initialize for a new event
        setFormData({
          id: `new-${Date.now()}`, // Generate a temporary ID for new event
          title: '',
          description: '',
          startDate: Date.now(),
          endDate: Date.now() + 3600000, // +1 hour from now
          location: '',
          status: 'Draft',
          audience: 'All',
          organizer: '',
          registrationLink: '',
          imageUrl: '',
        });
      }
    }
  }, [isModalVisible, eventToEdit]);

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
   * Opens the modal to add a new event.
   */
  const handleAddEvent = () => {
    setEventToEdit(null); // No event to edit, so it's a new one
    setIsModalVisible(true);
  };

  /**
   * Opens the modal to edit an existing event.
   * @param event The event object to edit.
   */
  const handleEditEvent = (event: EventItem) => {
    setEventToEdit(event); // Set the event data to pre-fill the form
    setIsModalVisible(true);
  };

  // --- Modal Form Handlers ---

  /**
   * Updates a specific field of the modal form data.
   */
  const handleChangeFormData = (field: keyof EventItem, value: string | number | EventStatus | EventAudience) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Handles date/time picker changes for the form.
   */
  const onDateChange = (event: any, selectedDate: Date | undefined, field: 'startDate' | 'endDate') => {
    const currentDate = selectedDate || (field === 'startDate' ? new Date(formData.startDate!) : new Date(formData.endDate!));
    if (field === 'startDate') setShowStartDatePicker(Platform.OS === 'ios');
    else setShowEndDatePicker(Platform.OS === 'ios');

    if (currentDate) {
      handleChangeFormData(field, currentDate.getTime());
    }
  };

  /**
   * Handles saving the event data from the modal form.
   */
  const handleSaveModal = () => {
    // Basic validation
    if (!formData.title || !formData.description || !formData.location || !formData.startDate || !formData.endDate) {
      Alert.alert('Missing Information', 'Please fill in Title, Description, Location, Start Date, and End Date.');
      return;
    }

    if (formData.startDate > formData.endDate) {
      Alert.alert('Invalid Dates', 'End Date cannot be before Start Date.');
      return;
    }

    // Ensure all required fields for EventItem type are present
    const finalData: EventItem = {
      id: formData.id || `e${Date.now()}`, // Ensure ID exists for new events
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

    const isNew = !eventToEdit; // If eventToEdit was null, it's a new event

    if (isNew) {
      setEvents(prevEvents => [finalData, ...prevEvents]); // Add new event to the beginning
    } else {
      setEvents(prevEvents =>
        prevEvents.map(event => (event.id === finalData.id ? finalData : event))
      );
    }
    setIsModalVisible(false); // Close the modal
    setEventToEdit(null); // Clear the event being edited
    Alert.alert('Success', `Event ${isNew ? 'added' : 'updated'} successfully!`);
    // In a real app, send data to your backend API here
  };

  /**
   * Handles canceling the modal form.
   */
  const handleCancelModal = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard unsaved changes?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            setIsModalVisible(false); // Close the modal
            setEventToEdit(null); // Clear any pending event to edit
          },
          style: 'destructive',
        },
      ]
    );
  };

  /**
   * Simulates refreshing events (e.g., fetching new data from a server).
   */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate fetching new data
    setTimeout(() => {
      const newEvent: EventItem = {
        id: `fresh-${Date.now()}`,
        title: 'Refreshed Event Added!',
        description: 'This event appeared after pulling down to refresh.',
        startDate: Date.now() + (1000 * 60 * 60 * 24 * 7), // 7 days from now
        endDate: Date.now() + (1000 * 60 * 60 * 24 * 7) + (1000 * 60 * 60 * 2), // 2 hours duration
        location: 'Refresh Arena',
        status: 'Draft',
      };
      setEvents(prev => [newEvent, ...prev.slice(0, 4)]); // Add new, keep list shorter for demo
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
      onPress={() => handleEditEvent(item)} // Tapping card opens edit modal
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
        {/* Back button */}
        <TouchableOpacity onPress={() => router.push('./../admin/Dashboard')} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
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

      {/* --- Modal Form for Add/Edit Event (All within EventsManager.tsx) --- */}
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
            <Text style={styles.modalTitle}>{eventToEdit ? 'Edit Event' : 'Add New Event'}</Text>
            <TouchableOpacity onPress={handleSaveModal} style={styles.saveButton}>
              <MaterialIcons name="check" size={24} color="#007AFF" />
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

            <Text style={styles.label}>Start Date & Time:</Text>
            <TouchableOpacity onPress={() => setShowStartDatePicker(true)} style={styles.datePickerButton}>
              <MaterialIcons name="calendar-today" size={20} color="#007AFF" />
              <Text style={styles.datePickerButtonText}>{formatDate(formData.startDate!)}</Text>
            </TouchableOpacity>
            {showStartDatePicker && (
              <DateTimePicker
                testID="startDatePicker"
                value={new Date(formData.startDate || Date.now())}
                mode="datetime"
                is24Hour={true}
                display="default"
                onChange={(e, d) => onDateChange(e, d, 'startDate')}
              />
            )}

            <Text style={styles.label}>End Date & Time:</Text>
            <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.datePickerButton}>
              <MaterialIcons name="calendar-today" size={20} color="#007AFF" />
              <Text style={styles.datePickerButtonText}>{formatDate(formData.endDate!)}</Text>
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                testID="endDatePicker"
                value={new Date(formData.endDate || Date.now())}
                mode="datetime"
                is24Hour={true}
                display="default"
                onChange={(e, d) => onDateChange(e, d, 'endDate')}
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
                onValueChange={(itemValue: EventAudience) => handleChangeFormData('audience', itemValue)}
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
                onValueChange={(itemValue: EventStatus) => handleChangeFormData('status', itemValue)}
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
    flexDirection: 'row', // Added for back button positioning
    justifyContent: 'center', // Center content
  },
  backButton: {
    position: 'absolute', // Position absolutely
    left: 15,
    top: 50, // Align with header padding
    zIndex: 10, // Ensure it's above other elements
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 8,
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
    marginLeft: 10, // Adjust for logo and back button
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
  // --- Modal Specific Styles (copied from previous modal component) ---
  modalContainer: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  saveButton: {
    padding: 5,
  },
  formContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 5,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 5,
  },
  datePickerButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
    marginBottom: 5,
  },
  picker: {
    height: 50,
    width: '100%',
  },
});

export default EventsManager;
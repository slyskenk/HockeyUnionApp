import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image, // For FAB animation
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
// For a real app, uncomment this import:
// import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

// --- Types ---
type TrainingSession = {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  location: string;
  focus: string; // e.g., "Offensive Drills", "Defensive Positioning"
  drills: string[]; // List of drills, e.g., ["Warm-up (10 min)", "Passing Grid (20 min)", "Small-sided Game (30 min)"]
  notes?: string; // Optional coach notes
};

// --- Helper Functions ---
const getFormattedDate = (date: Date): string => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
};

const getFormattedTime = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`; // HH:MM
};

const displayDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const displayTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

// --- Dummy Data ---
const TODAY = getFormattedDate(new Date());
const TOMORROW = getFormattedDate(new Date(Date.now() + 86400000)); // 24 hours later
const DAY_AFTER_TOMORROW = getFormattedDate(new Date(Date.now() + (2 * 86400000)));

const DUMMY_TRAINING_SESSIONS: TrainingSession[] = [
  {
    id: 's1',
    date: TODAY,
    time: '16:00',
    location: 'National Hockey Stadium',
    focus: 'Defensive Positioning & Tackling',
    drills: [
      'Warm-up & Dynamic Stretching (10 min)',
      '1v1 Tackling Drills (20 min)',
      'Zonal Defense Principles (30 min)',
      'Small-sided Game: Defensive Focus (30 min)',
    ],
    notes: 'Focus on communication and quick recovery.',
  },
  {
    id: 's2',
    date: TOMORROW,
    time: '09:00',
    location: 'DTS Field',
    focus: 'Offensive Strategies & Penalty Corners',
    drills: [
      'Warm-up (10 min)',
      'Passing & Receiving Grid (20 min)',
      'Attacking Penalty Corner Routines (30 min)',
      'Full Field Attack Play (40 min)',
    ],
    notes: 'Emphasize quick ball movement and decisive finishing.',
  },
  {
    id: 's3',
    date: TOMORROW,
    time: '18:30',
    location: 'Clubhouse Meeting Room',
    focus: 'Team Tactics Review',
    drills: ['Video Analysis of last match', 'Discussion on upcoming opponent'],
    notes: 'Bring notebooks and be prepared to discuss.',
  },
  {
    id: 's4',
    date: DAY_AFTER_TOMORROW,
    time: '17:00',
    location: 'National Hockey Stadium',
    focus: 'Fitness & Conditioning',
    drills: ['Interval Sprints', 'Agility Ladder Drills', 'Endurance Runs'],
    notes: 'High intensity session. Hydration is key.',
  },
];

const TrainingPlanner = () => {
  const router = useRouter();
  const [sessions, setSessions] = useState<TrainingSession[]>(DUMMY_TRAINING_SESSIONS);
  const [selectedDate, setSelectedDate] = useState<string>(TODAY); // Default to today
  const [modalVisible, setModalVisible] = useState(false);
  const [currentSession, setCurrentSession] = useState<TrainingSession | null>(null); // For editing

  // Form states for Add/Edit Modal
  const [title, setTitle] = useState(''); // Using 'title' for 'focus' in the form
  const [location, setLocation] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date()); // Date object for picker
  const [sessionTime, setSessionTime] = useState(new Date()); // Date object for picker (time part)
  const [drills, setDrills] = useState(''); // Single string for drills, split by newline
  const [notes, setNotes] = useState('');

  // For Android DateTimePicker mode 'date' and 'time'
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Animation for FAB button
  const fabScale = useRef(new Animated.Value(1)).current;

  // Input focus states for styling
  const [titleFocused, setTitleFocused] = useState(false);
  const [locationFocused, setLocationFocused] = useState(false);
  const [drillsFocused, setDrillsFocused] = useState(false);
  const [notesFocused, setNotesFocused] = useState(false);

  // Get sessions for the selected date
  const sessionsForSelectedDate = sessions
    .filter(session => session.date === selectedDate)
    .sort((a, b) => {
      // Sort by time
      const timeA = new Date(`1970/01/01 ${a.time}`);
      const timeB = new Date(`1970/01/01 ${b.time}`);
      return timeA.getTime() - timeB.getTime();
    });

  // Generate a list of dates to display in the horizontal calendar
  const getDatesForCalendar = () => {
    const dates: { date: string; hasSession: boolean }[] = [];
    const today = new Date();
    for (let i = -7; i <= 30; i++) { // Show 7 days before and 30 days after today
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const formattedDate = getFormattedDate(date);
      const hasSession = sessions.some(s => s.date === formattedDate);
      dates.push({ date: formattedDate, hasSession });
    }
    return dates;
  };

  const calendarDates = getDatesForCalendar();

  const resetForm = () => {
    setCurrentSession(null);
    setTitle('');
    setLocation('');
    setSessionDate(new Date());
    setSessionTime(new Date());
    setDrills('');
    setNotes('');
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (session: TrainingSession) => {
    setCurrentSession(session);
    setTitle(session.focus);
    setLocation(session.location);
    setSessionDate(new Date(`${session.date}T${session.time}`));
    setSessionTime(new Date(`${session.date}T${session.time}`));
    setDrills(session.drills.join('\n')); // Join drills back to a single string
    setNotes(session.notes || '');
    setModalVisible(true);
  };

  const handleSaveSession = () => {
    if (!title.trim() || !location.trim() || !drills.trim()) {
      Alert.alert('Missing Info', 'Please fill in session focus, location, and drills.');
      return;
    }

    const formattedDate = getFormattedDate(sessionDate);
    const formattedTime = getFormattedTime(sessionTime);
    const drillsArray = drills.split('\n').map(d => d.trim()).filter(d => d.length > 0);

    if (currentSession) {
      // Update existing session
      setSessions(sessions.map(s =>
        s.id === currentSession.id
          ? { ...s, focus: title.trim(), location: location.trim(), date: formattedDate, time: formattedTime, drills: drillsArray, notes: notes.trim() }
          : s
      ));
      Alert.alert('Success', 'Training session updated successfully!');
    } else {
      // Add new session
      const newSession: TrainingSession = {
        id: `session-${Date.now()}`,
        focus: title.trim(),
        location: location.trim(),
        date: formattedDate,
        time: formattedTime,
        drills: drillsArray,
        notes: notes.trim(),
      };
      setSessions([...sessions, newSession]);
      Alert.alert('Success', 'New training session added!');
    }
    setModalVisible(false);
    resetForm();
  };

  const handleDeleteSession = (id: string) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this training session? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            setSessions(sessions.filter(s => s.id !== id));
            Alert.alert('Deleted', 'Training session has been deleted.');
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Mock DateTimePicker functions (replace with real ones)
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSessionDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setSessionTime(selectedTime);
    }
  };

  const showDatepicker = () => {
    Alert.alert('Mock Date Picker', 'This would open a date picker in a real app.');
    // setShowDatePicker(true); // Uncomment for real picker
  };

  const showTimepicker = () => {
    Alert.alert('Mock Time Picker', 'This would open a time picker in a real app.');
    // setShowTimePicker(true); // Uncomment for real picker
  };

  // FAB animation
  const animateFabPress = () => {
    Animated.sequence([
      Animated.timing(fabScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.spring(fabScale, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }),
    ]).start();
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
        <Text style={styles.headerTitle}>Training Planner</Text>
        <View style={styles.backButtonPlaceholder} />
      </LinearGradient>

      {/* Horizontal Date Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateSelectorContainer}
      >
        {calendarDates.map((day) => (
          <TouchableOpacity
            key={day.date}
            style={[
              styles.dateBubble,
              selectedDate === day.date && styles.selectedDateBubble,
              day.hasSession && styles.hasSessionBubble,
            ]}
            onPress={() => setSelectedDate(day.date)}
          >
            <Text style={[
              styles.dateText,
              selectedDate === day.date && styles.selectedDateText,
            ]}>
              {displayDate(day.date).split(' ')[0]} {/* Day of week */}
            </Text>
            <Text style={[
              styles.dayNumberText,
              selectedDate === day.date && styles.selectedDayNumberText,
            ]}>
              {new Date(day.date).getDate()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Training Sessions List for Selected Date */}
      {sessionsForSelectedDate.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name="calendar-edit" size={100} color="#E0E0E0" />
          <Text style={styles.emptyStateText}>No training planned for {displayDate(selectedDate)}!</Text>
          <Text style={styles.emptyStateSubText}>Tap the '+' button to schedule a session.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {sessionsForSelectedDate.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionCardHeader}>
                <MaterialIcons name="fitness-center" size={28} color="#6633FF" />
                <View style={styles.sessionTitleContainer}>
                  <Text style={styles.sessionFocus}>{session.focus}</Text>
                  <Text style={styles.sessionTime}>{displayTime(session.time)}</Text>
                </View>
              </View>
              <View style={styles.sessionDetailsRow}>
                <MaterialIcons name="location-on" size={16} color="#666" />
                <Text style={styles.sessionDetailText}>{session.location}</Text>
              </View>
              <Text style={styles.drillsTitle}>Drills:</Text>
              {session.drills.map((drill, index) => (
                <View key={index} style={styles.drillItem}>
                  <MaterialIcons name="check-circle-outline" size={16} color="#34C759" />
                  <Text style={styles.drillText}>{drill}</Text>
                </View>
              ))}
              {session.notes && (
                <View style={styles.sessionNotesContainer}>
                  <MaterialIcons name="sticky-note-2" size={16} color="#FF9500" />
                  <Text style={styles.sessionNotesText}>{session.notes}</Text>
                </View>
              )}
              <View style={styles.sessionActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => openEditModal(session)}
                >
                  <MaterialIcons name="edit" size={20} color="#007AFF" />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteSession(session.id)}
                >
                  <MaterialIcons name="delete" size={20} color="#FF3B30" />
                  <Text style={[styles.actionButtonText, { color: '#FF3B30' }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add New Session Floating Action Button */}
      <Animated.View style={[styles.fab, { transform: [{ scale: fabScale }] }]}>
        <TouchableOpacity
          onPress={() => {
            animateFabPress();
            openAddModal();
          }}
          style={styles.fabButton}
        >
          <MaterialIcons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Add/Edit Session Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentSession ? 'Edit Training Session' : 'New Training Session'}</Text>

            <TextInput
              style={[styles.input, titleFocused && styles.inputFocused]}
              placeholder="Session Focus (e.g., Offensive Drills)"
              placeholderTextColor="#999"
              value={title}
              onChangeText={setTitle}
              onFocus={() => setTitleFocused(true)}
              onBlur={() => setTitleFocused(false)}
            />
            <TextInput
              style={[styles.input, locationFocused && styles.inputFocused]}
              placeholder="Location"
              placeholderTextColor="#999"
              value={location}
              onChangeText={setLocation}
              onFocus={() => setLocationFocused(true)}
              onBlur={() => setLocationFocused(false)}
            />

            {/* Date Picker (Mock or real) */}
            <TouchableOpacity onPress={showDatepicker} style={styles.dateTimeButton}>
              <MaterialIcons name="calendar-today" size={20} color="#666" />
              <Text style={styles.dateTimeButtonText}>
                {sessionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Text>
            </TouchableOpacity>
            {/* Uncomment and use real DateTimePicker if installed */}
            {/*
            {showDatePicker && (
              <DateTimePicker
                testID="datePicker"
                value={sessionDate}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
            */}

            {/* Time Picker (Mock or real) */}
            <TouchableOpacity onPress={showTimepicker} style={styles.dateTimeButton}>
              <MaterialIcons name="access-time" size={20} color="#666" />
              <Text style={styles.dateTimeButtonText}>
                {sessionTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </Text>
            </TouchableOpacity>
            {/* Uncomment and use real DateTimePicker if installed */}
            {/*
            {showTimePicker && (
              <DateTimePicker
                testID="timePicker"
                value={sessionTime}
                mode="time"
                display="default"
                onChange={onTimeChange}
              />
            )}
            */}

            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }, drillsFocused && styles.inputFocused]}
              placeholder="Drills (one per line)"
              placeholderTextColor="#999"
              multiline
              value={drills}
              onChangeText={setDrills}
              onFocus={() => setDrillsFocused(true)}
              onBlur={() => setDrillsFocused(false)}
            />
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top' }, notesFocused && styles.inputFocused]}
              placeholder="Coach Notes (Optional)"
              placeholderTextColor="#999"
              multiline
              value={notes}
              onChangeText={setNotes}
              onFocus={() => setNotesFocused(true)}
              onBlur={() => setNotesFocused(false)}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveSession}>
                <Text style={styles.saveButtonText}>{currentSession ? 'Update Session' : 'Add Session'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
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
    width: 24 + 10,
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
    marginLeft: -40,
  },
  dateSelectorContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  dateBubble: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 70, // Ensure consistent width
  },
  selectedDateBubble: {
    backgroundColor: '#6633FF',
    borderColor: '#6633FF',
    shadowColor: '#6633FF',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  hasSessionBubble: {
    borderColor: '#34C759', // Green border for days with sessions
    borderWidth: 2,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  selectedDateText: {
    color: '#fff',
  },
  dayNumberText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  selectedDayNumberText: {
    color: '#fff',
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
    minHeight: height * 0.5,
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
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
    borderLeftWidth: 6,
    borderLeftColor: '#FF9500', // Orange accent for training sessions
  },
  sessionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sessionTitleContainer: {
    marginLeft: 15,
    flex: 1,
  },
  sessionFocus: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  sessionTime: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  sessionDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  sessionDetailText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
  },
  drillsTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  drillItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  drillText: {
    fontSize: 14,
    color: '#444',
    marginLeft: 10,
    flexShrink: 1,
  },
  sessionNotesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBE6', // Light yellow background for notes
    borderRadius: 10,
    padding: 10,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  sessionNotesText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 10,
    flexShrink: 1,
    fontStyle: 'italic',
  },
  sessionActions: {
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
    backgroundColor: '#E6F3FA',
  },
  actionButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#6633FF',
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
  fabButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
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
  inputFocused: {
    borderColor: '#6633FF', // Highlight border on focus
    shadowColor: '#6633FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
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

export default TrainingPlanner;

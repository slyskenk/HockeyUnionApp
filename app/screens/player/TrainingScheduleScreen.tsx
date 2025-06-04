import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView, // Used for demo alerts, consider custom modals for production
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// --- Data Structures ---
const trainingPlanData = {
  todayActivity: { completed: 2, total: 4, timeSpent: 30, totalTime: 60 },
  myLevel: { percentage: 25, currentLevel: 'Basic Level', toMidLevel: 75, toProLevel: 175 },
  caloriesBurned: { today: 378, thisWeek: 2150 },
  categories: [
    { id: '1', name: 'Back and Stomach', icon: 'body-outline', color: '#FFD6E0', exercises: 3, duration: 45, progress: 0.6 },
    { id: '2', name: 'Hands and Arms', icon: 'barbell-outline', color: '#D6EAF8', exercises: 5, duration: 60, progress: 0.25 },
    { id: '3', name: 'Neck and Shoulders', icon: 'headset-outline', color: '#E8DAEF', exercises: 4, duration: 30, progress: 0.9 },
    { id: '4', name: 'Legs and Core', icon: 'walk-outline', color: '#D1F2EB', exercises: 6, duration: 75, progress: 0.0 },
  ],
};

// Placeholder data for exercises per category
// In a real app, this would come from a backend/database
const allExercisesData: { [key: string]: any[] } = {
  '1': [ // Back and Stomach
    { id: 'ex1', name: 'Plank', duration: '60 seconds', sets: 3, done: true },
    { id: 'ex2', name: 'Crunches', duration: '20 reps', sets: 3, done: false },
    { id: 'ex3', name: 'Bird Dog', duration: '15 reps/side', sets: 3, done: false },
    { id: 'ex4', name: 'Superman Holds', duration: '30 seconds', sets: 4, done: true },
  ],
  '2': [ // Hands and Arms
    { id: 'ex5', name: 'Bicep Curls', duration: '12 reps', sets: 4, done: false },
    { id: 'ex6', name: 'Tricep Dips', duration: '15 reps', sets: 3, done: false },
    { id: 'ex7', name: 'Push-ups', duration: 'Max reps', sets: 3, done: true },
  ],
  '3': [ // Neck and Shoulders
    { id: 'ex8', name: 'Shoulder Press', duration: '10 reps', sets: 4, done: false },
    { id: 'ex9', name: 'Lateral Raises', duration: '15 reps', sets: 3, done: false },
  ],
  '4': [ // Legs and Core
    { id: 'ex10', name: 'Squats', duration: '15 reps', sets: 4, done: false },
    { id: 'ex11', name: 'Lunges', duration: '12 reps/leg', sets: 3, done: false },
  ],
};

// Category colors for consistency
const categoryColors: { [key: string]: string } = {
  '1': '#FFD6E0', // Light Pink
  '2': '#D6EAF8', // Light Blue
  '3': '#E8DAEF', // Light Purple
  '4': '#D1F2EB', // Light Teal
};

export default function TrainingScheduleScreen() {
  const router = useRouter();

  // State to manage which category is currently selected for detailed view
  // If null, show the main overview. If an object, show category details.
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string; color: string; } | null>(null);

  // State for exercises of the selected category
  const [exercises, setExercises] = useState<any[]>([]);

  // State for the current category's accent color (used in detail view)
  const [currentCategoryColor, setCurrentCategoryColor] = useState('#F4F6F9');

  // States for the Add Exercise Modal
  const [addExerciseModalVisible, setAddExerciseModalVisible] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseDuration, setNewExerciseDuration] = useState('');
  const [newExerciseSets, setNewExerciseSets] = useState('');

  // Effect to load exercises when a category is selected or deselected
  useEffect(() => {
    if (selectedCategory) {
      // Deep copy the exercises data to allow local modifications
      setExercises(JSON.parse(JSON.stringify(allExercisesData[selectedCategory.id] || [])));
      setCurrentCategoryColor(selectedCategory.color || '#F4F6F9');
    } else {
      // Clear exercises and reset color when no category is selected (back to overview)
      setExercises([]);
      setCurrentCategoryColor('#F4F6F9');
    }
  }, [selectedCategory]);

  /**
   * Handles navigation to a specific category's detail view.
   * Instead of router.push, it updates the local state to switch views.
   */
  const navigateToCategoryDetail = (categoryId: string, categoryName: string, categoryColor: string) => {
    setSelectedCategory({ id: categoryId, name: categoryName, color: categoryColor });
  };

  /**
   * Navigates to the Training Resources screen.
   */
  const goToResources = () => {
    router.push('/screens/player/TrainingResources'); // Assumes this route exists
  };

  /**
   * Toggles the 'done' status of an exercise.
   * @param exerciseId The ID of the exercise to toggle.
   */
  const toggleExerciseDone = (exerciseId: string) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, done: !ex.done } : ex
      )
    );
    // In a real app, you would also update this status in your backend/storage
  };

  /**
   * Simulates starting an exercise and immediately marks it as done for demo purposes.
   * @param exerciseId The ID of the exercise to mark as done.
   * @param exerciseName The name of the exercise to "start".
   */
  const startExercise = (exerciseId: string, exerciseName: string) => {
    Alert.alert("Let's Go!", `Starting ${exerciseName}. Get ready!`);
    // After "starting" (for demo), mark it as done
    toggleExerciseDone(exerciseId); // This will flip the 'done' status
  }

  /**
   * Handles adding a new exercise to the current category.
   */
  const handleAddExercise = () => {
    if (!newExerciseName.trim() || !newExerciseDuration.trim() || !newExerciseSets.trim()) {
      Alert.alert('Missing Information', 'Please fill in all fields for the new exercise.');
      return;
    }

    const newExercise = {
      id: `ex-${Date.now()}`, // Generate a unique ID
      name: newExerciseName.trim(),
      duration: newExerciseDuration.trim(),
      sets: parseInt(newExerciseSets.trim(), 10), // Convert sets to a number
      done: false, // New exercises are not done by default
    };

    // Add the new exercise to the current category's exercises
    setExercises(prevExercises => [...prevExercises, newExercise]);

    // Also update the dummy data source for persistence in this demo
    if (selectedCategory && allExercisesData[selectedCategory.id]) {
      allExercisesData[selectedCategory.id].push(newExercise);
    }

    // Clear form fields and close the modal
    setNewExerciseName('');
    setNewExerciseDuration('');
    setNewExerciseSets('');
    setAddExerciseModalVisible(false);
    Alert.alert('Success', 'Exercise added successfully!');
  };

  // Calculate progress for the current category's exercises
  const totalExercises = exercises.length;
  const completedExercises = exercises.filter(ex => ex.done).length;
  const overallProgress = totalExercises > 0 ? completedExercises / totalExercises : 0;

  // Determine header title and back button action based on selectedCategory
  const headerTitle = selectedCategory ? selectedCategory.name : 'My Training Schedule';
  const handleHeaderBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null); // Go back to overview
    } else {
      router.back(); // Go back using router if on main overview
    }
  };

  return (
    <View style={styles.flexContainer}>
      {/* Header */}
      <LinearGradient
        colors={['#2E5AAC', '#3D7BE5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={handleHeaderBack} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{headerTitle}</Text>
        {selectedCategory && ( // Show add button only in category detail view
          <TouchableOpacity onPress={() => setAddExerciseModalVisible(true)} style={styles.addExerciseButton}>
            <MaterialIcons name="add-circle-outline" size={28} color="#fff" />
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Main Content Area */}
      {selectedCategory === null ? (
        // --- Training Overview Section ---
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
          {/* Overview Section */}
          <View style={styles.overviewSection}>
            <View style={[styles.overviewCard, styles.activityCard]}>
              <Text style={styles.overviewCardTitle}>Today's Activity</Text>
              <View style={styles.progressCircleContainer}>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressText}>
                    {trainingPlanData.todayActivity.completed}/{trainingPlanData.todayActivity.total}
                  </Text>
                </View>
              </View>
              <Text style={styles.activityTimeText}>
                {trainingPlanData.todayActivity.timeSpent} min out of {trainingPlanData.todayActivity.totalTime} min
              </Text>
            </View>

            <View style={[styles.overviewCard, styles.levelCard]}>
              <Text style={styles.overviewCardTitle}>My Level</Text>
              <View style={styles.progressCircleContainer}>
                <View style={styles.progressCircle}>
                  <Text style={styles.progressTextPercentage}>
                    {trainingPlanData.myLevel.percentage}%
                  </Text>
                </View>
              </View>
              <Text style={styles.levelText}>{trainingPlanData.myLevel.currentLevel}</Text>
              <Text style={styles.levelDetailText}>{trainingPlanData.myLevel.toMidLevel}% left to mid-level</Text>
            </View>
          </View>

          {/* Calories Burned */}
          <View style={styles.caloriesCard}>
            <Ionicons name="flame-outline" size={28} color="#FF6B6B" />
            <View style={styles.caloriesTextContainer}>
              <Text style={styles.caloriesTitle}>Calories Burned</Text>
              <Text style={styles.caloriesValue}>{trainingPlanData.caloriesBurned.today} kcal</Text>
              <Text style={styles.caloriesSubtitle}>Today</Text>
            </View>
            <View style={styles.caloriesDivider} />
            <View style={styles.caloriesTextContainer}>
              <Text style={styles.caloriesTitle}>This Week</Text>
              <Text style={styles.caloriesValue}>{trainingPlanData.caloriesBurned.thisWeek} kcal</Text>
              <TouchableOpacity>
                <Text style={styles.viewHistoryText}>View History</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Categories */}
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Workout Categories</Text>
            {trainingPlanData.categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[styles.categoryCard, { backgroundColor: category.color }]}
                onPress={() => navigateToCategoryDetail(category.id, category.name, category.color)}
              >
                <View style={styles.categoryIconContainer}>
                  <Ionicons name={category.icon as any} size={32} color="#2E5AAC" />
                </View>
                <View style={styles.categoryTextContainer}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryDetails}>
                    {category.exercises} exercises | {category.duration} min
                  </Text>
                  <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarForeground, { width: `${category.progress * 100}%` }]} />
                  </View>
                </View>
                <Ionicons name="chevron-forward-outline" size={24} color="#2E5AAC" />
              </TouchableOpacity>
            ))}
          </View>

          {/* Stylish Footer with Working Navigation */}
          <View style={styles.footerContainer}>
            <Image
              source={require('../../../assets/images/training-footer.jpg')} // Ensure this path is correct
              style={styles.footerImage}
              resizeMode="cover"
            />
            <LinearGradient colors={['rgba(46,90,172,0.7)', 'rgba(61,123,229,0.7)']} style={styles.footerOverlay} />

            <TouchableOpacity style={styles.resourceButton} onPress={goToResources}>
              <Text style={styles.resourceButtonText}>Explore Training Resources</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        // --- Category Detail View (Exercises List) ---
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.exerciseListContentContainer}>
          {/* Progress Overview for the Category */}
          <View style={[styles.categoryProgressCard, {backgroundColor: currentCategoryColor || '#E0E0E0'}]}>
              <Text style={styles.categoryProgressTitle}>Category Progress</Text>
              <Text style={styles.categoryProgressText}>{completedExercises} / {totalExercises} exercises completed</Text>
              <View style={styles.categoryProgressBarBackground}>
                  <View style={[styles.categoryProgressBarForeground, { width: `${overallProgress * 100}%` }]} />
              </View>
          </View>

          {exercises.map((exercise, index) => (
            <View
              key={exercise.id}
              style={[
                styles.exerciseCard,
                { borderLeftColor: exercise.done ? '#4CAF50' : currentCategoryColor }
              ]}
            >
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseName}>{index + 1}. {exercise.name}</Text>
                <Text style={styles.exerciseDetails}>
                  {exercise.duration} | {exercise.sets} sets
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.actionButton, exercise.done ? styles.doneButton : styles.letsGoButton]}
                onPress={() => exercise.done ? toggleExerciseDone(exercise.id) : startExercise(exercise.id, exercise.name)}
              >
                <Ionicons
                  name={exercise.done ? "checkmark-circle-outline" : "play-circle-outline"}
                  size={24}
                  color="#fff"
                />
                <Text style={styles.actionButtonText}>
                  {exercise.done ? 'Done' : "Let's Go"}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
          {exercises.length === 0 && (
            <Text style={styles.noExercisesText}>No exercises found for this category. Add some!</Text>
          )}
        </ScrollView>
      )}

      {/* Add Exercise Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addExerciseModalVisible}
        onRequestClose={() => setAddExerciseModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Exercise</Text>
            <TextInput
              style={styles.input}
              placeholder="Exercise Name (e.g., Push-ups)"
              placeholderTextColor="#999"
              value={newExerciseName}
              onChangeText={setNewExerciseName}
            />
            <TextInput
              style={styles.input}
              placeholder="Duration/Reps (e.g., 30 seconds, 15 reps)"
              placeholderTextColor="#999"
              value={newExerciseDuration}
              onChangeText={setNewExerciseDuration}
            />
            <TextInput
              style={styles.input}
              placeholder="Number of Sets (e.g., 3)"
              placeholderTextColor="#999"
              value={newExerciseSets}
              onChangeText={setNewExerciseSets}
              keyboardType="numeric" // Ensure numeric keyboard for sets
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setAddExerciseModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddExercise}>
                <Text style={styles.saveButtonText}>Add Exercise</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 20, // Adjusted padding top for consistency
  },
  exerciseListContentContainer: { // New style for exercise list padding
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 20,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 58 : 38,
    left: 15,
    zIndex: 1,
  },
  addExerciseButton: { // Renamed from editButton to reflect its new purpose (add)
    position: 'absolute',
    top: Platform.OS === 'ios' ? 58 : 38,
    right: 15,
    zIndex: 1,
  },
  overviewSection: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 0, marginBottom: 20 },
  overviewCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityCard: { marginRight: 8 },
  levelCard: { marginLeft: 8 },
  overviewCardTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
  progressCircleContainer: { marginBottom: 10, alignItems: 'center', justifyContent: 'center' },
  progressCircle: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 6, borderColor: '#2E5AAC',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#E9F0FB'
  },
  progressText: { fontSize: 18, fontWeight: 'bold', color: '#2E5AAC' },
  progressTextPercentage: { fontSize: 20, fontWeight: 'bold', color: '#2E5AAC' },
  activityTimeText: { fontSize: 13, color: '#555' },
  levelText: { fontSize: 14, fontWeight: 'bold', color: '#2E5AAC', marginBottom: 4 },
  levelDetailText: { fontSize: 12, color: '#777', textAlign: 'center' },
  caloriesCard: {
    backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 0, padding: 20, marginBottom: 25,
    flexDirection: 'row', alignItems: 'center', shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  caloriesTextContainer: { flex: 1, marginLeft: 15 },
  caloriesTitle: { fontSize: 14, color: '#666', marginBottom: 2 },
  caloriesValue: { fontSize: 22, fontWeight: 'bold', color: '#2E5AAC', marginBottom: 2 },
  caloriesSubtitle: { fontSize: 13, color: '#333' },
  caloriesDivider: { width: 1, height: '70%', backgroundColor: '#E0E0E0', marginHorizontal: 15 },
  viewHistoryText: { fontSize: 13, color: '#2E5AAC', fontWeight: '500', marginTop: 4 },
  categoriesSection: { marginHorizontal: 0 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1A3A5A', marginBottom: 15 },
  categoryCard: {
    flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
  },
  categoryIconContainer: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center', justifyContent: 'center', marginRight: 15,
  },
  categoryTextContainer: { flex: 1 },
  categoryName: { fontSize: 17, fontWeight: 'bold', color: '#2E5AAC' },
  categoryDetails: { fontSize: 13, color: '#3E63B0', marginBottom: 8 },
  progressBarBackground: {
    height: 8, backgroundColor: 'rgba(255, 255, 255, 0.6)', borderRadius: 4, marginTop: 4,
  },
  progressBarForeground: {
    height: '100%', backgroundColor: '#2E5AAC', borderRadius: 4,
  },
  footerContainer: {
    marginTop: 30,
    marginHorizontal: 0, // Adjusted margin to 0 for full width
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
  },
  footerImage: {
    width: '100%',
    height: 160,
    borderRadius: 16,
  },
  footerOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  resourceButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#ffffffcc',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  resourceButtonText: {
    color: '#2E5AAC',
    fontSize: 16,
    fontWeight: '600',
  },
  // Styles for the Exercise List (Category Detail View)
  categoryProgressCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryProgressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E5AAC',
    marginBottom: 8,
  },
  categoryProgressText: {
    fontSize: 15,
    color: '#3E63B0',
    marginBottom: 10,
  },
  categoryProgressBarBackground: {
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 5,
  },
  categoryProgressBarForeground: {
    height: '100%',
    backgroundColor: '#2E5AAC',
    borderRadius: 5,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  exerciseInfo: {
    flex: 1,
    marginRight: 10,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#666',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  letsGoButton: {
    backgroundColor: '#2E5AAC',
  },
  doneButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  noExercisesText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
    marginTop: 30,
  },
  // Styles for the Add Exercise Modal
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
    maxHeight: '80%',
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
    backgroundColor: '#2E5AAC',
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
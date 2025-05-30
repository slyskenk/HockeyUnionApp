import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert // For demo, replace with modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

// Placeholder data structure - replace with actual data fetching based on categoryId
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

// Category colors for consistency (can be passed via params or fetched)
const categoryColors: { [key: string]: string } = {
  '1': '#FFD6E0',
  '2': '#D6EAF8',
  '3': '#E8DAEF',
  '4': '#D1F2EB',
};

export default function EditTrainingSchedulePlanScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { categoryId, categoryName } = params;

  const [exercises, setExercises] = useState<any[]>([]);
  const [currentCategoryColor, setCurrentCategoryColor] = useState('#F4F6F9');

  useEffect(() => {
    if (categoryId && typeof categoryId === 'string') {
      // In a real app, fetch exercises for categoryId
      setExercises(allExercisesData[categoryId] || []);
      setCurrentCategoryColor(categoryColors[categoryId] || '#F4F6F9');
    }
  }, [categoryId]);

  const toggleExerciseDone = (exerciseId: string) => {
    setExercises(
      exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, done: !ex.done } : ex
      )
    );
    // In a real app, update this status in your backend
  };

  const startExercise = (exerciseName: string) => {
    // For demo purposes. In a real app, you might navigate to a timer screen
    // or start an in-app timer.
    Alert.alert("Let's Go!", `Starting ${exerciseName}. Get ready!`);
  }

  if (!categoryId) {
    return (
      <View style={styles.container}>
        <Text>Loading category details...</Text>
      </View>
    );
  }

  const totalExercises = exercises.length;
  const completedExercises = exercises.filter(ex => ex.done).length;
  const overallProgress = totalExercises > 0 ? completedExercises / totalExercises : 0;

  return (
    <View style={styles.flexContainer}>
      <LinearGradient
        colors={['#2E5AAC', '#3D7BE5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{typeof categoryName === 'string' ? categoryName : 'Training Plan'}</Text>
        <TouchableOpacity onPress={() => Alert.alert("Edit Mode", "Editing functionality would be here.")} style={styles.editButton}>
          <Ionicons name="create-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContentContainer}>
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
              onPress={() => exercise.done ? toggleExerciseDone(exercise.id) : startExercise(exercise.name)}
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
            <Text style={styles.noExercisesText}>No exercises found for this category.</Text>
        )}
      </ScrollView>
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
    paddingTop: 20,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // No border radius for a full-width feel before scroll content
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1, // Allows title to center properly with absolute positioned buttons
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 58 : 38,
    left: 15,
    zIndex: 1, // Ensure it's tappable
  },
  editButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 58 : 38,
    right: 15,
    zIndex: 1,
  },
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
    borderLeftWidth: 6, // For status indication
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
    borderRadius: 20, // More rounded
  },
  letsGoButton: {
    backgroundColor: '#2E5AAC', // Primary color
  },
  doneButton: {
    backgroundColor: '#4CAF50', // Green for done
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
  }
});

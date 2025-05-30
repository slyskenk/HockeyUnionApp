import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Removed direct import of PlayerTrainingResources since we're navigating to it via router
// import PlayerTrainingResources from './TrainingResources';

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

export default function TrainingScheduleScreen() {
  const router = useRouter();

  // ✅ FIXED: Use correct path for expo-router screen
  const navigateToCategoryDetail = (categoryId: string, categoryName: string) => {
    router.push({
      pathname: '/screens/player/EditTrainingSchedulePlanScreen',
      params: { categoryId, categoryName },
    });
  };

  const goToResources = () => {
    router.push('/screens/player/TrainingResources');
  };

  // ... the rest of your component stays unchanged ...

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header */}
      <LinearGradient colors={['#2E5AAC', '#3D7BE5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <Text style={styles.headerTitle}>My Training Plan</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

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
            onPress={() => navigateToCategoryDetail(category.id, category.name)}
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

      {/* ✅ Stylish Footer with Working Navigation */}
      <View style={styles.footerContainer}>
        <Image
          source={require('../../../assets/images/training-footer.jpg')}
          style={styles.footerImage}
          resizeMode="cover"
        />
        <LinearGradient colors={['rgba(46,90,172,0.7)', 'rgba(61,123,229,0.7)']} style={styles.footerOverlay} />
        
        {/* ✅ Fixed: Now correctly uses the navigation function */}
        <TouchableOpacity style={styles.resourceButton} onPress={goToResources}>
          <Text style={styles.resourceButtonText}>Explore Training Resources</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ✅ [STYLES UNCHANGED]
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6F9' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
  },
  overviewSection: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 16, marginBottom: 20 },
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
    backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, padding: 20, marginBottom: 25,
    flexDirection: 'row', alignItems: 'center', shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  caloriesTextContainer: { flex: 1, marginLeft: 15 },
  caloriesTitle: { fontSize: 14, color: '#666', marginBottom: 2 },
  caloriesValue: { fontSize: 22, fontWeight: 'bold', color: '#2E5AAC', marginBottom: 2 },
  caloriesSubtitle: { fontSize: 13, color: '#333' },
  caloriesDivider: { width: 1, height: '70%', backgroundColor: '#E0E0E0', marginHorizontal: 15 },
  viewHistoryText: { fontSize: 13, color: '#2E5AAC', fontWeight: '500', marginTop: 4 },
  categoriesSection: { marginHorizontal: 16 },
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
    marginHorizontal: 16,
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
});

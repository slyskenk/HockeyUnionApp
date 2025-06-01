import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
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

const { width, height } = Dimensions.get('window');

// --- Types ---
type LeaderboardEntry = {
  id: string;
  name: string; // Player or Team Name
  rank?: number; // Optional rank
  avatar?: string; // Player/Team avatar

  // For Player Leaderboards (Top Scorers, Assists, Clean Sheets)
  value?: number; // e.g., goals, assists, clean sheet count

  // For Team Standings (keeping all stats for robust sorting, but displaying fewer)
  teamStats?: {
    gp: number; // Games Played
    w: number; // Wins
    d: number; // Draws
    l: number; // Losses
    gf: number; // Goals For
    ga: number; // Goals Against
    gd: number; // Goal Difference (calculated or explicitly set)
    pts: number; // Points
  };
};

type LeaderboardCategory = {
  key: string;
  title: string;
  icon: string; // MaterialCommunityIcons name
  data: LeaderboardEntry[];
};

// --- Dummy Data ---
const DUMMY_LEADERBOARDS: LeaderboardCategory[] = [
  {
    key: 'top_scorers',
    title: 'Top Scorers',
    icon: 'hockey-sticks',
    data: [
      { id: 'p1', name: 'Maria Silva', value: 15, avatar: 'https://placehold.co/40x40/4A90E2/FFFFFF?text=MS' },
      { id: 'p2', name: 'Chris Green', value: 12, avatar: 'https://placehold.co/40x40/5856D6/FFFFFF?text=CG' },
      { id: 'p3', name: 'David Jones', value: 9, avatar: 'https://placehold.co/40x40/283593/FFFFFF?text=DJ' },
      { id: 'p4', name: 'Emily Brown', value: 8, avatar: 'https://placehold.co/40x40/C6C6C6/FFFFFF?text=EB' },
      { id: 'p5', name: 'John Doe', value: 7, avatar: 'https://placehold.co/40x40/B0B0B0/FFFFFF?text=JD' },
    ],
  },
  {
    key: 'assists_leaders',
    title: 'Assists Leaders',
    icon: 'handshake',
    data: [
      { id: 'p6', name: 'Emily Brown', value: 10, avatar: 'https://placehold.co/40x40/C6C6C6/FFFFFF?text=EB' },
      { id: 'p7', name: 'Maria Silva', value: 7, avatar: 'https://placehold.co/40x40/4A90E2/FFFFFF?text=MS' },
      { id: 'p8', name: 'Sarah Khan', value: 6, avatar: 'https://placehold.co/40x40/FF5733/FFFFFF?text=SK' },
      { id: 'p9', name: 'Michael Lee', value: 5, avatar: 'https://placehold.co/40x40/8A2BE2/FFFFFF?text=ML' },
    ],
  },
  {
    key: 'clean_sheets',
    title: 'Clean Sheets',
    icon: 'glove',
    data: [
      { id: 'p10', name: 'Alex Lee', value: 8, avatar: 'https://placehold.co/40x40/33FF57/000000?text=AL' },
      { id: 'p11', name: 'Sam White', value: 6, avatar: 'https://placehold.co/40x40/007AFF/FFFFFF?text=SW' },
      { id: 'p12', name: 'Laura Black', value: 5, avatar: 'https://placehold.co/40x40/FF1493/FFFFFF?text=LB' },
      { id: 'p13', name: 'Daniel Gray', value: 4, avatar: 'https://placehold.co/40x40/7B68EE/FFFFFF?text=DG' },
    ],
  },
  {
    key: 'team_standings',
    title: 'Team Standings',
    icon: 'trophy-variant',
    data: [
      { id: 't1', name: 'Desert Scorpions', avatar: 'https://placehold.co/40x40/02457A/FFFFFF?text=DS', teamStats: { gp: 10, w: 9, d: 1, l: 0, gf: 35, ga: 10, gd: 25, pts: 28 } },
      { id: 't2', name: 'Oryx Chargers', avatar: 'https://placehold.co/40x40/FF9500/FFFFFF?text=OC', teamStats: { gp: 10, w: 8, d: 1, l: 1, gf: 30, ga: 12, gd: 18, pts: 25 } },
      { id: 't3', name: 'Windhoek Warriors', avatar: 'https://placehold.co/40x40/34C759/FFFFFF?text=WW', teamStats: { gp: 10, w: 6, d: 2, l: 2, gf: 25, ga: 15, gd: 10, pts: 20 } },
      { id: 't4', name: 'Coastal Conquerors', avatar: 'https://placehold.co/40x40/A9A9A9/FFFFFF?text=CC', teamStats: { gp: 10, w: 4, d: 3, l: 3, gf: 20, ga: 20, gd: 0, pts: 15 } },
      { id: 't5', name: 'Northern Knights', avatar: 'https://placehold.co/40x40/800080/FFFFFF?text=NK', teamStats: { gp: 10, w: 2, d: 2, l: 6, gf: 15, ga: 25, gd: -10, pts: 8 } },
      { id: 't6', name: 'Southern Stingrays', avatar: 'https://placehold.co/40x40/FF6347/FFFFFF?text=SS', teamStats: { gp: 10, w: 1, d: 4, l: 5, gf: 10, ga: 18, gd: -8, pts: 7 } },
      { id: 't7', name: 'Eastern Eagles', avatar: 'https://placehold.co/40x40/4682B4/FFFFFF?text=EE', teamStats: { gp: 10, w: 0, d: 2, l: 8, gf: 8, ga: 30, gd: -22, pts: 2 } },
    ],
  },
];

// Helper function to sort and rank leaderboard data
const sortAndRankLeaderboards = (categories: LeaderboardCategory[]): LeaderboardCategory[] => {
  return categories.map(category => {
    let sortedData = [...category.data]; // Make a shallow copy to avoid mutating original data

    if (category.key === 'team_standings') {
      // Primary sort by points, then by goal difference, then by goals for
      sortedData.sort((a, b) => {
        if ((b.teamStats?.pts || 0) !== (a.teamStats?.pts || 0)) {
          return (b.teamStats?.pts || 0) - (a.teamStats?.pts || 0);
        }
        // These are kept for robust tie-breaking, even if not displayed
        if ((b.teamStats?.gd || 0) !== (a.teamStats?.gd || 0)) {
          return (b.teamStats?.gd || 0) - (a.teamStats?.gd || 0);
        }
        return (b.teamStats?.gf || 0) - (a.teamStats?.gf || 0);
      });
    } else {
      // Sort by value for player leaderboards (goals, assists, clean sheets)
      sortedData.sort((a, b) => (b.value || 0) - (a.value || 0));
    }

    const rankedData = sortedData.map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
    return { ...category, data: rankedData };
  });
};

const Leaderboards = () => {
  const router = useRouter();
  // Initialize state directly with sorted and ranked data
  const [leaderboards, setLeaderboards] = useState<LeaderboardCategory[]>(() => sortAndRankLeaderboards(DUMMY_LEADERBOARDS));
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>(DUMMY_LEADERBOARDS[0].key);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<LeaderboardEntry | null>(null); // For editing
  const [currentCategory, setCurrentCategory] = useState<LeaderboardCategory | null>(null); // For context in modal

  // Form states for Add/Edit Modal
  const [name, setName] = useState('');
  const [value, setValue] = useState(''); // Used for player stats value OR team Points (pts)
  const [winCount, setWinCount] = useState(''); // New for team wins (w)
  const [lossCount, setLossCount] = useState(''); // New for team losses (l)
  const [avatar, setAvatar] = useState('');

  // Input focus states for styling
  const [nameFocused, setNameFocused] = useState(false);
  const [valueFocused, setValueFocused] = useState(false);
  const [winCountFocused, setWinCountFocused] = useState(false); // New focus state
  const [lossCountFocused, setLossCountFocused] = useState(false); // New focus state
  const [avatarFocused, setAvatarFocused] = useState(false);

  const selectedLeaderboard = leaderboards.find(cat => cat.key === selectedCategoryKey);

  const resetForm = () => {
    setCurrentEntry(null);
    setCurrentCategory(null);
    setName('');
    setValue('');
    setWinCount(''); // Reset new states
    setLossCount(''); // Reset new states
    setAvatar('');
  };

  const openAddModal = (category: LeaderboardCategory) => {
    resetForm();
    setCurrentCategory(category);
    setModalVisible(true);
  };

  const openEditModal = (category: LeaderboardCategory, entry: LeaderboardEntry) => {
    setCurrentEntry(entry);
    setCurrentCategory(category);
    setName(entry.name);
    setAvatar(entry.avatar || '');

    if (category.key === 'team_standings') {
      setValue(String(entry.teamStats?.pts || '')); // Points
      setWinCount(String(entry.teamStats?.w || '')); // Wins
      setLossCount(String(entry.teamStats?.l || '')); // Losses
    } else {
      setValue(String(entry.value || '')); // Player value
    }
    setModalVisible(true);
  };

  const handleSaveEntry = () => {
    // Basic validation for name
    if (!name.trim()) {
      Alert.alert('Missing Info', 'Please provide a name.');
      return;
    }

    let numericValue = 0; // Will be points for teams, or value for players
    let numericWinCount = 0;
    let numericLossCount = 0;

    if (selectedCategoryKey === 'team_standings') {
      // Validate all three numeric inputs for team standings
      if (!value.trim() || isNaN(Number(value)) ||
          !winCount.trim() || isNaN(Number(winCount)) ||
          !lossCount.trim() || isNaN(Number(lossCount))) {
        Alert.alert('Missing Info', 'Please provide valid numeric values for Points, Wins, and Losses.');
        return;
      }
      numericValue = Number(value); // This is for points
      numericWinCount = Number(winCount);
      numericLossCount = Number(lossCount);
    } else {
      // Validate single numeric input for player leaderboards
      if (!value.trim() || isNaN(Number(value))) {
        Alert.alert('Missing Info', 'Please provide a valid numeric value.');
        return;
      }
      numericValue = Number(value); // This is for player value
    }

    setLeaderboards(prevLeaderboards => {
      const updatedCategories = prevLeaderboards.map(category => {
        if (category.key === selectedCategoryKey) {
          if (currentEntry) {
            // Update existing entry
            return {
              ...category,
              data: category.data.map(entry => {
                if (entry.id === currentEntry.id) {
                  if (category.key === 'team_standings') {
                    // Update team stats (W, L, Pts). Other stats remain unchanged from existing entry.
                    const oldTeamStats = entry.teamStats || { gp: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
                    return {
                      ...entry,
                      name: name.trim(),
                      avatar: avatar.trim() || undefined,
                      teamStats: {
                        ...oldTeamStats, // Keep existing GP, D, GF, GA, GD
                        w: numericWinCount,
                        l: numericLossCount,
                        pts: numericValue,
                      },
                    };
                  } else {
                    // For other leaderboards, update 'value'
                    return { ...entry, name: name.trim(), value: numericValue, avatar: avatar.trim() || undefined };
                  }
                }
                return entry;
              }),
            };
          } else {
            // Add new entry
            const newEntry: LeaderboardEntry = {
              id: `entry-${Date.now()}`,
              name: name.trim(),
              avatar: avatar.trim() || undefined,
            };

            if (category.key === 'team_standings') {
              // For new team, initialize with basic stats from inputs, others default to 0
              newEntry.teamStats = {
                  gp: 0, // Default to 0 for new entries
                  w: numericWinCount,
                  d: 0, // Default to 0 for new entries
                  l: numericLossCount,
                  gf: 0, // Default to 0 for new entries
                  ga: 0, // Default to 0 for new entries
                  gd: 0, // Default to 0 for new entries
                  pts: numericValue,
              };
            } else {
              newEntry.value = numericValue;
            }
            return { ...category, data: [...category.data, newEntry] };
          }
        }
        return category;
      });
      // Re-sort and re-rank the categories after the update
      return sortAndRankLeaderboards(updatedCategories);
    });

    Alert.alert('Success', currentEntry ? 'Entry updated successfully!' : 'New entry added!');
    setModalVisible(false);
    resetForm();
  };

  const handleDeleteEntry = (entryId: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry from the leaderboard? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            setLeaderboards(prevLeaderboards => {
              const updatedCategories = prevLeaderboards.map(category => {
                if (category.key === selectedCategoryKey) {
                  return {
                    ...category,
                    data: category.data.filter(entry => entry.id !== entryId),
                  };
                }
                return category;
              });
              // Re-sort and re-rank after deletion
              return sortAndRankLeaderboards(updatedCategories);
            });
            Alert.alert('Deleted', 'Entry has been deleted.');
          },
          style: 'destructive',
        },
      ]
    );
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
        {/* MODIFICATION HERE: Change router.back() to router.push('/dashboard') */}
        <TouchableOpacity onPress={() => router.push('./../admin/Dashboard')} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Image
          source={require('../../../assets/images/logo.jpeg')} // Corrected logo path
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Leaderboard Manager</Text>
        <View style={styles.backButtonPlaceholder} />
      </LinearGradient>

      {/* Category Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categorySelectorContainer}
      >
        {leaderboards.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryTab,
              selectedCategoryKey === category.key && styles.selectedCategoryTab,
            ]}
            onPress={() => setSelectedCategoryKey(category.key)}
          >
            <MaterialCommunityIcons
              name={category.icon as any} // Type assertion for icon name
              size={24}
              color={selectedCategoryKey === category.key ? '#fff' : '#6633FF'}
            />
            <Text style={[
              styles.categoryTabText,
              selectedCategoryKey === category.key && styles.selectedCategoryTabText,
            ]}>
              {category.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Leaderboard Content */}
      {selectedLeaderboard && selectedLeaderboard.data.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name={"trophy-off" as any} size={100} color="#E0E0E0" />
          <Text style={styles.emptyStateText}>No data for {selectedLeaderboard.title} yet!</Text>
          <Text style={styles.emptyStateSubText}>Tap the '+' button to add entries.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          {selectedCategoryKey === 'team_standings' ? (
            // Team Standings Table View - Simplified
            <View style={styles.tableContainer}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.posCell]}>Pos</Text>
                <Text style={[styles.headerCell, styles.clubCell]}>Club</Text>
                <Text style={styles.headerCell}>W</Text>
                <Text style={styles.headerCell}>L</Text>
                <Text style={[styles.headerCell, styles.ptsCell]}>Pts</Text>
                <View style={styles.actionsHeaderCell} /> {/* Placeholder for actions */}
              </View>
              {/* Table Rows */}
              {selectedLeaderboard?.data.map((entry) => (
                <View key={entry.id} style={styles.tableRow}>
                  <Text style={[styles.dataCell, styles.posCell]}>{entry.rank}</Text>
                  <View style={styles.clubDataCell}>
                    <Image
                      source={{ uri: entry.avatar || 'https://placehold.co/30x30/CCCCCC/000000?text=T' }}
                      style={styles.teamAvatar}
                    />
                    <Text style={styles.clubNameText}>{entry.name}</Text>
                  </View>
                  <Text style={styles.dataCell}>{entry.teamStats?.w}</Text>
                  <Text style={styles.dataCell}>{entry.teamStats?.l}</Text>
                  <Text style={[styles.dataCell, styles.ptsCell]}>{entry.teamStats?.pts}</Text>
                  <View style={styles.actionsDataCell}>
                    <TouchableOpacity onPress={() => openEditModal(selectedLeaderboard, entry)} style={styles.actionButton}>
                      <MaterialIcons name="edit" size={20} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteEntry(entry.id)} style={[styles.actionButton, styles.deleteButton]}>
                      <MaterialIcons name="delete" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            // Player Leaderboard Cards View (existing rendering)
            selectedLeaderboard?.data.map((entry) => (
              <View key={entry.id} style={styles.leaderboardEntryCard}>
                <View style={styles.rankContainer}>
                  <Text style={styles.rankText}>{entry.rank}</Text>
                  <MaterialCommunityIcons
                    name={entry.rank === 1 ? 'medal' : 'circle'}
                    size={entry.rank === 1 ? 24 : 10}
                    color={entry.rank === 1 ? '#FFD700' : '#E0E0E0'}
                  />
                </View>
                <Image
                  source={{ uri: entry.avatar || 'https://placehold.co/40x40/CCCCCC/000000?text=P' }}
                  style={styles.entryAvatar}
                />
                <View style={styles.entryInfo}>
                  <Text style={styles.entryName}>{entry.name}</Text>
                  <Text style={styles.entryValue}>
                    {entry.value}{' '}
                    {selectedLeaderboard?.key === 'clean_sheets'
                      ? 'Clean Sheets'
                      : 'Goals/Assists'}
                  </Text>
                </View>
                <View style={styles.entryActions}>
                  <TouchableOpacity onPress={() => openEditModal(selectedLeaderboard, entry)} style={styles.actionButton}>
                    <MaterialIcons name="edit" size={20} color="#007AFF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteEntry(entry.id)} style={[styles.actionButton, styles.deleteButton]}>
                    <MaterialIcons name="delete" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Add New Entry Floating Action Button */}
      <Animated.View style={[styles.fab, {}]}>
        <TouchableOpacity
          onPress={() => openAddModal(selectedLeaderboard!)}
          style={styles.fabButton}
        >
          <MaterialIcons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      </Animated.View>

      {/* Add/Edit Entry Modal */}
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
            <Text style={styles.modalTitle}>{currentEntry ? 'Edit Leaderboard Entry' : 'Add New Leaderboard Entry'}</Text>
            <Text style={styles.modalSubtitle}>Category: {currentCategory?.title}</Text>

            <TextInput
              style={[styles.input, nameFocused && styles.inputFocused]}
              placeholder="Name (Player/Team)"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
            />

            {selectedCategoryKey === 'team_standings' ? (
              <>
                <TextInput
                  style={[styles.input, winCountFocused && styles.inputFocused]}
                  placeholder="Wins (W)"
                  placeholderTextColor="#999"
                  value={winCount}
                  onChangeText={setWinCount}
                  keyboardType="numeric"
                  onFocus={() => setWinCountFocused(true)}
                  onBlur={() => setWinCountFocused(false)}
                />
                <TextInput
                  style={[styles.input, lossCountFocused && styles.inputFocused]}
                  placeholder="Losses (L)"
                  placeholderTextColor="#999"
                  value={lossCount}
                  onChangeText={setLossCount}
                  keyboardType="numeric"
                  onFocus={() => setLossCountFocused(true)}
                  onBlur={() => setLossCountFocused(false)}
                />
                <TextInput
                  style={[styles.input, valueFocused && styles.inputFocused]}
                  placeholder="Points (Pts)" // Clarify placeholder for team standings
                  placeholderTextColor="#999"
                  value={value} // This is for points now
                  onChangeText={setValue}
                  keyboardType="numeric"
                  onFocus={() => setValueFocused(true)}
                  onBlur={() => setValueFocused(false)}
                />
              </>
            ) : (
              <TextInput
                style={[styles.input, valueFocused && styles.inputFocused]}
                placeholder="Value (e.g., Goals, Assists or Clean Sheets)"
                placeholderTextColor="#999"
                value={value}
                onChangeText={setValue}
                keyboardType="numeric"
                onFocus={() => setValueFocused(true)}
                onBlur={() => setValueFocused(false)}
              />
            )}
            <TextInput
              style={[styles.input, avatarFocused && styles.inputFocused]}
              placeholder="Avatar Image URL (Optional)"
              placeholderTextColor="#999"
              value={avatar}
              onChangeText={setAvatar}
              keyboardType="url"
              onFocus={() => setAvatarFocused(true)}
              onBlur={() => setAvatarFocused(false)}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEntry}>
                <Text style={styles.saveButtonText}>{currentEntry ? 'Update Entry' : 'Add Entry'}</Text>
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
  categorySelectorContainer: {
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
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedCategoryTab: {
    backgroundColor: '#6633FF',
    borderColor: '#6633FF',
    shadowColor: '#6633FF',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  categoryTabText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginLeft: 5,
  },
  selectedCategoryTabText: {
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
  leaderboardEntryCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderLeftWidth: 6,
    borderLeftColor: '#FFD700', // Gold accent for leaderboards
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 10,
  },
  rankText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  entryAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: '#ddd',
    borderWidth: 1,
    borderColor: '#eee',
  },
  entryInfo: {
    flex: 1,
  },
  entryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  entryValue: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  entryActions: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  actionButton: {
    padding: 8,
    // Removed marginLeft from here to let justifyContent handle spacing
  },
  deleteButton: {
    // Specific styling for delete if needed
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
    marginBottom: 10,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
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

  // --- New Styles for Team Standings Table ---
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden', // Ensures borders/shadows are contained
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F0F4F8', // Lighter background for header
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerCell: {
    flex: 0.9, // Adjusted flex for W and L
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  posCell: {
    flex: 0.5,
  },
  clubCell: {
    flex: 2,
    textAlign: 'left',
    paddingLeft: 5,
  },
  ptsCell: {
    flex: 0.7,
  },
  actionsHeaderCell: {
    width: 80, // Increased width for better visibility of icons
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    backgroundColor: '#fff',
  },
  dataCell: {
    flex: 0.9, // Adjusted flex for W and L
    fontSize: 13,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  clubDataCell: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
  },
  teamAvatar: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    marginRight: 8,
    backgroundColor: '#ddd',
  },
  clubNameText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    flexShrink: 1, // Allow text to wrap if too long
  },
  actionsDataCell: {
    width: 80, // Increased width for better visibility of icons
    flexDirection: 'row',
    justifyContent: 'space-around', // Distribute space evenly
    alignItems: 'center',
  },
});

export default Leaderboards;
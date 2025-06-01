import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Import useRouter for navigation
import React, { useCallback, useEffect, useMemo, useState } from 'react'; // Added useCallback, useMemo
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// --- Types Definitions ---

// Define all possible roles in the system
type UserRole = 'Admin' | 'Other Admin' | 'Coach' | 'Player' | 'Supporter' | 'Fan';

// Define all features that have permissions
type FeatureKey =
  | 'dashboard_view'
  | 'news_view'
  | 'news_manage'
  | 'events_view'
  | 'events_manage'
  | 'forum_view'
  | 'forum_post'
  | 'forum_moderate'
  | 'chat_bot_access'
  | 'users_view'
  | 'users_manage'
  | 'reports_view'
  | 'roles_manage' // Permission to access this screen itself
  | 'notifications_view'; // Permission to view admin notifications

// Permissions for a single role
type Permissions = {
  [key in FeatureKey]: boolean;
};

// Structure for all roles' permissions
type RolePermissions = {
  [role in UserRole]: Permissions;
};

// Define structure for a displayable feature item
type FeatureItem = {
  key: FeatureKey;
  label: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap; // MaterialIcons icon name
};

// --- Dummy Data: Initial Permissions and Feature Definitions ---

const ALL_ROLES: UserRole[] = ['Admin', 'Other Admin', 'Coach', 'Player', 'Supporter', 'Fan'];

// Define all features with their display labels and descriptions
const ALL_FEATURES: Record<string, FeatureItem[]> = {
  'Core App Features': [
    { key: 'dashboard_view', label: 'View Dashboard', description: 'Access to the main dashboard.', icon: 'dashboard' },
    { key: 'chat_bot_access', label: 'Use Chatbot', description: 'Interact with the AI chatbot.', icon: 'smart-toy' },
  ],
  'Content Management': [
    { key: 'news_view', label: 'View News Articles', description: 'See published news and updates.', icon: 'article' },
    { key: 'news_manage', label: 'Manage News Articles', description: 'Add, edit, or delete news articles.', icon: 'edit-document' },
    { key: 'events_view', label: 'View Events Calendar', description: 'See upcoming and past events.', icon: 'event' },
    { key: 'events_manage', label: 'Manage Events', description: 'Create, edit, or cancel events.', icon: 'event-note' },
  ],
  'Community & Communication': [
    { key: 'forum_view', label: 'View Forum Discussions', description: 'Browse forum categories and posts.', icon: 'forum' },
    { key: 'forum_post', label: 'Post in Forum', description: 'Create new topics or reply to existing ones.', icon: 'post-add' },
    { key: 'forum_moderate', label: 'Moderate Forum', description: 'Approve, edit, or delete forum posts/comments.', icon: 'gavel' },
  ],
  'User & Administrative Tools': [
    { key: 'users_view', label: 'View User Profiles', description: 'See basic information of other users.', icon: 'people' },
    { key: 'users_manage', label: 'Manage Users', description: 'Add, edit, or remove user accounts.', icon: 'manage-accounts' },
    { key: 'reports_view', label: 'View Reports', description: 'Access various analytical reports (e.g., performance, financial).', icon: 'bar-chart' },
    { key: 'notifications_view', label: 'Receive Admin Notifications', description: 'Get alerts for new users, reported content, etc.', icon: 'notifications' },
    { key: 'roles_manage', label: 'Manage Role Access', description: 'Modify permissions for different user roles (this screen).', icon: 'security' },
  ],
};

// Initial dummy permissions for each role
const INITIAL_PERMISSIONS: RolePermissions = {
  'Admin': {
    dashboard_view: true, news_view: true, news_manage: true, events_view: true, events_manage: true,
    forum_view: true, forum_post: true, forum_moderate: true, chat_bot_access: true,
    users_view: true, users_manage: true, reports_view: true, roles_manage: true, notifications_view: true,
  },
  'Other Admin': {
    dashboard_view: true, news_view: true, news_manage: false, events_view: true, events_manage: true,
    forum_view: true, forum_post: true, forum_moderate: true, chat_bot_access: true,
    users_view: true, users_manage: false, reports_view: true, roles_manage: false, notifications_view: true,
  },
  'Coach': {
    dashboard_view: true, news_view: true, news_manage: false, events_view: true, events_manage: true,
    forum_view: true, forum_post: true, forum_moderate: false, chat_bot_access: true,
    users_view: false, users_manage: false, reports_view: true, roles_manage: false, notifications_view: true,
  },
  'Player': {
    dashboard_view: true, news_view: true, news_manage: false, events_view: true, events_manage: false,
    forum_view: true, forum_post: true, forum_moderate: false, chat_bot_access: true,
    users_view: false, users_manage: false, reports_view: false, roles_manage: false, notifications_view: true,
  },
  'Supporter': {
    dashboard_view: true, news_view: true, news_manage: false, events_view: true, events_manage: false,
    forum_view: true, forum_post: true, forum_moderate: false, chat_bot_access: true,
    users_view: false, users_manage: false, reports_view: false, roles_manage: false, notifications_view: false,
  },
  'Fan': {
    dashboard_view: true, news_view: true, news_manage: false, events_view: true, events_manage: false,
    forum_view: true, forum_post: false, forum_moderate: false, chat_bot_access: true,
    users_view: false, users_manage: false, reports_view: false, roles_manage: false, notifications_view: false,
  },
};

// --- Component Definition ---

const RoleAccess = () => {
  const router = useRouter(); // Initialize useRouter
  const [currentPermissions, setCurrentPermissions] = useState<RolePermissions>(INITIAL_PERMISSIONS);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Admin'); // Default to Admin
  const [lastUpdated, setLastUpdated] = useState<Record<UserRole, number>>(
    ALL_ROLES.reduce((acc, role) => ({ ...acc, [role]: Date.now() }), {} as Record<UserRole, number>)
  ); // To simulate last save time

  // Memoized check for unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    return JSON.stringify(currentPermissions[selectedRole]) !== JSON.stringify(INITIAL_PERMISSIONS[selectedRole]);
  }, [currentPermissions, selectedRole]);

  useEffect(() => {
    // In a real app, you'd fetch permissions from a backend here
    // For now, we use dummy data
  }, []);

  /**
   * Toggles a specific permission for the currently selected role.
   * @param featureKey The key of the feature to toggle.
   */
  const togglePermission = useCallback((featureKey: FeatureKey) => {
    setCurrentPermissions(prev => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [featureKey]: !prev[selectedRole][featureKey],
      },
    }));
  }, [selectedRole]);

  /**
   * Handles saving the current permission changes.
   * In a real app, this would send data to a backend.
   */
  const handleSaveChanges = useCallback(() => {
    Alert.alert(
      'Save Changes',
      `Are you sure you want to save these permissions for ${selectedRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: () => {
            // In a real app: send currentPermissions[selectedRole] to API
            setLastUpdated(prev => ({ ...prev, [selectedRole]: Date.now() }));
            Alert.alert('Success', `Permissions for ${selectedRole} saved!`);
            console.log(`Permissions for ${selectedRole} saved:`, currentPermissions[selectedRole]);
          },
        },
      ]
    );
  }, [selectedRole, currentPermissions]); // Added dependencies

  /**
   * Handles discarding unsaved changes.
   */
  const handleDiscardChanges = useCallback(() => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Discard Changes',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            onPress: () => {
              // Revert to initial state for the selected role
              setCurrentPermissions(prev => ({
                ...prev,
                [selectedRole]: INITIAL_PERMISSIONS[selectedRole],
              }));
              Alert.alert('Discarded', 'Changes have been discarded.');
            },
            style: 'destructive',
          },
        ]
      );
    } else {
      Alert.alert('No Changes', 'There are no unsaved changes to discard.');
    }
  }, [hasUnsavedChanges, selectedRole]); // Added dependencies

  // Helper to format last updated timestamp
  const formatLastUpdated = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString(); // Adjust formatting as needed
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.push('./../admin/Dashboard')} // Navigate back to Admin Dashboard
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Image
          source={require('../../../assets/images/logo.jpeg')} // Update this path
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Role Access Control</Text>
      </View>

      {/* Role Selector */}
      <View style={styles.roleSelectorContainer}>
        <Text style={styles.roleSelectorLabel}>Select Role:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleSelectorScrollView}>
          {ALL_ROLES.map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleButton,
                selectedRole === role && styles.roleButtonActive,
              ]}
              onPress={() => setSelectedRole(role)}
            >
              <Text style={[
                styles.roleButtonText,
                selectedRole === role && styles.roleButtonTextActive,
              ]}>
                {role}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Permissions List */}
      <ScrollView contentContainerStyle={styles.permissionsList}>
        <Text style={styles.roleInfoText}>
          Editing permissions for: <Text style={styles.currentRoleText}>{selectedRole}</Text>
        </Text>
        <Text style={styles.lastUpdatedText}>
          Last Saved: {formatLastUpdated(lastUpdated[selectedRole])}
        </Text>

        {Object.keys(ALL_FEATURES).map((category, categoryIndex) => (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {ALL_FEATURES[category as keyof typeof ALL_FEATURES].map((feature, featureIndex) => (
              <View
                key={feature.key}
                style={[
                  styles.permissionItem,
                  // Remove bottom border for the last item in each category
                  featureIndex === ALL_FEATURES[category as keyof typeof ALL_FEATURES].length - 1 && styles.lastPermissionItem,
                ]}
              >
                <View style={styles.permissionIconText}>
                  <MaterialIcons name={feature.icon} size={22} color="#555" />
                  <View style={styles.permissionTextContainer}>
                    <Text style={styles.permissionLabel}>{feature.label}</Text>
                    <Text style={styles.permissionDescription} numberOfLines={2}>
                      {feature.description}
                    </Text>
                  </View>
                </View>
                <Switch
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={currentPermissions[selectedRole][feature.key] ? '#007AFF' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => togglePermission(feature.key)}
                  value={currentPermissions[selectedRole][feature.key]}
                />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.discardButton, !hasUnsavedChanges && styles.actionButtonDisabled]}
          onPress={handleDiscardChanges}
          disabled={!hasUnsavedChanges}
        >
          <Text style={[styles.actionButtonText, !hasUnsavedChanges && styles.actionButtonTextDisabled]}>Discard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.saveButton, !hasUnsavedChanges && styles.actionButtonDisabled]}
          onPress={handleSaveChanges}
          disabled={!hasUnsavedChanges}
        >
          <Text style={[styles.actionButtonText, !hasUnsavedChanges && styles.actionButtonTextDisabled]}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    backgroundColor: '#007AFF', // Blue circle background
    borderRadius: 20, // Make it a circle
    padding: 8, // Padding inside the circle
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
    // Removed marginLeft to allow auto-centering with `justifyContent: 'center'`
  },
  roleSelectorContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  roleSelectorLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 15,
    marginBottom: 5,
  },
  roleSelectorScrollView: {
    paddingHorizontal: 10,
    paddingBottom: 5,
  },
  roleButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 5,
  },
  roleButtonActive: {
    backgroundColor: '#007AFF',
  },
  roleButtonText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 14,
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  permissionsList: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    paddingBottom: 100, // Space for action buttons
  },
  roleInfoText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
    fontWeight: '500',
  },
  currentRoleText: {
    fontWeight: 'bold',
    color: '#333',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  categoryContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastPermissionItem: {
    borderBottomWidth: 0, // No border for the last item in a category
  },
  permissionIconText: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Allows content to take space
    marginRight: 10,
  },
  permissionTextContainer: {
    marginLeft: 15,
    flex: 1, // Allows text to wrap
  },
  permissionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  permissionDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    numberOfLines: 2, // Added numberOfLines
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#007AFF', // Blue for save
  },
  discardButton: {
    backgroundColor: '#FF3B30', // Red for discard
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtonDisabled: {
    backgroundColor: '#cccccc', // Gray out when disabled
  },
  actionButtonTextDisabled: {
    color: '#999999',
  },
});

export default RoleAccess;
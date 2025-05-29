import { MaterialIcons } from '@expo/vector-icons'; // For icons like edit, delete, add
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Define User type with updated roles
type User = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Other Admin' | 'Coach' | 'Player' | 'Supporter' | 'Fan'; // Added 'Other Admin' and 'Supporter'
  avatar?: string; // Optional avatar URL
};

// Dummy data for users with new roles
const DUMMY_USERS: User[] = [
  { id: 'u1', name: 'Slysken Kakuva', email: 'slysken.k@example.com', role: 'Admin', avatar: 'https://placehold.co/40x40/FF5733/FFFFFF?text=SK' },
  { id: 'u6', name: 'Admin Two', email: 'admin.two@example.com', role: 'Other Admin', avatar: 'https://placehold.co/40x40/0000FF/FFFFFF?text=A2' }, // New role
  { id: 'u2', name: 'John Doe', email: 'john.doe@example.com', role: 'Coach', avatar: 'https://placehold.co/40x40/33FF57/000000?text=JD' },
  { id: 'u3', name: 'Jane Smith', email: 'jane.s@example.com', role: 'Player', avatar: 'https://placehold.co/40x40/3357FF/FFFFFF?text=JS' },
  { id: 'u5', name: 'Alice Brown', email: 'alice.b@example.com', role: 'Player', avatar: 'https://placehold.co/40x40/8A2BE2/FFFFFF?text=AB' },
  { id: 'u7', name: 'Sarah Green', email: 'sarah.g@example.com', role: 'Supporter', avatar: 'https://placehold.co/40x40/FF00FF/FFFFFF?text=SG' }, // New role
  { id: 'u4', name: 'Peter Jones', email: 'peter.j@example.com', role: 'Fan', avatar: 'https://placehold.co/40x40/FFD700/000000?text=PJ' },
];

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>(DUMMY_USERS);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /**
   * Handles deleting a user.
   * @param userId The ID of the user to delete.
   */
  const handleDeleteUser = (userId: string) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
            console.log(`User ${userId} deleted.`);
            // In a real app, you would also call an API to delete the user from the backend
          },
          style: 'destructive',
        },
      ]
    );
  };

  /**
   * Handles editing a user (placeholder for navigation to an edit screen).
   * @param user The user object to edit.
   */
  const handleEditUser = (user: User) => {
    console.log('Edit user:', user.name);
    // Implement navigation to a user edit screen, passing the user object
    // router.push({ pathname: '/admin/edit-user', params: { userId: user.id } });
    Alert.alert('Edit User', `Functionality to edit ${user.name} not implemented.`);
  };

  /**
   * Handles adding a new user (placeholder for navigation to an add screen).
   */
  const handleAddUser = () => {
    console.log('Add new user');
    // Implement navigation to a new user creation screen
    // router.push('/admin/add-user');
    Alert.alert('Add User', 'Functionality to add new user not implemented.');
  };

  /**
   * Renders a single user item in the FlatList.
   * @param item The User object to render.
   */
  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <Image
        source={{ uri: item.avatar || 'https://placehold.co/40x40/CCCCCC/000000?text=User' }}
        style={styles.avatar}
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userRole}>{item.role}</Text>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity onPress={() => handleEditUser(item)} style={styles.actionButton}>
          <MaterialIcons name="edit" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteUser(item.id)} style={styles.actionButton}>
          <MaterialIcons name="delete" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../../assets/images/logo.jpeg')} // Update this path
          style={styles.headerLogo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>Manage Users</Text>
      </View>

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search users..."
        placeholderTextColor="#999"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* User List */}
      {filteredUsers.length === 0 ? (
        <View style={styles.emptyListContainer}>
          <Text style={styles.emptyListText}>No users found matching your search.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item.id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Add User Button */}
      <TouchableOpacity style={styles.floatingAddButton} onPress={handleAddUser}>
        <MaterialIcons name="person-add" size={30} color="#fff" />
      </TouchableOpacity>
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
    paddingBottom: 80, // Space for the floating button
  },
  userCard: {
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
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    backgroundColor: '#ddd',
  },
  userInfo: {
    flex: 1, // Allows info to take up available space
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  userRole: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#007AFF', // Blue for role
    marginTop: 4,
  },
  userActions: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  actionButton: {
    padding: 8,
    marginLeft: 5,
  },
  floatingAddButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007AFF', // Blue color
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
  },
  emptyListText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default ManageUsers;

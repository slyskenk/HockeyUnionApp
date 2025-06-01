import { MaterialIcons } from '@expo/vector-icons'; // For icons like edit, delete, add
import { useRouter } from 'expo-router'; // Import useRouter for navigation
import React, { useEffect, useState } from 'react'; // Added useEffect
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform, // Import Modal
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Import Picker for role selection
import { Picker } from '@react-native-picker/picker';

// Define User type with updated roles
type UserRole = 'Admin' | 'Other Admin' | 'Coach' | 'Player' | 'Supporter' | 'Fan'; // Type for roles

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole; // Use the UserRole type
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
  const router = useRouter(); // Initialize useRouter
  const [users, setUsers] = useState<User[]>(DUMMY_USERS);
  const [searchQuery, setSearchQuery] = useState('');

  // --- State for the Modal Form ---
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null); // Holds user data for editing or null for new user
  const [formData, setFormData] = useState<Partial<User>>({}); // State for form inputs

  // Effect to initialize form data when modal opens or userToEdit changes
  useEffect(() => {
    if (isModalVisible) {
      if (userToEdit) {
        setFormData(userToEdit); // Populate with existing user data
      } else {
        // Initialize for a new user
        setFormData({
          id: `new-${Date.now()}`, // Generate a temporary ID for new user
          name: '',
          email: '',
          role: 'Fan', // Default role for new users
          avatar: '',
        });
      }
    }
  }, [isModalVisible, userToEdit]);

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
   * Opens the modal to add a new user.
   */
  const handleAddUser = () => {
    setUserToEdit(null); // No user to edit, so it's a new one
    setIsModalVisible(true);
  };

  /**
   * Opens the modal to edit an existing user.
   * @param user The user object to edit.
   */
  const handleEditUser = (user: User) => {
    setUserToEdit(user); // Set the user data to pre-fill the form
    setIsModalVisible(true);
  };

  // --- Modal Form Handlers ---

  /**
   * Updates a specific field of the modal form data.
   */
  const handleChangeFormData = (field: keyof User, value: string | UserRole) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Handles saving the user data from the modal form.
   */
  const handleSaveModal = () => {
    // Basic validation
    if (!formData.name || !formData.email || !formData.role) {
      Alert.alert('Missing Information', 'Please fill in Name, Email, and Role.');
      return;
    }
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        return;
    }


    // Ensure all required fields for User type are present
    const finalData: User = {
      id: formData.id || `u${Date.now()}`, // Ensure ID exists for new users
      name: formData.name,
      email: formData.email,
      role: formData.role,
      avatar: formData.avatar || '',
    };

    const isNew = !userToEdit; // If userToEdit was null, it's a new user

    if (isNew) {
      setUsers(prevUsers => [finalData, ...prevUsers]); // Add new user to the beginning
    } else {
      setUsers(prevUsers =>
        prevUsers.map(user => (user.id === finalData.id ? finalData : user))
      );
    }
    setIsModalVisible(false); // Close the modal
    setUserToEdit(null); // Clear the user being edited
    Alert.alert('Success', `User ${isNew ? 'added' : 'updated'} successfully!`);
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
            setUserToEdit(null); // Clear any pending user to edit
          },
          style: 'destructive',
        },
      ]
    );
  };

  /**
   * Renders a single user item in the FlatList.
   * @param item The User object to render.
   */
  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => handleEditUser(item)} // Tapping card opens edit modal
      activeOpacity={0.8}
    >
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

      {/* --- Modal Form for Add/Edit User (All within ManageUsers.tsx) --- */}
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
            <Text style={styles.modalTitle}>{userToEdit ? 'Edit User' : 'Add New User'}</Text>
            <TouchableOpacity onPress={handleSaveModal} style={styles.saveButton}>
              <MaterialIcons name="check" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.formContainer}>
            <Text style={styles.label}>Name:</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => handleChangeFormData('name', text)}
              placeholder="User Full Name"
            />

            <Text style={styles.label}>Email:</Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => handleChangeFormData('email', text)}
              placeholder="user@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Role:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.role}
                onValueChange={(itemValue: UserRole) => handleChangeFormData('role', itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Admin" value="Admin" />
                <Picker.Item label="Other Admin" value="Other Admin" />
                <Picker.Item label="Coach" value="Coach" />
                <Picker.Item label="Player" value="Player" />
                <Picker.Item label="Supporter" value="Supporter" />
                <Picker.Item label="Fan" value="Fan" />
              </Picker>
            </View>

            <Text style={styles.label}>Avatar URL (Optional):</Text>
            <TextInput
              style={styles.input}
              value={formData.avatar}
              onChangeText={(text) => handleChangeFormData('avatar', text)}
              placeholder="Link to user avatar image"
              keyboardType="url"
              autoCapitalize="none"
            />

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
  // --- Modal Specific Styles (copied from previous event manager file) ---
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

export default ManageUsers;
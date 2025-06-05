import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { auth, db } from '../../../firebase/firebase'; // ✅ Adjust path if needed
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const { width } = Dimensions.get('window');
const screenPaddingHorizontal = 20;
const numColumns = 3;
const itemGap = 10;

const availableWidthForGrid = width - 2 * screenPaddingHorizontal;
const itemSize = (availableWidthForGrid - (numColumns + 1) * itemGap) / numColumns;

interface DashboardRole {
  label: string;
  route: string;
}

const DASHBOARD_ROLES: DashboardRole[] = [
  { label: 'Admin Dashboard', route: './../admin/Dashboard' },
  { label: 'Supporter Dashboard', route: './../supporter/Dashboard' },
  { label: 'Player Dashboard', route: './../player/Dashboard' },
  { label: 'Coach Dashboard', route: './../coach/Dashboard' },
];

interface DashboardTabProps {
  iconName: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  label: string;
  onPress: () => void;
}

const DashboardTab = ({ iconName, label, onPress }: DashboardTabProps) => (
  <TouchableOpacity style={styles.tabButton} onPress={onPress}>
    <MaterialCommunityIcons name={iconName} size={itemSize * 0.4} color="#555" />
    <Text style={styles.tabLabel}>{label}</Text>
  </TouchableOpacity>
);

const DashboardScreen = () => {
  const router = useRouter();
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [currentRole, setCurrentRole] = useState<DashboardRole>(
    DASHBOARD_ROLES.find((role) => role.label === 'Admin Dashboard') || DASHBOARD_ROLES[0]
  );
  const [adminName, setAdminName] = useState<string>('');
  const [loadingName, setLoadingName] = useState(true); // ✅ Spinner state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(docRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            setAdminName(data.name || 'Admin');
          } else {
            setAdminName('Admin');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setAdminName('Admin');
        } finally {
          setLoadingName(false);
        }
      } else {
        setAdminName('');
        setLoadingName(false);
      }
    });

    return unsubscribe;
  }, []);

  const tabsData = [
    { iconName: 'robot-outline', label: 'Chatbot', onPress: () => router.push('./../admin/ChatbotManager') },
    { iconName: 'calendar-edit', label: 'Events', onPress: () => router.push('./../admin/EventsManager') },
    { iconName: 'forum-outline', label: 'Forum', onPress: () => router.push('./../admin/ForumModeration') },
    { iconName: 'account-multiple-outline', label: 'Manage Users', onPress: () => router.push('./../admin/ManageUsers') },
    { iconName: 'newspaper-variant-outline', label: 'News', onPress: () => router.push('./../admin/NewsManager') },
    { iconName: 'bell-outline', label: 'Notifications', onPress: () => router.push('./../admin/Notification') },
    { iconName: 'chart-bar', label: 'Reports', onPress: () => router.push('./../admin/Reports') },
    { iconName: 'key-chain', label: 'Role Access', onPress: () => router.push('./../admin/RoleAccess') },
    { iconName: 'account-group-outline', label: 'Teams', onPress: () => router.push('./../admin/TeamsManager') },
    { iconName: 'trophy-outline', label: 'Leaderboards', onPress: () => router.push('./../admin/Leaderboards') },
  ];

  const handleRoleChange = (role: DashboardRole) => {
    setCurrentRole(role);
    setShowRoleSelector(false);
    router.push(role.route);
  };

  return (
    <View style={styles.rootContainer}>
      {/* Header Area */}
      <View style={styles.header}>
        <Image source={require('../../../assets/images/logo.jpeg')} style={styles.logo} resizeMode="contain" />
        <TouchableOpacity style={styles.roleSelectorToggle} onPress={() => setShowRoleSelector(true)}>
          <Text style={styles.currentRoleText}>{currentRole.label}</Text>
          <MaterialIcons name="arrow-drop-down" size={24} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Welcome Text */}
      <Text style={styles.welcomeText}>Welcome Admin</Text>

      {loadingName ? (
        <ActivityIndicator size="small" color="#333" style={{ marginBottom: 30 }} />
      ) : (
        <Text style={styles.adminName}>{adminName}</Text>
      )}

      {/* Grid of Tabs */}
      <View style={styles.tabsGrid}>
        {tabsData.map((tab, index) => (
          <DashboardTab key={index} iconName={tab.iconName} label={tab.label} onPress={tab.onPress} />
        ))}
      </View>

      {/* Role Selection Modal */}
      <Modal animationType="fade" transparent={true} visible={showRoleSelector} onRequestClose={() => setShowRoleSelector(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowRoleSelector(false)}>
          <View style={styles.modalContent}>
            {DASHBOARD_ROLES.map((role, index) => (
              <TouchableOpacity key={index} style={styles.modalRoleOption} onPress={() => handleRoleChange(role)}>
                <Text style={styles.modalRoleText}>{role.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: screenPaddingHorizontal,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  logo: {
    width: 60,
    height: 60,
  },
  roleSelectorToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  currentRoleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 5,
  },
  welcomeText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
    textAlign: 'center',
    width: '100%',
  },
  adminName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 30,
    textTransform: 'uppercase',
    textAlign: 'center',
    width: '100%',
  },
  tabsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  tabButton: {
    width: itemSize,
    height: itemSize,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: itemGap,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tabLabel: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
    fontWeight: '500',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 80,
    paddingRight: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalRoleOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalRoleText: {
    fontSize: 16,
    color: '#333',
  },
});

export default DashboardScreen;

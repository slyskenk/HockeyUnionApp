import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import AdminNavigator from '../navigation/AdminNavigator';
import AuthNavigator from '../navigation/AuthNavigator';
import CoachNavigator from '../navigation/CoachNavigator';
import PlayerNavigator from '../navigation/PlayerNavigator';
import SupporterNavigator from '../navigation/SupporterNavigator';

export default function RootNavigator() {
  const { userRole, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {userRole === null && <AuthNavigator />}
      {userRole === 'admin' && <AdminNavigator />}
      {userRole === 'coach' && <CoachNavigator />}
      {userRole === 'player' && <PlayerNavigator />}
      {userRole === 'supporter' && <SupporterNavigator />}
    </NavigationContainer>
  );
}

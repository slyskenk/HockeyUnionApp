import React from 'react';
import { AuthProvider } from '../HockeyUnionApp/context/AuthContext';
import RootNavigator from '../HockeyUnionApp/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

// app/_layout.tsx
import { SplashScreen, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [user, setUser] = useState<any | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setIsAuthReady(true);
      SplashScreen.hideAsync();
    });

    return () => unsubscribe();
  }, []);

  if (!isAuthReady) {
    return null; // or show a loading spinner
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Auth screens always available if not logged in */}
      <Stack.Screen name="(auth)" />
      
      {/* App screens only accessible if logged in */}
      <Stack.Screen name="(app)" redirect={!user} />

      {/* Don’t auto-redirect from index; let user choose (e.g. via buttons) */}
      <Stack.Screen name="index" />
    </Stack>
  );
}

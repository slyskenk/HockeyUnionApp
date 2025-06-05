// app/_layout.tsx
import { SplashScreen } from 'expo-router';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase'; // Adjust this path if needed

// Prevent the splash screen from auto-hiding before authentication state is checked
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [user, setUser] = useState<any | null>(null); // Stores Firebase Auth user object
  const [isAuthReady, setIsAuthReady] = useState(false); // Tracks if auth state has been checked

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser); // authUser will be null if logged out, or a user object if logged in
      setIsAuthReady(true); // Auth state has now been determined
      SplashScreen.hideAsync(); // Hide splash screen once auth state is known
    });

    return () => unsubscribe(); // Clean up the listener when the component unmounts
  }, []);

  if (!isAuthReady) {
    // While checking auth state, return null or a loading indicator
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}> {/* Applied headerShown: false here */}
      {/*
        This configuration effectively says:
        If there's no 'user' (meaning not logged in):
          - Only allow access to the 'auth' group (which contains your login/signup).
          - Other routes will be redirected.
        If there IS a 'user' (meaning logged in):
          - Hide the 'auth' group from direct access (though users can still navigate there if you allow it programmatically).
          - Show all other routes.
      */}
      <Stack.Screen name="(auth)" /> {/* No need for options here, inherited from Stack */}
      <Stack.Screen name="(app)" /> {/* No need for options here, inherited from Stack */}
      <Stack.Screen name="index" redirect={!user} /> {/* No need for options here, inherited from Stack */}
    </Stack>
  );
}
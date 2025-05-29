// ../navigation/AuthNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import Login from './Login';
import SignUp from './SignUp';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();



// Full Stack with tabs + extras
export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="AuthTabs">
    <Stack.Screen name="Login" component={Login}/>
    <Stack.Screen name="SignUp" component={SignUp}/>
    </Stack.Navigator>
  );
}

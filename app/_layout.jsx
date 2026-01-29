import React from 'react'
import { Stack } from 'expo-router'
import { AuthProvider } from '../contexts/AuthContext';

const RootLayout = () => {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signUp" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AuthProvider>
  )
}

export default RootLayout

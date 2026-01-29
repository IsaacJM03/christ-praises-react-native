import React from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { PostProvider } from '../contexts/PostContext';

const RootLayout = () => {
  return (
    <>
      <StatusBar style="auto" />
      <PostProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
          <Stack.Screen name="login" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="signUp" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        </Stack>
      </PostProvider>
    </>
  )
}

export default RootLayout

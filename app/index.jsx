import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { authService } from "../lib/authService";
import { theme } from "../constants/theme";

const Index = () => {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Small delay to prevent flash
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const token = await authService.getToken();
        
        if (token) {
          // User is logged in, go to home
          router.replace("/(tabs)");
        } else {
          // User is not logged in, go to welcome
          router.replace("/welcome");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        router.replace("/welcome");
      } finally {
        setChecking(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});
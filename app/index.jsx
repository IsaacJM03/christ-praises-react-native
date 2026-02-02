import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { authService } from "../lib/authService";
import { theme } from "../constants/theme";
import InteractiveLogo from "../components/InteractiveLogo";
import { hp } from "../helpers/common";

const Index = () => {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
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

    // Small delay to prevent flash
    setTimeout(checkAuth, 100);
  }, []);

  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.colors.gradient.auth}
        style={styles.gradient}
      />
      
      <View style={styles.content}>
        <InteractiveLogo 
          mode="splash"
          size={hp(25)}
        />
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Christ Praises</Text>
          <Text style={styles.subtitle}>Can I Testify?</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: hp(3),
  },
  title: {
    fontSize: hp(3.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.textLight,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: hp(1.6),
    color: theme.colors.primaryLight,
    marginTop: theme.spacing.xs,
    letterSpacing: 2,
  },
});

export default Index;
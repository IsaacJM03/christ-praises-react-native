import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from "../constants/theme";

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = global.setTimeout(() => {
      router.replace("/welcome");
    }, 500);
    return () => global.clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.colors.gradient.auth}
        style={styles.gradient}
      />
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default Index;
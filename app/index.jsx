import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { theme } from "../constants/theme";
import { hp } from "../helpers/common";
import InteractiveLogo from "../components/InteractiveLogo";

const Index = () => {
  const router = useRouter();
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    if (animationComplete) {
      const timer = setTimeout(() => {
        router.replace("/welcome");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [animationComplete, router]);

  const handleAnimationComplete = () => {
    setAnimationComplete(true);
  };

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
          onAnimationComplete={handleAnimationComplete}
        />
        
        <Animated.View 
          entering={FadeIn.delay(600).duration(400)}
          style={styles.textContainer}
        >
          <Text style={styles.title}>Christ Praises</Text>
          <Text style={styles.subtitle}>Connect • Share • Grow</Text>
        </Animated.View>
      </View>
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
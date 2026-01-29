import { View, Text, Button, Image } from "react-native";
import React, { useEffect } from "react";
import { useRouter, usePathname, useSegments } from "expo-router";
import ScreenWrapper from "../components/ScreenWrapper";

const index = () => {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();

  useEffect(() => {
    // console.log("[index] pathname:", pathname);
    // console.log("[index] segments:", segments);
  }, [pathname, segments]);

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
          <Text style={styles.subtitle}>Can I Testify?</Text>
        </Animated.View>
      </View>
    </View>
  );
}

export default index
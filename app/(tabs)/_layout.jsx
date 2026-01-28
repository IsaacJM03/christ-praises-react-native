import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { theme } from '../../constants/theme';
import Icon from '../../assets/icons';

const AnimatedView = Animated.createAnimatedComponent(View);

// Animated Tab Icon component with bounce effect
const AnimatedTabIcon = ({ name, color, focused }) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    if (focused) {
      // Bounce animation on selection
      scale.value = withSequence(
        withSpring(1.15, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 150 })
      );
      translateY.value = withSequence(
        withSpring(-3, { damping: 8 }),
        withSpring(0, { damping: 12 })
      );
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <AnimatedView style={[styles.tabIcon, animatedStyle]}>
      <View style={[styles.iconWrapper, focused && styles.iconWrapperFocused]}>
        <Icon name={name} size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
      </View>
      {/* Active indicator line */}
      {focused && <View style={styles.activeIndicator} />}
    </AnimatedView>
  );
};

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.grayMedium,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="home" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="user" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="search" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="user" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: theme.colors.background,
    borderTopWidth: 0,
    height: 85,
    paddingTop: 8,
    paddingBottom: 25,
    // Elevated premium look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: theme.fonts.semibold,
    marginTop: 2,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 32,
  },
  iconWrapper: {
    padding: 4,
    borderRadius: 12,
  },
  iconWrapperFocused: {
    backgroundColor: 'rgba(255, 108, 0, 0.1)',
  },
  activeIndicator: {
    width: 20,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.primary,
    position: 'absolute',
    bottom: -4,
  },
});

export default TabLayout;

import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { theme } from '../constants/theme';
import Avatar from './Avatar';
import Icon from '../assets/icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Header = ({
  title = 'Christ Praises',
  showTitle = true,
  showProfile = true,
  showNotifications = true,
  profileImage,
  profileName,
  notificationCount = 0,
  onProfilePress,
  onNotificationPress,
  onTitlePress,
  leftComponent,
  rightComponent,
  backgroundColor = 'transparent',
  style,
}) => {
  const { top } = useSafeAreaInsets();
  const bellScale = useSharedValue(1);

  const bellAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bellScale.value }],
  }));

  const handleBellPressIn = () => {
    bellScale.value = withSpring(0.9, { damping: 15, stiffness: 150 });
  };

  const handleBellPressOut = () => {
    bellScale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <View style={[styles.container, { paddingTop: top + 10, backgroundColor }, style]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {leftComponent || (
            showTitle && (
              <Pressable onPress={onTitlePress} disabled={!onTitlePress}>
                <Text style={styles.title}>{title}</Text>
              </Pressable>
            )
          )}
        </View>

        <View style={styles.rightSection}>
          {rightComponent || (
            <>
              {showNotifications && (
                <AnimatedPressable
                  onPress={onNotificationPress}
                  onPressIn={handleBellPressIn}
                  onPressOut={handleBellPressOut}
                  style={[styles.iconButton, bellAnimatedStyle]}
                >
                  <Icon name="heart" size={24} color={theme.colors.text} />
                  {notificationCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.badgeText}>
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </Text>
                    </View>
                  )}
                </AnimatedPressable>
              )}
              {showProfile && (
                <Avatar
                  source={profileImage}
                  name={profileName}
                  size={36}
                  onPress={onProfilePress}
                />
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  iconButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.colors.rose,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: theme.colors.textLight,
    fontSize: 9,
    fontWeight: theme.fonts.bold,
  },
});

export default Header;

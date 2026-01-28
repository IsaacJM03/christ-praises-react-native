import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';
import { hp } from '../../helpers/common';
import Avatar from '../../components/Avatar';
import AnimatedCard from '../../components/AnimatedCard';
import Icon from '../../assets/icons';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

const mockUserData = {
  name: 'Guest User',
  email: 'guest@christpraises.com',
  joinDate: 'January 2024',
  postsCount: 12,
  friendsCount: 48,
  likesCount: 156,
};

const menuItems = [
  { id: '1', title: 'Edit Profile', icon: 'edit', action: 'edit' },
  { id: '2', title: 'Notifications', icon: 'heart', action: 'notifications' },
  { id: '3', title: 'Privacy Settings', icon: 'lock', action: 'privacy' },
  { id: '4', title: 'Help & Support', icon: 'comment', action: 'help' },
  { id: '5', title: 'About Christ Praises', icon: 'home', action: 'about' },
];

const Profile = () => {
  const router = useRouter();
  const [user] = useState(mockUserData);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 100], [1, 0.3]);
    const scale = interpolate(scrollY.value, [0, 100], [1, 0.9]);
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const handleMenuPress = (action) => {
    switch (action) {
      case 'edit':
        Alert.alert('Edit Profile', 'Profile editing coming soon!');
        break;
      case 'logout':
        Alert.alert('Logout', 'Are you sure you want to logout?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive', onPress: () => router.replace('/welcome') },
        ]);
        break;
      default:
        Alert.alert(action, 'Feature coming soon!');
    }
  };

  const renderStats = () => (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{user.postsCount}</Text>
        <Text style={styles.statLabel}>Posts</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{user.friendsCount}</Text>
        <Text style={styles.statLabel}>Friends</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{user.likesCount}</Text>
        <Text style={styles.statLabel}>Likes</Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={theme.colors.gradient.auth}
        style={styles.headerGradient}
      />

      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View style={[styles.profileHeader, headerStyle]}>
          <Animated.View entering={FadeInUp.delay(100)}>
            <Avatar name={user.name} size={100} style={styles.avatar} />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(150)}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.joinDate}>Member since {user.joinDate}</Text>
          </Animated.View>
        </Animated.View>

        {renderStats()}

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <AnimatedCard
              key={item.id}
              delay={300 + index * 50}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.action)}
            >
              <View style={styles.menuIconContainer}>
                <Icon name={item.icon} size={22} color={theme.colors.primary} />
              </View>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Icon
                name="arrowLeft"
                size={18}
                color={theme.colors.grayMedium}
                style={{ transform: [{ rotate: '180deg' }] }}
              />
            </AnimatedCard>
          ))}
        </View>

        <AnimatedCard
          delay={600}
          style={[styles.menuItem, styles.logoutItem]}
          onPress={() => handleMenuPress('logout')}
        >
          <View style={[styles.menuIconContainer, styles.logoutIconContainer]}>
            <Icon name="logout" size={22} color={theme.colors.rose} />
          </View>
          <Text style={[styles.menuTitle, styles.logoutText]}>Logout</Text>
        </AnimatedCard>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Christ Praises v1.0.0</Text>
          <Text style={styles.footerSubtext}>Made with ❤️ for the community</Text>
        </View>
      </AnimatedScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: hp(35),
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: hp(8),
    paddingBottom: theme.spacing.lg,
  },
  avatar: {
    borderWidth: 3,
    borderColor: theme.colors.background,
    ...theme.shadow.lg,
  },
  userName: {
    fontSize: hp(2.8),
    fontWeight: theme.fonts.bold,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  userEmail: {
    fontSize: hp(1.7),
    color: theme.colors.textLight,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  joinDate: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    ...theme.shadow.md,
    marginTop: -theme.spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: hp(2.4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.textDark,
  },
  statLabel: {
    fontSize: hp(1.5),
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  menuContainer: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  menuTitle: {
    flex: 1,
    fontSize: hp(1.9),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textDark,
  },
  logoutItem: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  logoutIconContainer: {
    backgroundColor: theme.colors.errorLight,
  },
  logoutText: {
    color: theme.colors.rose,
  },
  footer: {
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  footerText: {
    fontSize: hp(1.5),
    color: theme.colors.textMuted,
  },
  footerSubtext: {
    fontSize: hp(1.4),
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
});

export default Profile;

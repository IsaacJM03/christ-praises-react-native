import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, Image, ScrollView, Alert, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import { authService } from '../../lib/authService';

const ProfileScreen = () => {
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });

  const loadUser = useCallback(async () => {
    const userData = await authService.getUser();
    console.log('User data:', userData);
    setUser(userData);
    
    // TODO: Fetch actual stats from API
    // For now, using placeholder
  }, []);

  useEffect(() => {
    loadUser();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh user data from server
    const result = await authService.getCurrentUser();
    if (result.success) {
      setUser(result.data);
    }
    setRefreshing(false);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            router.replace('/');
          }
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert('Coming Soon', 'Profile editing will be available soon!');
  };

  const handleLikedPosts = () => {
    Alert.alert('Coming Soon', 'Liked posts will be available soon!');
  };

  const handleSettings = () => {
    Alert.alert('Coming Soon', 'Settings will be available soon!');
  };

  const handleHelp = () => {
    Alert.alert('Help & Support', 'For assistance, please email support@christpraises.app');
  };

  const handleAbout = () => {
    Alert.alert(
      'About Christ Praises',
      'Christ Praises is a community app for sharing faith, encouragement, and inspiration.\n\nVersion 1.0.0\n\n© 2024 Christ Praises'
    );
  };

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', onPress: () => router.push('/editProfile') },
    { icon: 'bookmark-outline', label: 'Saved Posts', onPress: () => router.push('/(tabs)/saved') },
    { icon: 'heart-outline', label: 'Liked Posts', onPress: () => router.push('/(tabs)/liked') },
    { icon: 'settings-outline', label: 'Settings', onPress: handleSettings },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: handleHelp },
    { icon: 'information-circle-outline', label: 'About', onPress: handleAbout },
  ];

  // Get display name - prioritize name over email
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || '';
  const avatarLetter = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={[styles.headerGradient, { paddingTop: top + hp(2) }]}
      >
        <Animated.View entering={FadeIn.duration(500)} style={styles.profileSection}>
          {user?.image ? (
            <Image source={{ uri: user.image }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </View>
          )}
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userEmail}>{displayEmail}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.posts}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: bottom + hp(2) }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <Animated.View 
              key={item.label}
              entering={FadeInDown.delay(index * 50).duration(400)}
            >
              <Pressable 
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed
                ]}
                onPress={item.onPress}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons name={item.icon} size={22} color={theme.colors.primary} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.grayMedium} />
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <Pressable 
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed
            ]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color={theme.colors.rose} />
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </Animated.View>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerGradient: {
    paddingBottom: hp(3),
  },
  profileSection: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: 'white',
  },
  userName: {
    fontSize: hp(2.4),
    fontWeight: theme.fonts.bold,
    color: 'white',
    marginTop: theme.spacing.md,
  },
  userEmail: {
    fontSize: hp(1.5),
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.radius.xl,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  statNumber: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: 'white',
  },
  statLabel: {
    fontSize: hp(1.3),
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    flex: 1,
    marginTop: -hp(2),
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    paddingTop: theme.spacing.lg,
  },
  menuSection: {
    backgroundColor: theme.colors.card,
    marginHorizontal: wp(4),
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.grayLight,
  },
  menuItemPressed: {
    backgroundColor: theme.colors.backgroundSecondary,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: hp(1.7),
    color: theme.colors.textDark,
    fontWeight: theme.fonts.medium,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: wp(4),
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.roseLight,
    borderRadius: theme.radius.xl,
    gap: theme.spacing.sm,
  },
  logoutButtonPressed: {
    opacity: 0.8,
  },
  logoutText: {
    fontSize: hp(1.7),
    color: theme.colors.rose,
    fontWeight: theme.fonts.semibold,
  },
  versionText: {
    textAlign: 'center',
    color: theme.colors.grayMedium,
    fontSize: hp(1.3),
    marginTop: theme.spacing.xl,
  },
});

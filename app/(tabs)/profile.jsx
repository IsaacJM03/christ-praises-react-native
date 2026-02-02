import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Image, ScrollView, Alert } from 'react-native';
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

  useEffect(() => {
    const loadUser = async () => {
      const userData = await authService.getUser();
      setUser(userData);
    };
    loadUser();
  }, []);

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

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', onPress: () => {} },
    { icon: 'bookmark-outline', label: 'Saved Posts', onPress: () => router.push('/(tabs)/saved') },
    { icon: 'heart-outline', label: 'Liked Posts', onPress: () => {} },
    { icon: 'settings-outline', label: 'Settings', onPress: () => {} },
    { icon: 'help-circle-outline', label: 'Help & Support', onPress: () => {} },
    { icon: 'information-circle-outline', label: 'About', onPress: () => {} },
  ];

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
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: bottom + hp(2) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <Animated.View 
              key={item.label}
              entering={FadeInDown.delay(index * 50).duration(400)}
            >
              <Pressable style={styles.menuItem} onPress={item.onPress}>
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
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
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

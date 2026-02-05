import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, Image, Modal, RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInRight,
  SlideInRight, 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import { authService } from '../../lib/authService';
import { postService } from '../../lib/postService';
import PostFeed from '../../components/PostFeed';
import { PostProvider } from '../../contexts/PostContext';
import CreatePostModal from '../../components/CreatePostModal';
import InteractiveLogo from '../../components/InteractiveLogo';

// Animated FAB Component
const AnimatedFAB = ({ onPress }) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
    rotation.value = withSpring(90);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    rotation.value = withSpring(0);
  };

  return (
    <Pressable 
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.fabContainer}
    >
      <Animated.View style={animatedStyle}>
        <LinearGradient 
          colors={[theme.colors.primary, theme.colors.primaryDark]} 
          style={styles.fab}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="add" size={28} color="white" />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

// Profile Popup Component
const ProfilePopup = ({ visible, onClose, user }) => {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();

  const handleLogout = async () => {
    await authService.logout();
    onClose();
    // Use replace to prevent going back, and navigate to welcome screen
    router.replace('/welcome');
  };

  const handleNavigate = (route) => {
    onClose();
    router.push(route);
  };

  if (!visible) return null;

  const avatarLetter = (user?.name || user?.email || 'U').charAt(0).toUpperCase();
  const displayName = user?.name && !user.name.includes('@') ? user.name : user?.email?.split('@')[0] || 'User';

  const menuItems = [
    { icon: 'person-outline', label: 'View Profile', route: '/(tabs)/profile', color: theme.colors.primary },
    { icon: 'bookmark-outline', label: 'Saved Posts', route: '/(tabs)/saved', color: theme.colors.primaryDark },
    { icon: 'heart-outline', label: 'Liked Posts', route: '/(tabs)/liked', color: theme.colors.rose },
    { icon: 'settings-outline', label: 'Settings', route: null, color: theme.colors.textMuted },
  ];

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.popupOverlay} onPress={onClose}>
        <Animated.View entering={SlideInRight.duration(300)} style={[styles.profilePopup, { paddingBottom: bottom + 20 }]}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            {/* Handle bar */}
            <View style={styles.handleBar} />
            
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>Profile</Text>
              <Pressable onPress={onClose} style={styles.closePopupButton}>
                <Ionicons name="close" size={24} color={theme.colors.textMuted} />
              </Pressable>
            </View>
            
            {/* Profile Card */}
            <LinearGradient 
              colors={[theme.colors.primary + '15', theme.colors.primaryDark + '10']}
              style={styles.profileCard}
            >
              <LinearGradient 
                colors={[theme.colors.primary, theme.colors.primaryDark]} 
                style={styles.profilePopupAvatar}
              >
                <Text style={styles.profilePopupAvatarText}>{avatarLetter}</Text>
              </LinearGradient>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileEmail}>{user?.email || ''}</Text>
              
              {/* Quick Stats */}
              <View style={styles.quickStats}>
                <View style={styles.quickStat}>
                  <Text style={styles.quickStatNumber}>0</Text>
                  <Text style={styles.quickStatLabel}>Posts</Text>
                </View>
                <View style={styles.quickStatDivider} />
                <View style={styles.quickStat}>
                  <Text style={styles.quickStatNumber}>0</Text>
                  <Text style={styles.quickStatLabel}>Likes</Text>
                </View>
              </View>
            </LinearGradient>
            
            {/* Menu Items */}
            <View style={styles.menuItems}>
              {menuItems.map((item, index) => (
                <Animated.View key={item.label} entering={FadeInRight.delay(index * 50)}>
                  <Pressable 
                    style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                    onPress={() => item.route && handleNavigate(item.route)}
                  >
                    <View style={[styles.menuIconContainer, { backgroundColor: item.color + '15' }]}>
                      <Ionicons name={item.icon} size={20} color={item.color} />
                    </View>
                    <Text style={styles.menuItemText}>{item.label}</Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.grayMedium} />
                  </Pressable>
                </Animated.View>
              ))}
            </View>
            
            {/* Logout Button */}
            <Pressable 
              style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={22} color={theme.colors.rose} />
              <Text style={styles.logoutText}>Log Out</Text>
            </Pressable>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

// Header Component
const HomeHeader = ({ user, onProfilePress }) => {
  const { top } = useSafeAreaInsets();
  const avatarLetter = (user?.name || user?.email || 'U').charAt(0).toUpperCase();
  const displayName = user?.name && !user.name.includes('@') ? user.name : user?.email?.split('@')[0] || 'Friend';
  
  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Animated.View entering={FadeIn.duration(500)} style={[styles.header, { paddingTop: top + hp(0.5) }]}>
      <LinearGradient
        colors={['white', theme.colors.background]}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.headerContent}>
        {/* Logo and Greeting */}
        <View style={styles.headerLeft}>
          <InteractiveLogo mode="home" size={hp(5)} motionIntensity={0.3} />
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{displayName} 👋</Text>
          </View>
        </View>
        
        {/* Profile Button with notification badge */}
        <Pressable onPress={onProfilePress} style={styles.profileButton}>
          <LinearGradient 
            colors={[theme.colors.primary, theme.colors.primaryDark]} 
            style={styles.avatarGradient}
          >
            <Text style={styles.avatarText}>{avatarLetter}</Text>
          </LinearGradient>
          {/* Notification badge */}
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>2</Text>
          </View>
        </Pressable>
      </View>
      
      {/* Inspirational Quote */}
      <Animated.View entering={FadeInDown.delay(200)} style={styles.quoteContainer}>
        <LinearGradient
          colors={[theme.colors.primary + '10', theme.colors.primaryDark + '05']}
          style={styles.quoteGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="sparkles" size={16} color={theme.colors.primary} />
          <Text style={styles.quoteText}>
            "Let your light shine before others" - Matthew 5:16
          </Text>
        </LinearGradient>
      </Animated.View>
    </Animated.View>
  );
};

const HomeScreen = () => {
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  const loadUser = async () => {
    const userData = await authService.getUser();
    setUser(userData);
  };

  const handleCreatePost = async (content, imageUrl) => {
    console.log('Creating post:', { content, imageUrl });
    const result = await postService.createPost(content, imageUrl);
    return result;
  };

  return (
    <PostProvider>
      <View style={styles.container}>
        <StatusBar style="dark" />
        
        {/* Feed with Header */}
        <PostFeed 
          onUserPress={(userId) => console.log('User pressed:', userId)}
          ListHeaderComponent={() => <HomeHeader user={user} onProfilePress={() => setShowProfile(true)} />}
        />

        {/* Floating Action Button */}
        <AnimatedFAB onPress={() => setShowCreatePost(true)} />

        {/* Create Post Modal */}
        <CreatePostModal
          visible={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          onSubmit={handleCreatePost}
          user={user}
        />

        {/* Profile Popup */}
        <ProfilePopup visible={showProfile} onClose={() => setShowProfile(false)} user={user} />
      </View>
    </PostProvider>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  
  // Header styles
  header: { 
    paddingHorizontal: wp(4), 
    paddingBottom: hp(1.5),
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  greetingContainer: {
    marginLeft: theme.spacing.xs,
  },
  greeting: { 
    fontSize: hp(1.5), 
    color: theme.colors.textMuted,
    fontWeight: theme.fonts.medium,
  },
  userName: { 
    fontSize: hp(2), 
    fontWeight: theme.fonts.bold, 
    color: theme.colors.textDark,
  },
  profileButton: { 
    padding: 2,
    position: 'relative',
  },
  avatarGradient: { 
    width: 46, 
    height: 46, 
    borderRadius: 23, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primaryLight + '30',
  },
  avatarText: { 
    color: 'white', 
    fontWeight: theme.fonts.bold, 
    fontSize: 18,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: theme.colors.rose,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  notificationBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: theme.fonts.bold,
  },
  
  // Quote styles
  quoteContainer: {
    marginTop: theme.spacing.md,
  },
  quoteGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.lg,
    gap: theme.spacing.sm,
  },
  quoteText: {
    flex: 1,
    fontSize: hp(1.4),
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  
  // FAB styles
  fabContainer: {
    position: 'absolute',
    bottom: hp(12),
    right: wp(4),
    zIndex: 100,
  },
  fab: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    alignItems: 'center', 
    justifyContent: 'center', 
    elevation: 8, 
    shadowColor: theme.colors.primary, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.4, 
    shadowRadius: 8,
  },
  
  // Profile popup styles
  popupOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'flex-end',
  },
  profilePopup: { 
    backgroundColor: theme.colors.card, 
    borderTopLeftRadius: 28, 
    borderTopRightRadius: 28, 
    paddingHorizontal: wp(4),
    paddingTop: theme.spacing.sm,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.grayMedium,
    opacity: 0.3,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  popupHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: theme.spacing.md,
  },
  popupTitle: { 
    fontSize: hp(2.2), 
    fontWeight: theme.fonts.bold, 
    color: theme.colors.textDark,
  },
  closePopupButton: { 
    padding: 4,
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: 20,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    borderRadius: theme.radius.xl,
    marginBottom: theme.spacing.md,
  },
  profilePopupAvatar: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profilePopupAvatarText: { 
    color: 'white', 
    fontSize: 32, 
    fontWeight: theme.fonts.bold,
  },
  profileName: { 
    fontSize: hp(2.2), 
    fontWeight: theme.fonts.bold, 
    color: theme.colors.textDark, 
    marginTop: theme.spacing.md,
  },
  profileEmail: { 
    fontSize: hp(1.5), 
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    gap: theme.spacing.xl,
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatNumber: {
    fontSize: hp(2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.textDark,
  },
  quickStatLabel: {
    fontSize: hp(1.3),
    color: theme.colors.textMuted,
  },
  quickStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.grayLight,
  },
  menuItems: { 
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: theme.spacing.md, 
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.grayLight,
  },
  menuItemPressed: {
    backgroundColor: theme.colors.grayLight + '50',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: { 
    flex: 1, 
    fontSize: hp(1.7), 
    color: theme.colors.textDark,
    fontWeight: theme.fonts.medium,
  },
  logoutButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
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
});

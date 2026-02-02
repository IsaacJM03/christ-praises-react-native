import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Image, ScrollView, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { 
  FadeIn, 
  FadeInDown,
  FadeInRight,
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming,
  SlideInRight,
  SlideOutRight,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import { PostProvider } from '../../contexts/PostContext';
import PostFeed from '../../components/PostFeed';
import QuickPostModal from '../../components/QuickPostModal';
import { Ionicons } from '@expo/vector-icons';
import { authService } from '../../lib/authService';
import { useRouter } from 'expo-router';
import { Modal } from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Story/Status Item Component
const StoryItem = ({ item, isAdd, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  if (isAdd) {
    return (
      <AnimatedPressable 
        style={[styles.storyItem, animatedStyle]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.addStoryCircle}
        >
          <Ionicons name="add" size={28} color="white" />
        </LinearGradient>
        <Text style={styles.storyName}>Your Story</Text>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable 
      style={[styles.storyItem, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <LinearGradient
        colors={['#FF6B6B', '#FF8E53', '#FFC93C']}
        style={styles.storyRing}
      >
        <View style={styles.storyImageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.storyImage} />
          ) : (
            <View style={styles.storyPlaceholder}>
              <Text style={styles.storyPlaceholderText}>
                {item.name?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
      <Text style={styles.storyName} numberOfLines={1}>{item.name?.split(' ')[0]}</Text>
    </AnimatedPressable>
  );
};

// Welcome Card Component
const WelcomeCard = ({ user }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const inspirationalQuotes = [
    "Let your faith be bigger than your fears",
    "With God, all things are possible",
    "Be the light in someone's darkness today",
    "Trust in His timing, not yours",
  ];

  const randomQuote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.welcomeCard}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.welcomeGradient}
      >
        <View style={styles.welcomeContent}>
          <View style={styles.welcomeTextContainer}>
            <Text style={styles.welcomeGreeting}>{getGreeting()},</Text>
            <Text style={styles.welcomeName}>{user?.name?.split(' ')[0] || 'Friend'} 👋</Text>
            <Text style={styles.welcomeQuote}>"{randomQuote}"</Text>
          </View>
          <View style={styles.welcomeIconContainer}>
            <Ionicons name="sunny" size={50} color="rgba(255,255,255,0.3)" />
          </View>
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActionsRow}>
          <Pressable style={styles.quickAction}>
            <Ionicons name="book-outline" size={18} color="white" />
            <Text style={styles.quickActionText}>Daily Verse</Text>
          </Pressable>
          <View style={styles.quickActionDivider} />
          <Pressable style={styles.quickAction}>
            <Ionicons name="musical-notes-outline" size={18} color="white" />
            <Text style={styles.quickActionText}>Hymns</Text>
          </Pressable>
          <View style={styles.quickActionDivider} />
          <Pressable style={styles.quickAction}>
            <Ionicons name="people-outline" size={18} color="white" />
            <Text style={styles.quickActionText}>Community</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// Section Header
const SectionHeader = ({ title, onSeeAll }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {onSeeAll && (
      <Pressable onPress={onSeeAll}>
        <Text style={styles.seeAllText}>See All</Text>
      </Pressable>
    )}
  </View>
);

// Profile Button
const ProfileButton = ({ user, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable 
      style={[styles.profileButton, animatedStyle]}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.9); }}
      onPressOut={() => { scale.value = withSpring(1); }}
    >
      {user?.image ? (
        <Image source={{ uri: user.image }} style={styles.profileImage} />
      ) : (
        <View style={styles.profilePlaceholder}>
          <Text style={styles.profilePlaceholderText}>
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
};

// Header Button
const HeaderButton = ({ icon, onPress, badge }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable 
      style={[styles.headerButton, animatedStyle]}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.9); }}
      onPressOut={() => { scale.value = withSpring(1); }}
    >
      <Ionicons name={icon} size={24} color={theme.colors.textDark} />
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
};

// Floating Action Button
const FloatingActionButton = ({ onPress }) => {
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulseScale.value }],
  }));

  return (
    <AnimatedPressable 
      style={[styles.fab, animatedStyle]}
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.9); }}
      onPressOut={() => { scale.value = withSpring(1); }}
    >
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.fabGradient}
      >
        <Ionicons name="add" size={30} color="white" />
      </LinearGradient>
    </AnimatedPressable>
  );
};

// Notifications Popup
const NotificationsPopup = ({ visible, onClose }) => {
  const { bottom } = useSafeAreaInsets();
  
  const notifications = [
    { id: 1, type: 'like', user: 'John Doe', message: 'liked your post', time: '2m ago' },
    { id: 2, type: 'comment', user: 'Jane Smith', message: 'commented on your post', time: '5m ago' },
    { id: 3, type: 'follow', user: 'Mike Johnson', message: 'started following you', time: '1h ago' },
  ];

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.popupOverlay} onPress={onClose}>
        <Animated.View 
          entering={SlideInRight.duration(300)} 
          exiting={SlideOutRight.duration(200)}
          style={[styles.notificationsPopup, { paddingBottom: bottom + 20 }]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>Notifications</Text>
              <Pressable onPress={onClose} style={styles.closePopupButton}>
                <Ionicons name="close" size={24} color={theme.colors.textMuted} />
              </Pressable>
            </View>
            
            {notifications.map((notif) => (
              <Animated.View 
                key={notif.id} 
                entering={FadeInRight.delay(notif.id * 100)}
                style={styles.notificationItem}
              >
                <View style={[styles.notificationIcon, { 
                  backgroundColor: notif.type === 'like' ? theme.colors.roseLight : theme.colors.primaryLight 
                }]}>
                  <Ionicons 
                    name={notif.type === 'like' ? 'heart' : notif.type === 'comment' ? 'chatbubble' : 'person-add'} 
                    size={18} 
                    color={notif.type === 'like' ? theme.colors.rose : theme.colors.primary} 
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationText}>
                    <Text style={styles.notificationUser}>{notif.user}</Text>
                    {' '}{notif.message}
                  </Text>
                  <Text style={styles.notificationTime}>{notif.time}</Text>
                </View>
              </Animated.View>
            ))}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

// Profile Popup  
const ProfilePopup = ({ visible, onClose, user }) => {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();

  const handleLogout = async () => {
    await authService.logout();
    onClose();
    router.replace('/');
  };

  const handleNavigate = (route) => {
    onClose();
    router.push(route);
  };

  if (!visible) return null;

  const menuItems = [
    { icon: 'person-outline', label: 'View Profile', route: '/(tabs)/profile' },
    { icon: 'bookmark-outline', label: 'Saved Posts', route: '/(tabs)/saved' },
    { icon: 'settings-outline', label: 'Settings', route: null },
    { icon: 'help-circle-outline', label: 'Help & Support', route: null },
  ];

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.popupOverlay} onPress={onClose}>
        <Animated.View 
          entering={SlideInRight.duration(300)} 
          style={[styles.profilePopup, { paddingBottom: bottom + 20 }]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>Profile</Text>
              <Pressable onPress={onClose} style={styles.closePopupButton}>
                <Ionicons name="close" size={24} color={theme.colors.textMuted} />
              </Pressable>
            </View>
            
            <View style={styles.profileInfo}>
              {user?.image ? (
                <Image source={{ uri: user.image }} style={styles.profilePopupImage} />
              ) : (
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryDark]}
                  style={styles.profilePopupPlaceholder}
                >
                  <Text style={styles.profilePopupPlaceholderText}>
                    {user?.name?.charAt(0)?.toUpperCase() || '?'}
                  </Text>
                </LinearGradient>
              )}
              <Text style={styles.profileName}>{user?.name || 'User'}</Text>
              <Text style={styles.profileEmail}>{user?.email || ''}</Text>
            </View>
            
            <View style={styles.menuItems}>
              {menuItems.map((item, index) => (
                <Animated.View key={item.label} entering={FadeInRight.delay(index * 50)}>
                  <Pressable 
                    style={styles.menuItem}
                    onPress={() => item.route ? handleNavigate(item.route) : null}
                  >
                    <Ionicons name={item.icon} size={22} color={theme.colors.textDark} />
                    <Text style={styles.menuItemText}>{item.label}</Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                  </Pressable>
                </Animated.View>
              ))}
            </View>
            
            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color={theme.colors.rose} />
              <Text style={styles.logoutText}>Log Out</Text>
            </Pressable>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const HomeContent = () => {
  const { top } = useSafeAreaInsets();
  const [showPostModal, setShowPostModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [user, setUser] = useState(null);

  // Load user from storage
  useEffect(() => {
    const loadUser = async () => {
      const userData = await authService.getUser();
      setUser(userData);
    };
    loadUser();
  }, []);

  const stories = [
    { id: '1', name: 'Sarah M.', image: null },
    { id: '2', name: 'David K.', image: null },
    { id: '3', name: 'Grace L.', image: null },
    { id: '4', name: 'Paul W.', image: null },
    { id: '5', name: 'Ruth A.', image: null },
  ];

  const handleCommentPress = (postId) => console.log('Open comments for post:', postId);
  const handleUserPress = (userId) => console.log('Open profile for user:', userId);
  const handleOptionsPress = (post) => console.log('Show options for post:', post.id);

  const ListHeader = () => (
    <>
      <WelcomeCard user={user} />
      <Animated.View entering={FadeInDown.delay(300).duration(500)}>
        <SectionHeader title="Stories" onSeeAll={() => {}} />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesContainer}
        >
          <StoryItem isAdd onPress={() => setShowPostModal(true)} />
          {stories.map((story, index) => (
            <Animated.View key={story.id} entering={FadeInRight.delay(100 * (index + 1))}>
              <StoryItem item={story} onPress={() => {}} />
            </Animated.View>
          ))}
        </ScrollView>
      </Animated.View>
      <SectionHeader title="Recent Posts" />
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      <Animated.View 
        entering={FadeIn.duration(500)} 
        style={[styles.header, { paddingTop: top + hp(0.5) }]}
      >
        <View style={styles.headerLeft}>
          <Image 
            source={require('../../assets/images/welcome2.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>Christ Praises</Text>
            <Text style={styles.headerSubtitle}>Share your faith ✨</Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <HeaderButton 
            icon="notifications-outline" 
            onPress={() => setShowNotifications(true)} 
            badge={3} 
          />
          <ProfileButton user={user} onPress={() => setShowProfile(true)} />
        </View>
      </Animated.View>

      <PostFeed
        onCommentPress={handleCommentPress}
        onUserPress={handleUserPress}
        onOptionsPress={handleOptionsPress}
        ListHeaderComponent={ListHeader}
      />

      <FloatingActionButton onPress={() => setShowPostModal(true)} />

      <QuickPostModal visible={showPostModal} onClose={() => setShowPostModal(false)} />
      <NotificationsPopup visible={showNotifications} onClose={() => setShowNotifications(false)} />
      <ProfilePopup visible={showProfile} onClose={() => setShowProfile(false)} user={user} />
    </View>
  );
};

const Home = () => (
  <PostProvider>
    <HomeContent />
  </PostProvider>
);

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingBottom: hp(1),
    backgroundColor: theme.colors.card,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.grayLight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 42,
    height: 42,
    marginRight: wp(2),
  },
  titleContainer: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.primary,
  },
  headerSubtitle: {
    fontSize: hp(1.3),
    color: theme.colors.textMuted,
    marginTop: -2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  headerButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.backgroundSecondary,
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: theme.colors.rose,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: theme.fonts.bold,
  },
  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePlaceholderText: {
    color: 'white',
    fontSize: hp(1.8),
    fontWeight: theme.fonts.bold,
  },
  // Welcome Card
  welcomeCard: {
    marginHorizontal: wp(4),
    marginTop: hp(1.5),
    marginBottom: hp(2),
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    ...theme.shadow.md,
  },
  welcomeGradient: {
    padding: theme.spacing.lg,
  },
  welcomeContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeGreeting: {
    fontSize: hp(1.6),
    color: 'rgba(255,255,255,0.8)',
  },
  welcomeName: {
    fontSize: hp(2.8),
    fontWeight: theme.fonts.bold,
    color: 'white',
    marginBottom: hp(0.5),
  },
  welcomeQuote: {
    fontSize: hp(1.4),
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
    marginTop: hp(1),
  },
  welcomeIconContainer: {
    justifyContent: 'center',
  },
  quickActionsRow: {
    flexDirection: 'row',
    marginTop: hp(2),
    paddingTop: hp(1.5),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  quickActionText: {
    color: 'white',
    fontSize: hp(1.4),
    fontWeight: theme.fonts.medium,
  },
  quickActionDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  // Stories
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    marginBottom: hp(1),
  },
  sectionTitle: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.bold,
    color: theme.colors.textDark,
  },
  seeAllText: {
    fontSize: hp(1.5),
    color: theme.colors.primary,
    fontWeight: theme.fonts.medium,
  },
  storiesContainer: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(2),
    gap: wp(3),
  },
  storyItem: {
    alignItems: 'center',
    width: 70,
  },
  addStoryCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  storyRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 3,
    marginBottom: 6,
  },
  storyImageContainer: {
    flex: 1,
    borderRadius: 31,
    overflow: 'hidden',
    backgroundColor: theme.colors.card,
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  storyPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.grayMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyPlaceholderText: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: 'white',
  },
  storyName: {
    fontSize: hp(1.3),
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: hp(3),
    right: wp(5),
    ...theme.shadow.lg,
  },
  fabGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Popups
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  notificationsPopup: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    maxHeight: hp(60),
  },
  profilePopup: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  popupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.grayLight,
  },
  popupTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.textDark,
  },
  closePopupButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.grayLight,
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: hp(1.6),
    color: theme.colors.text,
  },
  notificationUser: {
    fontWeight: theme.fonts.semibold,
    color: theme.colors.textDark,
  },
  notificationTime: {
    fontSize: hp(1.3),
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  profileInfo: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  profilePopupImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: theme.spacing.sm,
  },
  profilePopupPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  profilePopupPlaceholderText: {
    color: 'white',
    fontSize: hp(3),
    fontWeight: theme.fonts.bold,
  },
  profileName: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.textDark,
  },
  profileEmail: {
    fontSize: hp(1.5),
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  menuItems: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.grayLight,
    paddingTop: theme.spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.grayLight,
  },
  menuItemText: {
    flex: 1,
    fontSize: hp(1.7),
    color: theme.colors.textDark,
    marginLeft: theme.spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.roseLight,
    borderRadius: theme.radius.lg,
  },
  logoutText: {
    fontSize: hp(1.7),
    color: theme.colors.rose,
    fontWeight: theme.fonts.semibold,
    marginLeft: theme.spacing.sm,
  },
});

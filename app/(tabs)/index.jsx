import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import Header from '../../components/Header';
import AnimatedCard from '../../components/AnimatedCard';
import { SkeletonCard, SkeletonListItem } from '../../components/SkeletonLoader';
import Icon from '../../assets/icons';
import InteractiveLogo from '../../components/InteractiveLogo';
import PopupMenu from '../../components/PopupMenu';
import QuickPostModal from '../../components/QuickPostModal';
import FloatingActionButton from '../../components/FloatingActionButton';

const Home = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(3);
  
  // Popup menu states
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [notificationMenuVisible, setNotificationMenuVisible] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState({ x: 0, y: 0 });
  const [notificationAnchor, setNotificationAnchor] = useState({ x: 0, y: 0 });
  
  // Quick post modal
  const [quickPostVisible, setQuickPostVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setLoading(true);
    setTimeout(() => {
      setRefreshing(false);
      setLoading(false);
    }, 1500);
  }, []);

  const handleProfilePress = (event) => {
    // Get position for popup anchoring
    setProfileAnchor({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY });
    setProfileMenuVisible(true);
  };

  const handleNotificationPress = (event) => {
    setNotificationAnchor({ x: event.nativeEvent.pageX, y: event.nativeEvent.pageY });
    setNotificationMenuVisible(true);
  };

  const handleQuickPost = () => {
    setQuickPostVisible(true);
  };

  const handlePostSubmit = async (content) => {
    // Handle post submission
    console.log('New post:', content);
    // In a real app, you'd send this to your backend
  };

  // Profile menu items
  const profileMenuItems = [
    { id: '1', title: 'View Profile', icon: 'user', onPress: () => router.push('/profile') },
    { id: '2', title: 'Edit Profile', icon: 'edit', onPress: () => {} },
    { id: '3', title: 'Settings', icon: 'lock', onPress: () => {} },
    { id: '4', title: 'Logout', icon: 'logout', danger: true, onPress: () => router.replace('/welcome') },
  ];

  // Mock notifications
  const notifications = [
    { id: '1', title: 'John liked your post', time: '2 min ago', read: false, onPress: () => {} },
    { id: '2', title: 'Sarah sent you a message', time: '15 min ago', read: false, onPress: () => {} },
    { id: '3', title: 'New community event tomorrow', time: '1 hour ago', read: true, onPress: () => {} },
  ];

  const featuredContent = [
    {
      id: '1',
      title: 'Daily Devotional',
      subtitle: 'Start your day with inspiration',
      icon: 'heart',
    },
    {
      id: '2',
      title: 'Prayer Requests',
      subtitle: 'Share and support others',
      icon: 'send',
    },
    {
      id: '3',
      title: 'Praise Reports',
      subtitle: 'Celebrate answered prayers',
      icon: 'comment',
    },
  ];

  const quickActions = [
    { id: '1', label: 'Friends', icon: 'user', route: '/friends' },
    { id: '2', label: 'Search', icon: 'search', route: '/search' },
    { id: '3', label: 'Camera', icon: 'camera', route: '/camera' },
    { id: '4', label: 'Share', icon: 'share', route: '/share' },
  ];

  const renderSkeletons = () => (
    <View style={styles.skeletonContainer}>
      <SkeletonCard style={{ marginBottom: theme.spacing.md }} />
      <SkeletonCard style={{ marginBottom: theme.spacing.md }} />
      <SkeletonListItem style={{ marginBottom: theme.spacing.sm }} />
      <SkeletonListItem style={{ marginBottom: theme.spacing.sm }} />
    </View>
  );

  const renderQuickActions = () => (
    <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsRow}>
        {quickActions.map((action, index) => (
          <Animated.View
            key={action.id}
            entering={FadeInRight.delay(300 + index * 100).duration(400)}
          >
            <Pressable
              style={styles.quickAction}
              onPress={() => router.push(action.route)}
            >
              <View style={styles.quickActionIcon}>
                <Icon name={action.icon} size={22} color={theme.colors.primary} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );

  const renderFeaturedContent = () => (
    <View style={styles.featuredContainer}>
      <Text style={styles.sectionTitle}>Featured</Text>
      {featuredContent.map((item, index) => (
        <AnimatedCard
          key={item.id}
          delay={400 + index * 100}
          style={styles.featuredCard}
          onPress={() => {}}
        >
          <View style={styles.featuredCardContent}>
            <View style={styles.featuredIconContainer}>
              <Icon name={item.icon} size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.featuredTextContainer}>
              <Text style={styles.featuredTitle}>{item.title}</Text>
              <Text style={styles.featuredSubtitle}>{item.subtitle}</Text>
            </View>
            <Icon name="arrowLeft" size={20} color={theme.colors.grayMedium} style={{ transform: [{ rotate: '180deg' }] }} />
          </View>
        </AnimatedCard>
      ))}
    </View>
  );

  const renderWelcomeBanner = () => (
    <AnimatedCard delay={100} style={styles.welcomeBanner}>
      <View style={styles.welcomeContent}>
        <View style={styles.logoContainer}>
          <InteractiveLogo 
            mode="home"
            size={hp(12)}
            motionIntensity={0.7}
          />
        </View>
        <View style={styles.welcomeText}>
          <Text style={styles.welcomeTitle}>Welcome to Christ Praises</Text>
          <Text style={styles.welcomeSubtitle}>
            Connect, share, and grow in faith together
          </Text>
        </View>
      </View>
    </AnimatedCard>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Soft gradient background for better status bar visibility */}
      <LinearGradient
        colors={['#f8f5f2', '#faf8f6', theme.colors.background]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.3 }}
      />
      
      <Header
        title="Christ Praises"
        notificationCount={notificationCount}
        profileName="User"
        onProfilePress={handleProfilePress}
        onNotificationPress={handleNotificationPress}
        backgroundColor="transparent"
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {loading ? (
          renderSkeletons()
        ) : (
          <>
            {renderWelcomeBanner()}
            {renderQuickActions()}
            {renderFeaturedContent()}
            <View style={styles.bottomSpacer} />
          </>
        )}
      </ScrollView>

      {/* Floating Action Button for Quick Post */}
      <FloatingActionButton
        onPress={handleQuickPost}
        icon="plus"
        style={styles.fab}
      />

      {/* Profile Popup Menu */}
      <PopupMenu
        visible={profileMenuVisible}
        onClose={() => setProfileMenuVisible(false)}
        anchorPosition={profileAnchor}
        items={profileMenuItems}
        type="profile"
        title="Account"
      />

      {/* Notifications Popup Menu */}
      <PopupMenu
        visible={notificationMenuVisible}
        onClose={() => {
          setNotificationMenuVisible(false);
          setNotificationCount(0);
        }}
        anchorPosition={notificationAnchor}
        type="notifications"
        notifications={notifications}
      />

      {/* Quick Post Modal */}
      <QuickPostModal
        visible={quickPostVisible}
        onClose={() => setQuickPostVisible(false)}
        onSubmit={handlePostSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xxl + 80, // Extra space for FAB
  },
  skeletonContainer: {
    marginTop: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.md,
  },
  welcomeBanner: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    padding: 0,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.backgroundSecondary,
  },
  welcomeContent: {
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: theme.spacing.sm,
  },
  welcomeText: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.bold,
    color: theme.colors.textDark,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: hp(1.6),
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  quickActionsContainer: {
    marginTop: theme.spacing.lg,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    width: wp(20),
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
    ...theme.shadow.sm,
  },
  quickActionLabel: {
    fontSize: hp(1.5),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  featuredContainer: {
    marginTop: theme.spacing.lg,
  },
  featuredCard: {
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
  },
  featuredCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  featuredTextContainer: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.textDark,
  },
  featuredSubtitle: {
    fontSize: hp(1.5),
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  bottomSpacer: {
    height: theme.spacing.xl,
  },
  fab: {
    bottom: 100, // Above the tab bar
    right: theme.spacing.md,
  },
});

export default Home;

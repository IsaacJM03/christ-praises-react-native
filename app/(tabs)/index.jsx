import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
  Image,
  Pressable,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import Header from '../../components/Header';
import AnimatedCard from '../../components/AnimatedCard';
import { SkeletonCard, SkeletonListItem } from '../../components/SkeletonLoader';
import Icon from '../../assets/icons';

const Home = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(3);

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

  const handleProfilePress = () => {
    router.push('/profile');
  };

  const handleNotificationPress = () => {
    setNotificationCount(0);
  };

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
        <Image
          source={require('../../assets/images/welcome2.png')}
          style={styles.welcomeImage}
          resizeMode="contain"
        />
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
      <Header
        title="Christ Praises"
        notificationCount={notificationCount}
        profileName="User"
        onProfilePress={handleProfilePress}
        onNotificationPress={handleNotificationPress}
        backgroundColor={theme.colors.background}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
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
    backgroundColor: theme.colors.primaryLight,
    padding: 0,
    overflow: 'hidden',
  },
  welcomeContent: {
    padding: theme.spacing.md,
  },
  welcomeImage: {
    width: '100%',
    height: hp(15),
    marginBottom: theme.spacing.sm,
  },
  welcomeText: {
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: hp(2.4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.textDark,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: hp(1.7),
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
});

export default Home;

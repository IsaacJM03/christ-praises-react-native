import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeInRight,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';
import { hp } from '../../helpers/common';
import Header from '../../components/Header';
import Avatar from '../../components/Avatar';
import { SkeletonListItem } from '../../components/SkeletonLoader';
import Icon from '../../assets/icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const mockFriends = [
  { id: '1', name: 'John Smith', status: 'online', lastSeen: 'Active now' },
  { id: '2', name: 'Sarah Johnson', status: 'online', lastSeen: 'Active now' },
  { id: '3', name: 'Michael Brown', status: 'offline', lastSeen: '2 hours ago' },
  { id: '4', name: 'Emily Davis', status: 'offline', lastSeen: '1 day ago' },
  { id: '5', name: 'David Wilson', status: 'online', lastSeen: 'Active now' },
  { id: '6', name: 'Jessica Taylor', status: 'offline', lastSeen: '3 hours ago' },
  { id: '7', name: 'Daniel Anderson', status: 'offline', lastSeen: '5 days ago' },
  { id: '8', name: 'Ashley Thomas', status: 'online', lastSeen: 'Active now' },
];

// Animated friend item with press interaction
const FriendItem = ({ item, index, onPress }) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <AnimatedPressable
      entering={FadeInRight.delay(index * 50).duration(300)}
      layout={Layout.springify()}
      style={[styles.friendItem, animatedStyle]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={styles.friendAvatarContainer}>
        <Avatar name={item.name} size={50} />
        {item.status === 'online' && <View style={styles.onlineBadge} />}
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <View style={styles.statusRow}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: item.status === 'online' ? theme.colors.success : theme.colors.grayMedium }
          ]} />
          <Text style={styles.friendStatus}>{item.lastSeen}</Text>
        </View>
      </View>
      <View style={styles.friendActions}>
        <Pressable style={styles.actionButton}>
          <Icon name="send" size={20} color={theme.colors.primary} />
        </Pressable>
      </View>
    </AnimatedPressable>
  );
};

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFriends(mockFriends);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineFriends = filteredFriends.filter(f => f.status === 'online');
  const offlineFriends = filteredFriends.filter(f => f.status === 'offline');

  const renderEmptyState = () => (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Icon name="user" size={48} color={theme.colors.grayMedium} />
      </View>
      <Text style={styles.emptyTitle}>No friends found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery
          ? 'Try a different search term'
          : 'Start connecting with others in the community'}
      </Text>
    </Animated.View>
  );

  const renderSectionHeader = (title, count) => (
    <Animated.View entering={FadeInDown.delay(100)} style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{count}</Text>
      </View>
    </Animated.View>
  );

  const renderSkeletons = () => (
    <View style={styles.skeletonContainer}>
      {[...Array(6)].map((_, i) => (
        <SkeletonListItem key={i} style={{ marginBottom: theme.spacing.sm }} />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Soft gradient background */}
      <LinearGradient
        colors={['#f8f5f2', '#faf8f6', theme.colors.background]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0.2 }}
      />
      
      <Header
        title="Friends"
        showProfile={false}
        showNotifications={false}
        backgroundColor="transparent"
      />

      <Animated.View entering={FadeInDown.delay(100)} style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icon name="search" size={20} color={theme.colors.grayMedium} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search friends..."
            placeholderTextColor={theme.colors.grayMedium}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Icon name="delete" size={18} color={theme.colors.grayMedium} />
            </Pressable>
          )}
        </View>
      </Animated.View>

      {loading ? (
        renderSkeletons()
      ) : filteredFriends.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={[
            { type: 'header', title: 'Online', count: onlineFriends.length },
            ...onlineFriends.map(f => ({ type: 'friend', data: f })),
            { type: 'header', title: 'Offline', count: offlineFriends.length },
            ...offlineFriends.map(f => ({ type: 'friend', data: f })),
          ]}
          keyExtractor={(item, index) => item.type === 'header' ? `header-${item.title}` : item.data.id}
          renderItem={({ item, index }) => {
            if (item.type === 'header') {
              return renderSectionHeader(item.title, item.count);
            }
            return <FriendItem item={item.data} index={index} onPress={() => {}} />;
          }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  searchContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    height: hp(5.5),
    gap: theme.spacing.sm,
    ...theme.shadow.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: hp(1.8),
    color: theme.colors.text,
  },
  skeletonContainer: {
    padding: theme.spacing.md,
  },
  listContent: {
    padding: theme.spacing.md,
    paddingTop: theme.spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  sectionTitle: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  countBadge: {
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundSecondary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  countText: {
    fontSize: hp(1.3),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textMuted,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadow.sm,
  },
  friendAvatarContainer: {
    position: 'relative',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.success,
    borderWidth: 2,
    borderColor: theme.colors.card,
  },
  friendInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  friendName: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.textDark,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: theme.spacing.xs,
  },
  friendStatus: {
    fontSize: hp(1.5),
    color: theme.colors.textMuted,
  },
  friendActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: hp(10),
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.textDark,
    marginBottom: theme.spacing.xs,
  },
  emptySubtitle: {
    fontSize: hp(1.6),
    color: theme.colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
});

export default Friends;

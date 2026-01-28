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
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
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

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const timer = global.setTimeout(() => {
      setFriends(mockFriends);
      setLoading(false);
    }, 1000);
    return () => global.clearTimeout(timer);
  }, []);

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const renderFriendItem = ({ item, index }) => (
    <AnimatedPressable
      entering={FadeInRight.delay(index * 50).duration(300)}
      layout={Layout.springify()}
      style={styles.friendItem}
      onPress={() => {}}
    >
      <View style={styles.friendAvatarContainer}>
        <Avatar name={item.name} size={50} />
        {item.status === 'online' && <View style={styles.onlineBadge} />}
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendStatus}>{item.lastSeen}</Text>
      </View>
      <View style={styles.friendActions}>
        <Pressable style={styles.actionButton}>
          <Icon name="send" size={20} color={theme.colors.primary} />
        </Pressable>
      </View>
    </AnimatedPressable>
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
      <Header
        title="Friends"
        showProfile={false}
        showNotifications={false}
        backgroundColor={theme.colors.background}
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
      ) : (
        <FlatList
          data={filteredFriends}
          keyExtractor={(item) => item.id}
          renderItem={renderFriendItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
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
  searchContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    height: hp(5.5),
    gap: theme.spacing.sm,
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
  friendStatus: {
    fontSize: hp(1.5),
    color: theme.colors.textMuted,
    marginTop: 2,
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

import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  Keyboard,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import Avatar from '../../components/Avatar';
import AnimatedCard from '../../components/AnimatedCard';
import { SkeletonListItem } from '../../components/SkeletonLoader';
import Icon from '../../assets/icons';

const mockResults = {
  users: [
    { id: '1', name: 'John Smith', type: 'user' },
    { id: '2', name: 'Sarah Johnson', type: 'user' },
    { id: '3', name: 'Michael Brown', type: 'user' },
  ],
  content: [
    { id: '1', title: 'Morning Prayer Guide', type: 'content', category: 'Prayer' },
    { id: '2', title: 'Daily Devotional Series', type: 'content', category: 'Devotional' },
    { id: '3', title: 'Praise & Worship Songs', type: 'content', category: 'Music' },
  ],
};

const recentSearches = [
  'Morning prayers',
  'Worship music',
  'Bible study',
  'Community events',
];

const trendingTopics = [
  { id: '1', tag: '#prayer', count: '2.4k posts' },
  { id: '2', tag: '#faith', count: '1.8k posts' },
  { id: '3', tag: '#gratitude', count: '950 posts' },
  { id: '4', tag: '#testimony', count: '620 posts' },
];

const Search = () => {
  const inputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const searchBarWidth = useSharedValue(wp(100) - theme.spacing.md * 2);

  useEffect(() => {
    if (searchQuery.length > 0) {
      setLoading(true);
      const timer = setTimeout(() => {
        setResults(mockResults);
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setResults(null);
    }
  }, [searchQuery]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleCancel = () => {
    setSearchQuery('');
    setIsFocused(false);
    Keyboard.dismiss();
  };

  const handleRecentSearch = (term) => {
    setSearchQuery(term);
    inputRef.current?.focus();
  };

  const searchBarStyle = useAnimatedStyle(() => ({
    width: searchBarWidth.value,
  }));

  const renderTrendingTopics = () => (
    <Animated.View entering={FadeInDown.delay(200)} style={styles.trendingContainer}>
      <Text style={styles.sectionTitle}>Trending Topics</Text>
      <View style={styles.trendingTags}>
        {trendingTopics.map((topic, index) => (
          <Animated.View key={topic.id} entering={FadeInDown.delay(250 + index * 50)}>
            <Pressable style={styles.trendingTag}>
              <Text style={styles.tagText}>{topic.tag}</Text>
              <Text style={styles.tagCount}>{topic.count}</Text>
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );

  const renderRecentSearches = () => (
    <Animated.View entering={FadeInDown.delay(100)} style={styles.recentContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Searches</Text>
        <Pressable>
          <Text style={styles.clearText}>Clear All</Text>
        </Pressable>
      </View>
      {recentSearches.map((term, index) => (
        <Animated.View key={term} entering={FadeInDown.delay(150 + index * 50)}>
          <Pressable
            style={styles.recentItem}
            onPress={() => handleRecentSearch(term)}
          >
            <View style={styles.recentIconContainer}>
              <Icon name="search" size={16} color={theme.colors.grayMedium} />
            </View>
            <Text style={styles.recentText}>{term}</Text>
            <Icon name="arrowLeft" size={16} color={theme.colors.grayMedium} style={{ transform: [{ rotate: '135deg' }] }} />
          </Pressable>
        </Animated.View>
      ))}
    </Animated.View>
  );

  const renderResults = () => (
    <View style={styles.resultsContainer}>
      {results?.users?.length > 0 && (
        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>People</Text>
          {results.users.map((user, index) => (
            <AnimatedCard
              key={user.id}
              delay={index * 50}
              style={styles.userResult}
              onPress={() => {}}
            >
              <Avatar name={user.name} size={44} />
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userHandle}>@{user.name.toLowerCase().replace(' ', '')}</Text>
              </View>
              <Pressable style={styles.followButton}>
                <Text style={styles.followText}>Follow</Text>
              </Pressable>
            </AnimatedCard>
          ))}
        </View>
      )}

      {results?.content?.length > 0 && (
        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>Content</Text>
          {results.content.map((item, index) => (
            <AnimatedCard
              key={item.id}
              delay={100 + index * 50}
              style={styles.contentResult}
              onPress={() => {}}
            >
              <View style={styles.contentIcon}>
                <Icon name="heart" size={20} color={theme.colors.primary} />
              </View>
              <View style={styles.contentInfo}>
                <Text style={styles.contentTitle}>{item.title}</Text>
                <Text style={styles.contentCategory}>{item.category}</Text>
              </View>
            </AnimatedCard>
          ))}
        </View>
      )}
    </View>
  );

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      {[...Array(4)].map((_, i) => (
        <SkeletonListItem key={i} style={{ marginBottom: theme.spacing.sm }} />
      ))}
    </View>
  );

  const renderEmptyResults = () => (
    <Animated.View entering={FadeInUp} style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Icon name="search" size={48} color={theme.colors.grayMedium} />
      </View>
      <Text style={styles.emptyTitle}>No results found</Text>
      <Text style={styles.emptySubtitle}>
        Try a different search term or browse categories
      </Text>
    </Animated.View>
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

      <Animated.View entering={FadeInDown} style={styles.searchHeader}>
        <Animated.View style={[styles.searchInputContainer, searchBarStyle]}>
          <Icon name="search" size={20} color={theme.colors.grayMedium} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search people, content..."
            placeholderTextColor={theme.colors.grayMedium}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleFocus}
            onBlur={handleBlur}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Icon name="delete" size={18} color={theme.colors.grayMedium} />
            </Pressable>
          )}
        </Animated.View>
        {isFocused && (
          <Animated.View entering={FadeInDown}>
            <Pressable onPress={handleCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </Animated.View>
        )}
      </Animated.View>

      {loading ? (
        renderLoading()
      ) : searchQuery.length > 0 ? (
        results?.users?.length > 0 || results?.content?.length > 0 ? (
          <FlatList
            data={[1]}
            keyExtractor={() => 'results'}
            renderItem={() => renderResults()}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          renderEmptyResults()
        )
      ) : (
        <FlatList
          data={[1]}
          keyExtractor={() => 'discover'}
          renderItem={() => (
            <>
              {renderRecentSearches()}
              {renderTrendingTopics()}
            </>
          )}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: hp(6),
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    height: hp(5.5),
    gap: theme.spacing.sm,
    flex: 1,
    ...theme.shadow.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: hp(1.8),
    color: theme.colors.text,
  },
  cancelButton: {
    paddingHorizontal: theme.spacing.sm,
  },
  cancelText: {
    color: theme.colors.primary,
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
  },
  recentContainer: {
    padding: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: hp(2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.textDark,
  },
  clearText: {
    color: theme.colors.primary,
    fontSize: hp(1.6),
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.backgroundSecondary,
  },
  recentIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentText: {
    flex: 1,
    fontSize: hp(1.8),
    color: theme.colors.text,
  },
  trendingContainer: {
    padding: theme.spacing.md,
    paddingTop: 0,
  },
  trendingTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  trendingTag: {
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    ...theme.shadow.sm,
  },
  tagText: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.primary,
  },
  tagCount: {
    fontSize: hp(1.3),
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  loadingContainer: {
    padding: theme.spacing.md,
  },
  resultsContainer: {
    padding: theme.spacing.md,
  },
  resultSection: {
    marginBottom: theme.spacing.lg,
  },
  userResult: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textDark,
  },
  userHandle: {
    fontSize: hp(1.4),
    color: theme.colors.textMuted,
  },
  followButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
  followText: {
    fontSize: hp(1.5),
    fontWeight: theme.fonts.semibold,
    color: 'white',
  },
  contentResult: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.md,
  },
  contentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentInfo: {
    flex: 1,
  },
  contentTitle: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textDark,
  },
  contentCategory: {
    fontSize: hp(1.5),
    color: theme.colors.textMuted,
    marginTop: 2,
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

export default Search;

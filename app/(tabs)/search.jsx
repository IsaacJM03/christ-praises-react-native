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
            <Icon name="search" size={18} color={theme.colors.grayMedium} />
            <Text style={styles.recentText}>{term}</Text>
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
              <Text style={styles.userName}>{user.name}</Text>
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
        renderRecentSearches()
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
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    height: hp(5.5),
    gap: theme.spacing.sm,
    flex: 1,
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
  recentText: {
    fontSize: hp(1.8),
    color: theme.colors.text,
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
  userName: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textDark,
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

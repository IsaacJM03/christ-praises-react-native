import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';

const SkeletonBox = ({ width, height, borderRadius = 4, style }) => {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1200 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.7, 0.3]),
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.grayLight,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

const PostSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SkeletonBox width={46} height={46} borderRadius={23} />
        <View style={styles.headerText}>
          <SkeletonBox width={120} height={14} borderRadius={7} />
          <SkeletonBox width={80} height={12} borderRadius={6} style={{ marginTop: 6 }} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <SkeletonBox width="100%" height={14} borderRadius={7} />
        <SkeletonBox width="90%" height={14} borderRadius={7} style={{ marginTop: 8 }} />
        <SkeletonBox width="75%" height={14} borderRadius={7} style={{ marginTop: 8 }} />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <SkeletonBox width={50} height={24} borderRadius={12} />
        <SkeletonBox width={50} height={24} borderRadius={12} />
        <SkeletonBox width={50} height={24} borderRadius={12} />
      </View>
    </View>
  );
};

export const PostSkeletonList = ({ count = 3 }) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <PostSkeleton key={index} />
    ))}
  </>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.xl,
    marginHorizontal: wp(4),
    marginVertical: hp(0.8),
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerText: {
    marginLeft: theme.spacing.sm,
  },
  content: {
    marginBottom: theme.spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.grayLight,
  },
});

export default PostSkeleton;

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';

const SkeletonLoader = ({
  width = '100%',
  height = 20,
  borderRadius = theme.radius.sm,
  style,
}) => {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmerValue.value, [0, 1], [-200, 200]);
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={[styles.container, { width, height, borderRadius }, style]}>
      <Animated.View style={[styles.shimmer, shimmerStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
};

export const SkeletonCard = ({ style }) => (
  <View style={[skeletonStyles.card, style]}>
    <View style={skeletonStyles.header}>
      <SkeletonLoader width={48} height={48} borderRadius={24} />
      <View style={skeletonStyles.headerText}>
        <SkeletonLoader width={120} height={14} />
        <SkeletonLoader width={80} height={12} style={{ marginTop: 6 }} />
      </View>
    </View>
    <SkeletonLoader height={12} style={{ marginTop: 16 }} />
    <SkeletonLoader width="80%" height={12} style={{ marginTop: 8 }} />
    <SkeletonLoader width="60%" height={12} style={{ marginTop: 8 }} />
  </View>
);

export const SkeletonListItem = ({ style }) => (
  <View style={[skeletonStyles.listItem, style]}>
    <SkeletonLoader width={44} height={44} borderRadius={22} />
    <View style={skeletonStyles.listItemContent}>
      <SkeletonLoader width={140} height={14} />
      <SkeletonLoader width={100} height={12} style={{ marginTop: 6 }} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.gray,
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    flex: 1,
    width: 200,
  },
});

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    ...theme.shadow.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
  },
  listItemContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
});

export default SkeletonLoader;

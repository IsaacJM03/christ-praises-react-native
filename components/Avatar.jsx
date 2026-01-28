import React from 'react';
import { StyleSheet, View, Image, Text, Pressable } from 'react-native';
import { theme } from '../constants/theme';

const Avatar = ({
  source,
  size = 40,
  name,
  style,
  onPress,
  showBadge = false,
  badgeCount = 0,
}) => {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const textSize = size * 0.4;

  const content = (
    <View style={[styles.container, containerStyle, style]}>
      {source ? (
        <Image source={source} style={[styles.image, containerStyle]} />
      ) : (
        <View style={[styles.placeholder, containerStyle]}>
          <Text style={[styles.initials, { fontSize: textSize }]}>{initials}</Text>
        </View>
      )}
      {showBadge && badgeCount > 0 && (
        <View style={[styles.badge, { right: -2, top: -2 }]}>
          <Text style={styles.badgeText}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.pressable}>
        {content}
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: theme.colors.textLight,
    fontWeight: theme.fonts.semibold,
  },
  badge: {
    position: 'absolute',
    backgroundColor: theme.colors.rose,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  badgeText: {
    color: theme.colors.textLight,
    fontSize: 10,
    fontWeight: theme.fonts.bold,
  },
});

export default Avatar;

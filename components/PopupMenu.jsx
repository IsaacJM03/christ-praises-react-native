import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { hp } from '../helpers/common';
import Icon from '../assets/icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Floating Popup Menu Component
 * 
 * Inspired by GitHub profile dropdown and YouTube notifications panel.
 * Features scale + fade + slight vertical motion animation.
 * 
 * Props:
 * - visible: boolean
 * - onClose: callback
 * - anchorPosition: { x, y } - position to anchor the popup
 * - items: array of { id, title, icon, onPress, danger? }
 * - type: 'profile' | 'notifications'
 * - title: optional header title
 */
const PopupMenu = ({
  visible,
  onClose,
  anchorPosition = { x: 0, y: 0 },
  items = [],
  type = 'profile',
  title,
  notifications = [],
}) => {
  const { top } = useSafeAreaInsets();
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const translateY = useSharedValue(-10);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 20, stiffness: 300 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
    } else {
      opacity.value = withTiming(0, { duration: 150 });
      scale.value = withTiming(0.9, { duration: 150 });
      translateY.value = withTiming(-10, { duration: 150 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
  }));

  const handleItemPress = (item) => {
    onClose();
    setTimeout(() => {
      item.onPress?.();
    }, 150);
  };

  // Calculate popup position
  const popupWidth = type === 'notifications' ? 300 : 220;
  const rightOffset = SCREEN_WIDTH - anchorPosition.x - 20;
  const topOffset = anchorPosition.y + top + 50;

  const renderProfileMenu = () => (
    <View style={[styles.menuContent, { width: popupWidth }]}>
      {title && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
      )}
      {items.map((item, index) => (
        <Pressable
          key={item.id}
          style={({ pressed }) => [
            styles.menuItem,
            pressed && styles.menuItemPressed,
            item.danger && styles.menuItemDanger,
            index === items.length - 1 && styles.menuItemLast,
          ]}
          onPress={() => handleItemPress(item)}
        >
          {item.icon && (
            <View style={[styles.menuIconContainer, item.danger && styles.menuIconDanger]}>
              <Icon
                name={item.icon}
                size={18}
                color={item.danger ? theme.colors.rose : theme.colors.primary}
              />
            </View>
          )}
          <Text style={[styles.menuItemText, item.danger && styles.menuItemTextDanger]}>
            {item.title}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  const renderNotificationsMenu = () => (
    <View style={[styles.menuContent, { width: popupWidth }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notifications.length > 0 && (
          <Pressable>
            <Text style={styles.markAllRead}>Mark all read</Text>
          </Pressable>
        )}
      </View>
      {notifications.length === 0 ? (
        <View style={styles.emptyNotifications}>
          <Icon name="heart" size={32} color={theme.colors.grayMedium} />
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        notifications.slice(0, 5).map((notification, index) => (
          <Pressable
            key={notification.id}
            style={({ pressed }) => [
              styles.notificationItem,
              pressed && styles.menuItemPressed,
              !notification.read && styles.notificationUnread,
            ]}
            onPress={() => handleItemPress(notification)}
          >
            <View style={styles.notificationDot}>
              {!notification.read && <View style={styles.unreadDot} />}
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle} numberOfLines={1}>
                {notification.title}
              </Text>
              <Text style={styles.notificationTime}>{notification.time}</Text>
            </View>
          </Pressable>
        ))
      )}
      {notifications.length > 5 && (
        <Pressable style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View all notifications</Text>
        </Pressable>
      )}
    </View>
  );

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.popup,
                animatedStyle,
                {
                  right: Math.max(16, Math.min(rightOffset, SCREEN_WIDTH - popupWidth - 16)),
                  top: topOffset,
                },
              ]}
            >
              {/* Arrow pointing to anchor */}
              <View style={[styles.arrow, { right: 20 }]} />
              
              {type === 'notifications' ? renderNotificationsMenu() : renderProfileMenu()}
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  popup: {
    position: 'absolute',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    ...theme.shadow.lg,
    overflow: 'visible',
  },
  arrow: {
    position: 'absolute',
    top: -8,
    width: 16,
    height: 16,
    backgroundColor: theme.colors.card,
    transform: [{ rotate: '45deg' }],
    ...theme.shadow.sm,
  },
  menuContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.backgroundSecondary,
  },
  headerTitle: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.textDark,
  },
  markAllRead: {
    fontSize: hp(1.4),
    color: theme.colors.primary,
    fontWeight: theme.fonts.medium,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.backgroundSecondary,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemPressed: {
    backgroundColor: theme.colors.backgroundSecondary,
  },
  menuItemDanger: {
    backgroundColor: theme.colors.errorLight,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  menuIconDanger: {
    backgroundColor: theme.colors.errorLight,
  },
  menuItemText: {
    fontSize: hp(1.7),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  menuItemTextDanger: {
    color: theme.colors.rose,
  },
  emptyNotifications: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  emptyText: {
    fontSize: hp(1.6),
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.backgroundSecondary,
  },
  notificationUnread: {
    backgroundColor: 'rgba(255, 108, 0, 0.05)',
  },
  notificationDot: {
    width: 8,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: hp(1.6),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  notificationTime: {
    fontSize: hp(1.3),
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  viewAllButton: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.backgroundSecondary,
  },
  viewAllText: {
    fontSize: hp(1.5),
    color: theme.colors.primary,
    fontWeight: theme.fonts.medium,
  },
});

export default PopupMenu;

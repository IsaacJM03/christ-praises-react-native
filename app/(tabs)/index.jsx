import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, Image, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, SlideInRight, FadeInRight } from 'react-native-reanimated';
import { theme } from '../../constants/theme';
import { hp, wp } from '../../helpers/common';
import { authService } from '../../lib/authService';
import { postService } from '../../lib/postService';
import PostFeed from '../../components/PostFeed';
import { PostProvider } from '../../contexts/PostContext';
import CreatePostModal from '../../components/CreatePostModal';

// Profile Popup Component
const ProfilePopup = ({ visible, onClose, user }) => {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();

  const handleLogout = async () => {
    await authService.logout();
    onClose();
    router.replace('/welcome');
  };

  const handleNavigate = (route) => {
    onClose();
    router.push(route);
  };

  if (!visible) return null;

  const avatarLetter = (user?.name || user?.email || 'U').charAt(0).toUpperCase();
  const displayName = user?.name && !user.name.includes('@') ? user.name : user?.email?.split('@')[0] || 'User';

  const menuItems = [
    { icon: 'person-outline', label: 'View Profile', route: '/(tabs)/profile' },
    { icon: 'bookmark-outline', label: 'Saved Posts', route: '/(tabs)/saved' },
    { icon: 'settings-outline', label: 'Settings', route: null },
  ];

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.popupOverlay} onPress={onClose}>
        <Animated.View entering={SlideInRight.duration(300)} style={[styles.profilePopup, { paddingBottom: bottom + 20 }]}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.popupHeader}>
              <Text style={styles.popupTitle}>Profile</Text>
              <Pressable onPress={onClose} style={styles.closePopupButton}>
                <Ionicons name="close" size={24} color={theme.colors.textMuted} />
              </Pressable>
            </View>
            
            <View style={styles.profileInfo}>
              <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.profilePopupPlaceholder}>
                <Text style={styles.profilePopupPlaceholderText}>{avatarLetter}</Text>
              </LinearGradient>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.profileEmail}>{user?.email || ''}</Text>
            </View>
            
            <View style={styles.menuItems}>
              {menuItems.map((item, index) => (
                <Animated.View key={item.label} entering={FadeInRight.delay(index * 50)}>
                  <Pressable style={styles.menuItem} onPress={() => item.route && handleNavigate(item.route)}>
                    <Ionicons name={item.icon} size={22} color={theme.colors.textDark} />
                    <Text style={styles.menuItemText}>{item.label}</Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
                  </Pressable>
                </Animated.View>
              ))}
            </View>
            
            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={22} color={theme.colors.rose} />
              <Text style={styles.logoutText}>Log Out</Text>
            </Pressable>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const HomeScreen = () => {
  const { top } = useSafeAreaInsets();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await authService.getUser();
    setUser(userData);
  };

  // Create post using postService directly instead of context
  const handleCreatePost = async (content, imageUrl) => {
    console.log('Creating post:', { content, imageUrl });
    const result = await postService.createPost(content, imageUrl);
    return result;
  };

  const avatarLetter = (user?.name || user?.email || 'U').charAt(0).toUpperCase();
  const displayName = user?.name && !user.name.includes('@') ? user.name : user?.email?.split('@')[0] || 'Friend';

  return (
    <PostProvider>
      <View style={styles.container}>
        <StatusBar style="dark" />
        
        {/* Header */}
        <Animated.View entering={FadeIn.duration(500)} style={[styles.header, { paddingTop: top + hp(0.5) }]}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{displayName}</Text>
          </View>
          
          <Pressable onPress={() => setShowProfile(true)} style={styles.profileButton}>
            <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.avatarGradient}>
              <Text style={styles.avatarText}>{avatarLetter}</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Feed */}
        <PostFeed 
          onUserPress={(userId) => console.log('User pressed:', userId)}
          ListHeaderComponent={null}
        />

        {/* Floating Action Button */}
        <Pressable style={styles.fab} onPress={() => setShowCreatePost(true)}>
          <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.fabGradient}>
            <Ionicons name="add" size={28} color="white" />
          </LinearGradient>
        </Pressable>

        {/* Create Post Modal */}
        <CreatePostModal
          visible={showCreatePost}
          onClose={() => setShowCreatePost(false)}
          onSubmit={handleCreatePost}
          user={user}
        />

        {/* Profile Popup */}
        <ProfilePopup visible={showProfile} onClose={() => setShowProfile(false)} user={user} />
      </View>
    </PostProvider>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wp(4), paddingBottom: hp(1), backgroundColor: theme.colors.card, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.grayLight },
  greeting: { fontSize: hp(1.6), color: theme.colors.textMuted },
  userName: { fontSize: hp(2.2), fontWeight: theme.fonts.bold, color: theme.colors.textDark },
  profileButton: { padding: 2 },
  avatarGradient: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'white', fontWeight: theme.fonts.bold, fontSize: 18 },
  fab: { position: 'absolute', bottom: hp(12), right: wp(4), zIndex: 100 },
  fabGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  // Profile popup styles
  popupOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  profilePopup: { backgroundColor: theme.colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: wp(4) },
  popupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  popupTitle: { fontSize: hp(2), fontWeight: theme.fonts.bold, color: theme.colors.textDark },
  closePopupButton: { padding: 4 },
  profileInfo: { alignItems: 'center', paddingVertical: theme.spacing.lg },
  profilePopupPlaceholder: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  profilePopupPlaceholderText: { color: 'white', fontSize: 32, fontWeight: theme.fonts.bold },
  profileName: { fontSize: hp(2), fontWeight: theme.fonts.bold, color: theme.colors.textDark, marginTop: theme.spacing.sm },
  profileEmail: { fontSize: hp(1.5), color: theme.colors.textMuted },
  menuItems: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.grayLight, paddingTop: theme.spacing.md },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.md, gap: theme.spacing.md },
  menuItemText: { flex: 1, fontSize: hp(1.7), color: theme.colors.textDark },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: theme.spacing.md, marginTop: theme.spacing.md, backgroundColor: theme.colors.roseLight, borderRadius: theme.radius.lg, gap: theme.spacing.sm },
  logoutText: { fontSize: hp(1.7), color: theme.colors.rose, fontWeight: theme.fonts.semibold },
});

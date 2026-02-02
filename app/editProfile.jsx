import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import { authService } from '../lib/authService';
import { uploadService } from '../lib/uploadService';
import { API_BASE_URL } from '../lib/config';

const EditProfileScreen = () => {
  const { top, bottom } = useSafeAreaInsets();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [image, setImage] = useState(null); // This stores the URL to send to server
  const [imageDisplay, setImageDisplay] = useState(null); // This is for display
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    // Get fresh data from server
    const result = await authService.getCurrentUser();
    const userData = result.success ? result.data : await authService.getUser();
    
    if (userData) {
      setUser(userData);
      setName(userData.name || '');
      setBio(userData.bio || '');
      setImage(userData.image || null);
      setImageDisplay(getImageUrl(userData.image));
    }
    setLoading(false);
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${url}`;
  };

  useEffect(() => {
    if (user) {
      const changed = 
        name !== (user.name || '') ||
        bio !== (user.bio || '') ||
        image !== (user.image || null);
      setHasChanges(changed);
    }
  }, [name, bio, image, user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    setUploadingImage(true);
    console.log('Uploading image:', uri);
    
    const result = await uploadService.uploadImage(uri, 'profile');
    console.log('Upload result:', result);
    
    if (result.success && result.data) {
      // Store the relative URL for the server
      setImage(result.data.url);
      // Store the full URL for display
      setImageDisplay(getImageUrl(result.data.url));
    } else {
      Alert.alert('Upload Failed', result.message || 'Could not upload image');
    }
    
    setUploadingImage(false);
  };

  const showImageOptions = () => {
    Alert.alert(
      'Change Profile Picture',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        ...(image ? [{ text: 'Remove Photo', onPress: () => { setImage(null); setImageDisplay(null); }, style: 'destructive' }] : []),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setSaving(true);
    
    try {
      console.log('Saving profile:', { name: name.trim(), bio: bio.trim(), image });
      const result = await authService.updateProfile({
        name: name.trim(),
        bio: bio.trim(),
        image: image,
      });

      console.log('Save result:', result);

      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', result.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Save error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const avatarLetter = (name || user?.email || 'U').charAt(0).toUpperCase();

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={[styles.header, { paddingTop: top + hp(1) }]}
      >
        <View style={styles.headerContent}>
          <Pressable style={styles.headerButton} onPress={handleDiscard}>
            <Ionicons name="close" size={24} color="white" />
          </Pressable>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <Pressable 
            style={[styles.saveButton, (!hasChanges || saving) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={[styles.saveButtonText, !hasChanges && styles.saveButtonTextDisabled]}>Save</Text>
            )}
          </Pressable>
        </View>

        <Animated.View entering={FadeIn.duration(500)} style={styles.avatarSection}>
          <Pressable onPress={showImageOptions} disabled={uploadingImage}>
            {uploadingImage ? (
              <View style={styles.avatarPlaceholder}>
                <ActivityIndicator size="large" color="white" />
              </View>
            ) : imageDisplay ? (
              <Image source={{ uri: imageDisplay }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{avatarLetter}</Text>
              </View>
            )}
            <View style={styles.editAvatarBadge}>
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </Pressable>
          <Pressable onPress={showImageOptions} disabled={uploadingImage}>
            <Text style={styles.changePhotoText}>
              {uploadingImage ? 'Uploading...' : 'Change Photo'}
            </Text>
          </Pressable>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.formContainer}
        contentContainerStyle={[styles.formContent, { paddingBottom: bottom + hp(4) }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={theme.colors.grayMedium} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your name"
                  placeholderTextColor={theme.colors.grayMedium}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio</Text>
              <View style={[styles.inputWrapper, styles.bioWrapper]}>
                <Ionicons name="create-outline" size={20} color={theme.colors.grayMedium} style={styles.bioIcon} />
                <TextInput
                  style={[styles.input, styles.bioInput]}
                  placeholder="Tell us about yourself..."
                  placeholderTextColor={theme.colors.grayMedium}
                  value={bio}
                  onChangeText={(text) => text.length <= 150 && setBio(text)}
                  multiline
                  numberOfLines={4}
                />
              </View>
              <Text style={styles.bioCounter}>{bio.length}/150</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.inputCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="mail-outline" size={20} color={theme.colors.grayMedium} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user?.email || 'Not set'}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} />
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { paddingBottom: hp(3) },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(4), marginBottom: hp(2) },
  headerButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: hp(2), fontWeight: theme.fonts.bold, color: 'white' },
  saveButton: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, borderRadius: theme.radius.lg, backgroundColor: 'rgba(255,255,255,0.25)', minWidth: 70, alignItems: 'center' },
  saveButtonDisabled: { backgroundColor: 'rgba(255,255,255,0.1)' },
  saveButtonText: { fontSize: hp(1.6), fontWeight: theme.fonts.semibold, color: 'white' },
  saveButtonTextDisabled: { opacity: 0.5 },
  avatarSection: { alignItems: 'center' },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  avatarText: { fontSize: hp(4), fontWeight: theme.fonts.bold, color: 'white' },
  editAvatarBadge: { position: 'absolute', bottom: 0, right: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: theme.colors.primaryDark, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'white' },
  changePhotoText: { marginTop: theme.spacing.sm, fontSize: hp(1.5), color: 'rgba(255,255,255,0.8)', fontWeight: theme.fonts.medium },
  formContainer: { flex: 1, marginTop: -hp(2), backgroundColor: theme.colors.background, borderTopLeftRadius: theme.radius.xxl, borderTopRightRadius: theme.radius.xxl },
  formContent: { padding: wp(4), paddingTop: hp(3) },
  sectionTitle: { fontSize: hp(1.6), fontWeight: theme.fonts.semibold, color: theme.colors.textMuted, marginBottom: theme.spacing.sm, marginLeft: theme.spacing.xs },
  inputCard: { backgroundColor: theme.colors.card, borderRadius: theme.radius.xl, padding: theme.spacing.md, marginBottom: theme.spacing.lg },
  inputGroup: { marginBottom: theme.spacing.md },
  inputLabel: { fontSize: hp(1.5), color: theme.colors.textMuted, marginBottom: theme.spacing.xs, marginLeft: 4 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.backgroundSecondary, borderRadius: theme.radius.lg, paddingHorizontal: theme.spacing.md, height: 50, gap: theme.spacing.sm },
  input: { flex: 1, fontSize: hp(1.6), color: theme.colors.textDark },
  bioWrapper: { alignItems: 'flex-start', height: 'auto', minHeight: 100, paddingVertical: theme.spacing.sm },
  bioIcon: { marginTop: 4 },
  bioInput: { minHeight: 80, textAlignVertical: 'top', paddingTop: 0 },
  bioCounter: { fontSize: hp(1.3), color: theme.colors.grayMedium, textAlign: 'right', marginTop: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.sm },
  infoIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.md },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: hp(1.4), color: theme.colors.textMuted },
  infoValue: { fontSize: hp(1.6), color: theme.colors.textDark, fontWeight: theme.fonts.medium, marginTop: 2 },
});

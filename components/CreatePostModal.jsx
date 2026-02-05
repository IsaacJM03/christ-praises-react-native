import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeIn } from 'react-native-reanimated';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import { uploadService } from '../lib/uploadService';

const CreatePostModal = ({ visible, onClose, onSubmit, user }) => {
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const maxLength = 500;
  const avatarLetter = (user?.name || user?.email || 'U').charAt(0).toUpperCase();
  const displayName = user?.name && !user.name.includes('@') ? user.name : user?.email?.split('@')[0] || 'User';

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow photo library access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      handleImageSelected(result.assets[0].uri);
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
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      handleImageSelected(result.assets[0].uri);
    }
  };

  const handleImageSelected = async (uri) => {
    setSelectedImage(uri);
    setUploading(true);

    const result = await uploadService.uploadImage(uri, 'post');
    console.log('Image upload result:', result);

    if (result.success && result.data) {
      setUploadedImageUrl(result.data.url);
      console.log('Uploaded image URL:', result.data.url);
    } else {
      Alert.alert('Upload Failed', result.message || 'Could not upload image');
      setSelectedImage(null);
    }

    setUploading(false);
  };

  const showImageOptions = () => {
    Alert.alert('Add Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Library', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setUploadedImageUrl(null);
  };

  const handleSubmit = async () => {
    if (!content.trim() && !uploadedImageUrl) {
      Alert.alert('Empty Post', 'Please add some text or an image.');
      return;
    }

    setSubmitting(true);
    console.log('Submitting post:', { content: content.trim(), imageUrl: uploadedImageUrl });
    
    const result = await onSubmit(content.trim(), uploadedImageUrl);
    
    setSubmitting(false);

    if (result?.success) {
      setContent('');
      setSelectedImage(null);
      setUploadedImageUrl(null);
      onClose();
    } else {
      Alert.alert('Error', result?.message || 'Failed to create post');
    }
  };

  const handleClose = () => {
    if (content.trim() || selectedImage) {
      Alert.alert('Discard Post?', 'You have unsaved changes.', [
        { text: 'Keep Editing', style: 'cancel' },
        { 
          text: 'Discard', 
          style: 'destructive', 
          onPress: () => {
            setContent('');
            setSelectedImage(null);
            setUploadedImageUrl(null);
            onClose();
          }
        },
      ]);
    } else {
      onClose();
    }
  };

  const canPost = (content.trim() || uploadedImageUrl) && !uploading && !submitting;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleClose} style={styles.headerButton}>
            <Ionicons name="close" size={28} color={theme.colors.textDark} />
          </Pressable>
          <Text style={styles.headerTitle}>Create Post</Text>
          <Pressable 
            onPress={handleSubmit} 
            disabled={!canPost}
            style={[styles.postButton, !canPost && styles.postButtonDisabled]}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.postButtonText}>Post</Text>
            )}
          </Pressable>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* User Info */}
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{avatarLetter}</Text>
              </View>
              <Text style={styles.userName}>{displayName}</Text>
            </View>

            {/* Text Input */}
            <TextInput
              style={styles.input}
              placeholder="What's on your mind?"
              placeholderTextColor={theme.colors.grayMedium}
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={maxLength}
              autoFocus
            />

            {/* Character Count */}
            <Text style={[styles.charCount, content.length > maxLength * 0.9 && styles.charCountWarning]}>
              {content.length}/{maxLength}
            </Text>

            {/* Selected Image Preview */}
            {selectedImage && (
              <Animated.View entering={FadeIn} style={styles.imagePreviewContainer}>
                <Image 
                  source={{ uri: selectedImage }} 
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                {uploading ? (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator size="large" color="white" />
                    <Text style={styles.uploadingText}>Uploading...</Text>
                  </View>
                ) : (
                  <Pressable style={styles.removeImageButton} onPress={removeImage}>
                    <Ionicons name="close-circle" size={30} color="white" />
                  </Pressable>
                )}
              </Animated.View>
            )}
          </ScrollView>

          {/* Bottom Actions */}
          <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 8 }]}>
            <Pressable 
              style={[styles.actionButton, (uploading || selectedImage) && styles.actionButtonDisabled]}
              onPress={showImageOptions}
              disabled={uploading || !!selectedImage}
            >
              <Ionicons 
                name="image-outline" 
                size={26} 
                color={selectedImage ? theme.colors.grayMedium : theme.colors.primary} 
              />
              <Text style={[styles.actionButtonText, selectedImage && styles.actionButtonTextDisabled]}>
                Photo {selectedImage ? '(1/1)' : ''}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wp(4), paddingVertical: theme.spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.grayLight },
  headerButton: { padding: 4 },
  headerTitle: { fontSize: hp(2), fontWeight: theme.fonts.bold, color: theme.colors.textDark },
  postButton: { backgroundColor: theme.colors.primary, paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.sm, borderRadius: theme.radius.full, minWidth: 70, alignItems: 'center' },
  postButtonDisabled: { backgroundColor: theme.colors.grayMedium },
  postButtonText: { color: 'white', fontWeight: theme.fonts.semibold, fontSize: hp(1.6) },
  content: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  userRow: { flexDirection: 'row', alignItems: 'center', padding: wp(4), gap: theme.spacing.sm },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'white', fontWeight: theme.fonts.bold, fontSize: 20 },
  userName: { fontSize: hp(1.8), fontWeight: theme.fonts.semibold, color: theme.colors.textDark },
  input: { paddingHorizontal: wp(4), fontSize: hp(2), color: theme.colors.textDark, minHeight: hp(12), textAlignVertical: 'top' },
  charCount: { paddingHorizontal: wp(4), fontSize: hp(1.4), color: theme.colors.grayMedium, textAlign: 'right', marginBottom: theme.spacing.sm },
  charCountWarning: { color: theme.colors.rose },
  // Image preview styles
  imagePreviewContainer: { 
    marginHorizontal: wp(4), 
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.lg, 
    overflow: 'hidden', 
    position: 'relative',
    backgroundColor: theme.colors.grayLight,
  },
  imagePreview: { 
    width: '100%', 
    height: 250, 
    borderRadius: theme.radius.lg,
  },
  uploadingOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.6)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: theme.radius.lg,
  },
  uploadingText: { color: 'white', marginTop: theme.spacing.sm, fontSize: hp(1.6), fontWeight: theme.fonts.medium },
  removeImageButton: { 
    position: 'absolute', 
    top: 10, 
    right: 10, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    borderRadius: 15,
    padding: 2,
  },
  // Bottom actions
  bottomActions: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: wp(4), 
    paddingTop: theme.spacing.sm, 
    borderTopWidth: StyleSheet.hairlineWidth, 
    borderTopColor: theme.colors.grayLight, 
    backgroundColor: theme.colors.card,
  },
  actionButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: theme.spacing.xs, 
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.lg,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: { color: theme.colors.primary, fontSize: hp(1.6), fontWeight: theme.fonts.medium },
  actionButtonTextDisabled: { color: theme.colors.grayMedium },
});

export default CreatePostModal;

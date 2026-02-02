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
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';
import { uploadService } from '../lib/uploadService';
import { API_BASE_URL } from '../lib/config';
import ImagePickerModal from './ImagePickerModal';

const CreatePostModal = ({ visible, onClose, onSubmit, user }) => {
  const insets = useSafeAreaInsets();
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const maxLength = 500;
  const avatarLetter = (user?.name || user?.email || 'U').charAt(0).toUpperCase();

  const handleImageSelected = async (assets) => {
    if (assets.length === 0) return;
    
    setUploading(true);
    const baseUrl = API_BASE_URL.replace('/api', '');
    
    for (const asset of assets) {
      if (images.length >= 4) break;
      
      const result = await uploadService.uploadImage(asset.uri, 'post');
      if (result.success) {
        setImages(prev => [...prev, {
          uri: `${baseUrl}${result.data.url}`,
          url: result.data.url,
        }]);
      }
    }
    
    setUploading(false);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      Alert.alert('Empty Post', 'Please add some text or an image to your post.');
      return;
    }

    setSubmitting(true);
    
    const imageUrl = images.length > 0 ? images[0].url : null;
    const result = await onSubmit(content.trim(), imageUrl);
    
    setSubmitting(false);

    if (result?.success) {
      setContent('');
      setImages([]);
      onClose();
    } else {
      Alert.alert('Error', result?.message || 'Failed to create post');
    }
  };

  const handleClose = () => {
    if (content.trim() || images.length > 0) {
      Alert.alert(
        'Discard Post?',
        'You have unsaved changes. Are you sure you want to discard?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => {
            setContent('');
            setImages([]);
            onClose();
          }},
        ]
      );
    } else {
      onClose();
    }
  };

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
            disabled={submitting || (!content.trim() && images.length === 0)}
            style={[
              styles.postButton,
              (!content.trim() && images.length === 0) && styles.postButtonDisabled
            ]}
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
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* User Info */}
            <View style={styles.userRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{avatarLetter}</Text>
              </View>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
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
            <Text style={[
              styles.charCount,
              content.length > maxLength * 0.9 && styles.charCountWarning
            ]}>
              {content.length}/{maxLength}
            </Text>

            {/* Selected Images */}
            {images.length > 0 && (
              <Animated.View entering={FadeIn} style={styles.imagesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {images.map((img, index) => (
                    <Animated.View 
                      key={index} 
                      entering={FadeInDown.delay(index * 100)}
                      style={styles.imageWrapper}
                    >
                      <Image source={{ uri: img.uri }} style={styles.selectedImage} />
                      <Pressable 
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <Ionicons name="close-circle" size={24} color="white" />
                      </Pressable>
                    </Animated.View>
                  ))}
                </ScrollView>
              </Animated.View>
            )}

            {/* Uploading Indicator */}
            {uploading && (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
                <Text style={styles.uploadingText}>Uploading image...</Text>
              </View>
            )}
          </ScrollView>

          {/* Bottom Actions */}
          <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 8 }]}>
            <Pressable 
              style={styles.actionButton}
              onPress={() => setShowImagePicker(true)}
              disabled={images.length >= 4 || uploading}
            >
              <Ionicons 
                name="image-outline" 
                size={24} 
                color={images.length >= 4 ? theme.colors.grayMedium : theme.colors.primary} 
              />
              <Text style={[
                styles.actionButtonText,
                images.length >= 4 && { color: theme.colors.grayMedium }
              ]}>
                Photo {images.length > 0 ? `(${images.length}/4)` : ''}
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>

        {/* Image Picker */}
        <ImagePickerModal
          visible={showImagePicker}
          onClose={() => setShowImagePicker(false)}
          onImageSelected={handleImageSelected}
          allowMultiple
          title="Add Photos"
        />
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
  userRow: { flexDirection: 'row', alignItems: 'center', padding: wp(4), gap: theme.spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'white', fontWeight: theme.fonts.bold, fontSize: 18 },
  userName: { fontSize: hp(1.8), fontWeight: theme.fonts.semibold, color: theme.colors.textDark },
  input: { paddingHorizontal: wp(4), fontSize: hp(2), color: theme.colors.textDark, minHeight: hp(15), textAlignVertical: 'top' },
  charCount: { paddingHorizontal: wp(4), fontSize: hp(1.4), color: theme.colors.grayMedium, textAlign: 'right' },
  charCountWarning: { color: theme.colors.rose },
  imagesContainer: { paddingHorizontal: wp(4), marginTop: theme.spacing.md },
  imageWrapper: { marginRight: theme.spacing.sm, position: 'relative' },
  selectedImage: { width: 120, height: 120, borderRadius: theme.radius.lg },
  removeImageButton: { position: 'absolute', top: -8, right: -8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12 },
  uploadingContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: theme.spacing.md, gap: theme.spacing.sm },
  uploadingText: { color: theme.colors.textMuted, fontSize: hp(1.5) },
  bottomActions: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: wp(4), paddingTop: theme.spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.grayLight },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, paddingVertical: theme.spacing.sm, paddingHorizontal: theme.spacing.md },
  actionButtonText: { color: theme.colors.primary, fontSize: hp(1.6), fontWeight: theme.fonts.medium },
});

export default CreatePostModal;

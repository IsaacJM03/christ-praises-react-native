import React from 'react';
import { StyleSheet, View, Text, Pressable, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/theme';
import { hp, wp } from '../helpers/common';

const ImagePickerModal = ({ 
  visible, 
  onClose, 
  onImageSelected,
  allowMultiple = false,
  title = 'Add Photo',
}) => {
  const insets = useSafeAreaInsets();

  const requestPermission = async (type) => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermission('camera');
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please allow camera access to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onImageSelected([result.assets[0]]);
      onClose();
    }
  };

  const handleChooseFromLibrary = async () => {
    const hasPermission = await requestPermission('library');
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please allow photo library access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: allowMultiple,
      allowsEditing: !allowMultiple,
      aspect: allowMultiple ? undefined : [1, 1],
      quality: 0.8,
      selectionLimit: allowMultiple ? 5 : 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      onImageSelected(result.assets);
      onClose();
    }
  };

  if (!visible) return null;

  const options = [
    { icon: 'camera', label: 'Take Photo', onPress: handleTakePhoto, color: theme.colors.primary },
    { icon: 'images', label: 'Choose from Library', onPress: handleChooseFromLibrary, color: theme.colors.primary },
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View 
          entering={SlideInDown.duration(300)}
          style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            <Text style={styles.title}>{title}</Text>

            <View style={styles.options}>
              {options.map((option, index) => (
                <Animated.View key={option.label} entering={FadeIn.delay(index * 50)}>
                  <Pressable 
                    style={({ pressed }) => [styles.optionItem, pressed && styles.optionItemPressed]}
                    onPress={option.onPress}
                  >
                    <View style={[styles.optionIcon, { backgroundColor: option.color + '15' }]}>
                      <Ionicons name={option.icon} size={24} color={option.color} />
                    </View>
                    <Text style={styles.optionLabel}>{option.label}</Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.grayMedium} />
                  </Pressable>
                </Animated.View>
              ))}
            </View>

            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: theme.colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  handleContainer: { alignItems: 'center', paddingVertical: 12 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: theme.colors.grayMedium, opacity: 0.3 },
  title: { fontSize: hp(2), fontWeight: theme.fonts.bold, color: theme.colors.textDark, textAlign: 'center', marginBottom: theme.spacing.md },
  options: { paddingHorizontal: theme.spacing.md },
  optionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: theme.spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.grayLight },
  optionItemPressed: { backgroundColor: theme.colors.backgroundSecondary },
  optionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.md },
  optionLabel: { flex: 1, fontSize: hp(1.7), fontWeight: theme.fonts.medium, color: theme.colors.textDark },
  cancelButton: { marginHorizontal: theme.spacing.md, marginTop: theme.spacing.md, paddingVertical: theme.spacing.md, backgroundColor: theme.colors.backgroundSecondary, borderRadius: theme.radius.lg, alignItems: 'center' },
  cancelText: { fontSize: hp(1.7), fontWeight: theme.fonts.semibold, color: theme.colors.textDark },
});

export default ImagePickerModal;

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './config';

const getAuthToken = async () => {
  return await AsyncStorage.getItem('authToken');
};

export const uploadService = {
  async uploadImage(uri, type = 'post') {
    try {
      const token = await getAuthToken();
      
      const filename = uri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const fileType = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';
      
      const formData = new FormData();
      formData.append('image', {
        uri: uri,
        name: filename,
        type: fileType,
      });
      formData.append('type', type);
      
      console.log('Uploading to:', `${API_BASE_URL}/upload/image`);
      console.log('Type:', type);
      
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      
      const data = await response.json();
      console.log('Upload response:', data);
      return data;
    } catch (error) {
      console.error('Upload image error:', error);
      return { success: false, message: 'Failed to upload image: ' + error.message };
    }
  },
};

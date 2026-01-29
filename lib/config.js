// API Configuration
// Update this URL to match your backend server

// For local development:
// - iOS Simulator: use 'localhost'
// - Android Emulator: use '10.0.2.2'
// - Physical device: use your computer's local IP address

const DEV_API_URL = 'http://localhost:3000/api';
const PROD_API_URL = 'https://your-production-api.com/api'; // Update when you deploy

export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

// Other config constants
export const CONFIG = {
  API_TIMEOUT: 10000, // 10 seconds
  MAX_RETRIES: 3,
};

export const theme = {
  colors: {
    primary: '#FF6C00',
    primaryDark: '#E55A00',
    primaryLight: '#FF8A3D',
    dark: '#1a1a2e',
    darkLight: '#16213e',
    gray: '#e3e3e3',
    grayMedium: '#9ca3af',
    grayDark: '#6b7280',

    text: '#494949',
    textLight: '#f5f5f5',
    textDark: '#1d1d1d',
    textMuted: '#6b7280',

    rose: '#ef4444',
    roseLight: '#f87171',

    background: '#ffffff',
    backgroundDark: '#0f0f23',
    backgroundSecondary: '#f8f9fa',

    card: '#ffffff',
    cardDark: '#1e1e3f',
    cardBorder: '#e5e7eb',

    success: '#10b981',
    successLight: '#d1fae5',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    error: '#ef4444',
    errorLight: '#fee2e2',

    gradient: {
      primary: ['#FF6C00', '#FF8A3D'],
      dark: ['#1a1a2e', '#16213e'],
      auth: ['#1a1a2e', '#0f0f23', '#16213e'],
    },

    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
  },
  fonts: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extraBold: '800',
  },
  radius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 22,
    xxl: 28,
    full: 9999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.2,
      shadowRadius: 15,
      elevation: 8,
    },
  },
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
};
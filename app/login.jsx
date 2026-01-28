import { Alert, Pressable, StyleSheet, Text, View, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState } from 'react'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { theme } from '../constants/theme'
import Icon from '../assets/icons/index'
import { StatusBar } from 'expo-status-bar'
import BackButton from '../components/BackButton'
import { useRouter } from 'expo-router'
import { hp, wp } from '../helpers/common'
import FloatingInput from '../components/FloatingInput'
import AnimatedButton from '../components/AnimatedButton'
import InteractiveLogo from '../components/InteractiveLogo'
import { authService } from '../lib/authService'

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [inputFocused, setInputFocused] = useState(false);
  
  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    const result = await authService.login(email.trim(), password);
    setLoading(false);
    
    if (result.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Login Failed', result.message);
    }
  }
  
  return (
    <View style={styles.container}>
      <StatusBar style='light' />
      <LinearGradient
        colors={theme.colors.gradient.auth}
        style={styles.gradient}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Animated.View entering={FadeInUp.delay(100)}>
            <BackButton router={router}/>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150)} style={styles.logoContainer}>
            <InteractiveLogo 
              mode="onboarding"
              size={hp(12)}
              motionIntensity={0.6}
              isFocused={inputFocused}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
            <Text style={styles.welcomeText}>Hey,</Text>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitleText}>Sign in to continue your journey</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300)} style={styles.form}>
            <FloatingInput 
              label="Email"
              icon={<Icon name='mail' size={22} strokeWidth={1.6} color={theme.colors.grayMedium} />}
              placeholder='Enter your email'
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
            <FloatingInput 
              label="Password"
              icon={<Icon name='lock' size={22} strokeWidth={1.6} color={theme.colors.grayMedium} />}
              placeholder='Enter your password'
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
            />
            
            <Pressable style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </Pressable>

            <AnimatedButton 
              title="Login"
              onPress={onSubmit}
              loading={loading}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400)} style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Pressable onPress={() => router.push('/signUp')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500)} style={styles.inspirationContainer}>
            <Text style={styles.inspirationText}>"Faith is taking the first step even when you don't see the whole staircase."</Text>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(6),
    paddingTop: hp(6),
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: hp(2),
    marginBottom: hp(1),
  },
  header: {
    marginTop: hp(2),
    marginBottom: hp(3),
  },
  welcomeText: {
    fontSize: hp(3.5),
    fontWeight: theme.fonts.bold,
    color: theme.colors.textLight,
  },
  subtitleText: {
    fontSize: hp(1.8),
    color: theme.colors.textLight,
    opacity: 0.7,
    marginTop: theme.spacing.sm,
  },
  form: {
    gap: theme.spacing.md,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -theme.spacing.xs,
  },
  forgotPasswordText: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
    color: theme.colors.primaryLight,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xl,
  },
  footerText: {
    fontSize: hp(1.7),
    color: theme.colors.textLight,
    opacity: 0.8,
  },
  footerLink: {
    fontSize: hp(1.7),
    color: theme.colors.primaryLight,
    fontWeight: theme.fonts.semibold,
  },
  inspirationContainer: {
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  inspirationText: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    opacity: 0.5,
    textAlign: 'center',
    fontStyle: 'italic',
  },
})
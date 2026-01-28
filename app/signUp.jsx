import { Alert, Pressable, StyleSheet, Text, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
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
import { authService } from '../lib/authService'

const SignUp = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email format';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    const result = await authService.register(name.trim(), email.trim(), password);
    setLoading(false);
    
    if (result.success) {
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } else {
      Alert.alert('Sign Up Failed', result.message);
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
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.content}>
            <Animated.View entering={FadeInUp.delay(100)}>
              <BackButton router={router}/>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
              <Text style={styles.welcomeText}>Let's</Text>
              <Text style={styles.welcomeText}>Get Started!</Text>
              <Text style={styles.subtitleText}>Create your account to join the community</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300)} style={styles.form}>
              <FloatingInput 
                label="Full Name"
                icon={<Icon name='user' size={22} strokeWidth={1.6} color={theme.colors.grayMedium} />}
                placeholder='Enter your full name'
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                error={errors.name}
              />
              <FloatingInput 
                label="Email"
                icon={<Icon name='mail' size={22} strokeWidth={1.6} color={theme.colors.grayMedium} />}
                placeholder='Enter your email'
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />
              <FloatingInput 
                label="Password"
                icon={<Icon name='lock' size={22} strokeWidth={1.6} color={theme.colors.grayMedium} />}
                placeholder='Create a password'
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={errors.password}
              />

              <AnimatedButton 
                title="Create Account"
                onPress={onSubmit}
                loading={loading}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400)} style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <Pressable onPress={() => router.push('/login')}>
                <Text style={styles.footerLink}>Login</Text>
              </Pressable>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(500)} style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By signing up, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

export default SignUp

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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(6),
    paddingTop: hp(8),
    paddingBottom: hp(4),
  },
  header: {
    marginTop: hp(3),
    marginBottom: hp(3),
  },
  welcomeText: {
    fontSize: hp(4),
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
  termsContainer: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  termsText: {
    fontSize: hp(1.4),
    color: theme.colors.textLight,
    opacity: 0.5,
    textAlign: 'center',
    lineHeight: hp(2),
  },
  termsLink: {
    color: theme.colors.primaryLight,
    opacity: 1,
  },
})
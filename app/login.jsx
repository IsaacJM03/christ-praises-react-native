import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useRef, useState } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import Home from '../assets/icons/Home'
import { theme } from '../constants/theme'
import Icon from '../assets/icons/index'
import {StatusBar} from 'expo-status-bar'
import BackButton from '../components/BackButton'
import { useRouter } from 'expo-router'
import { hp, wp } from '../helpers/common'
import Input from '../components/Input'
import Button from '../components/Button'
import { authService } from '../lib/authService'

const Login = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [loading,setLoading] = useState(false);
  
  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert('Login','Please fill all fields');
      return;
    }
    
    setLoading(true);
    const result = await authService.login(emailRef.current, passwordRef.current);
    setLoading(false);
    
    if (result.success) {
      Alert.alert(
        'Success',
        'Login successful!',
        [{ text: 'OK', onPress: () => router.replace('/') }] // was: router.push('/index')
      );
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
              onBlur={() => setTimeout(() => setInputFocused(false), 100)}
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
              onBlur={() => setTimeout(() => setInputFocused(false), 100)}
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
      </View>
    </ScreenWrapper>
  )
}

export default Login

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
  },
  welcomeText: {
    fontSize: hp(4) ,
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  form: {
    gap: 25
  },
  forgotPassword: {
    textAlign: 'right',
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    textAlign: 'center',
    fontSize: hp(1.6),
    color: theme.colors.text,
  }
})
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

const SignUp = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const nameRef = useRef("");
  const passwordRef = useRef("");
  const [loading,setLoading] = useState(false);
  
  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current || !nameRef.current) {
      Alert.alert('Sign Up','Please fill all fields');
      return;
    }
    
    setLoading(true);
    const result = await authService.register(nameRef.current, emailRef.current, passwordRef.current);
    setLoading(false);
    
    if (result.success) {
      Alert.alert('Success', 'Account created successfully!');
      router.replace('/index'); // was: router.replace('/')
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

            <Animated.View entering={FadeInDown.delay(150)} style={styles.logoContainer}>
              <InteractiveLogo 
                mode="onboarding"
                size={hp(12)}
                motionIntensity={0.6}
                isFocused={inputFocused}
              />
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
                onFocus={() => setInputFocused(true)}
                onBlur={() => setTimeout(() => setInputFocused(false), 100)}
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
                onFocus={() => setInputFocused(true)}
                onBlur={() => setTimeout(() => setInputFocused(false), 100)}
              />
              <FloatingInput 
                label="Password"
                icon={<Icon name='lock' size={22} strokeWidth={1.6} color={theme.colors.grayMedium} />}
                placeholder='Create a password'
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                error={errors.password}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setTimeout(() => setInputFocused(false), 100)}
              />

          {/* button */}
          <Button 
            title={'Sign Up'}
            onPress={onSubmit}
            loading={loading}
          />
        </View>
        {/* footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Pressable onPress={() => router.push('/login')}> 
            {/* was: router.push('login') */}
            <Text style={[styles.footerText, {color: theme.colors.primaryDark, fontWeight:theme.fonts.semibold}]}>Login</Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default SignUp

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
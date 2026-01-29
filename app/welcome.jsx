import { StyleSheet, Text, View,Image, Pressable } from 'react-native'
import React from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import { hp, wp } from '../helpers/common'
import {theme} from '../constants/theme'
import Button from '../components/Button'
import { useRouter } from 'expo-router'

const Welcome = () => {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <StatusBar style='light' />
      <LinearGradient
        colors={['#1a1a2e', '#0f0f23', '#16213e']}
        style={styles.gradient}
      />
      
      <View style={styles.content}>
        <Animated.View entering={FadeInUp.delay(200).duration(600)} style={styles.logoContainer}>
          <InteractiveLogo 
            mode="onboarding"
            size={hp(24)}
            motionIntensity={1}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.textContainer}>
          <Text style={styles.title}>Christ Praises</Text>
          <Text style={styles.subtitle}>Can I Testify?</Text>
          <Text style={styles.punchline}>
            Join a community of believers sharing their journey, lifting each other up, and celebrating God's grace together.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.footer}>
          <AnimatedButton 
            title="Get Started"
            onPress={() => router.push('signUp')}
          />
          
          <AnimatedButton 
            title="I already have an account"
            variant="ghost"
            onPress={() => router.push('login')}
            style={styles.secondaryButton}
            textStyle={styles.secondaryButtonText}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(800).duration(600)} style={styles.inspirationContainer}>
          <Text style={styles.inspirationText}>
            "For where two or three gather in my name, there am I with them."
          </Text>
          <Text style={styles.verseReference}>Matthew 18:20</Text>
        </Animated.View>
      </View>
    </ScreenWrapper>
  )
}

export default Welcome

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: wp(4),
  },
  welcomeImage: {
    height: hp(30),
    width: wp(100),
    alignSelf: 'center',
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(4),
    textAlign: 'center',
    fontWeight: theme.fonts.extraBold
  },
  punchline: {
    textAlign: 'center',
    paddingHorizontal: wp(10),
    fontSize: hp(1.7),
    color: theme.colors.text,
  },
  footer: {
    gap: 30,
    width: '100%',
  },
  bottomTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: theme.colors.text,
    fontSize: hp(1.7),
  }
})
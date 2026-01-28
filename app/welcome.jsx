import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { StatusBar } from 'expo-status-bar'
import { hp, wp } from '../helpers/common'
import { theme } from '../constants/theme'
import AnimatedButton from '../components/AnimatedButton'
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
          <Image 
            style={styles.welcomeImage} 
            resizeMode='contain' 
            source={require('../assets/images/welcome2.png')} 
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.textContainer}>
          <Text style={styles.title}>Christ Praises</Text>
          <Text style={styles.subtitle}>Connect • Share • Grow in Faith</Text>
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
    </View>
  )
}

export default Welcome

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(6),
    paddingTop: hp(8),
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: hp(2),
  },
  welcomeImage: {
    height: hp(28),
    width: wp(90),
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: hp(4),
  },
  title: {
    color: theme.colors.textLight,
    fontSize: hp(4.5),
    textAlign: 'center',
    fontWeight: theme.fonts.extraBold,
    letterSpacing: 1,
  },
  subtitle: {
    color: theme.colors.primaryLight,
    fontSize: hp(1.8),
    textAlign: 'center',
    fontWeight: theme.fonts.medium,
    marginTop: theme.spacing.sm,
    letterSpacing: 2,
  },
  punchline: {
    textAlign: 'center',
    paddingHorizontal: wp(4),
    fontSize: hp(1.7),
    color: theme.colors.textLight,
    opacity: 0.7,
    marginTop: theme.spacing.md,
    lineHeight: hp(2.5),
  },
  footer: {
    width: '100%',
    gap: theme.spacing.md,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: theme.colors.textLight,
    opacity: 0.8,
  },
  inspirationContainer: {
    marginTop: hp(4),
    alignItems: 'center',
    paddingHorizontal: wp(4),
  },
  inspirationText: {
    fontSize: hp(1.5),
    color: theme.colors.textLight,
    opacity: 0.5,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: hp(2.2),
  },
  verseReference: {
    fontSize: hp(1.3),
    color: theme.colors.primaryLight,
    opacity: 0.6,
    marginTop: theme.spacing.xs,
    fontWeight: theme.fonts.medium,
  },
})
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

const SignUp = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const nameRef = useRef("");
  const passwordRef = useRef("");
  const [loading,setLoading] = useState(false);
  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert('Sign Up','Please fill all fields');
      return;
    }
    // good to go
  }
  return (
    <ScreenWrapper bg="white">
      <StatusBar style='dark' />
      <View style={styles.container}>
        <BackButton router={router}/>

        {/* welcome */}
        <View>
          <Text style={styles.welcomeText}>Let's</Text>
          <Text style={styles.welcomeText}>Begin!</Text>
        </View>

        {/* form */}
        <View style={styles.form}>
          <Text style={{fontSize: hp(1.8), color: theme.colors.text}}>Please fill in your details to create an account</Text>
          <Input 
            icon={<Icon name='user' size={26}  strokeWidth={1.6} color={theme.colors.text} />}
            placeholder='Enter your name'
            onChangeText={value=> nameRef.current = value}
          />
          <Input 
            icon={<Icon name='mail' size={26}  strokeWidth={1.6} color={theme.colors.text} />}
            placeholder='Enter your e-mail'
            onChangeText={value=> emailRef.current = value}
          />
          <Input 
            icon={<Icon name='lock' size={26}  strokeWidth={1.6} color={theme.colors.text} />}
            placeholder='Enter your password'
            secureTextEntry
            onChangeText={value=> passwordRef.current = value}
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
          <Pressable onPress={()=>router.push('login')}>
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
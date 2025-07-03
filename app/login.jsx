import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import Home from '../assets/icons/Home'
import { theme } from '../constants/theme'
import Icon from '../assets/icons/index'

const Login = () => {
  return (
    <ScreenWrapper>
      <Text>Login</Text>
      <Icon name="home" color="orange"/>
    </ScreenWrapper>
  )
}

export default Login

const styles = StyleSheet.create({})
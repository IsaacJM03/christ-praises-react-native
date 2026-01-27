import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { ActivityIndicator } from 'react-native'
import { theme } from '../constants/theme'
import { hp, wp } from '../helpers/common'

const Loading = ({size="small", color=theme.colors.primary}) => {
  return (
    <View style={{justifyContent:'center', alignItems:'center'}}>
      <ActivityIndicator size={size} color={color} />
    </View>
  )
}

export default Loading

const styles = StyleSheet.create({})
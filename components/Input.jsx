import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { TextInput } from 'react-native'
import {theme} from '@/constants/theme'
import {hp,wp} from '@/helpers/common'

const Input = (props) => {
  return (
    <View style={[styles.container, props.containerStyles && props.containerStyles]}>
      {
        props.icon && props.icon
      }
      <TextInput
       style = {{flex:1}}
       placeholderTextColor={theme.colors.text}
       ref = {props.inputRef && props.inputRef}
       {...props}
       />
    </View>
  )
}

export default Input

const styles = StyleSheet.create({
    container :{
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 0.4,
        justifyContent: 'center',
        borderColor: theme.colors.text,
        height: hp(7.2),
        borderRadius: theme.radius.xxl,
        borderCurve: 'continuous',
        paddingHorizontal: 18,
        gap: 12
    }
})
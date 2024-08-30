import React, {useEffect, useState} from 'react'
import {StyleSheet, Text, View} from 'react-native'
import {useNavigation} from '@react-navigation/native'

import {useAgent, useAuthApi} from '#/state/verus_session'
import {
  CommonNavigatorParams,
  NativeStackScreenProps,
  NavigationProp,
} from 'lib/routes/types'

export function ConfirmLogin({}: NativeStackScreenProps<
  CommonNavigatorParams,
  'ConfirmLogin'
>) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [display, setDisplay] = useState<string>('')
  const verusAgent = useAgent()
  const {login} = useAuthApi()

  const navigation = useNavigation<NavigationProp>()

  useEffect(() => {
    const getIdentity = async () => {
      const url = window.location.href
      console.log(url)

      const code = url.split('=')[1]
      console.log('Finding identity, the code is', code)
      await verusAgent.getIdentityFromResponse(code)
      login()
      navigation.navigate('Home')
      // setDisplay(id ?? 'no ID')
    }

    console.log('Getting Identity')
    getIdentity()
    console.log('Got Identity')
  }, [verusAgent, navigation, login])

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{display}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  text: {
    fontSize: 16,
    marginVertical: 10,
  },
})

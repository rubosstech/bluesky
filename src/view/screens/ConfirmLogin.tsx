import React, {useEffect, useState} from 'react'
import {StyleSheet, Text, View} from 'react-native'

import {useAgent} from '#/state/verus_session'
import {CommonNavigatorParams, NativeStackScreenProps} from 'lib/routes/types'

export function ConfirmLogin({}: NativeStackScreenProps<
  CommonNavigatorParams,
  'ConfirmLogin'
>) {
  const [display, setDisplay] = useState<string>('')
  const verusAgent = useAgent()

  useEffect(() => {
    const getIdentity = async () => {
      const url = window.location.href
      console.log(url)

      const code = url.split('=')[1]
      console.log('Finding identity, the code is', code)
      const id = await verusAgent.getIdentityFromResponse(code).then(res => res)
      console.log('setting id')
      setDisplay(id ?? 'no ID')
    }

    console.log('Getting Identity')
    getIdentity()
    console.log('Got Identity')
  }, [verusAgent])

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

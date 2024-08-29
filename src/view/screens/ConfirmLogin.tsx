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
      const id = await verusAgent.getIdentityFromResponse(code).then(res => res)
      setDisplay(id ?? 'no ID')
    }

    getIdentity()
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

import React, {useEffect, useState} from 'react'
import {ActivityIndicator, View} from 'react-native'
import QRCode from 'react-native-qrcode-svg' // Import the QR code component
import {ComAtprotoServerDescribeServer} from '@atproto/api'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {useAgent} from '#/state/verus_session'
import {atoms as a, useTheme} from '#/alf'
import {Button, ButtonText} from '#/components/Button'
import {Link} from '#/components/Link'
import {Text} from '#/components/Typography'
import {FormContainer} from './FormContainer'

type ServiceDescription = ComAtprotoServerDescribeServer.OutputSchema

export const VerusLoginForm = ({
  initialHandle,
  setError,
}: {
  error: string
  serviceUrl: string
  serviceDescription: ServiceDescription | undefined
  initialHandle: string
  setError: (v: string) => void
  // setServiceUrl: (v: string) => void;
  onPressRetryConnect: () => void
  onPressBack: () => void
  onPressForgotPassword: () => void
}) => {
  const verusAgent = useAgent()
  const t = useTheme()
  const [uri, setUri] = useState<string | null>(null) // State to store the URI for QR code
  console.log(initialHandle)
  const {_} = useLingui()

  useEffect(() => {
    const setURI = async () => {
      try {
        const URI = await verusAgent.getLoginURI().then(res => res)

        if (!URI) {
          throw new Error('URI not found')
        }

        console.log('URI:', URI)

        setUri(URI)
      } catch (err) {
        console.error('Error creating login consent:', err)
        setError('Failed to generate login consent')
      }
    }

    setURI()
  }, [setError, verusAgent])

  return (
    <FormContainer testID="loginForm" titleText={<Trans>Sign in</Trans>}>
      {uri ? (
        <View style={{alignItems: 'center', marginVertical: 20}}>
          <QRCode value={uri} size={200} />
          <Text style={[a.text_sm, t.atoms.text_contrast_medium, a.mt_sm]}>
            <Trans>Scan this QR code to proceed.</Trans>
          </Text>
          <Link to={uri}>
            <Button
              label={_(msg`Mobile Login`)}
              variant="solid"
              color="primary"
              size="medium"
              style={{marginVertical: 10}}>
              <ButtonText>
                <Trans>Mobile Login</Trans>
              </ButtonText>
            </Button>
          </Link>
        </View>
      ) : (
        <ActivityIndicator size="large" />
      )}
    </FormContainer>
  )
}

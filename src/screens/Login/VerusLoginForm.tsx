import React, {useRef, useState} from 'react'
import {ActivityIndicator, TextInput, View} from 'react-native'
import QRCode from 'react-native-qrcode-svg' // Import the QR code component
import {ComAtprotoServerDescribeServer} from '@atproto/api'
import {msg, Trans} from '@lingui/macro'
import {useLingui} from '@lingui/react'

import {useAgent} from '#/state/verus_session'
import {atoms as a, useTheme} from '#/alf'
import {Button, ButtonText} from '#/components/Button'
import {FormError} from '#/components/forms/FormError'
import * as TextField from '#/components/forms/TextField'
import {Ticket_Stroke2_Corner0_Rounded as Ticket} from '#/components/icons/Ticket'
import {Text} from '#/components/Typography'
import {FormContainer} from './FormContainer'

type ServiceDescription = ComAtprotoServerDescribeServer.OutputSchema

export const VerusLoginForm = ({
  error,
  serviceDescription,
  initialHandle,
  setError,
  // setServiceUrl,
  onPressRetryConnect,
  onPressBack,
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
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [isReady, setIsReady] = useState<boolean>(false)
  const [isAuthFactorTokenNeeded] = useState<boolean>(false)
  const [uri, setUri] = useState<string | null>(null) // State to store the URI for QR code
  const identifierValueRef = useRef<string>(initialHandle || '')
  const passwordValueRef = useRef<string>('')
  const authFactorTokenValueRef = useRef<string>('')
  const passwordRef = useRef<TextInput>(null)
  const {_} = useLingui()

  const onPressNext = async () => {
    let iaddress = identifierValueRef.current
    let wif = passwordValueRef.current

    setIsProcessing(true) // Set processing state to true while processing
    try {
      const response = await verusAgent.createLoginConsent(iaddress, wif) // Await the response
      const URI = response[2] ?? null // Ensure URI is properly accessed and resolved
      console.log(URI)
      setUri(URI) // Store the URI in state for QR code
    } catch (err) {
      console.error('Error creating login consent:', err)
      setError('Failed to generate login consent') // Update error state if needed
    } finally {
      setIsProcessing(false) // Reset processing state
    }
  }

  const checkIsReady = () => {
    if (
      !!serviceDescription &&
      !!identifierValueRef.current &&
      !!passwordValueRef.current
    ) {
      if (!isReady) {
        setIsReady(true)
      }
    } else {
      if (isReady) {
        setIsReady(false)
      }
    }
  }

  return (
    <FormContainer testID="loginForm" titleText={<Trans>Sign in</Trans>}>
      <View>
        <TextField.LabelText>
          <Trans>Identity</Trans>
        </TextField.LabelText>
        <View>
          <TextField.Root>
            <TextField.Input
              testID="loginUsernameInput"
              label={_(msg`Username or email address`)}
              autoCapitalize="none"
              autoFocus
              autoCorrect={false}
              autoComplete="username"
              returnKeyType="next"
              textContentType="username"
              defaultValue={initialHandle || ''}
              onChangeText={v => {
                identifierValueRef.current = v
                checkIsReady()
              }}
              onSubmitEditing={() => {
                passwordRef.current?.focus()
              }}
              blurOnSubmit={false}
              editable={!isProcessing}
              accessibilityHint={_(
                msg`Input the username or email address you used at signup`,
              )}
            />
          </TextField.Root>

          <TextField.LabelText>
            <Trans>WIF</Trans>
          </TextField.LabelText>
          <TextField.Root>
            <TextField.Input
              testID="loginPasswordInput"
              inputRef={passwordRef}
              label={_(msg`WIF`)}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              returnKeyType="done"
              enablesReturnKeyAutomatically={true}
              secureTextEntry={false}
              textContentType="username"
              clearButtonMode="while-editing"
              onChangeText={v => {
                passwordValueRef.current = v
                checkIsReady()
              }}
              onSubmitEditing={onPressNext}
              blurOnSubmit={false}
              editable={!isProcessing}
              accessibilityHint={_(msg`Input your password`)}
            />
          </TextField.Root>
        </View>
      </View>
      {isAuthFactorTokenNeeded && (
        <View>
          <TextField.LabelText>
            <Trans>2FA Confirmation</Trans>
          </TextField.LabelText>
          <TextField.Root>
            <TextField.Icon icon={Ticket} />
            <TextField.Input
              testID="loginAuthFactorTokenInput"
              label={_(msg`Confirmation code`)}
              autoCapitalize="none"
              autoFocus
              autoCorrect={false}
              autoComplete="off"
              returnKeyType="done"
              textContentType="username"
              blurOnSubmit={false}
              onChangeText={v => {
                authFactorTokenValueRef.current = v
              }}
              onSubmitEditing={onPressNext}
              editable={!isProcessing}
              accessibilityHint={_(
                msg`Input the code which has been emailed to you`,
              )}
            />
          </TextField.Root>
          <Text style={[a.text_sm, t.atoms.text_contrast_medium, a.mt_sm]}>
            <Trans>Check your email for a login code and enter it here.</Trans>
          </Text>
        </View>
      )}
      {uri && ( // Conditionally render QR code if URI is available
        <View style={{alignItems: 'center', marginVertical: 20}}>
          <QRCode value={uri} size={200} />
          <Text style={[a.text_sm, t.atoms.text_contrast_medium, a.mt_sm]}>
            <Trans>Scan this QR code to proceed.</Trans>
          </Text>
        </View>
      )}
      <FormError error={error} />
      <View style={[a.flex_row, a.align_center, a.pt_md]}>
        <Button
          label={_(msg`Back`)}
          variant="solid"
          color="secondary"
          size="medium"
          onPress={onPressBack}>
          <ButtonText>
            <Trans>Back</Trans>
          </ButtonText>
        </Button>
        <View style={a.flex_1} />
        {!serviceDescription && error ? (
          <Button
            testID="loginRetryButton"
            label={_(msg`Retry`)}
            accessibilityHint={_(msg`Retries login`)}
            variant="solid"
            color="secondary"
            size="medium"
            onPress={onPressRetryConnect}>
            <ButtonText>
              <Trans>Retry</Trans>
            </ButtonText>
          </Button>
        ) : !serviceDescription ? (
          <>
            <ActivityIndicator />
            <Text style={[t.atoms.text_contrast_high, a.pl_md]}>
              <Trans>Connecting...</Trans>
            </Text>
          </>
        ) : (
          <Button
            testID="loginNextButton"
            label={_(msg`Next`)}
            accessibilityHint={_(msg`Navigates to the next screen`)}
            variant="solid"
            color="primary"
            size="medium"
            onPress={onPressNext}>
            <ButtonText>
              <Trans>Sign in</Trans>
            </ButtonText>
            {isProcessing && <ActivityIndicator />}
          </Button>
        )}
      </View>
    </FormContainer>
  )
}

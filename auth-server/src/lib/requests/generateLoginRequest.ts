// @ts-ignore: No type definitions for crypto-browserify
import * as crypto from 'crypto-browserify'
import {
  IDENTITY_VIEW,
  // LOGIN_CONSENT_WEBHOOK_VDXF_KEY,
  LOGIN_CONSENT_REDIRECT_VDXF_KEY,
  LoginConsentChallenge,
  RedirectUri,
  RequestedPermission,
  toBase58Check,
} from 'verus-typescript-primitives'

import {env} from '../utils/env'
import {idInterface} from '../utils/idInterface'

export const generateLoginRequest = async () => {
  console.log('Generating login request at', new Date().toLocaleTimeString())
  const randID = Buffer.from(crypto.randomBytes(20))
  const challengeId = toBase58Check(randID, 102)

  const challenge = new LoginConsentChallenge({
    challenge_id: challengeId,
    requested_access: [new RequestedPermission(IDENTITY_VIEW.vdxfid)],
    redirect_uris: [
      new RedirectUri(
        `${env.BASE_URL}confirm-login`,
        LOGIN_CONSENT_REDIRECT_VDXF_KEY.vdxfid,
      ),
    ],
    created_at: Number((Date.now() / 1000).toFixed(0)),
  })

  try {
    const req = await idInterface.createLoginConsentRequest(
      env.IADDRESS,
      challenge,
      env.WIF,
    )
    const uri = req.toWalletDeeplinkUri()
    console.log('Generated URI:', uri)
    console.log('Generated challenge:', challenge)
    console.log('Generated request:', req)
    return {uri} // Return an object containing the URI
  } catch (error) {
    console.error('Error generating login request:', error)
    console.error('wif: ', env.WIF)
    return {error: 'Failed to generate login request'} // Return an object containing the error
  }
}

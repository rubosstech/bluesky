// @ts-ignore: No type definitions for crypto-browserify
import * as crypto from 'crypto-browserify'
import * as dotenv from 'dotenv'
import {
  IDENTITY_VIEW,
  LOGIN_CONSENT_WEBHOOK_VDXF_KEY,
  LoginConsentChallenge,
  RedirectUri,
  RequestedPermission,
  toBase58Check,
} from 'verus-typescript-primitives'
import {VerusIdInterface} from 'verusid-ts-client'
dotenv.config()

const isDev = process.env.IS_DEV === 'true'
const iaddress = process.env.IADDRESS as string
const wif = process.env.WIF as string

const DEFAULT_CHAIN = isDev ? 'VRSCTEST' : 'VRSC'
const DEFAULT_URL = isDev
  ? 'https://api.verustest.net'
  : 'https://api.verus.services'

const idInterface = new VerusIdInterface(DEFAULT_CHAIN, DEFAULT_URL)

export const generateLoginRequest = async () => {
  console.log('iaddress: ', iaddress)
  console.log('wif: ', wif)
  const randID = Buffer.from(crypto.randomBytes(20))
  const challengeId = toBase58Check(randID, 102)

  const challenge = new LoginConsentChallenge({
    challenge_id: challengeId,
    requested_access: [new RequestedPermission(IDENTITY_VIEW.vdxfid)],
    redirect_uris: [
      new RedirectUri(
        'http://10.0.2.2:19006/',
        LOGIN_CONSENT_WEBHOOK_VDXF_KEY.vdxfid,
      ),
    ],
    created_at: Number((Date.now() / 1000).toFixed(0)),
  })

  try {
    const req = await idInterface.createLoginConsentRequest(
      iaddress,
      challenge,
      wif,
    )
    const uri = req.toWalletDeeplinkUri()
    return {uri} // Return an object containing the URI
  } catch (error) {
    console.error('Error generating login request:', error)
    console.error('wif: ', wif)
    return {error: 'Failed to generate login request'} // Return an object containing the error
  }
}

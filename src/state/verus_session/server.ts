// @ts-ignore Ignore this error since the types aren't defined
import * as crypto from 'crypto-browserify'
import {
  IDENTITY_VIEW,
  LOGIN_CONSENT_WEBHOOK_VDXF_KEY,
  LoginConsentChallenge,
  RedirectUri,
  RequestedPermission,
  toBase58Check,
} from 'verus-typescript-primitives'
import {VerusIdInterface} from 'verusid-ts-client'

import {IS_DEV} from '#/env'

// const iaddress = "iGzFuwQ9cXuZzQ4MsX8pWUqfjWYWpvcgiT"
const iaddress = 'iJMx9gvpS66vJxL2xwTDnrTkkK4iNjF2W9'
const wif = 'UuwL3tkqGwugREyPC86Bzng9k25Ld87bsM6FFza2Q3SEofXpshTK'

const DEFAULT_CHAIN = IS_DEV ? 'VRSCTEST' : 'VRSC'
const DEFAULT_URL = IS_DEV
  ? 'https://api.verustest.net'
  : 'https://api.verus.services'

const idInterface = new VerusIdInterface(DEFAULT_CHAIN, DEFAULT_URL)

export const generateLoginRequest = async () => {
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

  const req = idInterface.createLoginConsentRequest(iaddress, challenge, wif)

  return req
}

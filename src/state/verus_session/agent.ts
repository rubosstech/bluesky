// @ts-ignore Ignore this error since the types aren't defined
import * as crypto from 'crypto-browserify'
import {
  IDENTITY_VIEW,
  LOGIN_CONSENT_WEBHOOK_VDXF_KEY,
  // LOGIN_CONSENT_CHALLENGE_VDXF_KEY,
  // I_ADDR_VERSION,
  LoginConsentChallenge,
  RedirectUri,
  RequestedPermission,
  toBase58Check,
} from 'verus-typescript-primitives'
import {VerusdRpcInterface} from 'verusd-rpc-ts-client'
import {VerusIdInterface} from 'verusid-ts-client'

import {IS_DEV} from '#/env'
// import { verify } from 'crypto'

const DEFAULT_CHAIN = IS_DEV ? 'VRSCTEST' : 'VRSC'
const DEFAULT_URL = IS_DEV
  ? 'https://api.verustest.net'
  : 'https://api.verus.services'

export function createPublicAgent() {
  return VerusAgent.publicAgent()
}

export class VerusAgent {
  chain: string
  baseUrl: string
  rpcInterface: VerusdRpcInterface
  idInterface: VerusIdInterface

  lastLoginRequest: Awaited<
    ReturnType<
      InstanceType<typeof VerusIdInterface>['createLoginConsentRequest']
    >
  > | null = null

  static publicAgent(baseUrl: string = DEFAULT_URL) {
    return new VerusAgent(DEFAULT_CHAIN, baseUrl)
  }

  constructor(chain: string, baseUrl: string = DEFAULT_URL) {
    this.chain = chain
    this.baseUrl = baseUrl
    this.rpcInterface = new VerusdRpcInterface(chain, baseUrl, {})
    this.idInterface = new VerusIdInterface(chain, baseUrl, {})
  }

  async createLoginConsent(..._params: unknown[]) {
    const oldStackTraceLimit = Error.stackTraceLimit
    Error.stackTraceLimit = 1000
    console.log(crypto, toBase58Check)
    const randID = Buffer.from(crypto.randomBytes(20))
    console.log(randID)
    const iaddressID = toBase58Check(randID, 102)
    console.log(iaddressID)
    // const iaddressID = 'i8koJHX4v2vgwMr9VwEE1KdXgzNztKW3yt'

    console.log('creating challenge')
    const challenge = new LoginConsentChallenge({
      challenge_id: iaddressID,
      requested_access: [new RequestedPermission(IDENTITY_VIEW.vdxfid)],
      redirect_uris: [
        new RedirectUri(
          'https://localhost',
          LOGIN_CONSENT_WEBHOOK_VDXF_KEY.vdxfid,
        ),
      ],
      created_at: Number((Date.now() / 1000).toFixed(0)),
    })
    console.log(challenge)
    console.log('challenge created')
    const signingId = 'RXT9zkUMrfT2SSzqJG1eniftHNrEYCMFfa'
    // const primaryAddrWif = 'RXT9zkUMrfT2SSzqJG1eniftHNrEYCMFfa'
    const primaryAddrWif =
      'UuwL3tkqGwugREyPC86Bzng9k25Ld87bsM6FFza2Q3SEofXpshTK'
    // const primaryAddrWif = 'i8koJHX4v2vgwMr9VwEE1KdXgzNztKW3yt'

    console.log('creating login consent request')
    try {
      this.lastLoginRequest = await this.idInterface.createLoginConsentRequest(
        signingId,
        challenge,
        primaryAddrWif,
      )
      console.log(this.lastLoginRequest)
      return [
        this.lastLoginRequest,
        this.lastLoginRequest.toWalletDeeplinkUri(),
      ] as const
    } catch (err) {
      console.log('Something went wrong creating the login consent request')
      // console.log(await this.verifyLoginConsent())
      console.log(err)
    } finally {
      Error.stackTraceLimit = oldStackTraceLimit
    }
    this.verifyLoginConsent()
    console.log('Done')

    return [this.lastLoginRequest, null] as const
  }

  async verifyLoginConsent() {
    console.log('in verify login consent')
    if (!this.lastLoginRequest) return null

    try {
      const isValid = await this.idInterface.verifyLoginConsentRequest(
        this.lastLoginRequest,
      )
      console.log(isValid)
    } catch (err) {
      console.log(err)
    }
  }

  async listPosts(..._params: unknown[]) {
    return {}
  }

  async getPost(..._params: unknown[]) {
    // This is just a test query to prove that the interface works
    return await this.rpcInterface.getBlock('0')
  }
}

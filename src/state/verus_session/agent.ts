// @ts-ignore Ignore this error since the types aren't defined
// import * as crypto from 'crypto-browserify'
// import {
//   IDENTITY_VIEW,
//   LOGIN_CONSENT_REDIRECT_VDXF_KEY,
//   LOGIN_CONSENT_WEBHOOK_VDXF_KEY,
//   // LOGIN_CONSENT_CHALLENGE_VDXF_KEY,
//   // I_ADDR_VERSION,
//   LoginConsentChallenge,
//   LoginConsentDecision,
//   RedirectUri,
//   RequestedPermission,
//   toBase58Check,
//   LoginConsentRequest,
// } from 'verus-typescript-primitives'
import {VerusdRpcInterface} from 'verusd-rpc-ts-client'
import {VerusIdInterface} from 'verusid-ts-client'

import {IS_DEV} from '#/env'
import {generateLoginRequest} from './server'
// const USE_LOGIN_FORM_VALUES = false
// import { verify } from 'crypto'

const ID = {
  identity: {
    version: 3,
    flags: 0,
    primaryaddresses: ['RXT9zkUMrfT2SSzqJG1eniftHNrEYCMFfa'],
    minimumsignatures: 1,
    name: 'Scott',
    identityaddress: 'iMon85SSR2wu3PWFXAAo4oBMwyGSxULZ3w',
    parent: 'iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq',
    systemid: 'iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq',
    contentmap: {},
    contentmultimap: {},
    revocationauthority: 'iMon85SSR2wu3PWFXAAo4oBMwyGSxULZ3w',
    recoveryauthority: 'iMon85SSR2wu3PWFXAAo4oBMwyGSxULZ3w',
    // "privateaddress": "zs1mvtq0xex9dd3cjxcrdupn6kaza4uuvyvt3ahfzv48lucq67zersx06uzl3s962hw86hnzz68jwn",
    timelock: 0,
  },
  status: 'active',
  canspendfor: true,
  cansignfor: true,
  blockheight: 178300,
  txid: '4d8eb3d5c4cd10968ba7aee6b8083ae74dc7b012122587b11aced1f66485b534',
  vout: 0,
}

const VERUSTEST_I_ADDR = 'iJhCezBExJHvtyH3fGhNnt2NhU4Ztkf2yq'

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

  async getLoginURI() {
    try {
      const request = await generateLoginRequest()
      const uri = request.toWalletDeeplinkUri()
      return uri
    } catch (err) {
      console.error('Error creating login consent:', err)
    }
    // const oldStackTraceLimit = Error.stackTraceLimit
    // Error.stackTraceLimit = 1000
    // const randID = Buffer.from(crypto.randomBytes(20))
    // const iaddressID = toBase58Check(randID, 102)
    // const created_at = Number((Date.now() / 1000).toFixed(0))

    // const challenge = new LoginConsentChallenge({
    //   challenge_id: iaddressID,
    //   requested_access: [new RequestedPermission(IDENTITY_VIEW.vdxfid)],
    //   redirect_uris: [
    //     new RedirectUri(
    //       'https://localhost',
    //       LOGIN_CONSENT_WEBHOOK_VDXF_KEY.vdxfid,
    //     ),
    //   ],
    //   // created_at: created_at,
    //   created_at: Number((Date.now() / 1000).toFixed(0)),
    // })
    // // console.log(challenge)
    // // const signingId = 'Scott@'
    // const signingId = 'iMon85SSR2wu3PWFXAAo4oBMwyGSxULZ3w'
    // const primaryAddrWif =
    //   'UuwL3tkqGwugREyPC86Bzng9k25Ld87bsM6FFza2Q3SEofXpshTK'

    // try {

    // this.lastLoginRequest = await this.idInterface.createLoginConsentRequest(
    //   USE_LOGIN_FORM_VALUES && iaddress ? iaddress : signingId,
    //   challenge,
    //   USE_LOGIN_FORM_VALUES && wif ? wif : primaryAddrWif,
    //   ID,
    //   // 18167,
    //   // VERUSTEST_I_ADDR,
    // )

    // const validReal = await this.idInterface.verifyLoginConsentRequest(
    //   this.lastLoginRequest,
    //   ID,
    //   VERUSTEST_I_ADDR,
    // )
    // console.log("isValid real values: " + validReal)

    //   // const res = await this.idInterface.createLoginConsentResponse(
    //   //   "iMon85SSR2wu3PWFXAAo4oBMwyGSxULZ3w",
    //   //   new LoginConsentDecision({
    //   //     decision_id: iaddressID,
    //   //     request: this.lastLoginRequest,
    //   //     created_at: 1527992841,
    //   //   }),
    //   //   "UuwL3tkqGwugREyPC86Bzng9k25Ld87bsM6FFza2Q3SEofXpshTK"
    //   // );

    //   console.log(this.lastLoginRequest)
    //   return [
    //     this.lastLoginRequest,
    //     this.verifyLoginConsent(),
    //     this.lastLoginRequest.toWalletDeeplinkUri(),
    //   ] as const
    // } catch (err) {
    //   console.log('Something went wrong creating the login consent request')
    //   console.log(err)
    // } finally {
    //   Error.stackTraceLimit = oldStackTraceLimit
    // }

    // return [this.lastLoginRequest, null] as const
  }

  async verifyLoginConsent() {
    console.log('in verify login consent')
    if (!this.lastLoginRequest) return null

    try {
      const isValid = await this.idInterface.verifyLoginConsentRequest(
        this.lastLoginRequest,
        ID,
        VERUSTEST_I_ADDR,
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

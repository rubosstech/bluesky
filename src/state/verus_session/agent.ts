// @ts-ignore Ignore this error since the types aren't defined
// import * as crypto from 'crypto-browserify'
import base64url from 'base64url'
import {LoginConsentResponse} from 'verus-typescript-primitives'
import {VerusdRpcInterface} from 'verusd-rpc-ts-client'
import {VerusIdInterface} from 'verusid-ts-client'

import {IS_DEV} from '#/env'
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
      const response = await fetch(
        `${process.env.BASE_URL}/api/v1/login/get-login-request`,
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json() // Explicitly type the response

      if (result.error) {
        console.error('Error received from server:', result.error)
        return null
      }

      if (result.uri) {
        console.log('Generated URI:', result.uri)
        return result.uri
      }

      throw new Error('Unexpected response format')
    } catch (err) {
      console.error('Error creating login consent:', err)
      return null
    }
  }

  async getIdentityFromResponse(code: any) {
    let response = new LoginConsentResponse()
    response.fromBuffer(base64url.toBuffer(code))

    console.log('response:', response)
    const isValid = await this.idInterface.verifyLoginConsentResponse(response)
    console.log('isValid:', isValid)

    let id
    let idat = 'sad'

    if (isValid) {
      id = await this.rpcInterface.getIdentity(response.signing_id)
      idat = id.result?.identity.name + '@'
      // session = response.decision.request.challenge.session_id
    }

    return idat
  }

  async decode(code: string) {
    try {
      let res = new LoginConsentResponse()
      res.fromBuffer(base64url.toBuffer(code))

      return res
    } catch (error) {
      console.error('Error decoding code:', error)
      return null
    }
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

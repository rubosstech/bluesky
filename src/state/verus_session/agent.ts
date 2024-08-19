import {LoginConsentChallenge} from 'verus-typescript-primitives'
import {VerusdRpcInterface} from 'verusd-rpc-ts-client'
import {VerusIdInterface} from 'verusid-ts-client'

import {IS_DEV} from '#/env'

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
    const challenge = new LoginConsentChallenge()
    const signingId = 'VerusID@'
    const primaryAddrWif = 'yourWIFhere'

    try {
      this.lastLoginRequest = await this.idInterface.createLoginConsentRequest(
        signingId,
        challenge,
        primaryAddrWif,
      )
      console.log(this.lastLoginRequest)
    } catch (err) {
      console.log(err)
    }
  }

  async verifyLoginConsent() {
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

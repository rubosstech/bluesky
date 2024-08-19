import {VerusdRpcInterface} from 'verusd-rpc-ts-client'

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
  interface: VerusdRpcInterface

  static publicAgent(baseUrl: string = DEFAULT_URL) {
    return new VerusAgent(DEFAULT_CHAIN, baseUrl)
  }

  constructor(chain: string, baseUrl: string = DEFAULT_URL) {
    this.chain = chain
    this.baseUrl = baseUrl
    this.interface = new VerusdRpcInterface(chain, baseUrl, {})
  }

  listPosts(..._params: unknown[]) {
    return {}
  }

  getPost(..._params: unknown[]) {
    return this.interface.getBlock('0')
  }
}

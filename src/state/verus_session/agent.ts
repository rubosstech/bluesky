import {DEFAULT} from '@sentry/react-native/dist/js/tracing'
import {VerusdRpcInterface} from 'verusd-rpc-ts-client'

const DEFAULT_URL = ['test', 'development'].includes(
  process.env.NODE_ENV as any,
)
  ? 'https://api.verustest.net'
  : 'https://api.verus.services'

export function createPublicAgent() {
  return VerusAgent.publicAgent()
}

export class VerusAgent {
  chain: string
  baseUrl: string
  interface: VerusdRpcInterface

  static publicAgent(baseUrl: string = DEFAULT) {
    return new VerusAgent('', baseUrl)
  }

  constructor(chain: string, baseUrl: string = DEFAULT_URL) {
    this.chain = chain
    this.baseUrl = baseUrl
    this.interface = new VerusdRpcInterface(chain, baseUrl, {})
  }

  listPosts(..._params: unknown[]) {
    return null
  }

  getPost(..._params: unknown[]) {
    return null
  }
}

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
  interface: VerusdRpcInterface

  static publicAgent(baseUrl: string = DEFAULT) {
    return new VerusAgent('', baseUrl)
  }

  constructor(chain: string, baseUrl: string = DEFAULT_URL) {
    this.interface = new VerusdRpcInterface(chain, baseUrl, {})
  }
}

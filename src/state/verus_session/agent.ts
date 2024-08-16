import {VerusdRpcInterface} from 'verusd-rpc-ts-client'

const DEFAULT_URL = ['test', 'development'].includes(
  process.env.NODE_ENV as any,
)
  ? 'https://api.verustest.net'
  : 'https://api.verus.services'

export function createPublicAgent() {
  return new VerusdRpcInterface('', DEFAULT_URL, {})
}

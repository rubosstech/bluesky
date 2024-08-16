import {VerusdRpcInterface} from 'verusd-rpc-ts-client'

import {createPublicAgent} from './agent'
import {wrapAgentReducerForLogging} from './logging'

export type AgentState = {agent: VerusdRpcInterface}

export type State = {currentAgentState: AgentState}

export type Action =
  | {
      type: 'received-agent-event'
      client: VerusdRpcInterface
    }
  | {
      type: 'switched-to-account'
      client: VerusdRpcInterface
    }
  | {
      type: 'removed-account'
      client: VerusdRpcInterface
    }
  | {
      type: 'logged-out'
    }
  | {
      type: 'synced-accounts'
      client: VerusdRpcInterface
    }

function createPublicAgentState(): AgentState {
  return {
    agent: createPublicAgent(),
  }
}

export function getInitialState(_persistedAccounts: never[]): State {
  return {
    currentAgentState: createPublicAgentState(),
  }
}

export const reducer = wrapAgentReducerForLogging(
  (state: State, _action: Action): State => {
    return state
  },
)

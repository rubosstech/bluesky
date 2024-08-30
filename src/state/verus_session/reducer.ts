import {createPublicAgent, VerusAgent} from './agent'
import {wrapAgentReducerForLogging} from './logging'

export type AgentState = {agent: VerusAgent}

export type State = {currentAgentState: AgentState}

export type Action =
  | {
      type: 'received-agent-event'
      agent: VerusAgent
    }
  | {
      type: 'switched-to-account'
      newAgent: VerusAgent
    }
  | {
      type: 'removed-account'
    }
  | {
      type: 'logged-out'
    }
  | {
      type: 'synced-accounts'
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

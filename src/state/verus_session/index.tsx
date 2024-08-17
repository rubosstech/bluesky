import React from 'react'

import {VerusAgent} from './agent'
import {addSessionDebugLog} from './logging'
import {getInitialState, reducer} from './reducer'

const AgentContext = React.createContext<VerusAgent | null>(null)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useOneTaskAtATime() {
  const abortController = React.useRef<AbortController | null>(null)
  const cancelPendingTask = React.useCallback(() => {
    if (abortController.current) {
      abortController.current.abort()
    }
    abortController.current = new AbortController()
    return abortController.current.signal
  }, [])
  return cancelPendingTask
}

export function Provider({children}: React.PropsWithChildren<{}>) {
  // const cancelPendingTask = useOneTaskAtATime()
  const [state, _dispatch] = React.useReducer(reducer, null, () => {
    const initialState = getInitialState([])
    addSessionDebugLog({type: 'reducer:init', state: initialState})
    return initialState
  })

  return (
    <AgentContext.Provider value={state.currentAgentState.agent}>
      {children}
    </AgentContext.Provider>
  )
}

export function useAgent(): VerusAgent {
  const agent = React.useContext(AgentContext)
  if (!agent) {
    throw Error('useAgent() must be below <Provider>.')
  }
  return agent
}

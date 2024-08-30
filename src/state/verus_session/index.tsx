import React from 'react'

import {isWeb} from '#/platform/detection'
import {IS_DEV} from '#/env'
import {VerusAgent} from './agent'
import {addSessionDebugLog} from './logging'
import {getInitialState, reducer} from './reducer'
import {AuthApiContext} from './types'

const AgentContext = React.createContext<VerusAgent | null>(null)

const ApiContext = React.createContext<AuthApiContext>({
  createAccount: async () => {},
  login: async () => {},
  logout: async () => {},
  resumeSession: async () => {},
  removeAccount: async () => {},
})

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
  const cancelPendingTask = useOneTaskAtATime()
  const [state, dispatch] = React.useReducer(reducer, null, () => {
    const initialState = getInitialState([])
    addSessionDebugLog({type: 'reducer:init', state: initialState})
    return initialState
  })

  // We will use this once the auth methods start to get filled in properly
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const onAgentSessionChange = React.useCallback((agent: VerusAgent) => {
    dispatch({
      type: 'received-agent-event',
      agent,
    })
  }, [])

  const createAccount = React.useCallback<AuthApiContext['createAccount']>(
    async (..._params) => {
      addSessionDebugLog({type: 'method:start', method: 'createAccount'})
      const signal = cancelPendingTask()

      // !GH - TODO - auth

      if (signal.aborted) {
        return
      }

      dispatch({
        type: 'switched-to-account',
        newAgent: state.currentAgentState.agent,
      })
      addSessionDebugLog({type: 'method:end', method: 'createAccount'})
    },
    [state.currentAgentState.agent, cancelPendingTask],
  )

  const login = React.useCallback<AuthApiContext['login']>(
    async (..._params) => {
      addSessionDebugLog({type: 'method:start', method: 'login'})
      const signal = cancelPendingTask()

      // !GH - TODO - auth

      if (signal.aborted) {
        return
      }

      dispatch({
        type: 'switched-to-account',
        newAgent: state.currentAgentState.agent,
      })
      addSessionDebugLog({type: 'method:end', method: 'login'})
    },
    [cancelPendingTask, state.currentAgentState.agent],
  )

  const logout = React.useCallback<AuthApiContext['logout']>(
    async (..._params) => {
      addSessionDebugLog({type: 'method:start', method: 'logout'})
      cancelPendingTask()
      dispatch({
        type: 'logged-out',
      })
      addSessionDebugLog({type: 'method:start', method: 'logout'})
    },
    [cancelPendingTask],
  )

  const resumeSession = React.useCallback<AuthApiContext['resumeSession']>(
    async (..._params) => {
      addSessionDebugLog({type: 'method:start', method: 'resumeSession'})
      const signal = cancelPendingTask()

      // !GH - TODO - resume

      if (signal.aborted) {
        return
      }
      dispatch({
        type: 'switched-to-account',
        newAgent: state.currentAgentState.agent,
      })
      addSessionDebugLog({type: 'method:end', method: 'resumeSession'})
    },
    [cancelPendingTask, state.currentAgentState.agent],
  )

  const removeAccount = React.useCallback<AuthApiContext['removeAccount']>(
    (..._params) => {
      addSessionDebugLog({
        type: 'method:start',
        method: 'removeAccount',
      })
      cancelPendingTask()
      dispatch({
        type: 'removed-account',
      })
      addSessionDebugLog({type: 'method:end', method: 'removeAccount'})
    },
    [cancelPendingTask],
  )

  // !GH - TODO - persist data
  // !GH - TODO - read persist data

  const authApi = React.useMemo(
    () => ({
      createAccount,
      login,
      logout,
      resumeSession,
      removeAccount,
    }),
    [createAccount, login, logout, resumeSession, removeAccount],
  )

  // @ts-ignore
  if (IS_DEV && isWeb) window.verus_agent = state.currentAgentState.agent

  const agent = state.currentAgentState.agent
  const currentAgentRef = React.useRef(agent)
  React.useEffect(() => {
    if (currentAgentRef.current !== agent) {
      const prevAgent = currentAgentRef.current
      currentAgentRef.current = agent
      addSessionDebugLog({type: 'agent:switch', prevAgent, nextAgent: agent})

      // !GH - TODO - Neutralize the session
    }
  }, [agent])

  return (
    <ApiContext.Provider value={authApi}>
      <AgentContext.Provider value={state.currentAgentState.agent}>
        {children}
      </AgentContext.Provider>
    </ApiContext.Provider>
  )
}

export function useAgent(): VerusAgent {
  const agent = React.useContext(AgentContext)
  if (!agent) {
    throw Error('useAgent() must be below <Provider>.')
  }
  return agent
}

export function useAuthApi() {
  return React.useContext(ApiContext)
}

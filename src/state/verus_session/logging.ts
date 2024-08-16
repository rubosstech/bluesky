import {type Action, type State} from './reducer'

type Reducer = (state: State, action: Action) => State

export function wrapAgentReducerForLogging(reducer: Reducer): Reducer {
  return function loggingWrapper(prevState: State, action: Action): State {
    // !GH - TODO - Logging
    return reducer(prevState, action)
  }
}

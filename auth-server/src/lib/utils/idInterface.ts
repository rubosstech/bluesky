import {VerusIdInterface} from 'verusid-ts-client'

import {env} from './env'

export const idInterface = new VerusIdInterface(
  env.DEFAULT_CHAIN,
  env.DEFAULT_URL,
)

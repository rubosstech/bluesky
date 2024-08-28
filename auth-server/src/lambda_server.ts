import serverlessExpress from '@codegenie/serverless-express'

import {app} from './app'

const handler = serverlessExpress({app})

export {handler}

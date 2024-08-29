import {Router} from 'express'

import {loginRouter} from './v1/login'

const router = Router()

router.use('/login', loginRouter)

export {router as v1Router}

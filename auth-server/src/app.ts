import express from 'express'

import {helloWorldRouter} from './api/hello_world'
import {loginRouter} from './api/login'

const app = express()

// TODO middlewares

app.use('/hello_world', helloWorldRouter)
app.use('/login', loginRouter)
app.all('*', (req, res) => {
  res.status(404)
  res.send('Hello From Verus Social!!!')
})

export {app}

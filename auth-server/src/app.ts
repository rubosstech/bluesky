import express from 'express'

import {helloWorldRouter} from './api/hello_world'
import {v1Router} from './api/v1_route'

const app = express()

// TODO middlewares

app.use('/hello_world', helloWorldRouter)
app.use('/api/v1', v1Router)
app.all('*', (req, res) => {
  res.status(404)
  res.send('Hello From Verus Social!!!')
})

export {app}

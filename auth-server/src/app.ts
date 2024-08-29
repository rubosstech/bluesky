import compression from 'compression'
import express from 'express'
import morgan from 'morgan'
import path from 'path'

import {helloWorldRouter} from './api/hello_world'
import {v1Router} from './api/v1_route'

const app = express()

app.use(morgan('tiny'))
app.use(compression())

app.use(express.static(path.resolve(path.join(__dirname, '..', 'public'))))

app.use('/hello_world', helloWorldRouter)
app.use('/api/v1', v1Router)
app.all('*', (req, res) => {
  res.status(200)
  res.sendFile(path.resolve(path.join(__dirname, '..', 'public', 'index.html')))
})

export {app}

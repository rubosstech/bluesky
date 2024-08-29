import express from 'express'

import {generateLoginRequest} from './getLoginRequest'

const loginRouter = express.Router()

loginRouter.get('/get-login-request', async (req, res) => {
  try {
    const result = await generateLoginRequest()

    if (result.error) {
      res.status(500).json(result)
    } else {
      res.status(200).json(result)
    }
  } catch (error) {
    console.error('Error processing login request:', error)
    res.status(500).send('Internal Server Error')
  }
})

loginRouter.get('/confirm-login', async (req, res) => {
  console.log('Confirming login')
  res.status(200).send('Login confirmed')
})

export {loginRouter}

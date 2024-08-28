import express from 'express'

import {generateLoginRequest} from './getLoginRequest'

const loginRouter = express.Router()

loginRouter.get('/get-login-request', async (req, res) => {
  try {
    const result = await generateLoginRequest() // Always returns an object

    if (result.error) {
      res.status(500).json(result) // Send error as JSON
    } else {
      res.status(200).json(result) // Send URI as JSON
    }
  } catch (error) {
    console.error('Error processing login request:', error)
    res.status(500).send('Internal Server Error')
  }
})

export {loginRouter}

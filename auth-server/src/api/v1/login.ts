import express from 'express'

const loginRouter = express.Router()

loginRouter.post('/get-login-request', (req, res) => {
  res.status(200)
  res.send('TODO, World!')
})

export {loginRouter}

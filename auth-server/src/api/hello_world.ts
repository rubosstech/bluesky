import {Router} from 'express'
import {z} from 'zod'

const helloWorldRouter = Router()

const hwSchema = z.object({
  name: z.string().optional().default('World'),
})

helloWorldRouter.get('/', (req, res) => {
  const query = hwSchema.parse(req.query)

  res.status(200)
  res.send(`Hello, ${query.name}!`)
})

export {helloWorldRouter}

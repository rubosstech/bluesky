import * as dotenv from 'dotenv'
import {z} from 'zod'

dotenv.config()

const envSchema = z
  .object({
    IS_DEV: z
      .string()
      .optional()
      .default('true')
      .transform(val => val === 'true'),
    IADDRESS: z.string(),
    WIF: z.string(),
    BASE_URL: z.string(),
  })
  .transform(val => ({
    ...val,
    DEFAULT_CHAIN: val.IS_DEV ? 'VRSCTEST' : 'VRSC',
    DEFAULT_URL: val.IS_DEV
      ? 'https://api.verustest.net'
      : 'https://api.verus.services',
  }))

export type Env = z.infer<typeof envSchema>
export const env = envSchema.parse(process.env)

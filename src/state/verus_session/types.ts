export type AuthApiContext = {
  createAccount: (...props: unknown[]) => Promise<void>
  login: (...props: unknown[]) => Promise<void>
  logout: (...props: unknown[]) => void
  resumeSession: (...props: unknown[]) => Promise<void>
  removeAccount: (...props: unknown[]) => void
}

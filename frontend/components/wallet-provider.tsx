'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react'
import { setCookie, getCookie } from 'cookies-next'
import type { W3SSdk as W3SSdkType } from '@circle-fin/w3s-pw-web-sdk'

const appId = process.env.NEXT_PUBLIC_CIRCLE_APP_ID as string
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string

type LoginResult = {
  userToken: string
  encryptionKey: string
}

type Wallet = {
  id: string
  address: string
  blockchain: string
}

interface WalletContextValue {
  isConnected: boolean
  isConnecting: boolean
  address: string | null
  walletId: string | null
  userToken: string | null
  encryptionKey: string | null
  connect: () => void
  disconnect: () => void
  executeChallenge: (challengeId: string) => Promise<void>
  error: string | null
}

const WalletContext = createContext<WalletContextValue | null>(null)

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet must be used within WalletProvider')
  return ctx
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const sdkRef = useRef<W3SSdkType | null>(null)

  const [sdkReady, setSdkReady] = useState(false)
  const [deviceId, setDeviceId] = useState('')
  const [deviceToken, setDeviceToken] = useState('')
  const [deviceEncryptionKey, setDeviceEncryptionKey] = useState('')

  const [loginResult, setLoginResult] = useState<LoginResult | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [walletId, setWalletId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Track whether we've already handled post-login to avoid double-runs
  const postLoginHandled = useRef(false)

  const loadWallets = useCallback(async (userToken: string) => {
    const response = await fetch('/api/endpoints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'listWallets', userToken }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to load wallets')

    const wallets = (data.wallets as Wallet[]) || []
    if (wallets.length > 0) {
      setAddress(wallets[0].address)
      setWalletId(wallets[0].id)
      setIsConnected(true)
    }
  }, [])

  const handlePostLogin = useCallback(
    async (result: LoginResult) => {
      if (postLoginHandled.current) return
      postLoginHandled.current = true

      try {
        setIsConnecting(true)
        setError(null)

        // Step 1: Initialize user
        const initRes = await fetch('/api/endpoints', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'initializeUser',
            userToken: result.userToken,
          }),
        })
        const initData = await initRes.json()

        if (!initRes.ok) {
          // Error 155106 = user already initialized, just load wallets
          if (initData.code === 155106) {
            await loadWallets(result.userToken)
            return
          }
          throw new Error(initData.error || initData.message || 'Failed to initialize user')
        }

        // Step 2: Execute challenge to create wallet
        const sdk = sdkRef.current
        if (!sdk || !initData.challengeId) {
          throw new Error('SDK not ready or missing challengeId')
        }

        sdk.setAuthentication({
          userToken: result.userToken,
          encryptionKey: result.encryptionKey,
        })

        await new Promise<void>((resolve, reject) => {
          sdk.execute(initData.challengeId, (executeError: unknown) => {
            if (executeError) {
              reject(new Error((executeError as Error).message || 'Challenge execution failed'))
            } else {
              resolve()
            }
          })
        })

        // Wait briefly for wallet creation to propagate
        await new Promise((resolve) => setTimeout(resolve, 2000))
        await loadWallets(result.userToken)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Connection failed'
        setError(message)
        console.error('Wallet connection error:', err)
      } finally {
        setIsConnecting(false)
      }
    },
    [loadWallets],
  )

  // Initialize SDK
  useEffect(() => {
    let cancelled = false

    const initSdk = async () => {
      try {
        const { W3SSdk } = await import('@circle-fin/w3s-pw-web-sdk')
        const { SocialLoginProvider } = await import(
          '@circle-fin/w3s-pw-web-sdk/dist/src/types'
        )

        // Keep SocialLoginProvider accessible for connect()
        ;(window as any).__SocialLoginProvider = SocialLoginProvider

        const onLoginComplete = (err: unknown, result: any) => {
          if (cancelled) return

          if (err) {
            console.error('Login failed:', err)
            setError((err as Error).message || 'Login failed')
            setIsConnecting(false)
            return
          }

          const loginRes: LoginResult = {
            userToken: result.userToken,
            encryptionKey: result.encryptionKey,
          }
          setLoginResult(loginRes)
        }

        const restoredDeviceToken = (getCookie('deviceToken') as string) || ''
        const restoredDeviceEncryptionKey =
          (getCookie('deviceEncryptionKey') as string) || ''

        const initialConfig = {
          appSettings: { appId },
          loginConfigs: {
            deviceToken: restoredDeviceToken,
            deviceEncryptionKey: restoredDeviceEncryptionKey,
            google: {
              clientId: googleClientId,
              redirectUri:
                typeof window !== 'undefined' ? window.location.origin : '',
              selectAccountPrompt: true,
            },
          },
        }

        const sdk = new W3SSdk(initialConfig, onLoginComplete)
        sdkRef.current = sdk

        if (!cancelled) {
          setSdkReady(true)

          // Get deviceId
          const cached = localStorage.getItem('circle-deviceId')
          if (cached) {
            setDeviceId(cached)
          } else {
            const id = await sdk.getDeviceId()
            setDeviceId(id)
            localStorage.setItem('circle-deviceId', id)
          }
        }
      } catch (err) {
        console.error('Failed to initialize Web SDK:', err)
      }
    }

    void initSdk()
    return () => {
      cancelled = true
    }
  }, [])

  // When loginResult arrives (after Google redirect), run the post-login flow
  useEffect(() => {
    if (loginResult) {
      void handlePostLogin(loginResult)
    }
  }, [loginResult, handlePostLogin])

  const connect = useCallback(async () => {
    const sdk = sdkRef.current
    if (!sdk || !sdkReady) {
      setError('SDK not ready yet')
      return
    }

    setIsConnecting(true)
    setError(null)
    postLoginHandled.current = false

    try {
      // Step 1: Create device token if we don't have one
      let dToken = deviceToken
      let dEncKey = deviceEncryptionKey

      if (!dToken) {
        if (!deviceId) {
          setError('Missing deviceId')
          setIsConnecting(false)
          return
        }

        const res = await fetch('/api/endpoints', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'createDeviceToken', deviceId }),
        })
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || 'Failed to create device token')
        }

        dToken = data.deviceToken
        dEncKey = data.deviceEncryptionKey
        setDeviceToken(dToken)
        setDeviceEncryptionKey(dEncKey)

        setCookie('deviceToken', dToken)
        setCookie('deviceEncryptionKey', dEncKey)
      }

      // Step 2: Update SDK config and trigger Google login
      setCookie('appId', appId)
      setCookie('google.clientId', googleClientId)
      setCookie('deviceToken', dToken)
      setCookie('deviceEncryptionKey', dEncKey)

      sdk.updateConfigs({
        appSettings: { appId },
        loginConfigs: {
          deviceToken: dToken,
          deviceEncryptionKey: dEncKey,
          google: {
            clientId: googleClientId,
            redirectUri: window.location.origin,
            selectAccountPrompt: true,
          },
        },
      })

      const SocialLoginProvider = (window as any).__SocialLoginProvider
      sdk.performLogin(SocialLoginProvider.GOOGLE)
      // Browser will redirect to Google. On return, onLoginComplete fires.
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Connection failed'
      setError(message)
      setIsConnecting(false)
    }
  }, [sdkReady, deviceId, deviceToken, deviceEncryptionKey])

  const executeChallenge = useCallback(
    async (challengeId: string) => {
      const sdk = sdkRef.current
      if (!sdk || !loginResult) {
        throw new Error('SDK not ready or user not logged in')
      }

      sdk.setAuthentication({
        userToken: loginResult.userToken,
        encryptionKey: loginResult.encryptionKey,
      })

      return new Promise<void>((resolve, reject) => {
        sdk.execute(challengeId, (executeError: unknown) => {
          if (executeError) {
            reject(
              new Error(
                (executeError as Error).message || 'Challenge execution failed',
              ),
            )
          } else {
            resolve()
          }
        })
      })
    },
    [loginResult],
  )

  const disconnect = useCallback(() => {
    setIsConnected(false)
    setAddress(null)
    setWalletId(null)
    setLoginResult(null)
    setError(null)
    postLoginHandled.current = false
  }, [])

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        isConnecting,
        address,
        walletId,
        userToken: loginResult?.userToken ?? null,
        encryptionKey: loginResult?.encryptionKey ?? null,
        connect,
        disconnect,
        executeChallenge,
        error,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

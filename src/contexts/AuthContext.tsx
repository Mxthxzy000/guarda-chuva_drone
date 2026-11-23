import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { dataService } from '../services/dataService'
import type { ActionResult, UserProfile } from '../types'

interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  isLiveSupabase: boolean
  login: (email: string, password: string) => Promise<ActionResult<UserProfile>>
  register: (data: {
    nome: string
    email: string
    bairro: string
    password: string
  }) => Promise<ActionResult<UserProfile>>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    const profile = await dataService.getCurrentSessionProfile()
    setUser(profile)
  }

  useEffect(() => {
    let active = true

    const init = async () => {
      try {
        const profile = await dataService.getCurrentSessionProfile()
        if (active) setUser(profile)
      } finally {
        if (active) setLoading(false)
      }
    }

    init()

    if (isSupabaseConfigured && supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!active) return
        if (!session?.user) {
          setUser(null)
          return
        }
        const profile = await dataService.getCurrentSessionProfile()
        if (active) setUser(profile)
      })
      return () => {
        active = false
        subscription.unsubscribe()
      }
    }

    return () => {
      active = false
    }
  }, [])

  const login = async (email: string, password: string) => {
    const result = await dataService.login({ email, password })
    if (result.ok && result.data) {
      setUser(result.data)
    }
    return result
  }

  const register = async (params: {
    nome: string
    email: string
    bairro: string
    password: string
  }) => {
    const result = await dataService.register(params)
    if (result.ok && result.data) {
      setUser(result.data)
    }
    return result
  }

  const logout = async () => {
    await dataService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isLiveSupabase: dataService.isLiveSupabase(),
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider')
  }
  return ctx
}

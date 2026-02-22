import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../api/supabase"
import type { Session } from "@supabase/supabase-js"

type AuthContextType = {
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as any)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })

    if (error) throw error
    if (!data.user) throw new Error("Erro ao criar conta")
  }

  return (
    <AuthContext.Provider value={{ session, loading, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

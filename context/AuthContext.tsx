'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  modalOpen: boolean
  modalTab: 'login' | 'register'
  openModal: (tab?: 'login' | 'register') => void
  closeModal: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTab, setModalTab] = useState<'login' | 'register'>('login')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openModal = useCallback((tab: 'login' | 'register' = 'login') => {
    setModalTab(tab)
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => setModalOpen(false), [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [supabase])

  return (
    <AuthContext.Provider
      value={{ user, session, loading, modalOpen, modalTab, openModal, closeModal, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

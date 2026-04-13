'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export default function AuthModal() {
  const { modalOpen, modalTab, closeModal, openModal } = useAuth()
  const supabase = createClient()

  const [tab, setTab] = useState<'login' | 'register'>(modalTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Sync tab with external trigger
  useEffect(() => { setTab(modalTab) }, [modalTab])

  // Reset form on close
  useEffect(() => {
    if (!modalOpen) {
      setEmail('')
      setPassword('')
      setUsername('')
      setFullName('')
      setError(null)
      setSuccess(null)
    }
  }, [modalOpen])

  if (!modalOpen) return null

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else closeModal()
    setLoading(false)
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, username } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        username: username || email.split('@')[0],
        full_name: fullName || null,
        avatar_url: null,
        bio: null,
        created_at: new Date().toISOString(),
      })
    }

    setSuccess('¡Cuenta creada! Revisa tu email para confirmar.')
    setLoading(false)
  }

  async function handleGoogle() {
    setError(null)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={closeModal}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[#f7f7f7] text-[#737373] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo */}
        <div className="text-center mb-6">
          <span className="text-2xl font-semibold">
            <span className="text-[#e85d04]">Tu</span>ChefSoy
          </span>
          <p className="text-sm text-[#737373] mt-1">
            {tab === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta gratis'}
          </p>
        </div>

        {/* Google OAuth */}
        <button
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-[#f0f0f0] rounded-xl text-sm font-medium text-[#111] hover:bg-[#f7f7f7] transition-colors mb-5"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar con Google
        </button>

        {/* Divider */}
        <div className="relative flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-[#f0f0f0]" />
          <span className="text-xs text-[#737373]">o con email</span>
          <div className="flex-1 h-px bg-[#f0f0f0]" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 p-1 bg-[#f7f7f7] rounded-xl">
          {(['login', 'register'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null) }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                tab === t ? 'bg-white text-[#111] shadow-sm' : 'text-[#737373] hover:text-[#111]'
              }`}
            >
              {t === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        {/* Error / Success */}
        {error && (
          <div className="mb-4 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 px-3 py-2 bg-green-50 border border-green-100 rounded-lg text-xs text-green-600">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="flex flex-col gap-3">
          {tab === 'register' && (
            <>
              <input
                type="text"
                placeholder="Nombre completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-field"
                required
              />
              <input
                type="text"
                placeholder="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                className="input-field"
                required
              />
            </>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
            minLength={6}
            autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full py-2.5 text-sm font-medium text-white bg-[#e85d04] hover:bg-[#c94e00] disabled:opacity-60 rounded-xl transition-colors"
          >
            {loading ? 'Cargando...' : tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>

        {/* Switch tab */}
        <p className="text-center text-xs text-[#737373] mt-4">
          {tab === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
          <button
            onClick={() => openModal(tab === 'login' ? 'register' : 'login')}
            className="text-[#e85d04] font-medium hover:underline"
          >
            {tab === 'login' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>

      <style>{`
        .input-field {
          width: 100%;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          background: #f7f7f7;
          border: 1px solid #f0f0f0;
          border-radius: 0.75rem;
          outline: none;
          transition: border-color 0.15s, background-color 0.15s;
        }
        .input-field:focus {
          border-color: #e85d04;
          background: #fff;
        }
        .input-field::placeholder {
          color: #a0a0a0;
        }
      `}</style>
    </div>
  )
}

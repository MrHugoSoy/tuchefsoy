'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function Topbar() {
  const { user, loading, openModal, signOut } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Sync search input with URL
  useEffect(() => {
    setSearch(searchParams.get('q') ?? '')
  }, [searchParams])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = search.trim()
    if (trimmed) {
      router.push(`/?q=${encodeURIComponent(trimmed)}`)
    } else {
      router.push('/')
    }
  }

  function handleClear() {
    setSearch('')
    router.push('/')
  }

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined
  const displayName =
    (user?.user_metadata?.full_name as string) ??
    (user?.user_metadata?.name as string) ??
    user?.email?.split('@')[0] ??
    ''
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center gap-4">

<Link href="/">
  <Image
    src="/logo.svg"
    alt="TuChefSoy"
    width={160}
    height={78}
    priority
  />
</Link>

        {/* Buscador */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar recetas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-9 py-2 text-sm bg-[#f7f7f7] border border-border rounded-full outline-none focus:border-brand focus:bg-white transition-colors placeholder:text-[#a0a0a0]"
            />
            {search && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted hover:text-[#111] transition-colors"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </form>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link href="/" className="px-3 py-1.5 rounded-lg text-[#555] hover:text-[#111] hover:bg-[#f7f7f7] transition-colors">
            Explorar
          </Link>
          {user && (
            <Link href="/perfil" className="px-3 py-1.5 rounded-lg text-[#555] hover:text-[#111] hover:bg-[#f7f7f7] transition-colors">
              Mi perfil
            </Link>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <Link
              href="/create"
              className="shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-hover rounded-full transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Subir receta</span>
            </Link>
          ) : (
            <button
              onClick={() => openModal('login')}
              className="shrink-0 px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-hover rounded-full transition-colors"
            >
              Iniciar sesión
            </button>
          )}

          {!loading && user && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-8 h-8 rounded-full overflow-hidden border border-border shrink-0 focus:outline-none focus:ring-2 focus:ring-brand"
              >
                {avatarUrl ? (
                  <Image src={avatarUrl} alt={displayName} width={32} height={32} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#fff5ee] text-brand text-xs font-semibold">
                    {initials}
                  </div>
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-10 w-44 bg-white border border-border rounded-xl shadow-lg py-1 z-50">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium text-[#111] truncate">{displayName}</p>
                    <p className="text-xs text-muted truncate">{user.email}</p>
                  </div>
                  <Link href="/perfil" onClick={() => setMenuOpen(false)} className="block px-3 py-2 text-sm text-[#555] hover:bg-[#f7f7f7] hover:text-[#111] transition-colors">
                    Mi perfil
                  </Link>
                  <button
                    onClick={() => { setMenuOpen(false); signOut() }}
                    className="w-full text-left px-3 py-2 text-sm text-[#555] hover:bg-[#f7f7f7] hover:text-[#111] transition-colors border-t border-border"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
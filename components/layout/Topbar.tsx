'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Topbar() {
  const [search, setSearch] = useState('')

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#f0f0f0]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex-shrink-0 flex items-center gap-2 font-semibold text-xl tracking-tight text-[#111]"
        >
          <span className="text-[#e85d04]">Tu</span>
          <span>ChefSoy</span>
        </Link>

        {/* Buscador */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Buscar recetas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-[#f7f7f7] border border-[#f0f0f0] rounded-full outline-none focus:border-[#e85d04] focus:bg-white transition-colors placeholder:text-[#a0a0a0]"
            />
          </div>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg text-[#555] hover:text-[#111] hover:bg-[#f7f7f7] transition-colors"
          >
            Explorar
          </Link>
          <Link
            href="/mis-recetas"
            className="px-3 py-1.5 rounded-lg text-[#555] hover:text-[#111] hover:bg-[#f7f7f7] transition-colors"
          >
            Mis recetas
          </Link>
        </nav>

        {/* CTA */}
        <Link
          href="/nueva-receta"
          className="ml-auto flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#e85d04] hover:bg-[#c94e00] rounded-full transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Subir receta</span>
        </Link>
      </div>
    </header>
  )
}

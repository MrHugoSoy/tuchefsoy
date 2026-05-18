'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import type { ChefRecommendation } from '@/types'
import { useAuth } from '@/context/AuthContext'

type GeneratedRecipe = ChefRecommendation & { generated: true; full_recipe: string }

const CATEGORY_EMOJI: Record<string, string> = {
  Desayunos: '🌅', Comidas: '🍽️', Cenas: '🌙', Postres: '🍰',
  Bebidas: '🥤', Vegano: '🥗', 'Sin gluten': '🌾', Snacks: '🍿',
}

function matchColors(pct: number) {
  if (pct >= 80) return { bg: '#dcfce7', text: '#15803d', dot: '#22c55e' }
  if (pct >= 50) return { bg: '#fef9c3', text: '#854d0e', dot: '#eab308' }
  return { bg: '#ffedd5', text: '#9a3412', dot: '#f97316' }
}

function MatchBadge({ pct }: { pct: number }) {
  const c = matchColors(pct)
  return (
    <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: c.bg, color: c.text }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: c.dot }} />
      {pct}%
    </span>
  )
}

const FEATURES = [
  'Recetas que puedes hacer ahora mismo',
  'Recetas nuevas creadas por IA',
  '3 consultas gratuitas cada día',
]

export default function ChefAssistant() {
  const { user, loading: authLoading, openModal } = useAuth()

  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<ChefRecommendation[] | null>(null)
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [remaining, setRemaining] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function addTag(raw: string) {
    const parts = raw.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    setTags(prev => {
      const next = [...prev]
      for (const p of parts) if (!next.includes(p)) next.push(p)
      return next
    })
    setTagInput('')
  }

  function removeTag(i: number) {
    setTags(prev => prev.filter((_, idx) => idx !== i))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (tagInput.trim()) addTag(tagInput)
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(prev => prev.slice(0, -1))
    }
  }

  async function handleAsk() {
    const pending = tagInput.trim() ? tagInput.split(',').map(s => s.trim()).filter(Boolean) : []
    const allTags = [...tags, ...pending.filter(p => !tags.includes(p))]
    if (!allTags.length) return

    setTags(allTags)
    setTagInput('')
    setLoading(true)
    setError(null)
    setRecommendations(null)
    setGeneratedRecipe(null)

    try {
      const res = await fetch('/api/chef', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients: allTags }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error desconocido')
      setRecommendations(data.recommendations ?? [])
      setGeneratedRecipe(data.generatedRecipe ?? null)
      if (typeof data.remaining === 'number') setRemaining(data.remaining)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al consultar al chef')
    } finally {
      setLoading(false)
    }
  }

  const hasResults = recommendations !== null
  const totalResults = (recommendations?.length ?? 0) + (generatedRecipe ? 1 : 0)
  const canSubmit = (tags.length > 0 || tagInput.trim().length > 0) && remaining !== 0 && !loading

  return (
    <div className="rounded-2xl border border-border overflow-hidden shadow-sm bg-white">

      {/* Header con gradiente */}
      <div className="px-5 py-4 bg-gradient-to-br from-[#e85d04] to-[#c94d00]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <svg className="w-4 h-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h2 className="text-sm font-semibold text-white">Chef IA</h2>
            </div>
            <p className="text-xs text-white/70">Dime qué tienes y te digo qué cocinar</p>
          </div>

          {remaining !== null && (
            <div className="flex flex-col items-end gap-1">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i < remaining ? 'bg-white' : 'bg-white/25'}`} />
                ))}
              </div>
              <span className="text-[10px] text-white/60">{remaining}/3 hoy</span>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {authLoading ? (
          <div className="flex items-center justify-center py-10">
            <svg className="w-5 h-5 animate-spin text-brand" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>

        ) : !user ? (
          <div className="py-1">
            <div className="w-10 h-10 rounded-xl bg-[#fff5ee] flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-[#111] mb-0.5">Tu chef personal con IA</p>
            <p className="text-xs text-muted mb-4">Crea una cuenta gratis y obtén 3 consultas al día.</p>
            <ul className="flex flex-col gap-2 mb-5">
              {FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-xs text-[#555]">
                  <svg className="w-3.5 h-3.5 text-brand shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={() => openModal('register')} className="w-full py-2.5 text-sm font-semibold text-white bg-brand hover:bg-brand-hover rounded-xl transition-colors">
              Crear cuenta gratis
            </button>
            <button onClick={() => openModal('login')} className="mt-2 w-full py-2 text-xs text-muted hover:text-[#111] transition-colors">
              Ya tengo cuenta — Iniciar sesión
            </button>
          </div>

        ) : (
          <>
            {/* Input de chips */}
            <div className="mb-3">
              <div
                className="flex flex-wrap gap-1.5 p-2.5 border border-border rounded-xl bg-[#f7f7f7] focus-within:border-brand focus-within:bg-white transition-colors cursor-text min-h-[52px] items-center"
                onClick={() => inputRef.current?.focus()}
              >
                {tags.map((tag, i) => (
                  <span key={i} className="flex items-center gap-1 pl-2.5 pr-1.5 py-1 bg-white border border-[#e8e8e8] rounded-full text-xs font-medium text-[#333] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
                    {tag}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeTag(i) }}
                      className="w-3.5 h-3.5 rounded-full text-[#a0a0a0] hover:text-[#111] flex items-center justify-center transition-colors"
                    >
                      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
                <input
                  ref={inputRef}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => tagInput.trim() && addTag(tagInput)}
                  placeholder={tags.length === 0 ? 'tomate, huevo, queso...' : 'Añadir...'}
                  className="flex-1 min-w-[80px] bg-transparent outline-none text-sm placeholder:text-[#b0b0b0]"
                />
              </div>
              <p className="text-[10px] text-muted mt-1.5 ml-0.5">Enter o coma para agregar cada ingrediente</p>
            </div>

            <button
              onClick={handleAsk}
              disabled={!canSubmit}
              className="w-full py-2.5 text-sm font-semibold text-white bg-brand hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Analizando ingredientes...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  ¿Qué puedo cocinar?
                </>
              )}
            </button>

            {error && (
              <div className="mt-3 flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                <svg className="w-3.5 h-3.5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Resultados */}
            {hasResults && !loading && (
              <div className="mt-5 pt-4 border-t border-[#f0f0f0]">
                {totalResults === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-sm font-medium text-[#111]">Sin coincidencias</p>
                    <p className="text-xs text-muted mt-1">Agrega más ingredientes e inténtalo de nuevo.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-3">
                      {totalResults} sugerencia{totalResults !== 1 ? 's' : ''}
                    </p>

                    <div className="flex flex-col gap-2">
                      {recommendations?.map((rec) => (
                        <Link
                          key={rec.id}
                          href={rec.slug ? `/receta/${rec.slug}` : `/recipe/${rec.id}`}
                          className="group flex items-start gap-3 p-3 rounded-xl border border-[#f0f0f0] hover:border-brand/30 hover:bg-[#fff8f5] transition-all"
                        >
                          <div className="shrink-0 w-8 h-8 rounded-lg bg-[#f7f7f7] flex items-center justify-center text-sm">
                            {CATEGORY_EMOJI[rec.category] ?? '🍴'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <span className="text-sm font-medium text-[#111] group-hover:text-brand transition-colors leading-snug line-clamp-2">
                                {rec.title}
                              </span>
                              <MatchBadge pct={rec.match_percentage} />
                            </div>
                            {rec.missing_ingredients.length > 0 && (
                              <p className="text-[11px] text-muted">
                                Falta: {rec.missing_ingredients.slice(0, 3).join(', ')}{rec.missing_ingredients.length > 3 ? '…' : ''}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}

                      {generatedRecipe && (
                        <div className="p-3.5 rounded-xl border border-brand/15 bg-gradient-to-br from-[#fff8f5] to-[#fff0e6]">
                          <div className="flex items-center gap-1.5 mb-2.5">
                            <svg className="w-3 h-3 text-brand" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z" />
                            </svg>
                            <span className="text-[10px] font-bold text-brand uppercase tracking-widest">IA exclusiva</span>
                            <MatchBadge pct={generatedRecipe.match_percentage} />
                          </div>
                          <p className="text-sm font-semibold text-[#111] mb-2 leading-snug">
                            {generatedRecipe.title}
                          </p>
                          <p className="text-xs text-[#555] leading-relaxed">
                            {generatedRecipe.full_recipe}
                          </p>
                          {generatedRecipe.missing_ingredients.length > 0 && (
                            <p className="text-[11px] text-muted mt-2">
                              Falta: {generatedRecipe.missing_ingredients.join(', ')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

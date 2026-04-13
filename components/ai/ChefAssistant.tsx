'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ChefRecommendation } from '@/types'

type GeneratedRecipe = ChefRecommendation & { generated: true; full_recipe: string }

const CATEGORY_EMOJI: Record<string, string> = {
  Desayunos: '🌅', Comidas: '🍽️', Cenas: '🌙', Postres: '🍰',
  Bebidas: '🥤', Vegano: '🥗', 'Sin gluten': '🌾', Snacks: '🍿', Todo: '✨',
}

function matchColor(pct: number) {
  if (pct >= 80) return '#22c55e'
  if (pct >= 50) return '#f59e0b'
  return '#e85d04'
}

export default function ChefAssistant() {
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<ChefRecommendation[] | null>(null)
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAsk() {
    const ingredients = inputValue.split(',').map((s) => s.trim()).filter(Boolean)
    if (!ingredients.length) return

    setLoading(true)
    setError(null)
    setRecommendations(null)
    setGeneratedRecipe(null)

    try {
      const res = await fetch('/api/chef', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error desconocido')
      setRecommendations(data.recommendations ?? [])
      setGeneratedRecipe(data.generatedRecipe ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al consultar al chef')
    } finally {
      setLoading(false)
    }
  }

  const hasResults = recommendations !== null
  const totalResults = (recommendations?.length ?? 0) + (generatedRecipe ? 1 : 0)

  return (
    <div className="rounded-[12px] border border-border overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border bg-[#fff5ee]">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xl">👨‍🍳</span>
          <h2 className="font-semibold text-[#111]">IA Chef</h2>
        </div>
        <p className="text-xs text-muted">¿Qué tengo en la nevera? Te digo qué cocinar.</p>
      </div>

      {/* Body */}
      <div className="p-5">
        <label className="block text-xs font-medium text-[#555] mb-2">
          Ingredientes disponibles (separados por coma)
        </label>
        <textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="huevos, tomate, cebolla, queso..."
          rows={3}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleAsk() }}
          className="w-full px-3 py-2.5 text-sm bg-[#f7f7f7] border border-border rounded-xl outline-none focus:border-brand focus:bg-white transition-colors placeholder:text-[#a0a0a0] resize-none font-sans"
        />

        <button
          onClick={handleAsk}
          disabled={loading || !inputValue.trim()}
          className="mt-3 w-full py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand-hover disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Analizando...
            </>
          ) : '¿Qué puedo cocinar?'}
        </button>

        {error && (
          <div className="mt-4 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Resultados */}
        {hasResults && (
          <div className="mt-5">
            {totalResults === 0 ? (
              <p className="text-sm text-muted text-center py-3">
                No encontré recetas con esos ingredientes. ¡Prueba con otros!
              </p>
            ) : (
              <>
                <p className="text-xs text-muted mb-3">
                  {totalResults} sugerencia{totalResults !== 1 ? 's' : ''}
                </p>

                <div className="flex flex-col gap-3">
                  {/* Recetas existentes */}
                  {recommendations?.map((rec) => (
                    <Link
                      key={rec.id}
                      href={`/recipe/${rec.id}`}
                      className="block p-3 rounded-xl border border-border hover:border-brand hover:bg-[#fff5ee] transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="text-sm font-medium text-[#111] group-hover:text-brand transition-colors leading-snug">
                          {CATEGORY_EMOJI[rec.category] ?? '🍴'} {rec.title}
                        </span>
                        <span
                          className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: matchColor(rec.match_percentage) }}
                        >
                          {rec.match_percentage}%
                        </span>
                      </div>
                      {rec.missing_ingredients.length > 0 && (
                        <p className="text-xs text-muted">
                          Falta: {rec.missing_ingredients.join(', ')}
                        </p>
                      )}
                    </Link>
                  ))}

                  {/* Receta generada por IA */}
                  {generatedRecipe && (
                    <div className="p-3 rounded-xl border border-dashed border-brand bg-[#fff5ee]">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-sm font-medium text-[#111] leading-snug">
                          ✨ {generatedRecipe.title}
                        </span>
                        <span
                          className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: matchColor(generatedRecipe.match_percentage) }}
                        >
                          {generatedRecipe.match_percentage}%
                        </span>
                      </div>
                      <p className="text-xs text-[#555] leading-relaxed mb-1.5">
                        {generatedRecipe.full_recipe}
                      </p>
                      {generatedRecipe.missing_ingredients.length > 0 && (
                        <p className="text-xs text-muted">
                          Falta: {generatedRecipe.missing_ingredients.join(', ')}
                        </p>
                      )}
                      <span className="inline-block mt-2 text-[10px] font-medium text-brand bg-white border border-brand/20 px-2 py-0.5 rounded-full">
                        Receta generada por IA
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

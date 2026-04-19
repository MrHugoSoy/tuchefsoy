'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface FavoriteButtonProps {
  recipeId: string
  size?: 'sm' | 'md'
}

export default function FavoriteButton({ recipeId, size = 'sm' }: FavoriteButtonProps) {
  const { user, openModal } = useAuth()
  const supabase = createClient()
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase
      .from('recipe_favorites')
      .select('id')
      .eq('recipe_id', recipeId)
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setSaved(true)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, recipeId])

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { openModal('login'); return }
    if (loading) return
    setLoading(true)

    const nextSaved = !saved
    setSaved(nextSaved)

    if (nextSaved) {
      await supabase.from('recipe_favorites').insert({ recipe_id: recipeId, user_id: user.id })
    } else {
      await supabase.from('recipe_favorites').delete().eq('recipe_id', recipeId).eq('user_id', user.id)
    }
    setLoading(false)
  }

  if (size === 'md') {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-colors ${
          saved
            ? 'border-brand bg-[#fff5ee] text-brand'
            : 'border-border text-[#555] hover:border-brand hover:text-brand hover:bg-[#fff5ee]'
        }`}
      >
        <svg
          className={`w-4 h-4 transition-colors ${saved ? 'fill-brand stroke-brand' : 'fill-none stroke-current'}`}
          viewBox="0 0 24 24" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        {saved ? 'Guardado' : 'Guardar'}
      </button>
    )
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      aria-label={saved ? 'Quitar de favoritos' : 'Guardar receta'}
      className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
        saved
          ? 'bg-brand/10 text-brand'
          : 'bg-white/90 text-[#555] hover:bg-white'
      }`}
    >
      <svg
        className={`w-3.5 h-3.5 transition-colors ${saved ? 'fill-brand stroke-brand' : 'fill-none stroke-[#555]'}`}
        viewBox="0 0 24 24" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    </button>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface StarRatingProps {
  recipeId: string
  initialAvg: number
  initialCount: number
}

export default function StarRating({ recipeId, initialAvg, initialCount }: StarRatingProps) {
  const { user, openModal } = useAuth()
  const supabase = createClient()

  const [hoveredStar, setHoveredStar] = useState(0)
  const [userRating, setUserRating] = useState(0)
  const [avg, setAvg] = useState(initialAvg)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const [justRated, setJustRated] = useState(false)

  // Load user's existing rating
  useEffect(() => {
    if (!user) return
    supabase
      .from('recipe_ratings')
      .select('rating')
      .eq('recipe_id', recipeId)
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) setUserRating(data.rating)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, recipeId])

  async function handleRate(rating: number) {
    if (!user) {
      openModal('login')
      return
    }
    if (loading) return
    setLoading(true)

    const hadPreviousRating = userRating > 0

    // Upsert the rating
    await supabase
      .from('recipe_ratings')
      .upsert(
        { recipe_id: recipeId, user_id: user.id, rating },
        { onConflict: 'recipe_id,user_id' }
      )

    // Recalculate average
    const { data: allRatings } = await supabase
      .from('recipe_ratings')
      .select('rating')
      .eq('recipe_id', recipeId)

    if (allRatings && allRatings.length > 0) {
      const total = allRatings.reduce((sum, r) => sum + r.rating, 0)
      const newAvg = Math.round((total / allRatings.length) * 10) / 10
      const newCount = allRatings.length

      await supabase
        .from('recipes')
        .update({ rating_avg: newAvg, rating_count: newCount })
        .eq('id', recipeId)

      setAvg(newAvg)
      setCount(newCount)
    }

    setUserRating(rating)
    setJustRated(true)
    setTimeout(() => setJustRated(false), 2000)
    setLoading(false)
  }

  const displayRating = hoveredStar || userRating

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        {/* Stars */}
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              disabled={loading}
              className="p-0.5 transition-transform hover:scale-110 disabled:opacity-50"
              aria-label={`Calificar ${star} estrellas`}
            >
              <svg
                className="w-6 h-6 transition-colors"
                viewBox="0 0 24 24"
                fill={star <= displayRating ? '#f59e0b' : 'none'}
                stroke={star <= displayRating ? '#f59e0b' : '#d0d0d0'}
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              </svg>
            </button>
          ))}
        </div>

        {/* Average display */}
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-semibold text-[#111]">
            {avg > 0 ? avg.toFixed(1) : '—'}
          </span>
          <span className="text-xs text-muted">
            ({count} {count === 1 ? 'voto' : 'votos'})
          </span>
        </div>
      </div>

      {/* Feedback */}
      {justRated && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          ¡Gracias por calificar!
        </p>
      )}
      {!justRated && userRating > 0 && (
        <p className="text-xs text-muted">Tu calificación: {userRating} {userRating === 1 ? 'estrella' : 'estrellas'}</p>
      )}
      {!justRated && !userRating && (
        <p className="text-xs text-muted">Haz clic en las estrellas para calificar</p>
      )}
    </div>
  )
}
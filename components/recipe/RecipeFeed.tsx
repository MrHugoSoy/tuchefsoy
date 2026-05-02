'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import RecipeCard from '@/components/recipe/RecipeCard'
import RecipeCardSkeleton from '@/components/recipe/RecipeCardSkeleton'
import type { Recipe } from '@/types'

interface RecipeFeedProps {
  initialRecipes: Recipe[]
  category: string
  q: string
  sort: string
}

const PAGE_SIZE = 30

export default function RecipeFeed({ initialRecipes, category, q, sort }: RecipeFeedProps) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes)
  const [offset, setOffset] = useState(initialRecipes.length)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(initialRecipes.length < PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || done) return
    setLoading(true)

    try {
      const params = new URLSearchParams({ category, q, sort, offset: String(offset) })
      const res = await fetch(`/api/recipes?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setRecipes((prev) => [...prev, ...data.recipes])
      setOffset((prev) => prev + data.recipes.length)
      if (!data.hasMore) setDone(true)
    } catch {
      // silently fail — user puede volver a hacer scroll
    } finally {
      setLoading(false)
    }
  }, [loading, done, category, q, sort, offset])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: '300px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <>
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="break-inside-avoid">
            <RecipeCard recipe={recipe} />
          </div>
        ))}
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <div key={`sk-${i}`} className="break-inside-avoid">
            <RecipeCardSkeleton />
          </div>
        ))}
      </div>

      {!done && <div ref={sentinelRef} className="h-4 mt-5" />}

      {done && recipes.length > 0 && (
        <p className="text-center text-sm text-muted mt-10 pb-4">
          Ya viste todas las recetas ✓
        </p>
      )}
    </>
  )
}

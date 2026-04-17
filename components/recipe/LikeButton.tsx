'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface LikeButtonProps {
  recipeId: string
  initialLikes: number
  initialLiked: boolean
  recipeTitle?: string
  recipeAuthorId?: string
}

export default function LikeButton({ recipeId, initialLikes, initialLiked, recipeTitle, recipeAuthorId }: LikeButtonProps) {
  const { user, openModal } = useAuth()
  const supabase = createClient()
  const [liked, setLiked] = useState(initialLiked)
  const [likes, setLikes] = useState(initialLikes)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    if (!user) { openModal('login'); return }
    if (loading) return
    setLoading(true)

    const nextLiked = !liked
    setLiked(nextLiked)
    setLikes((l) => l + (nextLiked ? 1 : -1))

    if (nextLiked) {
      await supabase.from('recipe_likes').insert({ recipe_id: recipeId, user_id: user.id })
      await supabase.from('recipes').update({ likes_count: likes + 1 }).eq('id', recipeId)

      // Notify recipe author (don't notify yourself)
      if (recipeAuthorId && recipeAuthorId !== user.id) {
        const senderName = (user.user_metadata?.full_name as string)
          ?? (user.user_metadata?.name as string)
          ?? user.email?.split('@')[0]
          ?? 'Alguien'

        await supabase.from('notifications').insert({
          user_id: recipeAuthorId,
          type: 'like',
          recipe_id: recipeId,
          from_user_id: user.id,
          message: `${senderName} le dio me gusta a "${recipeTitle ?? 'tu receta'}"`,
        })
      }
    } else {
      await supabase.from('recipe_likes').delete().eq('recipe_id', recipeId).eq('user_id', user.id)
      await supabase.from('recipes').update({ likes_count: likes - 1 }).eq('id', recipeId)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-colors ${
        liked
          ? 'border-brand bg-[#fff5ee] text-brand'
          : 'border-border text-[#555] hover:border-brand hover:text-brand hover:bg-[#fff5ee]'
      }`}
    >
      <svg
        className={`w-4 h-4 transition-colors ${liked ? 'fill-brand stroke-brand' : 'fill-none stroke-current'}`}
        viewBox="0 0 24 24"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {likes} {likes === 1 ? 'me gusta' : 'me gusta'}
    </button>
  )
}
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface FollowButtonProps {
  targetUserId: string
  initialFollowing: boolean
}

export default function FollowButton({ targetUserId, initialFollowing }: FollowButtonProps) {
  const { user, openModal } = useAuth()
  const supabase = createClient()
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    if (!user) { openModal('login'); return }
    if (loading) return
    setLoading(true)

    const nextFollowing = !following
    setFollowing(nextFollowing)

    if (nextFollowing) {
      await supabase.from('user_follows').insert({
        follower_id: user.id,
        following_id: targetUserId,
      })
    } else {
      await supabase.from('user_follows').delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
    }
    setLoading(false)
  }

  if (user?.id === targetUserId) return null

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-5 py-1.5 text-sm font-medium rounded-full border transition-colors disabled:opacity-60 ${
        following
          ? 'border-border text-[#555] hover:border-red-300 hover:text-red-500 hover:bg-red-50'
          : 'border-brand bg-brand text-white hover:bg-brand-hover'
      }`}
    >
      {following ? 'Siguiendo' : 'Seguir'}
    </button>
  )
}
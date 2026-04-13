'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { RecipeComment } from '@/types'

interface CommentSectionProps {
  recipeId: string
}

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return `${Math.floor(diff / 86400)}d`
}

export default function CommentSection({ recipeId }: CommentSectionProps) {
  const { user, openModal } = useAuth()
  const supabase = createClient()
  const [comments, setComments] = useState<RecipeComment[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase
      .from('recipe_comments')
      .select('*, author:profiles(*)')
      .eq('recipe_id', recipeId)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setComments(data as RecipeComment[])
      })
  }, [recipeId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) { openModal('login'); return }
    if (!content.trim() || loading) return
    setLoading(true)

    const { data, error } = await supabase
      .from('recipe_comments')
      .insert({ recipe_id: recipeId, user_id: user.id, content: content.trim() })
      .select('*, author:profiles(*)')
      .single()

    if (!error && data) {
      setComments((prev) => [data as RecipeComment, ...prev])
      setContent('')
    }
    setLoading(false)
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-5">
        Comentarios <span className="text-muted font-normal text-base">({comments.length})</span>
      </h2>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-7">
        <div className="w-8 h-8 rounded-full bg-[#f0f0f0] shrink-0 flex items-center justify-center text-xs text-muted font-semibold overflow-hidden">
          {user?.user_metadata?.avatar_url ? (
            <Image src={user.user_metadata.avatar_url as string} alt="" width={32} height={32} className="object-cover" />
          ) : (
            (user?.email?.[0] ?? '?').toUpperCase()
          )}
        </div>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={user ? 'Escribe un comentario...' : 'Inicia sesión para comentar'}
            onFocus={() => { if (!user) openModal('login') }}
            className="flex-1 px-4 py-2 text-sm bg-[#f7f7f7] border border-border rounded-full outline-none focus:border-brand focus:bg-white transition-colors placeholder:text-[#a0a0a0]"
          />
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-hover disabled:opacity-50 rounded-full transition-colors"
          >
            Enviar
          </button>
        </div>
      </form>

      {/* Lista */}
      <div className="flex flex-col gap-5">
        {comments.length === 0 && (
          <p className="text-sm text-muted text-center py-6">Sé el primero en comentar.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#f0f0f0] shrink-0 overflow-hidden flex items-center justify-center text-xs font-semibold text-muted">
              {c.author?.avatar_url ? (
                <Image src={c.author.avatar_url} alt={c.author.username} width={32} height={32} className="object-cover" />
              ) : (
                (c.author?.username?.[0] ?? '?').toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-[#111]">
                  {c.author?.full_name ?? c.author?.username ?? 'Usuario'}
                </span>
                <span className="text-xs text-muted">{timeAgo(c.created_at)}</span>
              </div>
              <p className="text-sm text-[#333] leading-relaxed">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

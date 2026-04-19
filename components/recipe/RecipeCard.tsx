'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import FavoriteButton from '@/components/recipe/FavoriteButton'
import type { Recipe } from '@/types'

interface RecipeCardProps {
  recipe: Recipe
}

const DIFFICULTY_COLOR: Record<Recipe['difficulty'], string> = {
  Fácil: '#22c55e',
  Media: '#f59e0b',
  Difícil: '#ef4444',
}

function formatViews(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const { user, openModal } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(recipe.likes_count)
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isOwner = user?.id === recipe.author_id
  const isVideo = !!recipe.youtube_url
  const totalTime = recipe.prep_time + recipe.cook_time

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setConfirmDelete(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', onClickOutside)
    }
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [menuOpen])

  useEffect(() => {
    if (!user) return
    supabase
      .from('recipe_likes')
      .select('id')
      .eq('recipe_id', recipe.id)
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => { if (data) setLiked(true) })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, recipe.id])

  async function handleLike(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { openModal('login'); return }
    if (loading) return
    setLoading(true)
    const nextLiked = !liked
    setLiked(nextLiked)
    setLikes((l) => l + (nextLiked ? 1 : -1))
    if (nextLiked) {
      await supabase.from('recipe_likes').insert({ recipe_id: recipe.id, user_id: user.id })
      await supabase.from('recipes').update({ likes_count: likes + 1 }).eq('id', recipe.id)
    } else {
      await supabase.from('recipe_likes').delete().eq('recipe_id', recipe.id).eq('user_id', user.id)
      await supabase.from('recipes').update({ likes_count: likes - 1 }).eq('id', recipe.id)
    }
    setLoading(false)
  }

  function handleMenuToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setMenuOpen((v) => !v)
    setConfirmDelete(false)
  }

  function handleEdit(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/recipe/${recipe.id}/edit`)
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setConfirmDelete(true)
  }

  async function handleConfirmDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDeleting(true)
    if (recipe.image_url) {
      const path = recipe.image_url.split('/storage/v1/object/public/recipes/')[1]
      if (path) await supabase.storage.from('recipes').remove([path])
    }
    await supabase.from('recipe_likes').delete().eq('recipe_id', recipe.id)
    await supabase.from('recipe_comments').delete().eq('recipe_id', recipe.id)
    await supabase.from('recipes').delete().eq('id', recipe.id)
    setDeleting(false)
    setMenuOpen(false)
    router.refresh()
  }

  function handleCancelDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setConfirmDelete(false)
    setMenuOpen(false)
  }

  return (
    <Link
      href={`/recipe/${recipe.id}`}
      className="group block rounded-[12px] border border-[#f0f0f0] bg-white overflow-hidden hover:shadow-md transition-shadow relative"
    >
      <div className="relative aspect-[4/3] bg-[#f0f0f0] overflow-hidden">
        {!imgLoaded && recipe.image_url && (
          <div className="absolute inset-0 bg-gradient-to-r from-[#f0f0f0] via-[#e8e8e8] to-[#f0f0f0] animate-pulse" />
        )}

        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            loading="lazy"
            className={`object-cover group-hover:scale-105 transition-all duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 380px"
            onLoad={() => setImgLoaded(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#d0d0d0]">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Play button overlay for video recipes */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-black/60 rounded-full flex items-center justify-center group-hover:bg-black/80 transition-colors">
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1">
          <span className="px-2.5 py-1 text-xs font-medium bg-white/90 rounded-full text-[#555]">
            {recipe.category}
          </span>
          {isVideo && (
            <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-[#ff0000]/90 text-white rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Video
            </span>
          )}
        </div>

        {/* Like + Favorito */}
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <FavoriteButton recipeId={recipe.id} />
          <button
            onClick={handleLike}
            aria-label={liked ? 'Quitar like' : 'Dar like'}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-white/90 rounded-full transition-colors hover:bg-white"
          >
            <svg
              className={`w-3.5 h-3.5 transition-colors ${liked ? 'fill-[#e85d04] stroke-[#e85d04]' : 'fill-none stroke-[#555]'}`}
              viewBox="0 0 24 24" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className={liked ? 'text-[#e85d04]' : 'text-[#555]'}>{likes}</span>
          </button>
        </div>

        {isOwner && (
          <div className="absolute bottom-3 right-3" ref={menuRef}>
            <button onClick={handleMenuToggle} className="flex items-center justify-center w-8 h-8 bg-white/90 hover:bg-white rounded-full transition-colors">
              <svg className="w-4 h-4 text-[#555]" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute bottom-10 right-0 w-40 bg-white border border-border rounded-xl shadow-lg py-1 z-50">
                {confirmDelete ? (
                  <div className="p-3">
                    <p className="text-xs text-[#555] mb-3">¿Eliminar esta receta? No se puede deshacer.</p>
                    <div className="flex gap-2">
                      <button onClick={handleCancelDelete} className="flex-1 px-2 py-1.5 text-xs font-medium text-[#555] border border-border rounded-lg hover:bg-[#f7f7f7] transition-colors">No</button>
                      <button onClick={handleConfirmDelete} disabled={deleting} className="flex-1 px-2 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 rounded-lg transition-colors">
                        {deleting ? '...' : 'Sí, eliminar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button onClick={handleEdit} className="w-full text-left px-3 py-2 text-sm text-[#555] hover:bg-[#f7f7f7] hover:text-[#111] transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                    <button onClick={handleDeleteClick} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-[#111] text-base leading-snug mb-1 line-clamp-2">
          {recipe.title}
        </h3>

        {recipe.description && (
          <p className="text-sm text-[#737373] line-clamp-2 mb-3">{recipe.description}</p>
        )}

        <div className="flex items-center gap-3 text-xs text-[#737373] mb-3">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {totalTime} min
          </span>
          <span className="flex items-center gap-1 font-medium" style={{ color: DIFFICULTY_COLOR[recipe.difficulty] }}>
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {recipe.difficulty}
          </span>
        </div>

        {recipe.author && (
          <div className="flex items-center justify-between pt-3 border-t border-[#f0f0f0]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-[#f0f0f0] overflow-hidden flex-shrink-0">
                {recipe.author.avatar_url ? (
                  <Image src={recipe.author.avatar_url} alt={recipe.author.username} width={24} height={24} className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-semibold text-[#737373]">
                    {recipe.author.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              <Link
                href={`/perfil/${recipe.author.username}`}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-[#737373] truncate hover:text-brand transition-colors"
              >
                @{recipe.author.username}
              </Link>
            </div>
            <span className="flex items-center gap-1 text-xs text-[#a0a0a0] shrink-0 ml-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {formatViews(recipe.views_count ?? 0)}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
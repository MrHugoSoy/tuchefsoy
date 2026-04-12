'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Recipe } from '@/types'

interface RecipeCardProps {
  recipe: Recipe
}

const DIFFICULTY_COLOR: Record<Recipe['difficulty'], string> = {
  Fácil: '#22c55e',
  Media: '#f59e0b',
  Difícil: '#ef4444',
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(recipe.likes_count)

  const totalTime = recipe.prep_time + recipe.cook_time

  function handleLike(e: React.MouseEvent) {
    e.preventDefault()
    setLiked((prev) => {
      const next = !prev
      setLikes((l) => (next ? l + 1 : l - 1))
      return next
    })
  }

  return (
    <Link
      href={`/recetas/${recipe.id}`}
      className="group block rounded-[12px] border border-[#f0f0f0] bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Imagen */}
      <div className="relative aspect-[4/3] bg-[#f7f7f7] overflow-hidden">
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 380px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#d0d0d0]">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Badge categoría */}
        <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium bg-white/90 rounded-full text-[#555]">
          {recipe.category}
        </span>

        {/* Botón like */}
        <button
          onClick={handleLike}
          aria-label={liked ? 'Quitar like' : 'Dar like'}
          className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-white/90 rounded-full transition-colors hover:bg-white"
        >
          <svg
            className={`w-3.5 h-3.5 transition-colors ${liked ? 'fill-[#e85d04] stroke-[#e85d04]' : 'fill-none stroke-[#555]'}`}
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className={liked ? 'text-[#e85d04]' : 'text-[#555]'}>{likes}</span>
        </button>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="font-semibold text-[#111] text-base leading-snug mb-1 line-clamp-2">
          {recipe.title}
        </h3>

        {recipe.description && (
          <p className="text-sm text-[#737373] line-clamp-2 mb-3">{recipe.description}</p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-[#737373] mb-3">
          {/* Tiempo */}
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {totalTime} min
          </span>

          {/* Porciones */}
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"
              />
            </svg>
            {recipe.servings} {recipe.servings === 1 ? 'porción' : 'porciones'}
          </span>

          {/* Dificultad */}
          <span
            className="flex items-center gap-1 font-medium"
            style={{ color: DIFFICULTY_COLOR[recipe.difficulty] }}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {recipe.difficulty}
          </span>
        </div>

        {/* Autor */}
        {recipe.author && (
          <div className="flex items-center gap-2 pt-3 border-t border-[#f0f0f0]">
            <div className="w-6 h-6 rounded-full bg-[#f0f0f0] overflow-hidden flex-shrink-0">
              {recipe.author.avatar_url ? (
                <Image
                  src={recipe.author.avatar_url}
                  alt={recipe.author.username}
                  width={24}
                  height={24}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] font-semibold text-[#737373]">
                  {recipe.author.username[0].toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-xs text-[#737373] truncate">
              {recipe.author.full_name ?? recipe.author.username}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

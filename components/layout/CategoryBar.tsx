'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { Category } from '@/types'

const CATEGORIES: Category[] = [
  'Todo',
  'Desayunos',
  'Comidas',
  'Cenas',
  'Postres',
  'Bebidas',
  'Vegano',
  'Sin gluten',
  'Snacks',
]

const SORT_OPTIONS = [
  { value: 'recientes', label: 'Recientes' },
  { value: 'likes', label: 'Más likes' },
  { value: 'vistas', label: 'Más vistas' },
]

export default function CategoryBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = (searchParams.get('category') as Category) || 'Todo'
  const activeSort = searchParams.get('sort') || 'recientes'

  function handleClick(cat: Category) {
    const params = new URLSearchParams(searchParams.toString())
    if (cat === 'Todo') {
      params.delete('category')
    } else {
      params.set('category', cat)
    }
    router.push(`/?${params.toString()}`)
  }

  function handleSort(sort: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (sort === 'recientes') {
      params.delete('sort')
    } else {
      params.set('sort', sort)
    }
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="border-b border-[#f0f0f0] bg-white">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center gap-2 py-3">

          {/* Categorías */}
          <div className="flex gap-1 overflow-x-auto scrollbar-none flex-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleClick(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  active === cat
                    ? 'bg-[#e85d04] text-white'
                    : 'bg-[#f7f7f7] text-[#555] hover:bg-[#f0f0f0] hover:text-[#111]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Separador */}
          <div className="w-px h-5 bg-[#e0e0e0] shrink-0" />

          {/* Sort */}
          <div className="flex items-center gap-1 bg-[#f7f7f7] rounded-full p-1 shrink-0">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSort(opt.value)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors whitespace-nowrap ${
                  activeSort === opt.value
                    ? 'bg-white text-[#111] shadow-sm'
                    : 'text-[#737373] hover:text-[#111]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}
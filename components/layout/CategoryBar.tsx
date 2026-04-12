'use client'

import { useState } from 'react'
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

export default function CategoryBar() {
  const [active, setActive] = useState<Category>('Todo')

  return (
    <div className="border-b border-[#f0f0f0] bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-1 overflow-x-auto py-3 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
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
      </div>
    </div>
  )
}

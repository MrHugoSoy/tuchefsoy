'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const SORT_OPTIONS = [
  { value: 'vistas', label: 'Más vistas' },
  { value: 'likes', label: 'Más likes' },
  { value: 'recientes', label: 'Recientes' },
]

interface SortBarProps {
  activeSort: string
}

export default function SortBar({ activeSort }: SortBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

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
  )
}
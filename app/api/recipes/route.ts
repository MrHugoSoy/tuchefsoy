import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import type { Category, Recipe } from '@/types'

const LIMIT = 30

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') || 'Todo'
  const q = searchParams.get('q') || ''
  const sort = searchParams.get('sort') || 'recientes'
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  const sortConfig: Record<string, { column: string; ascending: boolean }> = {
    recientes: { column: 'created_at', ascending: false },
    likes: { column: 'likes_count', ascending: false },
    vistas: { column: 'views_count', ascending: false },
  }
  const { column, ascending } = sortConfig[sort] ?? sortConfig.recientes

  const supabase = await createClient()

  let query = supabase
    .from('recipes')
    .select('*, author:profiles(*)')
    .order(column, { ascending })
    .range(offset, offset + LIMIT - 1)

  if (category !== 'Todo') {
    query = query.eq('category', category as Category)
  }

  if (q.trim()) {
    query = query.ilike('title', `%${q.trim()}%`)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const recipes = (data as Recipe[] | null) ?? []

  return NextResponse.json({ recipes, hasMore: recipes.length === LIMIT })
}

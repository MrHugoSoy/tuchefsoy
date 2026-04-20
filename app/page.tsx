import RecipeCard from '@/components/recipe/RecipeCard'
import ChefAssistant from '@/components/ai/ChefAssistant'
import SortBar from '@/components/layout/SortBar'
import { createClient } from '@/lib/supabase-server'
import type { Recipe, Category } from '@/types'

interface HomePageProps {
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { category, q, sort } = await searchParams
  const activeCategory = (category as Category) || 'Todo'
  const searchQuery = q?.trim() ?? ''
  const activeSort = sort || 'recientes'

  const supabase = await createClient()

  const sortConfig: Record<string, { column: string; ascending: boolean }> = {
    recientes: { column: 'created_at', ascending: false },
    likes: { column: 'likes_count', ascending: false },
    vistas: { column: 'views_count', ascending: false },
  }
  const { column, ascending } = sortConfig[activeSort] ?? sortConfig.recientes

  let query = supabase
    .from('recipes')
    .select('*, author:profiles(*)')
    .order(column, { ascending })
    .limit(30)

  if (activeCategory !== 'Todo') {
    query = query.eq('category', activeCategory)
  }

  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`)
  }

  const { data } = await query
  const feed: Recipe[] = (data as Recipe[] | null) ?? []

  let heading = 'Descubre recetas'
  let subheading = 'Inspírate con las mejores recetas de nuestra comunidad'

  if (searchQuery) {
    heading = `Resultados para "${searchQuery}"`
    subheading = `${feed.length} ${feed.length === 1 ? 'receta encontrada' : 'recetas encontradas'}`
  } else if (activeCategory !== 'Todo') {
    heading = activeCategory
    subheading = `Recetas de ${activeCategory.toLowerCase()} para inspirarte`
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 sm:py-8">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">

        {/* Feed principal */}
        <div>
          {/* Header: en móvil apilado, en desktop lado a lado */}
          <div className="mb-5 sm:mb-7">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h1 className="text-xl sm:text-2xl font-semibold leading-tight">{heading}</h1>
              <div className="shrink-0">
                <SortBar activeSort={activeSort} />
              </div>
            </div>
            <p className="text-sm text-muted">{subheading}</p>
          </div>

          {/* Grid estilo Pinterest */}
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
            {feed.map((recipe) => (
              <div key={recipe.id} className="break-inside-avoid">
                <RecipeCard recipe={recipe} />
              </div>
            ))}
          </div>

          {feed.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-[#fff5ee] flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-semibold mb-1">
                {searchQuery
                  ? `No se encontraron recetas para "${searchQuery}"`
                  : activeCategory === 'Todo'
                    ? 'Sin recetas aún'
                    : `Sin recetas en ${activeCategory}`}
              </h2>
              <p className="text-sm text-muted">
                {searchQuery
                  ? 'Intenta con otros términos de búsqueda.'
                  : activeCategory === 'Todo'
                    ? 'Sé el primero en compartir una receta.'
                    : 'Prueba con otra categoría o sé el primero en publicar aquí.'}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar IA Chef — solo desktop */}
        <div className="hidden xl:block">
          <div className="sticky top-24">
            <ChefAssistant />
          </div>
        </div>
      </div>
    </div>
  )
}
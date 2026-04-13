import RecipeCard from '@/components/recipe/RecipeCard'
import ChefAssistant from '@/components/ai/ChefAssistant'
import { createClient } from '@/lib/supabase-server'
import type { Recipe } from '@/types'

export default async function HomePage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('recipes')
    .select('*, author:profiles(*)')
    .order('created_at', { ascending: false })
    .limit(30)

  const feed: Recipe[] = (data as Recipe[] | null) ?? []

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">

        {/* Feed principal */}
        <div>
          <div className="mb-7">
            <h1 className="text-2xl font-semibold mb-1">Descubre recetas</h1>
            <p className="text-sm text-muted">Inspírate con las mejores recetas de nuestra comunidad</p>
          </div>

          {/* Grid estilo Pinterest */}
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
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
              <h2 className="text-lg font-semibold mb-1">Sin recetas aún</h2>
              <p className="text-sm text-muted">Sé el primero en compartir una receta.</p>
            </div>
          )}
        </div>

        {/* Sidebar IA Chef */}
        <div>
          <div className="sticky top-24">
            <ChefAssistant />
          </div>
        </div>
      </div>
    </div>
  )
}

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import RecipeCard from '@/components/recipe/RecipeCard'
import { createClient } from '@/lib/supabase-server'
import type { Recipe, Category } from '@/types'

const slugToCategory: Record<string, Category> = {
  desayunos: 'Desayunos',
  comidas: 'Comidas',
  cenas: 'Cenas',
  postres: 'Postres',
  bebidas: 'Bebidas',
  vegano: 'Vegano',
  'sin-gluten': 'Sin gluten',
  snacks: 'Snacks',
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return Object.keys(slugToCategory).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const category = slugToCategory[slug]

  if (!category) return {}

  return {
    title: `Recetas de ${category} fáciles y rápidas`,
    description: `Descubre las mejores recetas de ${category.toLowerCase()} paso a paso. Fáciles, rápidas y deliciosas. Encuentra tu próxima receta favorita en TuChefSoy.`,
    openGraph: {
      title: `Recetas de ${category} fáciles y rápidas`,
      description: `Descubre las mejores recetas de ${category.toLowerCase()} paso a paso. Fáciles, rápidas y deliciosas.`,
      url: `https://tuchefsoy.com/categoria/${slug}`,
      siteName: 'TuChefSoy',
      locale: 'es_ES',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Recetas de ${category} fáciles y rápidas`,
      description: `Descubre las mejores recetas de ${category.toLowerCase()} en TuChefSoy.`,
    },
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  const category = slugToCategory[slug]

  if (!category) notFound()

  const supabase = await createClient()

  const { data } = await supabase
    .from('recipes')
    .select('*, author:profiles(*)')
    .eq('category', category)
    .order('likes_count', { ascending: false })
    .limit(60)

  const recipes: Recipe[] = (data as Recipe[] | null) ?? []

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 sm:py-8">
      <div className="mb-5 sm:mb-7">
        <h1 className="text-xl sm:text-2xl font-semibold leading-tight mb-1">{category}</h1>
        <p className="text-sm text-muted">
          {recipes.length === 0
            ? 'Sin recetas aún'
            : `${recipes.length} ${recipes.length === 1 ? 'receta encontrada' : 'recetas encontradas'}`}
        </p>
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-sm text-muted">
            Aún no hay recetas en esta categoría. ¡Sé el primero en publicar!
          </p>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="break-inside-avoid">
              <RecipeCard recipe={recipe} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

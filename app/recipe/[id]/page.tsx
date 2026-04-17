import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import LikeButton from '@/components/recipe/LikeButton'
import CommentSection from '@/components/recipe/CommentSection'
import type { Recipe } from '@/types'
import type { Metadata } from 'next'

const DIFFICULTY_COLOR = { Fácil: '#22c55e', Media: '#f59e0b', Difícil: '#ef4444' } as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: recipe } = await supabase
    .from('recipes')
    .select('title, description, image_url, category')
    .eq('id', id)
    .single()

  if (!recipe) {
    return { title: 'Receta no encontrada — TuChefSoy' }
  }

  const title = `${recipe.title} — TuChefSoy`
  const description = recipe.description ?? `Receta de ${recipe.category} en TuChefSoy`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      siteName: 'TuChefSoy',
      ...(recipe.image_url && {
        images: [{ url: recipe.image_url, width: 1200, height: 630, alt: recipe.title }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(recipe.image_url && { images: [recipe.image_url] }),
    },
  }
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('*, author:profiles(*)')
    .eq('id', id)
    .single()

  if (error || !recipe) notFound()

  const r = recipe as Recipe

  // Increment view count
  await supabase
    .from('recipes')
    .update({ views_count: (r.views_count ?? 0) + 1 })
    .eq('id', id)

  const { data: { user } } = await supabase.auth.getUser()
  let initialLiked = false
  if (user) {
    const { data: likeRow } = await supabase
      .from('recipe_likes')
      .select('id')
      .eq('recipe_id', id)
      .eq('user_id', user.id)
      .single()
    initialLiked = !!likeRow
  }

  const totalTime = r.prep_time + r.cook_time
  const viewsCount = (r.views_count ?? 0) + 1

  const recipeSchema = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: r.title,
    description: r.description ?? '',
    ...(r.image_url && { image: [r.image_url] }),
    author: {
      '@type': 'Person',
      name: r.author?.full_name ?? r.author?.username ?? 'TuChefSoy',
    },
    datePublished: r.created_at,
    prepTime: `PT${r.prep_time}M`,
    cookTime: `PT${r.cook_time}M`,
    totalTime: `PT${totalTime}M`,
    recipeYield: `${r.servings} porciones`,
    recipeCategory: r.category,
    recipeIngredient: r.ingredients.map((ing) =>
      [ing.amount, ing.unit, ing.name].filter(Boolean).join(' ')
    ),
    recipeInstructions: r.steps.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: step,
    })),
    aggregateRating: r.likes_count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: Math.min(5, 3 + (r.likes_count * 0.5)),
      ratingCount: r.likes_count,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 py-10">

        <nav className="flex items-center gap-2 text-sm text-muted mb-6">
          <Link href="/" className="hover:text-[#111] transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-[#111] truncate">{r.title}</span>
        </nav>

        {r.image_url && (
          <div className="relative aspect-16/7 rounded-[12px] overflow-hidden mb-8">
            <Image src={r.image_url} alt={r.title} fill className="object-cover" priority />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">

          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 text-xs font-medium bg-[#f7f7f7] rounded-full text-muted">
                  {r.category}
                </span>
                {r.tags?.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 text-xs bg-[#f7f7f7] rounded-full text-muted">
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-3xl font-semibold leading-tight mb-3">{r.title}</h1>
              {r.description && (
                <p className="text-[#555] leading-relaxed">{r.description}</p>
              )}
            </div>

            {r.author && (
              <div className="flex items-center gap-3 mb-8 pb-8 border-b border-border">
                <div className="w-10 h-10 rounded-full bg-border overflow-hidden shrink-0">
                  {r.author.avatar_url ? (
                    <Image src={r.author.avatar_url} alt={r.author.username} width={40} height={40} className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-muted">
                      {r.author.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{r.author.full_name ?? r.author.username}</p>
                  <p className="text-xs text-muted">@{r.author.username}</p>
                </div>
              </div>
            )}

            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-4">Ingredientes</h2>
              <ul className="flex flex-col gap-2">
                {r.ingredients.map((ing, i) => (
                  <li key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                    <span className="text-sm">{ing.name}</span>
                    <span className="text-sm font-medium text-muted">
                      {[ing.amount, ing.unit].filter(Boolean).join(' ')}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-xl font-semibold mb-4">Preparación</h2>
              <ol className="flex flex-col gap-6">
                {r.steps.map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="shrink-0 w-8 h-8 rounded-full bg-[#fff5ee] text-brand font-semibold text-sm flex items-center justify-center">
                      {i + 1}
                    </span>
                    <p className="text-[#333] leading-relaxed pt-1">{step}</p>
                  </li>
                ))}
              </ol>
            </section>

            <div className="flex items-center gap-3 mb-12 pb-10 border-b border-border">
              <LikeButton recipeId={id} initialLikes={r.likes_count} initialLiked={initialLiked} />
            </div>

            <CommentSection recipeId={id} />
          </div>

          <div>
            <div className="sticky top-24 rounded-[12px] border border-border p-5">
              <h3 className="text-sm font-semibold mb-4 text-muted uppercase tracking-wide">Resumen</h3>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">Tiempo total</span>
                  <span className="text-sm font-semibold">{totalTime} min</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm text-muted">Preparación</span>
                  <span className="text-sm font-semibold">{r.prep_time} min</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm text-muted">Cocción</span>
                  <span className="text-sm font-semibold">{r.cook_time} min</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm text-muted">Porciones</span>
                  <span className="text-sm font-semibold">{r.servings}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm text-muted">Dificultad</span>
                  <span
                    className="text-sm font-semibold"
                    style={{ color: DIFFICULTY_COLOR[r.difficulty] }}
                  >
                    {r.difficulty}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm text-muted">Ingredientes</span>
                  <span className="text-sm font-semibold">{r.ingredients.length}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm text-muted flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Vistas
                  </span>
                  <span className="text-sm font-semibold">{viewsCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

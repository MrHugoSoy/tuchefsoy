import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import LikeButton from '@/components/recipe/LikeButton'
import CommentSection from '@/components/recipe/CommentSection'
import SharePrintButtons from '@/components/recipe/SharePrintButtons'
import StarRating from '@/components/recipe/StarRating'
import type { Recipe } from '@/types'
import type { Metadata } from 'next'

const DIFFICULTY_COLOR = { Fácil: '#22c55e', Media: '#f59e0b', Difícil: '#ef4444' } as const

function getYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: recipe } = await supabase.from('recipes').select('title, description, image_url, category').eq('id', id).single()
  if (!recipe) return { title: 'Receta no encontrada — TuChefSoy' }
  const title = `${recipe.title} — TuChefSoy`
  const description = recipe.description ?? `Receta de ${recipe.category} en TuChefSoy`
  return {
    title, description,
    openGraph: { title, description, type: 'article', siteName: 'TuChefSoy', ...(recipe.image_url && { images: [{ url: recipe.image_url, width: 1200, height: 630, alt: recipe.title }] }) },
    twitter: { card: 'summary_large_image', title, description, ...(recipe.image_url && { images: [recipe.image_url] }) },
  }
}

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: recipe, error } = await supabase.from('recipes').select('*, author:profiles(*)').eq('id', id).single()
  if (error || !recipe) notFound()

  const r = recipe as Recipe
  await supabase.from('recipes').update({ views_count: (r.views_count ?? 0) + 1 }).eq('id', id)

  const { data: { user } } = await supabase.auth.getUser()
  let initialLiked = false
  if (user) {
    const { data: likeRow } = await supabase.from('recipe_likes').select('id').eq('recipe_id', id).eq('user_id', user.id).single()
    initialLiked = !!likeRow
  }

  const { data: relatedData } = await supabase
    .from('recipes')
    .select('id, title, image_url, youtube_url, prep_time, cook_time, difficulty, category, likes_count, author:profiles(username, full_name, avatar_url)')
    .eq('category', r.category).neq('id', id).order('likes_count', { ascending: false }).limit(4)

  const related: Recipe[] = (relatedData as Recipe[] | null) ?? []
  const totalTime = r.prep_time + r.cook_time
  const viewsCount = (r.views_count ?? 0) + 1
  const youtubeId = r.youtube_url ? getYoutubeId(r.youtube_url) : null

  const recipeSchema = {
    '@context': 'https://schema.org', '@type': 'Recipe',
    name: r.title, description: r.description ?? '',
    ...(r.image_url && { image: [r.image_url] }),
    author: { '@type': 'Person', name: r.author?.full_name ?? r.author?.username ?? 'TuChefSoy' },
    datePublished: r.created_at,
    prepTime: `PT${r.prep_time}M`, cookTime: `PT${r.cook_time}M`, totalTime: `PT${totalTime}M`,
    recipeYield: `${r.servings} porciones`, recipeCategory: r.category,
    recipeIngredient: r.ingredients.map((ing) => [ing.amount, ing.unit, ing.name].filter(Boolean).join(' ')),
    recipeInstructions: r.steps.map((step, i) => ({ '@type': 'HowToStep', position: i + 1, text: step })),
    aggregateRating: (r.rating_count ?? 0) > 0 ? { '@type': 'AggregateRating', ratingValue: r.rating_avg ?? 0, ratingCount: r.rating_count ?? 0, bestRating: 5, worstRating: 1 } : undefined,
  }

  // Resumen sidebar content (shared between mobile inline and desktop sidebar)
  const ResumenContent = (
    <div className="flex flex-col gap-4">
      {(r.rating_count ?? 0) > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted flex items-center gap-1">
            <svg className="w-4 h-4 text-[#f59e0b]" fill="#f59e0b" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            Calificación
          </span>
          <span className="text-sm font-semibold">{(r.rating_avg ?? 0).toFixed(1)} / 5</span>
        </div>
      )}
      <div className={`flex items-center justify-between ${(r.rating_count ?? 0) > 0 ? 'border-t border-border pt-4' : ''}`}>
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
        <span className="text-sm font-semibold" style={{ color: DIFFICULTY_COLOR[r.difficulty] }}>{r.difficulty}</span>
      </div>
      {!youtubeId && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm text-muted">Ingredientes</span>
          <span className="text-sm font-semibold">{r.ingredients.length}</span>
        </div>
      )}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-muted flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Vistas
        </span>
        <span className="text-sm font-semibold">{viewsCount}</span>
      </div>
    </div>
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeSchema) }} />

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          header, footer, nav, .no-print { display: none !important; }
          body { background: white !important; color: black !important; font-size: 10pt; line-height: 1.4; }
          .print-only { display: block !important; }
          .max-w-4xl { max-width: 100% !important; padding: 0 !important; }
          .grid { display: block !important; }
          .sticky { position: static !important; }
          img { display: none !important; }
          a { color: black !important; text-decoration: none !important; }
          h1 { font-size: 18pt !important; margin-bottom: 4px !important; }
          h2 { font-size: 13pt !important; margin-bottom: 6px !important; }
          li { page-break-inside: avoid; }
          @page { margin: 1cm; }
        }
      `}} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="print-only hidden mb-4">
          <p className="text-sm text-gray-500">tuchefsoy.com</p>
        </div>

        <nav className="flex items-center gap-2 text-sm text-muted mb-6 no-print">
          <Link href="/" className="hover:text-[#111] transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-[#111] truncate">{r.title}</span>
        </nav>

        {/* Video embed or image */}
        {youtubeId ? (
          <div className="relative aspect-video rounded-[12px] overflow-hidden mb-8 no-print">
            <iframe src={`https://www.youtube.com/embed/${youtubeId}`} className="absolute inset-0 w-full h-full" allowFullScreen title={r.title} />
          </div>
        ) : r.image_url ? (
          <div className="relative aspect-video lg:aspect-[16/7] rounded-[12px] overflow-hidden mb-8">
            <Image src={r.image_url} alt={r.title} fill className="object-cover" priority />
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">

          {/* Contenido principal */}
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 no-print flex-wrap">
                <span className="px-2.5 py-1 text-xs font-medium bg-[#f7f7f7] rounded-full text-muted">{r.category}</span>
                {youtubeId && (
                  <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-red-50 text-red-600 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    Video
                  </span>
                )}
                {r.tags?.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 text-xs bg-[#f7f7f7] rounded-full text-muted">{tag}</span>
                ))}
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold leading-tight mb-3">{r.title}</h1>
              {r.description && <p className="text-[#555] leading-relaxed mb-4">{r.description}</p>}
              <div className="no-print">
                <StarRating recipeId={id} initialAvg={r.rating_avg ?? 0} initialCount={r.rating_count ?? 0} />
              </div>
            </div>

            {r.author && (
              <div className="flex items-center gap-3 mb-8 pb-8 border-b border-border">
                <div className="w-10 h-10 rounded-full bg-border overflow-hidden shrink-0 no-print">
                  {r.author.avatar_url ? (
                    <Image src={r.author.avatar_url} alt={r.author.username} width={40} height={40} className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-muted">{r.author.username[0].toUpperCase()}</div>
                  )}
                </div>
                <div>
                  <Link href={`/perfil/${r.author.username}`} className="text-sm font-medium hover:text-brand transition-colors">
                    {r.author.full_name ?? r.author.username}
                  </Link>
                  <p className="text-xs text-muted">@{r.author.username}</p>
                </div>
              </div>
            )}

            {/* Resumen — solo móvil, aparece aquí antes de ingredientes */}
            <div className="lg:hidden rounded-[12px] border border-border p-5 mb-8 no-print">
              <h3 className="text-sm font-semibold mb-4 text-muted uppercase tracking-wide">Resumen</h3>
              {ResumenContent}
            </div>

            {!youtubeId && (
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Ingredientes</h2>
                <ul className="flex flex-col gap-2">
                  {r.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                      <span className="text-sm">{ing.name}</span>
                      <span className="text-sm font-medium text-muted">{[ing.amount, ing.unit].filter(Boolean).join(' ')}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {!youtubeId && (
              <section className="mb-10">
                <h2 className="text-xl font-semibold mb-4">Preparación</h2>
                <ol className="flex flex-col gap-6">
                  {r.steps.map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="shrink-0 w-8 h-8 rounded-full bg-[#fff5ee] text-brand font-semibold text-sm flex items-center justify-center">{i + 1}</span>
                      <p className="text-[#333] leading-relaxed pt-1">{step}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            <div className="mb-10 pb-10 border-b border-border no-print">
              <h3 className="text-sm font-semibold mb-3 text-muted uppercase tracking-wide">Compartir</h3>
              <SharePrintButtons title={r.title} description={r.description ?? ''} recipeId={id} />
            </div>

            <div className="flex items-center gap-3 mb-12 pb-10 border-b border-border no-print">
              <LikeButton recipeId={id} initialLikes={r.likes_count} initialLiked={initialLiked} recipeTitle={r.title} recipeAuthorId={r.author_id} />
            </div>

            <div className="no-print">
              <CommentSection recipeId={id} recipeTitle={r.title} recipeAuthorId={r.author_id} />
            </div>
          </div>

          {/* Sidebar resumen — solo desktop */}
          <div className="hidden lg:block">
            <div className="sticky top-24 rounded-[12px] border border-border p-5">
              <h3 className="text-sm font-semibold mb-4 text-muted uppercase tracking-wide">Resumen</h3>
              {ResumenContent}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-border no-print">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">También te puede gustar</h2>
              <Link href={`/?category=${encodeURIComponent(r.category)}`} className="text-sm text-brand hover:underline font-medium">
                Ver más de {r.category}
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((rel) => {
                const relTime = rel.prep_time + rel.cook_time
                const relYtId = rel.youtube_url ? getYoutubeId(rel.youtube_url) : null
                return (
                  <Link key={rel.id} href={`/recipe/${rel.id}`} className="group block rounded-[12px] border border-[#f0f0f0] bg-white overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative aspect-[4/3] bg-[#f7f7f7] overflow-hidden">
                      {rel.image_url ? (
                        <Image src={rel.image_url} alt={rel.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 50vw, 25vw" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[#d0d0d0]">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                          </svg>
                        </div>
                      )}
                      {relYtId && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-[#111] text-sm leading-snug mb-2 line-clamp-2">{rel.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-[#737373]">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {relTime} min
                        </span>
                        <span className="font-medium" style={{ color: DIFFICULTY_COLOR[rel.difficulty] }}>{rel.difficulty}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
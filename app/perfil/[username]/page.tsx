import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import RecipeCard from '@/components/recipe/RecipeCard'
import EditProfileButton from '@/components/profile/EditProfileButton'
import type { Recipe, Profile } from '@/types'

function memberSince(date: string) {
  const d = new Date(date)
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${months[d.getMonth()]} ${d.getFullYear()}`
}

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { username } = await params
  const { tab } = await searchParams
  const activeTab = tab === 'favoritos' ? 'favoritos' : 'recetas'
  const decodedUsername = decodeURIComponent(username)
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', decodedUsername)
    .single()

  if (error || !profile) notFound()

  const p = profile as Profile

  const { data: { user } } = await supabase.auth.getUser()
  const isOwn = user?.id === p.id

  // Get recipes
  const { data: recipesData } = await supabase
    .from('recipes')
    .select('*, author:profiles(*)')
    .eq('author_id', p.id)
    .order('created_at', { ascending: false })

  const recipes: Recipe[] = (recipesData as Recipe[] | null) ?? []

  // Get favorites (only for own profile)
  let favorites: Recipe[] = []
  if (isOwn) {
    const { data: favData } = await supabase
      .from('recipe_favorites')
      .select('recipe:recipes(*, author:profiles(*))')
      .eq('user_id', p.id)
      .order('created_at', { ascending: false })

    favorites = (favData?.map((f) => f.recipe) as Recipe[] | null) ?? []
  }

  const totalLikes = recipes.reduce((sum, r) => sum + r.likes_count, 0)
  const totalRecipes = recipes.length

  const displayList = activeTab === 'favoritos' ? favorites : recipes

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-10">

      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10 pb-10 border-b border-border">

        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-[#f7f7f7] border-2 border-border shrink-0">
          {p.avatar_url ? (
            <Image src={p.avatar_url} alt={p.username} width={112} height={112} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-semibold text-brand bg-[#fff5ee]">
              {p.username[0].toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-[#111]">{p.full_name ?? p.username}</h1>
            {isOwn && <EditProfileButton profile={p} />}
          </div>

          <p className="text-sm text-muted mb-4">@{p.username}</p>

          {p.bio && (
            <p className="text-sm text-[#555] leading-relaxed mb-4 max-w-lg">{p.bio}</p>
          )}

          <div className="flex items-center justify-center sm:justify-start gap-6">
            <div className="text-center">
              <span className="block text-lg font-semibold text-[#111]">{totalRecipes}</span>
              <span className="text-xs text-muted">{totalRecipes === 1 ? 'Receta' : 'Recetas'}</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <span className="block text-lg font-semibold text-[#111]">{totalLikes}</span>
              <span className="text-xs text-muted">{totalLikes === 1 ? 'Like' : 'Likes'}</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <span className="block text-lg font-semibold text-[#111]">
                <svg className="w-4 h-4 inline-block mr-1 -mt-0.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {memberSince(p.created_at)}
              </span>
              <span className="text-xs text-muted">Miembro desde</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-8 border-b border-border">
        <Link
          href={`/perfil/${p.username}`}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === 'recetas'
              ? 'border-brand text-brand'
              : 'border-transparent text-muted hover:text-[#111]'
          }`}
        >
          Recetas
          <span className="ml-2 text-xs bg-[#f0f0f0] px-1.5 py-0.5 rounded-full">{totalRecipes}</span>
        </Link>
        {isOwn && (
          <Link
            href={`/perfil/${p.username}?tab=favoritos`}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === 'favoritos'
                ? 'border-brand text-brand'
                : 'border-transparent text-muted hover:text-[#111]'
            }`}
          >
            Guardados
            <span className="ml-2 text-xs bg-[#f0f0f0] px-1.5 py-0.5 rounded-full">{favorites.length}</span>
          </Link>
        )}

        {/* Nueva receta button */}
        <div className="ml-auto">
          {isOwn && (
            <Link
              href="/create"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-hover rounded-full transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva receta
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      {displayList.length > 0 ? (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
          {displayList.map((recipe) => (
            <div key={recipe.id} className="break-inside-avoid">
              <RecipeCard recipe={recipe} />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-[#fff5ee] flex items-center justify-center mb-4">
            {activeTab === 'favoritos' ? (
              <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            )}
          </div>
          <h3 className="text-lg font-semibold mb-1">
            {activeTab === 'favoritos' ? 'Sin recetas guardadas' : isOwn ? 'Aún no tienes recetas' : 'Sin recetas aún'}
          </h3>
          <p className="text-sm text-muted mb-4">
            {activeTab === 'favoritos'
              ? 'Guarda recetas que te gusten para verlas aquí.'
              : isOwn ? 'Comparte tu primera receta con la comunidad.' : 'Este usuario aún no ha compartido recetas.'}
          </p>
          {isOwn && activeTab === 'recetas' && (
            <Link href="/create" className="px-6 py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand-hover rounded-full transition-colors">
              Subir mi primera receta
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
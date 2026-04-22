import { createClient } from '@/lib/supabase-server'
import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()

  // Get all recipes
  const { data: recipes } = await supabase
    .from('recipes')
    .select('slug, updated_at')
    .not('slug', 'is', null)
    .order('updated_at', { ascending: false })

  // Get all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('username, created_at')

  const baseUrl = 'https://tuchefsoy.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/privacidad`,
      lastModified: new Date('2026-04-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terminos`,
      lastModified: new Date('2026-04-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date('2026-04-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Recipe pages
  const recipePages: MetadataRoute.Sitemap = (recipes ?? []).map((recipe) => ({
    url: `${baseUrl}/receta/${recipe.slug}`,
    lastModified: new Date(recipe.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Profile pages
  const profilePages: MetadataRoute.Sitemap = (profiles ?? []).map((profile) => ({
    url: `${baseUrl}/perfil/${profile.username}`,
    lastModified: new Date(profile.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  return [...staticPages, ...recipePages, ...profilePages]
}

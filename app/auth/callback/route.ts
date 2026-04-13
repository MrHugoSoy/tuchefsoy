import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Create profile if it doesn't exist yet
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existing) {
        const meta = data.user.user_metadata
        await supabase.from('profiles').insert({
          id: data.user.id,
          username: meta?.preferred_username ?? meta?.name?.toLowerCase().replace(/\s+/g, '_') ?? data.user.email?.split('@')[0],
          full_name: meta?.full_name ?? meta?.name ?? null,
          avatar_url: meta?.avatar_url ?? null,
          bio: null,
        })
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth`)
}

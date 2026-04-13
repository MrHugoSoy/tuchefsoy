import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export default async function PerfilRedirect() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-[#fff5ee] flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold mb-2">Inicia sesión para ver tu perfil</h1>
        <p className="text-sm text-muted">Necesitas una cuenta para acceder a tu perfil.</p>
      </div>
    )
  }

  // Get username from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const username = profile?.username ?? user.email?.split('@')[0] ?? user.id
  redirect(`/perfil/${username}`)
}

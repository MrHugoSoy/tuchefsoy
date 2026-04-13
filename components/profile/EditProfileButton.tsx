'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Profile } from '@/types'

interface EditProfileButtonProps {
  profile: Profile
}

export default function EditProfileButton({ profile }: EditProfileButtonProps) {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [open, setOpen] = useState(false)
  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [username, setUsername] = useState(profile.username)
  const [bio, setBio] = useState(profile.bio ?? '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!user) return
    setError(null)
    setSaving(true)

    try {
      let avatarUrl = profile.avatar_url

      // Upload new avatar if changed
      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `avatars/${user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('recipes')
          .upload(path, avatarFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('recipes')
          .getPublicUrl(path)
        avatarUrl = publicUrl
      }

      // Check username uniqueness if changed
      if (username !== profile.username) {
        const { data: existing } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .neq('id', user.id)
          .single()

        if (existing) {
          setError('Ese nombre de usuario ya está en uso.')
          setSaving(false)
          return
        }
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName || null,
          username,
          bio: bio || null,
          avatar_url: avatarUrl,
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setOpen(false)

      // Redirect if username changed
      if (username !== profile.username) {
        router.push(`/perfil/${username}`)
      } else {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-1.5 text-sm font-medium text-[#555] border border-border rounded-full hover:bg-[#f7f7f7] hover:text-[#111] transition-colors"
      >
        Editar perfil
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          <div
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-[#f7f7f7] text-[#737373] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-semibold mb-6">Editar perfil</h2>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-6">
              <div
                onClick={() => fileRef.current?.click()}
                className="w-16 h-16 rounded-full overflow-hidden bg-[#f7f7f7] border-2 border-border cursor-pointer hover:opacity-80 transition-opacity shrink-0"
              >
                {avatarPreview ? (
                  <Image src={avatarPreview} alt="" width={64} height={64} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-semibold text-brand bg-[#fff5ee]">
                    {username[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-sm text-brand font-medium hover:underline"
                >
                  Cambiar foto
                </button>
                <p className="text-xs text-muted mt-0.5">JPG, PNG. Máx 2MB.</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[#111] mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full px-3 py-2.5 text-sm bg-[#f7f7f7] border border-border rounded-xl outline-none focus:border-brand focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111] mb-1">Usuario</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  placeholder="usuario"
                  className="w-full px-3 py-2.5 text-sm bg-[#f7f7f7] border border-border rounded-xl outline-none focus:border-brand focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#111] mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Cuéntanos sobre ti..."
                  rows={3}
                  maxLength={300}
                  className="w-full px-3 py-2.5 text-sm bg-[#f7f7f7] border border-border rounded-xl outline-none focus:border-brand focus:bg-white transition-colors resize-none"
                />
                <p className="text-xs text-muted text-right mt-1">{bio.length}/300</p>
              </div>
            </div>

            {error && (
              <div className="mb-4 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-[#555] border border-border rounded-xl hover:bg-[#f7f7f7] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !username.trim()}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand-hover disabled:opacity-60 rounded-xl transition-colors"
              >
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

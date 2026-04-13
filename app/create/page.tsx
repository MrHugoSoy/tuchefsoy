'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Category, Difficulty, Ingredient } from '@/types'

const CATEGORIES: Exclude<Category, 'Todo'>[] = [
  'Desayunos', 'Comidas', 'Cenas', 'Postres',
  'Bebidas', 'Vegano', 'Sin gluten', 'Snacks',
]
const DIFFICULTIES: Difficulty[] = ['Fácil', 'Media', 'Difícil']

export default function CreatePage() {
  const router = useRouter()
  const { user, openModal } = useAuth()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Exclude<Category, 'Todo'>>('Comidas')
  const [difficulty, setDifficulty] = useState<Difficulty>('Fácil')
  const [prepTime, setPrepTime] = useState('')
  const [cookTime, setCookTime] = useState('')
  const [servings, setServings] = useState('')
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', amount: '', unit: '' }])
  const [steps, setSteps] = useState<string[]>([''])
  const [tags, setTags] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-14 h-14 rounded-full bg-[#fff5ee] flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold mb-2">Inicia sesión para subir recetas</h1>
        <p className="text-sm text-muted mb-6">Crea una cuenta gratis y comparte tus recetas con la comunidad.</p>
        <button onClick={() => openModal('register')} className="px-6 py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand-hover rounded-full transition-colors">
          Crear cuenta
        </button>
      </div>
    )
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  function addIngredient() {
    setIngredients((prev) => [...prev, { name: '', amount: '', unit: '' }])
  }
  function removeIngredient(i: number) {
    setIngredients((prev) => prev.filter((_, idx) => idx !== i))
  }
  function updateIngredient(i: number, field: keyof Ingredient, value: string) {
    setIngredients((prev) => prev.map((ing, idx) => idx === i ? { ...ing, [field]: value } : ing))
  }

  function addStep() {
    setSteps((prev) => [...prev, ''])
  }
  function removeStep(i: number) {
    setSteps((prev) => prev.filter((_, idx) => idx !== i))
  }
  function updateStep(i: number, value: string) {
    setSteps((prev) => prev.map((s, idx) => idx === i ? value : s))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setError(null)
    setSubmitting(true)

    try {
      let imageUrl: string | null = null

      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('recipes')
          .upload(path, imageFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('recipes')
          .getPublicUrl(path)
        imageUrl = publicUrl
      }

      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean)
      const cleanIngredients = ingredients.filter((i) => i.name.trim())
      const cleanSteps = steps.filter((s) => s.trim())

      const { data: recipe, error: insertError } = await supabase
        .from('recipes')
        .insert({
          title,
          description: description || null,
          image_url: imageUrl,
          prep_time: parseInt(prepTime) || 0,
          cook_time: parseInt(cookTime) || 0,
          servings: parseInt(servings) || 1,
          difficulty,
          category,
          ingredients: cleanIngredients,
          steps: cleanSteps,
          tags: tagList,
          likes_count: 0,
          author_id: user.id,
        })
        .select('id')
        .single()

      if (insertError) throw insertError
      router.push(`/recipe/${recipe.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la receta')
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-8">Nueva receta</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">

        {/* Imagen */}
        <section>
          <label className="form-label">Imagen principal</label>
          <div
            onClick={() => fileRef.current?.click()}
            className="mt-2 relative aspect-video rounded-[12px] border border-border overflow-hidden cursor-pointer bg-[#f7f7f7] hover:bg-border transition-colors flex items-center justify-center"
          >
            {imagePreview ? (
              <Image src={imagePreview} alt="Preview" fill className="object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm">Haz clic para subir una imagen</span>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </section>

        {/* Básicos */}
        <section className="flex flex-col gap-4">
          <div>
            <label className="form-label">Título *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Tortilla española clásica"
              className="form-input mt-1"
              required
            />
          </div>

          <div>
            <label className="form-label">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cuéntanos de qué va esta receta..."
              rows={3}
              className="form-input mt-1 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Categoría</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as typeof category)} className="form-input mt-1">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Dificultad</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} className="form-input mt-1">
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="form-label">Prep. (min)</label>
              <input type="number" min={0} value={prepTime} onChange={(e) => setPrepTime(e.target.value)} placeholder="15" className="form-input mt-1" />
            </div>
            <div>
              <label className="form-label">Cocción (min)</label>
              <input type="number" min={0} value={cookTime} onChange={(e) => setCookTime(e.target.value)} placeholder="30" className="form-input mt-1" />
            </div>
            <div>
              <label className="form-label">Porciones</label>
              <input type="number" min={1} value={servings} onChange={(e) => setServings(e.target.value)} placeholder="4" className="form-input mt-1" />
            </div>
          </div>
        </section>

        {/* Ingredientes */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="form-label text-base font-semibold">Ingredientes</h2>
            <button type="button" onClick={addIngredient} className="text-sm text-brand hover:underline font-medium">
              + Añadir
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Ingrediente"
                  value={ing.name}
                  onChange={(e) => updateIngredient(i, 'name', e.target.value)}
                  className="form-input flex-1"
                />
                <input
                  type="text"
                  placeholder="Cantidad"
                  value={ing.amount}
                  onChange={(e) => updateIngredient(i, 'amount', e.target.value)}
                  className="form-input w-24"
                />
                <input
                  type="text"
                  placeholder="Unidad"
                  value={ing.unit}
                  onChange={(e) => updateIngredient(i, 'unit', e.target.value)}
                  className="form-input w-20"
                />
                {ingredients.length > 1 && (
                  <button type="button" onClick={() => removeIngredient(i)} className="shrink-0 p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Pasos */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="form-label text-base font-semibold">Pasos</h2>
            <button type="button" onClick={addStep} className="text-sm text-brand hover:underline font-medium">
              + Añadir paso
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="mt-2.5 shrink-0 w-6 h-6 rounded-full bg-[#fff5ee] text-brand text-xs font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                <textarea
                  value={step}
                  onChange={(e) => updateStep(i, e.target.value)}
                  placeholder={`Paso ${i + 1}...`}
                  rows={2}
                  className="form-input flex-1 resize-none"
                />
                {steps.length > 1 && (
                  <button type="button" onClick={() => removeStep(i)} className="mt-2.5 shrink-0 p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Tags */}
        <section>
          <label className="form-label">Tags</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="vegano, sin gluten, rápido (separados por coma)"
            className="form-input mt-1"
          />
        </section>

        {error && (
          <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex gap-3 pb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 text-sm font-medium text-[#555] border border-border rounded-full hover:bg-[#f7f7f7] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand-hover disabled:opacity-60 rounded-full transition-colors"
          >
            {submitting ? 'Guardando...' : 'Publicar receta'}
          </button>
        </div>
      </form>

      <style>{`
        .form-label { display: block; font-size: 0.875rem; font-weight: 500; color: #111; }
        .form-input {
          display: block; width: 100%; padding: 0.625rem 0.875rem;
          font-size: 0.875rem; background: #f7f7f7;
          border: 1px solid #f0f0f0; border-radius: 0.75rem;
          outline: none; transition: border-color 0.15s, background-color 0.15s;
          font-family: inherit;
        }
        .form-input:focus { border-color: #e85d04; background: #fff; }
        .form-input::placeholder { color: #a0a0a0; }
      `}</style>
    </div>
  )
}

'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Category, Difficulty, Ingredient } from '@/types'

const ADMIN_ID = '094c3fa4-d3f9-4548-8403-4c3fe4d4ffb4'

const CATEGORIES: Exclude<Category, 'Todo'>[] = [
  'Desayunos', 'Comidas', 'Cenas', 'Postres',
  'Bebidas', 'Vegano', 'Sin gluten', 'Snacks',
]
const DIFFICULTIES: Difficulty[] = ['Fácil', 'Media', 'Difícil']

function parseRecipeText(text: string) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const get = (label: string) => {
    const line = lines.find(l => l.toLowerCase().startsWith(label.toLowerCase()))
    return line ? line.split(':').slice(1).join(':').trim() : ''
  }
  const titleLine = lines.find(l => l.startsWith('## '))
  const title = titleLine ? titleLine.replace('## ', '').trim() : ''
  const category = (get('Categoría') as Exclude<Category, 'Todo'>) || 'Comidas'
  const difficulty = (get('Dificultad') as Difficulty) || 'Fácil'
  const description = get('Descripción')
  const tagsRaw = get('Tags')
  const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean)
  const timeLine = lines.find(l => l.includes('Prep:') || l.includes('prep:'))
  let prepTime = '0', cookTime = '0', servings = '4'
  if (timeLine) {
    const prepMatch = timeLine.match(/Prep:\s*(\d+)/)
    const cookMatch = timeLine.match(/Cocción:\s*(\d+)/)
    const servMatch = timeLine.match(/Porciones:\s*(\d+)/)
    if (prepMatch) prepTime = prepMatch[1]
    if (cookMatch) cookTime = cookMatch[1]
    if (servMatch) servings = servMatch[1]
  }
  const ingStart = lines.findIndex(l => l.toLowerCase() === 'ingredientes:')
  const stepsStart = lines.findIndex(l => l.toLowerCase() === 'pasos:')
  const tagsStart = lines.findIndex(l => l.toLowerCase().startsWith('tags:'))
  const ingredients: Ingredient[] = []
  if (ingStart !== -1) {
    const ingEnd = stepsStart !== -1 ? stepsStart : tagsStart !== -1 ? tagsStart : lines.length
    for (let i = ingStart + 1; i < ingEnd; i++) {
      const line = lines[i]
      if (!line.startsWith('-')) continue
      const parts = line.replace(/^-\s*/, '').split('|').map(p => p.trim())
      if (parts.length >= 1) ingredients.push({ name: parts[0] ?? '', amount: parts[1] ?? '', unit: parts[2] ?? '' })
    }
  }
  const steps: string[] = []
  if (stepsStart !== -1) {
    const stepsEnd = tagsStart !== -1 ? tagsStart : lines.length
    for (let i = stepsStart + 1; i < stepsEnd; i++) {
      const match = lines[i].match(/^\d+\.\s+(.+)/)
      if (match) steps.push(match[1])
    }
  }
  return { title, category, difficulty, description, prepTime, cookTime, servings, ingredients, steps, tags }
}

export default function AdminCreatePage() {
  const { user } = useAuth()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<'single' | 'bulk'>('single')
  const [rawText, setRawText] = useState('')
  const [parsed, setParsed] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Exclude<Category, 'Todo'>>('Comidas')
  const [difficulty, setDifficulty] = useState<Difficulty>('Fácil')
  const [prepTime, setPrepTime] = useState('')
  const [cookTime, setCookTime] = useState('')
  const [servings, setServings] = useState('')
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [steps, setSteps] = useState<string[]>([])
  const [tags, setTags] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Bulk mode state
  const [bulkText, setBulkText] = useState('')
  const [bulkParsed, setBulkParsed] = useState<ReturnType<typeof parseRecipeText>[]>([])
  const [bulkSubmitting, setBulkSubmitting] = useState(false)
  const [bulkResults, setBulkResults] = useState<string[]>([])

  if (!user || user.id !== ADMIN_ID) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <p className="text-sm text-muted">Acceso denegado.</p>
      </div>
    )
  }

  function handleParse() {
    if (!rawText.trim()) return
    const data = parseRecipeText(rawText)
    setTitle(data.title)
    setDescription(data.description)
    setCategory(data.category)
    setDifficulty(data.difficulty)
    setPrepTime(data.prepTime)
    setCookTime(data.cookTime)
    setServings(data.servings)
    setIngredients(data.ingredients.length ? data.ingredients : [{ name: '', amount: '', unit: '' }])
    setSteps(data.steps.length ? data.steps : [''])
    setTags(data.tags.join(', '))
    setParsed(true)
    setError(null)
  }

  function handleBulkParse() {
    if (!bulkText.trim()) return
    const blocks = bulkText.split(/\n---\n|\n---$|^---\n/).map(b => b.trim()).filter(Boolean)
    const parsed = blocks.map(block => parseRecipeText(block)).filter(r => r.title)
    setBulkParsed(parsed)
    setBulkResults([])
  }

  async function handleBulkSubmit() {
    if (!bulkParsed.length || !user) return
    setBulkSubmitting(true)
    setBulkResults([])
    const results: string[] = []

    for (const recipe of bulkParsed) {
      try {
        const { data, error } = await supabase.from('recipes').insert({
          title: recipe.title,
          description: recipe.description || null,
          image_url: null,
          prep_time: parseInt(recipe.prepTime) || 0,
          cook_time: parseInt(recipe.cookTime) || 0,
          servings: parseInt(recipe.servings) || 1,
          difficulty: recipe.difficulty,
          category: recipe.category,
          ingredients: recipe.ingredients,
          steps: recipe.steps,
          tags: recipe.tags,
          likes_count: 0,
          author_id: user.id,
        }).select('id').single()

        if (error) throw error
        results.push(`✅ "${recipe.title}" — ID: ${data.id}`)
      } catch (err) {
        results.push(`❌ "${recipe.title}" — ${err instanceof Error ? err.message : 'Error'}`)
      }
    }

    setBulkResults(results)
    setBulkSubmitting(false)
    setBulkParsed([])
    setBulkText('')
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setError(null)
    setSubmitting(true)
    try {
      let imageUrl: string | null = null
      if (imageFile && user) {
        const ext = imageFile.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage.from('recipes').upload(path, imageFile, { upsert: true })
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('recipes').getPublicUrl(path)
        imageUrl = publicUrl
      }
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)
      const { data: recipe, error: insertError } = await supabase.from('recipes').insert({
        title, description: description || null, image_url: imageUrl,
        prep_time: parseInt(prepTime) || 0, cook_time: parseInt(cookTime) || 0,
        servings: parseInt(servings) || 1, difficulty, category,
        ingredients: ingredients.filter(i => i.name.trim()),
        steps: steps.filter(s => s.trim()),
        tags: tagList, likes_count: 0, author_id: user.id,
      }).select('id').single()
      if (insertError) throw insertError
      setSuccess(`✅ Receta publicada — ID: ${recipe.id}`)
      setRawText(''); setParsed(false); setTitle(''); setDescription('')
      setIngredients([]); setSteps([]); setTags('')
      setImageFile(null); setImagePreview(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    }
    setSubmitting(false)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Admin — Importar recetas</h1>
        <span className="px-3 py-1 text-xs font-medium bg-[#fff5ee] text-brand rounded-full">Solo admin</span>
      </div>

      {/* Selector de modo */}
      <div className="flex gap-1 mb-8 p-1 bg-[#f7f7f7] rounded-xl w-fit">
        <button onClick={() => setMode('single')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'single' ? 'bg-white text-[#111] shadow-sm' : 'text-[#737373] hover:text-[#111]'}`}>
          Una receta con foto
        </button>
        <button onClick={() => setMode('bulk')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${mode === 'bulk' ? 'bg-white text-[#111] shadow-sm' : 'text-[#737373] hover:text-[#111]'}`}>
          Carga masiva sin foto
        </button>
      </div>

      {/* MODO BULK */}
      {mode === 'bulk' && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted">Pega varias recetas separadas por <code className="bg-[#f0f0f0] px-1 rounded">---</code> y se publicarán todas sin foto. Puedes agregar las fotos después desde el editor.</p>

          {bulkResults.length > 0 && (
            <div className="p-4 bg-[#f7f7f7] rounded-xl flex flex-col gap-1">
              {bulkResults.map((r, i) => <p key={i} className="text-sm font-mono">{r}</p>)}
            </div>
          )}

          {bulkParsed.length > 0 ? (
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-green-50 border border-green-100 rounded-xl">
                <p className="text-sm text-green-700 font-medium">✅ {bulkParsed.length} recetas detectadas:</p>
                <ul className="mt-2 flex flex-col gap-1">
                  {bulkParsed.map((r, i) => (
                    <li key={i} className="text-sm text-green-600">• {r.title} — {r.category}</li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setBulkParsed([])} className="px-4 py-2 text-sm text-[#555] border border-border rounded-full hover:bg-[#f7f7f7]">
                  ← Volver
                </button>
                <button onClick={handleBulkSubmit} disabled={bulkSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-brand hover:bg-brand-hover disabled:opacity-60 rounded-full transition-colors">
                  {bulkSubmitting ? 'Publicando...' : `Publicar ${bulkParsed.length} recetas sin foto`}
                </button>
              </div>
            </div>
          ) : (
            <>
              <textarea
                value={bulkText}
                onChange={e => setBulkText(e.target.value)}
                placeholder="## Receta 1&#10;Categoría: Comidas&#10;...&#10;&#10;---&#10;&#10;## Receta 2&#10;Categoría: Postres&#10;..."
                rows={20}
                className="w-full p-4 text-sm bg-[#f7f7f7] border border-[#f0f0f0] rounded-xl outline-none focus:border-brand font-mono resize-none"
              />
              <button onClick={handleBulkParse} disabled={!bulkText.trim()} className="px-6 py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand-hover disabled:opacity-50 rounded-full transition-colors self-start">
                Parsear recetas →
              </button>
            </>
          )}
        </div>
      )}

      {/* MODO SINGLE */}
      {mode === 'single' && (
        <>
          {!parsed && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted">Pega el texto de la receta en formato .md y el sistema llenará el formulario automáticamente.</p>
              <textarea
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder={`## NOMBRE DE LA RECETA\nCategoría: Comidas\nDificultad: Fácil\nPrep: 15 min | Cocción: 30 min | Porciones: 4\nDescripción: ...\n\nIngredientes:\n- Tomate | 2 | piezas\n\nPasos:\n1. Primer paso...\n\nTags: mexicano, fácil`}
                rows={20}
                className="w-full p-4 text-sm bg-[#f7f7f7] border border-[#f0f0f0] rounded-xl outline-none focus:border-brand font-mono resize-none"
              />
              <button onClick={handleParse} disabled={!rawText.trim()} className="px-6 py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand-hover disabled:opacity-50 rounded-full transition-colors self-start">
                Parsear receta →
              </button>
            </div>
          )}

          {parsed && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-xl">
                <span className="text-sm text-green-700 font-medium">✅ Receta parseada correctamente</span>
                <button type="button" onClick={() => setParsed(false)} className="text-xs text-green-600 hover:underline">Volver a editar texto</button>
              </div>

              <section>
                <label className="form-label">Foto de la receta *</label>
                <div onClick={() => fileRef.current?.click()} className="mt-2 relative aspect-video rounded-[12px] border-2 border-dashed border-[#f0f0f0] overflow-hidden cursor-pointer bg-[#f7f7f7] hover:bg-[#f0f0f0] transition-colors flex items-center justify-center">
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm font-medium">Haz clic para subir la foto</span>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </section>

              <section className="flex flex-col gap-4">
                <div>
                  <label className="form-label">Título</label>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="form-input mt-1" required />
                </div>
                <div>
                  <label className="form-label">Descripción</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="form-input mt-1 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Categoría</label>
                    <select value={category} onChange={e => setCategory(e.target.value as typeof category)} className="form-input mt-1">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Dificultad</label>
                    <select value={difficulty} onChange={e => setDifficulty(e.target.value as Difficulty)} className="form-input mt-1">
                      {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><label className="form-label">Prep. (min)</label><input type="number" value={prepTime} onChange={e => setPrepTime(e.target.value)} className="form-input mt-1" /></div>
                  <div><label className="form-label">Cocción (min)</label><input type="number" value={cookTime} onChange={e => setCookTime(e.target.value)} className="form-input mt-1" /></div>
                  <div><label className="form-label">Porciones</label><input type="number" value={servings} onChange={e => setServings(e.target.value)} className="form-input mt-1" /></div>
                </div>
              </section>

              <section>
                <h2 className="form-label text-base font-semibold mb-3">Ingredientes ({ingredients.filter(i => i.name).length})</h2>
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                  {ingredients.map((ing, i) => (
                    <div key={i} className="flex gap-2 items-center text-sm">
                      <span className="flex-1 px-3 py-2 bg-[#f7f7f7] rounded-lg truncate">{ing.name}</span>
                      <span className="w-16 px-3 py-2 bg-[#f7f7f7] rounded-lg text-center">{ing.amount}</span>
                      <span className="w-20 px-3 py-2 bg-[#f7f7f7] rounded-lg">{ing.unit}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="form-label text-base font-semibold mb-3">Pasos ({steps.filter(s => s).length})</h2>
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                  {steps.map((step, i) => (
                    <div key={i} className="flex gap-3 items-start text-sm">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-[#fff5ee] text-brand text-xs font-semibold flex items-center justify-center mt-0.5">{i + 1}</span>
                      <p className="flex-1 px-3 py-2 bg-[#f7f7f7] rounded-lg leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <label className="form-label">Tags</label>
                <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="form-input mt-1" />
              </section>

              {error && <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">{error}</div>}
              {success && <div className="px-4 py-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700">{success}</div>}

              <div className="flex gap-3 pb-4">
                <button type="button" onClick={() => setParsed(false)} className="px-6 py-2.5 text-sm font-medium text-[#555] border border-border rounded-full hover:bg-[#f7f7f7] transition-colors">← Volver</button>
                <button type="submit" disabled={submitting || !imageFile} className="px-8 py-2.5 text-sm font-medium text-white bg-brand hover:bg-brand-hover disabled:opacity-60 rounded-full transition-colors">
                  {submitting ? 'Publicando...' : !imageFile ? 'Agrega la foto primero' : 'Publicar receta'}
                </button>
              </div>
            </form>
          )}
        </>
      )}

      <style>{`
        .form-label { display: block; font-size: 0.875rem; font-weight: 500; color: #111; }
        .form-input { display: block; width: 100%; padding: 0.625rem 0.875rem; font-size: 0.875rem; background: #f7f7f7; border: 1px solid #f0f0f0; border-radius: 0.75rem; outline: none; transition: border-color 0.15s; font-family: inherit; }
        .form-input:focus { border-color: #e85d04; background: #fff; }
      `}</style>
    </div>
  )
}
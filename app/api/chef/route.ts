import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase-server'
import type { ChefRecommendation } from '@/types'

const client = new Anthropic()
const DAILY_LIMIT = 3

export async function POST(request: NextRequest) {
  try {
    const { ingredients } = await request.json() as { ingredients: string[] }

    if (!ingredients?.length) {
      return NextResponse.json({ error: 'Necesito al menos un ingrediente' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para usar el Chef IA.' },
        { status: 401 }
      )
    }

    // Check daily usage — usar select en lugar de count para detectar errores
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)

    const { data: usageRows, error: countError } = await supabase
      .from('chef_usage')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString())

    if (countError) {
      console.error('[chef] Error al verificar uso:', countError.message)
      return NextResponse.json(
        { error: 'Error al verificar el límite de uso. Intenta de nuevo.' },
        { status: 500 }
      )
    }

    const usageCount = usageRows?.length ?? 0

    if (usageCount >= DAILY_LIMIT) {
      return NextResponse.json({
        error: `Has alcanzado el límite de ${DAILY_LIMIT} consultas diarias. ¡Vuelve mañana!`,
      }, { status: 429 })
    }

    // Registrar uso — verificar que se inserta correctamente
    const { error: insertError } = await supabase.from('chef_usage').insert({
      user_id: user.id,
    })

    if (insertError) {
      console.error('[chef] Error al registrar uso:', insertError.message)
      // Si no se puede registrar, bloqueamos para evitar bypass
      return NextResponse.json(
        { error: 'Error al registrar el uso. Intenta de nuevo.' },
        { status: 500 }
      )
    }

    // Fetch recipes — incluir slug para construir el link correcto
    const { data: recipes } = await supabase
      .from('recipes')
      .select('id, title, slug, ingredients, category')
      .limit(60)

    // Mapa id → slug para enriquecer las recomendaciones
    const slugMap: Record<string, string | null> = {}
    for (const r of recipes ?? []) {
      slugMap[r.id] = r.slug ?? null
    }

    const userIngredients = ingredients.join(', ')

    const recipeList = (recipes ?? [])
      .map((r) => {
        const ingNames = (r.ingredients as { name: string }[]).map((i) => i.name).join(', ')
        return `- ID:${r.id} | "${r.title}" | Categoría: ${r.category} | Ingredientes: ${ingNames}`
      })
      .join('\n')

    // ── Primera llamada: buscar recetas existentes ──────────────────────────
    const matchMessage = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: `Eres un asistente de cocina experto. Analiza qué recetas puede preparar el usuario con sus ingredientes.
Responde SOLO con un objeto JSON válido, sin markdown ni texto extra.
Formato exacto:
{
  "recommendations": [{"id":"...","title":"...","match_percentage":85,"missing_ingredients":["sal"],"category":"..."}],
  "generate_new": true
}
- "recommendations": máximo 3 recetas de la lista, ordenadas de mayor a menor coincidencia, con al menos 30% de match.
- "generate_new": true si hay menos de 3 recetas con ≥30% de coincidencia, false si ya tienes 3 o más.`,
      messages: [
        {
          role: 'user',
          content: `Ingredientes disponibles: ${userIngredients}

Recetas en la base de datos:
${recipeList || 'No hay recetas disponibles.'}

Devuelve el JSON.`,
        },
      ],
    })

    const rawMatch = matchMessage.content[0].type === 'text' ? matchMessage.content[0].text.trim() : '{}'
    const jsonMatch = rawMatch.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    const { recommendations: rawRecommendations, generate_new } = JSON.parse(jsonMatch) as {
      recommendations: Omit<ChefRecommendation, 'slug'>[]
      generate_new: boolean
    }

    // Enriquecer recomendaciones con slug
    const recommendations: ChefRecommendation[] = (rawRecommendations ?? []).map((rec) => ({
      ...rec,
      slug: slugMap[rec.id] ?? null,
    }))

    // ── Segunda llamada: generar receta nueva si hace falta ─────────────────
    let generatedRecipe: (ChefRecommendation & { generated: true; full_recipe: string }) | null = null

    if (generate_new) {
      const genMessage = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: `Eres un chef creativo. Crea una receta nueva y sencilla usando principalmente los ingredientes disponibles.
Responde SOLO con un objeto JSON válido, sin markdown ni texto extra.
Formato exacto:
{
  "title": "Nombre de la receta",
  "category": "Comidas",
  "match_percentage": 90,
  "missing_ingredients": ["ingrediente extra"],
  "full_recipe": "Descripción breve de cómo preparar la receta en 3-4 oraciones."
}`,
        messages: [
          {
            role: 'user',
            content: `Ingredientes disponibles: ${userIngredients}

Crea una receta original y deliciosa.`,
          },
        ],
      })

      const rawGen = genMessage.content[0].type === 'text' ? genMessage.content[0].text.trim() : '{}'
      const jsonGen = rawGen.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
      const parsed = JSON.parse(jsonGen)
      generatedRecipe = { ...parsed, id: 'ai-generated', slug: null, generated: true }
    }

    return NextResponse.json({
      recommendations,
      generatedRecipe,
      remaining: DAILY_LIMIT - usageCount - 1,
    })
  } catch (err) {
    console.error('[/api/chef]', err)
    return NextResponse.json(
      { error: 'No pude procesar tu consulta. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}

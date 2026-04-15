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

    // Get user ID if logged in
    const { data: { user } } = await supabase.auth.getUser()

    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? 'unknown'

    // Check daily usage
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let usageQuery = supabase
      .from('chef_usage')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())

    if (user) {
      usageQuery = usageQuery.eq('user_id', user.id)
    } else {
      usageQuery = usageQuery.eq('user_ip', ip)
    }

    const { count } = await usageQuery

    if ((count ?? 0) >= DAILY_LIMIT) {
      return NextResponse.json({
        error: `Has alcanzado el límite de ${DAILY_LIMIT} consultas diarias. ¡Vuelve mañana!`,
      }, { status: 429 })
    }

    // Log usage
    await supabase.from('chef_usage').insert({
      user_ip: ip,
      user_id: user?.id ?? null,
    })

    // Fetch recipes from database
    const { data: recipes } = await supabase
      .from('recipes')
      .select('id, title, ingredients, category')
      .limit(60)

    const userIngredients = ingredients.join(', ')

    const recipeList = (recipes ?? [])
      .map((r) => {
        const ingNames = (r.ingredients as { name: string }[]).map((i) => i.name).join(', ')
        return `- ID:${r.id} | "${r.title}" | Categoría: ${r.category} | Ingredientes: ${ingNames}`
      })
      .join('\n')

    // ── First call: match existing recipes ──────────────────────────────────
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
    const { recommendations, generate_new } = JSON.parse(jsonMatch) as {
      recommendations: ChefRecommendation[]
      generate_new: boolean
    }

    // ── Second call: generate a new recipe if needed ─────────────────────────
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
      generatedRecipe = { ...parsed, id: 'ai-generated', generated: true }
    }

    return NextResponse.json({ recommendations: recommendations ?? [], generatedRecipe })
  } catch (err) {
    console.error('[/api/chef]', err)
    return NextResponse.json(
      { error: 'No pude procesar tu consulta. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}
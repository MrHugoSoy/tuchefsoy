import RecipeCard from '@/components/recipe/RecipeCard'
import type { Recipe } from '@/types'

// Datos de ejemplo hasta conectar Supabase
const MOCK_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Tortilla española con pimientos',
    description: 'La tortilla de siempre, jugosa por dentro y con un toque de pimiento asado.',
    image_url: null,
    prep_time: 15,
    cook_time: 20,
    servings: 4,
    difficulty: 'Fácil',
    category: 'Comidas',
    ingredients: [],
    steps: [],
    likes_count: 142,
    author_id: 'u1',
    author: { id: 'u1', username: 'maricocinera', full_name: 'Mari García', avatar_url: null, bio: null, created_at: '' },
    created_at: '',
    updated_at: '',
  },
  {
    id: '2',
    title: 'Bizcocho de limón y yogur',
    description: 'Esponjoso, húmedo y con un glaseado de limón que no puedes resistir.',
    image_url: null,
    prep_time: 10,
    cook_time: 35,
    servings: 8,
    difficulty: 'Fácil',
    category: 'Postres',
    ingredients: [],
    steps: [],
    likes_count: 89,
    author_id: 'u2',
    author: { id: 'u2', username: 'pastelesconalma', full_name: 'Carlos Ruiz', avatar_url: null, bio: null, created_at: '' },
    created_at: '',
    updated_at: '',
  },
  {
    id: '3',
    title: 'Bowl de açaí con frutas del bosque',
    description: 'Desayuno energético y vegano cargado de antioxidantes.',
    image_url: null,
    prep_time: 10,
    cook_time: 0,
    servings: 2,
    difficulty: 'Fácil',
    category: 'Desayunos',
    ingredients: [],
    steps: [],
    likes_count: 204,
    author_id: 'u3',
    author: { id: 'u3', username: 'verdeyvivo', full_name: 'Laura Sánchez', avatar_url: null, bio: null, created_at: '' },
    created_at: '',
    updated_at: '',
  },
  {
    id: '4',
    title: 'Ramen casero con caldo de miso',
    description: 'Un ramen profundo y reconfortante preparado desde cero.',
    image_url: null,
    prep_time: 30,
    cook_time: 90,
    servings: 2,
    difficulty: 'Difícil',
    category: 'Cenas',
    ingredients: [],
    steps: [],
    likes_count: 317,
    author_id: 'u4',
    author: { id: 'u4', username: 'umamimaster', full_name: 'Pedro López', avatar_url: null, bio: null, created_at: '' },
    created_at: '',
    updated_at: '',
  },
  {
    id: '5',
    title: 'Smoothie verde detox',
    description: 'Espinacas, pepino, manzana y jengibre. El reset que tu cuerpo pide.',
    image_url: null,
    prep_time: 5,
    cook_time: 0,
    servings: 1,
    difficulty: 'Fácil',
    category: 'Bebidas',
    ingredients: [],
    steps: [],
    likes_count: 76,
    author_id: 'u5',
    author: { id: 'u5', username: 'jugosvitales', full_name: 'Ana Martínez', avatar_url: null, bio: null, created_at: '' },
    created_at: '',
    updated_at: '',
  },
  {
    id: '6',
    title: 'Hummus cremoso con pimentón ahumado',
    description: 'Receta vegana sin gluten. Perfecto para mojar con pan de pita o crudités.',
    image_url: null,
    prep_time: 10,
    cook_time: 0,
    servings: 6,
    difficulty: 'Fácil',
    category: 'Vegano',
    ingredients: [],
    steps: [],
    likes_count: 133,
    author_id: 'u1',
    author: { id: 'u1', username: 'maricocinera', full_name: 'Mari García', avatar_url: null, bio: null, created_at: '' },
    created_at: '',
    updated_at: '',
  },
]

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Encabezado de sección */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#111] mb-1">Descubre recetas</h1>
        <p className="text-sm text-muted">
          Inspírate con las mejores recetas de nuestra comunidad
        </p>
      </div>

      {/* Grid estilo Pinterest — 3 columnas */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
        {MOCK_RECIPES.map((recipe) => (
          <div key={recipe.id} className="break-inside-avoid">
            <RecipeCard recipe={recipe} />
          </div>
        ))}
      </div>

      {/* Empty state (para cuando no haya recetas) */}
      {MOCK_RECIPES.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-[#fff5ee] flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#111] mb-1">Sin recetas aún</h2>
          <p className="text-sm text-muted">Sé el primero en compartir una receta.</p>
        </div>
      )}
    </div>
  )
}

export type Category =
  | 'Todo'
  | 'Desayunos'
  | 'Comidas'
  | 'Cenas'
  | 'Postres'
  | 'Bebidas'
  | 'Vegano'
  | 'Sin gluten'
  | 'Snacks'

export type Difficulty = 'Fácil' | 'Media' | 'Difícil'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
}

export interface Recipe {
  id: string
  title: string
  description: string | null
  image_url: string | null
  prep_time: number // minutes
  cook_time: number // minutes
  servings: number
  difficulty: Difficulty
  category: Category
  ingredients: string[]
  steps: string[]
  likes_count: number
  author_id: string
  author?: Profile
  created_at: string
  updated_at: string
}

export interface RecipeComment {
  id: string
  recipe_id: string
  author_id: string
  author?: Profile
  content: string
  created_at: string
}

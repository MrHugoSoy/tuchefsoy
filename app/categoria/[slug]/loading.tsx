import RecipeCardSkeleton from '@/components/recipe/RecipeCardSkeleton'

export default function CategoryLoading() {
  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 sm:py-8">
      <div className="mb-5 sm:mb-7">
        <div className="h-7 w-40 bg-[#f0f0f0] rounded-full animate-pulse mb-2" />
        <div className="h-4 w-24 bg-[#f0f0f0] rounded-full animate-pulse" />
      </div>
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="break-inside-avoid">
            <RecipeCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  )
}

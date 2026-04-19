export default function RecipeCardSkeleton() {
  return (
    <div className="rounded-[12px] border border-[#f0f0f0] bg-white overflow-hidden">
      {/* Image skeleton */}
      <div className="relative aspect-[4/3] bg-[#f0f0f0] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#f0f0f0] via-[#e8e8e8] to-[#f0f0f0] animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="p-4">
        {/* Title */}
        <div className="h-4 bg-[#f0f0f0] rounded-full animate-pulse mb-2" />
        <div className="h-4 bg-[#f0f0f0] rounded-full animate-pulse w-3/4 mb-4" />

        {/* Meta */}
        <div className="flex items-center gap-3 mb-3">
          <div className="h-3 w-16 bg-[#f0f0f0] rounded-full animate-pulse" />
          <div className="h-3 w-12 bg-[#f0f0f0] rounded-full animate-pulse" />
        </div>

        {/* Author */}
        <div className="flex items-center gap-2 pt-3 border-t border-[#f0f0f0]">
          <div className="w-6 h-6 rounded-full bg-[#f0f0f0] animate-pulse shrink-0" />
          <div className="h-3 w-20 bg-[#f0f0f0] rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}
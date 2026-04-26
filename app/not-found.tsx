import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFAF7] px-4">
      <div className="text-center max-w-md">
        <span className="text-7xl block mb-2 animate-bounce">👨‍🍳</span>
        <h1 className="font-serif text-8xl font-bold text-[#D85A30] leading-none tracking-tight">
          404
        </h1>
        <div className="w-12 h-1 bg-[#D85A30] rounded mx-auto my-4" />
        <h2 className="font-serif text-2xl font-bold text-gray-800 mb-3">
          ¡Esta receta no existe!
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Parece que esta página se quemó en la cocina.<br />
          Pero tenemos miles de recetas deliciosas esperándote.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/"
            className="bg-[#D85A30] text-white font-bold px-8 py-3 rounded-lg hover:bg-[#993C1D] transition-colors"
          >
            Ir al inicio
          </Link>
          <Link
            href="/recetas"
            className="border-2 border-[#D85A30] text-[#D85A30] font-bold px-6 py-3 rounded-lg hover:bg-[#FAECE7] transition-colors"
          >
            Explorar recetas
          </Link>
        </div>
      </div>
    </div>
  )
}
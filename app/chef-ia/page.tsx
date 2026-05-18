import type { Metadata } from 'next'
import ChefAssistant from '@/components/ai/ChefAssistant'

export const metadata: Metadata = {
  title: 'Chef IA — Recetas con lo que tienes en casa | TuChefSoy',
  description: 'Dile al Chef IA qué ingredientes tienes y te sugiere recetas al instante. Gratis, sin registro.',
  openGraph: {
    title: 'Chef IA — Recetas con lo que tienes en casa',
    description: 'Dile al Chef IA qué ingredientes tienes y te sugiere recetas al instante. Gratis, sin registro.',
    url: 'https://tuchefsoy.com/chef-ia',
    siteName: 'TuChefSoy',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chef IA — Recetas con lo que tienes en casa',
    description: 'Dile al Chef IA qué ingredientes tienes y te sugiere recetas al instante. Gratis, sin registro.',
  },
}

const HOW_IT_WORKS = [
  {
    step: '1',
    title: 'Escribe tus ingredientes',
    desc: 'Agrega lo que tienes en casa uno por uno o separado por comas.',
  },
  {
    step: '2',
    title: 'El Chef analiza',
    desc: 'Busca recetas existentes y crea una nueva exclusiva para ti.',
  },
  {
    step: '3',
    title: 'Cocina al instante',
    desc: 'Elige una sugerencia y sigue la receta paso a paso.',
  },
]

export default function ChefIAPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">

      {/* Hero */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff5ee] border border-brand/20 text-xs font-medium text-brand mb-4">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Inteligencia artificial
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-[#111] mb-3">
          Dime qué tienes<br className="hidden sm:block" /> y te digo qué cocinar
        </h1>
        <p className="text-[#555] leading-relaxed">
          Escribe los ingredientes que tienes en casa y el Chef IA encontrará recetas que puedes preparar ahora mismo, o creará una receta nueva exclusiva para ti.
        </p>
      </div>

      {/* Componente principal */}
      <ChefAssistant />

      {/* Cómo funciona */}
      <div className="mt-12 pt-10 border-t border-border">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-widest mb-6">Cómo funciona</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map(({ step, title, desc }) => (
            <div key={step} className="flex gap-3 sm:flex-col sm:gap-2">
              <div className="shrink-0 w-7 h-7 rounded-full bg-[#fff5ee] border border-brand/20 flex items-center justify-center text-xs font-bold text-brand">
                {step}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111] mb-0.5">{title}</p>
                <p className="text-xs text-muted leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

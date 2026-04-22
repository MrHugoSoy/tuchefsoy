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

export default function ChefIAPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-semibold mb-3 leading-tight">
        Chef IA: dime qué tienes y te digo qué cocinar
      </h1>
      <p className="text-sm text-muted mb-8">
        Escribe los ingredientes que tienes en casa y el Chef IA te propondrá recetas fáciles y deliciosas al instante. Sin registro, sin complicaciones.
      </p>
      <ChefAssistant />
    </div>
  )
}

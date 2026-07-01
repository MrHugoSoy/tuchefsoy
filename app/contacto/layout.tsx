import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Ponte en contacto con el equipo de TuChefSoy. Dudas, sugerencias o colaboraciones bienvenidas.',
  openGraph: {
    title: 'Contacto — TuChefSoy',
    description: 'Ponte en contacto con el equipo de TuChefSoy.',
  },
}

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

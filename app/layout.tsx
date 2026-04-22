import type { Metadata } from 'next'
import { Suspense } from 'react'
import Script from 'next/script'
import { Geist } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import AuthModal from '@/components/auth/AuthModal'
import Topbar from '@/components/layout/Topbar'
import CategoryBar from '@/components/layout/CategoryBar'

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://tuchefsoy.com'),
  title: {
    default: 'TuChefSoy — Recetas fáciles para cocinar hoy',
    template: '%s | TuChefSoy',
  },
  description: 'Recetas fáciles, saludables y rápidas para cocinar hoy. Encuentra inspiración por ingrediente, categoría o deja que nuestro Chef IA te sugiera qué preparar.',
  keywords: ['recetas', 'recetas fáciles', 'recetas saludables', 'cocinar hoy', 'chef IA', 'ingredientes', 'comida'],
  icons: {
    icon: '/logo.svg',
  },
  openGraph: {
    siteName: 'TuChefSoy',
    locale: 'es_ES',
    type: 'website',
    title: 'TuChefSoy — Recetas fáciles para cocinar hoy',
    description: 'Recetas fáciles, saludables y rápidas para cocinar hoy. Encuentra inspiración por ingrediente, categoría o deja que nuestro Chef IA te sugiera qué preparar.',
    url: 'https://tuchefsoy.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TuChefSoy — Recetas fáciles para cocinar hoy',
    description: 'Recetas fáciles, saludables y rápidas para cocinar hoy.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8458170443836025"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-J1RF2NFE47"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-J1RF2NFE47');
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-white text-[#111]">
        <AuthProvider>
          <Suspense fallback={<div className="h-16 border-b border-border bg-white" />}>
            <Topbar />
          </Suspense>
          <Suspense fallback={<div className="h-12 border-b border-[#f0f0f0] bg-white" />}>
            <CategoryBar />
          </Suspense>
          <main className="flex-1">{children}</main>
          <AuthModal />
          <footer className="border-t border-border mt-16">
            <div className="max-w-[1400px] mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
              <span>
                © {new Date().getFullYear()}{' '}
                <span className="font-semibold text-[#111]">TuChefSoy</span>
              </span>
              <div className="flex gap-5">
                <a href="/privacidad" className="hover:text-[#111] transition-colors">Privacidad</a>
                <a href="/terminos" className="hover:text-[#111] transition-colors">Términos</a>
                <a href="/contacto" className="hover:text-[#111] transition-colors">Contacto</a>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
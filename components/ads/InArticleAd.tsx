'use client'

import { useEffect } from 'react'

export default function InArticleAd() {
  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).adsbygoogle.push({})
    } catch {
      // AdSense no cargó aún, no es crítico
    }
  }, [])

  return (
    <div className="mb-10 no-print">
      <p className="text-[10px] text-muted uppercase tracking-wide mb-1">Publicidad</p>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client="ca-pub-8458170443836025"
        data-ad-slot="8855705931"
      />
    </div>
  )
}

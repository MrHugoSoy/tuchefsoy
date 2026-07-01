'use client'

import { useEffect } from 'react'

export default function InFeedAd() {
  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).adsbygoogle = (window as any).adsbygoogle || []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).adsbygoogle.push({})
    } catch {
      // AdSense no cargó aún
    }
  }, [])

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-format="fluid"
      data-ad-layout-key="-6t+ed+2i-1n-4w"
      data-ad-client="ca-pub-8458170443836025"
      data-ad-slot="6754535639"
    />
  )
}

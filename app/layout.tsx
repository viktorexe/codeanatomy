import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CodeAnatomy - C Program Visualizer',
  description: 'Interactive web-based visualizer that reveals the internal mechanics of C programs. Visualize memory, data structures, and system-level behavior in real-time.',
  keywords: ['C programming', 'memory visualization', 'data structures', 'programming education', 'code visualizer'],
  authors: [{ name: 'CodeAnatomy Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  icons: {
    icon: '/favicon.ico',
    apple: '/codeanatomy_logo.png',
  },
  openGraph: {
    title: 'CodeAnatomy - C Program Visualizer',
    description: 'Interactive web-based visualizer for C programs, memory, and data structures',
    url: 'https://codeanatomy.vercel.app',
    siteName: 'CodeAnatomy',
    images: [{
      url: '/codeanatomy_logo.png',
      width: 1200,
      height: 630,
      alt: 'CodeAnatomy - C Program Visualizer',
    }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeAnatomy - C Program Visualizer',
    description: 'Interactive web-based visualizer for C programs, memory, and data structures',
    images: ['/codeanatomy_logo.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>{children}</body>
    </html>
  )
}
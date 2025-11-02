import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CodeAnatomy - C Code Explainer',
  description: 'Intelligent C code explainer that breaks down your programs line-by-line. Understand what your C code does with detailed explanations and memory analysis.',
  keywords: ['C programming', 'code explainer', 'programming education', 'code analysis', 'C tutorial'],
  authors: [{ name: 'CodeAnatomy Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  icons: {
    icon: '/favicon.ico',
    apple: '/codeanatomy_logo.png',
  },
  openGraph: {
    title: 'CodeAnatomy - C Code Explainer',
    description: 'Intelligent C code explainer with line-by-line analysis and memory insights',
    url: 'https://codeanatomy.vercel.app',
    siteName: 'CodeAnatomy',
    images: [{
      url: '/codeanatomy_logo.png',
      width: 1200,
      height: 630,
      alt: 'CodeAnatomy - C Code Explainer',
    }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CodeAnatomy - C Code Explainer',
    description: 'Intelligent C code explainer with line-by-line analysis and memory insights',
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
      <body>{children}</body>
    </html>
  )
}
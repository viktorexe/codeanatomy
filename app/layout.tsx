import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CodeAnatomy - C Program Visualizer',
  description: 'Interactive visualizer for C programs, memory, and data structures',
  viewport: 'width=device-width, initial-scale=1',
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
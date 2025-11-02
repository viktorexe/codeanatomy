import './globals.css'

export const metadata = {
  title: 'CodeAnatomy - C Program Visualizer',
  description: 'Interactive visualizer for C programs, memory, and data structures',
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
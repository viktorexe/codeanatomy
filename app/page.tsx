'use client'

import { useEffect } from 'react'
import MainInterface from '@/components/MainInterface'

export default function Home() {
  useEffect(() => {
    // Load main interface styles
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '/styles/main-interface.css'
    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [])

  return <MainInterface />
}
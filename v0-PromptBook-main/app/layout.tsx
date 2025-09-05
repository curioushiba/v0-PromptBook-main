import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mage Craft - AI Prompt Engineering Platform',
  description: 'Empower your AI interactions with structured prompt engineering',
  generator: 'Next.js',
  keywords: 'AI, prompt engineering, ChatGPT, Claude, Gemini, prompts',
  authors: [{ name: 'Mage Craft Team' }],
  openGraph: {
    title: 'Mage Craft - AI Prompt Engineering Platform',
    description: 'Empower your AI interactions with structured prompt engineering',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className={GeistSans.className}>
        {children}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 4000,
          }}
        />
        <Analytics />
      </body>
    </html>
  )
}

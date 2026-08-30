import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { NavProvider } from '@/context/NavContext'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'AI Content Transformer — One Source. Every Communication Format.',
  description: 'Enterprise Generative AI platform that transforms documents, reports, and unstructured data into verified, multi-format communication artefacts.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="font-sans bg-slate-50 text-slate-900 text-[15px] leading-normal antialiased min-h-screen flex flex-col selection:bg-sky-500 selection:text-white" suppressHydrationWarning>
        <NavProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
        </NavProvider>
      </body>
    </html>
  )
}

// app/layout.js
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CampaignWatch Kenya 🇰🇪',
  description: 'Transparent political finance monitoring ahead of Kenya 2027 Elections — Transparency International Kenya / KISP',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-ash min-h-screen`}>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="bg-navy text-white text-center py-4 text-sm mt-16">
          Campaign Finance Watch Tool &nbsp;·&nbsp; Built for Transparency International Kenya
          &nbsp;·&nbsp; KISP Programme &nbsp;·&nbsp; FCDO Supported
        </footer>
      </body>
    </html>
  )
}

// app/layout.js
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import PrototypeBanner from '@/components/PrototypeBanner'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'The Samaritan — Campaign Finance Watch Kenya 🇰🇪',
  description: 'Transparent political finance monitoring ahead of Kenya 2027 Elections — Transparency International Kenya / KISP Programme',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-ash min-h-screen flex flex-col`}>
        <Navbar />
        <PrototypeBanner />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full pb-24 md:pb-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}

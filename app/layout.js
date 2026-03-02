
// app/layout.js
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'CampaignWatch Kenya 🇰🇪',
  description: 'Transparent political finance monitoring ahead of Kenya 2027 Elections — Transparency International Kenya / KISP',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-bg-primary text-text-primary min-h-screen flex flex-col pb-[env(safe-area-inset-bottom,20px)]`}>
        <Navbar />
        {/* Added pb-24 to ensure content isn't hidden behind the BottomNav */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
          {children}
        </main>

        {/* Hidden on mobile completely, replaced by BottomNav context */}
        <footer className="hidden md:block bg-white border-t border-border-subtle text-text-secondary text-center py-6 text-sm mt-8 font-medium">
          Campaign Finance Watch Tool &nbsp;·&nbsp; Built for Transparency International Kenya
          <span className="hidden md:inline">&nbsp;·&nbsp;</span> KISP Programme &nbsp;·&nbsp; FCDO Supported
        </footer>

        {/* Global Mobile Bottom Navigation */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </body>
    </html>
  )
}

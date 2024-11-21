'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Home, BarChart3 as BarChart, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/applications', label: 'Applications', icon: Briefcase },
    { href: '/analytics', label: 'Analytics', icon: BarChart },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className={`${isMobile ? 'hidden' : 'fixed'} w-64 h-full bg-gray-900 p-4 shadow-lg z-10`}
      >
        <div className="flex justify-between items-center mb-6">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold">
              JobTrack<span className="text-yellow-400">r</span>
            </h1>
          </Link>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.href}
                variant="ghost"
                className={`w-full justify-start ${
                  pathname === item.href ? 'bg-gray-800' : ''
                }`}
                asChild
              >
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" /> {item.label}
                </Link>
              </Button>
            )
          })}
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-400 hover:text-red-500 hover:bg-red-500/10"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        </nav>
      </motion.aside>

      {/* Main content */}
      <main className={`${isMobile ? '' : 'ml-64'} p-8`}>
        {children}
      </main>
    </div>
  )
} 
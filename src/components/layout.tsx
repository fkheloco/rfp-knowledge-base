'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Building2, 
  Users, 
  FolderOpen, 
  Upload, 
  MessageSquare, 
  LogOut,
  Menu,
  X
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        if (!session && pathname !== '/auth/login' && pathname !== '/auth/signup') {
          router.push('/auth/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Building2 },
    { name: 'Records', href: '/records', icon: FolderOpen },
    { name: 'Upload', href: '/upload', icon: Upload },
    { name: 'Chat', href: '/chat', icon: MessageSquare },
  ]

  if (pathname === '/auth/login' || pathname === '/auth/signup') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-bold text-slate-900">RFP Knowledge Base</h1>
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="mt-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium ${
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </a>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-slate-200">
          <div className="flex items-center px-4 py-6 border-b border-slate-200">
            <h1 className="text-xl font-bold text-slate-900">RFP Knowledge Base</h1>
          </div>
          <nav className="mt-4 flex-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium ${
                    pathname === item.href
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </a>
              )
            })}
          </nav>
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{user?.email}</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-slate-900">RFP Knowledge Base</h1>
          <div className="w-8" />
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

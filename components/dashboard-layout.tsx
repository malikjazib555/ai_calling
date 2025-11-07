'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Phone,
  ShoppingCart,
  Settings,
  Menu,
  X,
  Zap,
  Activity,
  Link as LinkIcon,
  Radio,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Agents', href: '/', icon: LayoutDashboard },
  { name: 'Calls', href: '/calls', icon: Phone },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Analytics', href: '/analytics', icon: Activity },
  { name: 'Recordings', href: '/recordings', icon: Radio },
  { name: 'Webhooks', href: '/webhooks', icon: LinkIcon },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [liveCalls, setLiveCalls] = useState(0)

  useEffect(() => {
    // WebSocket connection for live calls count
    const wsPort = process.env.NEXT_PUBLIC_WS_PORT || '3001'
    const ws = new WebSocket(`ws://localhost:${wsPort}`)
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'live_calls_update') {
        setLiveCalls(data.count)
      }
    }

    return () => ws.close()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Status Bar */}
      <div className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <h1 className="text-xl font-bold">BizzAI</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-muted-foreground">Live Calls:</span>
              <span className="font-semibold">{liveCalls}</span>
            </div>
            
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Cost/min:</span>
              <span className="font-semibold">$0.02</span>
            </div>
            
            <Button asChild variant="outline" size="sm">
              <Link href="/test-call">
                <Zap className="h-4 w-4 mr-2" />
                Test Call
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 bg-black/50 backdrop-blur-sm transition-transform lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
            'pt-16'
          )}
        >
          <nav className="flex flex-col gap-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}


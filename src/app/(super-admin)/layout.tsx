'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  Database, 
  FileText, 
  Menu, 
  X, 
  Home,
  UserCheck,
  Activity,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const sidebarItems = [
  {
    title: 'Dashboard',
    href: '/super-admin',
    icon: Home
  },
  {
    title: 'User Management',
    href: '/super-admin/user-management',
    icon: Users
  },
  {
    title: 'Admin Management',
    href: '/super-admin/admin-management',
    icon: UserCheck
  },
  {
    title: 'System Analytics',
    href: '/super-admin/analytics',
    icon: BarChart3
  },
  {
    title: 'Activity Logs',
    href: '/super-admin/activity-logs',
    icon: Activity
  },
  {
    title: 'Database Management',
    href: '/super-admin/database',
    icon: Database
  },
  {
    title: 'Security Settings',
    href: '/super-admin/security',
    icon: Shield
  },
  {
    title: 'System Reports',
    href: '/super-admin/reports',
    icon: FileText
  },
  {
    title: 'System Health',
    href: '/super-admin/system-health',
    icon: AlertTriangle
  },
  {
    title: 'Global Settings',
    href: '/super-admin/settings',
    icon: Settings
  }
]

function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white/90 backdrop-blur-sm shadow-xl transform transition-all duration-300 ease-in-out border-r border-sky-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative
        ${sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'}
        w-64
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <h1 className="text-lg font-bold text-sky-800">Super Admin</h1>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {/* Desktop collapse toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex hover:bg-sky-100 text-sky-700"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
            {/* Mobile close button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden hover:bg-sky-100 text-sky-700"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative
                  ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}
                  ${isActive 
                    ? 'bg-sky-50 text-sky-700 border border-sky-200' 
                    : 'text-sky-600 hover:bg-sky-50 hover:text-sky-800'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
                title={sidebarCollapsed ? item.title : undefined}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-sky-600' : 'text-sky-500'}`} />
                {!sidebarCollapsed && <span>{item.title}</span>}
                
                {/* Tooltip for collapsed state */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-2 bg-sky-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                    {item.title}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User info at bottom */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-sky-200">
            <Card className="p-3 bg-sky-50 border-sky-200 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-sky-800">Super Admin</p>
                  <p className="text-xs text-sky-600">Full System Access</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-sky-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden hover:bg-sky-100 text-sky-700"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h2 className="text-lg font-semibold text-sky-800">
                Super Admin Panel
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">System Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 bg-transparent">
          {children}
        </main>
      </div>
    </div>
  )
}

export default SuperAdminLayout

'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, UserCheck, Activity, Shield, Database, AlertTriangle, TrendingUp, Eye, Settings, FileText } from 'lucide-react'
import Link from 'next/link'

function SuperAdminDashboard() {
  const stats = [
    {
      title: 'Total Users',
      value: '12,345',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Active Admins',
      value: '23',
      change: '+2',
      changeType: 'positive' as const,
      icon: UserCheck,
      color: 'green'
    },
    {
      title: 'System Activities',
      value: '1,234',
      change: '+5%',
      changeType: 'positive' as const,
      icon: Activity,
      color: 'purple'
    },
    {
      title: 'Security Alerts',
      value: '3',
      change: '-2',
      changeType: 'negative' as const,
      icon: AlertTriangle,
      color: 'red'
    },
    {
      title: 'Database Size',
      value: '2.4 GB',
      change: '+0.1 GB',
      changeType: 'neutral' as const,
      icon: Database,
      color: 'gray'
    },
    {
      title: 'System Health',
      value: '99.9%',
      change: 'Excellent',
      changeType: 'positive' as const,
      icon: Shield,
      color: 'emerald'
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
      gray: 'bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800',
      emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 dark:text-green-400'
      case 'negative':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-sky-800 mb-2">
              Super Admin Dashboard
            </h1>
            <p className="text-sky-600">
              Monitor and manage your entire system from this central control panel
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="shadow-xl border-0 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-sky-700">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${getColorClasses(stat.color)}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-sky-800 mb-1">{stat.value}</div>
                <p className={`text-xs ${getChangeColor(stat.changeType)}`}>
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-xl font-bold text-sky-800">
              Recent System Activities
            </CardTitle>
            <CardDescription className="text-sky-600">
              Latest administrative actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'New user registered', user: 'john.doe@email.com', time: '2 minutes ago' },
                { action: 'Admin permissions updated', user: 'admin@system.com', time: '15 minutes ago' },
                { action: 'Database backup completed', user: 'System', time: '1 hour ago' },
                { action: 'Security scan completed', user: 'System', time: '2 hours ago' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-sky-50 rounded-lg border border-sky-200">
                  <div>
                    <p className="text-sm font-medium text-sky-800">{activity.action}</p>
                    <p className="text-xs text-sky-600">{activity.user}</p>
                  </div>
                  <span className="text-xs text-sky-600 bg-white px-2 py-1 rounded-full border border-sky-200">{activity.time}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full border-sky-200 text-sky-700 hover:bg-sky-50" asChild>
                <Link href="/super-admin/activity-logs">
                  View All Activities
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-xl font-bold text-sky-800">
              System Status
            </CardTitle>
            <CardDescription className="text-sky-600">
              Current system health overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { service: 'Database', status: 'Online', color: 'green' },
                { service: 'Authentication Service', status: 'Online', color: 'green' },
                { service: 'Email Service', status: 'Online', color: 'green' },
                { service: 'File Storage', status: 'Warning', color: 'yellow' },
                { service: 'Backup Service', status: 'Online', color: 'green' }
              ].map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-sky-50 rounded-lg border border-sky-200">
                  <span className="text-sm font-medium text-sky-800">{service.service}</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      service.color === 'green' ? 'bg-green-500' : 
                      service.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      service.color === 'green' ? 'text-green-700 bg-green-100' : 
                      service.color === 'yellow' ? 'text-yellow-700 bg-yellow-100' : 'text-red-700 bg-red-100'
                    }`}>
                      {service.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full border-sky-200 text-sky-700 hover:bg-sky-50" asChild>
                <Link href="/super-admin/system-health">
                  System Health Details
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-xl font-bold text-sky-800">
            Quick Actions
          </CardTitle>
          <CardDescription className="text-sky-600">
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'Create Admin', href: '/super-admin/admin-management' },
              { title: 'View Reports', href: '/super-admin/reports' },
              { title: 'System Backup', href: '/super-admin/database' },
              { title: 'Security Audit', href: '/super-admin/security' }
            ].map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="p-4 rounded-lg border-2 border-dashed border-sky-300 hover:border-sky-400 hover:bg-sky-50 transition-colors text-center bg-sky-50/50"
              >
                <p className="text-sm font-medium text-sky-800">{action.title}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SuperAdminDashboard

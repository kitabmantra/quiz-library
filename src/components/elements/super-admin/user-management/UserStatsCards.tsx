"use client"
import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Shield, Crown, Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface UserStats {
  totalUsers: number
  totalAdmins: number
  totalSuperAdmins: number
  recentUsers: number
}

interface UserStatsCardsProps {
  stats: UserStats
  totalUsers: number
  error?: Error | null
  isLoading: boolean
}

export function UserStatsCards({ stats, totalUsers, error, isLoading }: UserStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white/70 backdrop-blur-sm border-white/30 shadow-sm">
            <CardContent className="p-4">
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-6 w-12 mb-1" />
              <Skeleton className="h-2 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-red-50/70 backdrop-blur-sm border-red-200/30 shadow-sm">
            <CardContent className="p-4">
              <div className="text-red-600 text-xs">Error loading stats</div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50/80",
      borderColor: "border-blue-200/20",
    },
    {
      title: "Admins",
      value: stats.totalAdmins,
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-50/80",
      borderColor: "border-green-200/20",
    },
    {
      title: "Super Admins",
      value: stats.totalSuperAdmins,
      icon: Crown,
      color: "text-purple-600",
      bgColor: "bg-purple-50/80",
      borderColor: "border-purple-200/20",
    },
    {
      title: "Recent Users",
      value: stats.recentUsers,
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50/80",
      borderColor: "border-orange-200/20",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className={`${card.bgColor} backdrop-blur-sm ${card.borderColor} transition-all duration-200 hover:shadow-md hover:scale-[1.02] shadow-sm`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600 mb-1">{card.title}</p>
                <p className={`text-xl font-bold ${card.color}`}>
                  {card.value.toLocaleString()}
                </p>
              </div>
              <card.icon className={`w-6 h-6 ${card.color} opacity-70`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/*eslint-disable */
import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Target, BarChart3, Zap, TrendingUp, AlertCircle } from "lucide-react"

interface StatsCardsProps {
  stats: {
    easyQuestions: number
    mediumQuestions: number
    hardQuestions: number
    recentQuestions: number
  }
  totalQuestions: number
  isLoading?: boolean
  error?: any
}

export const StatsCards = React.memo(({ stats, totalQuestions, isLoading, error }: StatsCardsProps) => {
  // Show error state
  if (error) {
    return (
      <div className="mb-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Dashboard data has failed to load</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Questions</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <FileText className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Easy Questions</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Target className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Medium Questions</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <BarChart3 className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-rose-500 to-pink-500 text-white border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-rose-100 text-sm font-medium">Hard Questions</p>
                  <p className="text-3xl font-bold">0</p>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Zap className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Questions</p>
              <p className="text-3xl font-bold">{totalQuestions}</p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm text-blue-100">+12 this week</span>
              </div>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <FileText className="w-8 h-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium">Easy Questions</p>
              <p className="text-3xl font-bold">{stats.easyQuestions}</p>
              <div className="flex items-center gap-2 mt-2">
                <Target className="w-4 h-4" />
                <span className="text-sm text-emerald-100">Beginner friendly</span>
              </div>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Target className="w-8 h-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm font-medium">Medium Questions</p>
              <p className="text-3xl font-bold">{stats.mediumQuestions}</p>
              <div className="flex items-center gap-2 mt-2">
                <BarChart3 className="w-4 h-4" />
                <span className="text-sm text-amber-100">Intermediate level</span>
              </div>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <BarChart3 className="w-8 h-8" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-rose-500 to-pink-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-rose-100 text-sm font-medium">Hard Questions</p>
              <p className="text-3xl font-bold">{stats.hardQuestions}</p>
              <div className="flex items-center gap-2 mt-2">
                <Zap className="w-4 h-4" />
                <span className="text-sm text-rose-100">Advanced level</span>
              </div>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Zap className="w-8 h-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

StatsCards.displayName = "StatsCards" 
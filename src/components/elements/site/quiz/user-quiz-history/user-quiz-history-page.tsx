"use client"

import type React from "react"
import { useState } from "react"
import { intervalToDuration } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  BarChart3,
  Plus,
  AlertTriangle,
  Loader2,
  Calendar,
  TrendingUp,
  ArrowLeft,
  Home,
  Target,
  Award,
} from "lucide-react"
import { useGetUserPastHistory } from "@/lib/hooks/tanstack-query/query-hook/quiz/quiz-history/use-get-user-past-history"
import { useRouter } from "next/navigation"

// Types based on the backend structure
interface UserQuizQuestionType {
  questionId: string
  userAnswer: string
  isCorrect: boolean
  isTimeOut: boolean
  timeSpent: number
}

interface UserQuizQuestionHistory {
  id: string
  userId: string
  correctQuestions: UserQuizQuestionType[]
  wrongQuestions: UserQuizQuestionType[]
  createdAt: string
  updatedAt: string
}

function UserQuizHistoryPage() {
  const { data, isLoading, error } = useGetUserPastHistory()
  const router = useRouter()
  const [selectedHistory, setSelectedHistory] = useState<UserQuizQuestionHistory | null>(null)
  const [showHistoryDetail, setShowHistoryDetail] = useState(false)

  console.log("this is the data : ", data)
  console.log("this is the history data : ", data?.questions)
  console.log("this is the history structure : ", {
    id: data?.questions?.id,
    correctQuestions: data?.questions?.correctQuestions?.length,
    wrongQuestions: data?.questions?.wrongQuestions?.length,
  })

  const formatTime = (seconds: number) => {
    const safeSeconds = Math.max(0, Math.floor(seconds || 0))
    const d = intervalToDuration({ start: 0, end: safeSeconds * 1000 })
    const hours = d.hours || 0
    const minutes = String(d.minutes || 0).padStart(hours ? 2 : 1, "0")
    const secs = String(d.seconds || 0).padStart(2, "0")
    return hours ? `${hours}:${minutes}:${secs}` : `${minutes}:${secs}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600"
    if (score >= 60) return "text-amber-600"
    return "text-red-500"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-emerald-50 border-emerald-200"
    if (score >= 60) return "bg-amber-50 border-amber-200"
    return "bg-red-50 border-red-200"
  }

  const getScoreMessage = (score: number) => {
    if (score >= 90) return "Excellent! Outstanding performance!"
    if (score >= 80) return "Great job! Well done!"
    if (score >= 70) return "Good work! Keep it up!"
    if (score >= 60) return "Not bad! Room for improvement."
    return "Keep practicing! You can do better!"
  }

  const calculateHistoryStats = (history: UserQuizQuestionHistory) => {
    // Ensure arrays exist and are arrays
    const correctQuestions = Array.isArray(history.correctQuestions) ? history.correctQuestions : []
    const wrongQuestions = Array.isArray(history.wrongQuestions) ? history.wrongQuestions : []

    const totalQuestions = correctQuestions.length + wrongQuestions.length
    const score = totalQuestions > 0 ? Math.round((correctQuestions.length / totalQuestions) * 100) : 0
    const totalTime = [...correctQuestions, ...wrongQuestions].reduce((sum, q) => sum + (q?.timeSpent || 0), 0)
    const averageTime = totalQuestions > 0 ? Math.round(totalTime / totalQuestions) : 0
    const timeoutCount = [...correctQuestions, ...wrongQuestions].filter((q) => q?.isTimeOut).length

    return {
      totalQuestions,
      score,
      totalTime,
      averageTime,
      timeoutCount,
      correctCount: correctQuestions.length,
      wrongCount: wrongQuestions.length,
    }
  }

  const TimeSeriesChart: React.FC<{ times: number[]; correctness: boolean[] }> = ({ times, correctness }) => {
    // Safety check for empty arrays
    if (!Array.isArray(times) || !Array.isArray(correctness) || times.length === 0) {
      return (
        <div className="w-full h-40 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center border border-slate-200">
          <p className="text-slate-500 font-medium">No data available for chart</p>
        </div>
      )
    }

    const paddingX = 24
    const paddingY = 16
    const width = 800
    const height = 160
    const innerW = width - paddingX * 2
    const innerH = height - paddingY * 2

    const maxTime = Math.max(1, ...times)
    const pointCount = times.length
    const stepX = pointCount > 1 ? innerW / (pointCount - 1) : 0

    const points = times.map((t, i) => {
      const x = paddingX + i * stepX
      const y = paddingY + (innerH - (t / maxTime) * innerH)
      return { x, y }
    })

    const polyline = points.map((p) => `${p.x},${p.y}`).join(" ")
    const avgY =
      paddingY + (innerH - (Math.min(maxTime, times.reduce((a, b) => a + b, 0) / times.length) / maxTime) * innerH)

    return (
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
          <rect x={0} y={0} width={width} height={height} fill="white" />
          <g>
            {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => (
              <line
                key={idx}
                x1={paddingX}
                x2={width - paddingX}
                y1={paddingY + p * innerH}
                y2={paddingY + p * innerH}
                stroke="#e2e8f0"
                strokeWidth={1}
              />
            ))}
          </g>

          {points.length > 1 && <polyline points={polyline} fill="none" stroke="#3b82f6" strokeWidth={3} />}

          <line
            x1={paddingX}
            x2={width - paddingX}
            y1={avgY}
            y2={avgY}
            stroke="#10b981"
            strokeDasharray="4 4"
            strokeWidth={2}
          />

          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={4}
              fill={correctness[i] ? "#10b981" : "#ef4444"}
              stroke="white"
              strokeWidth={2}
            />
          ))}
        </svg>
      </div>
    )
  }

  const BreadcrumbNav = ({ showDetail = false }: { showDetail?: boolean }) => (
    <nav className="flex items-center space-x-2 text-sm mb-8">
      <button
        onClick={() => router.push("/")}
        className="flex items-center text-slate-500 hover:text-slate-700 transition-colors"
      >
        <Home className="h-4 w-4 mr-1" />
        Home
      </button>
      <span className="text-slate-400">/</span>
      <button
        onClick={() => router.push("/quizzes/academic/category-selection")}
        className="flex items-center text-slate-500 hover:text-slate-700 transition-colors"
      >
        <Target className="h-4 w-4 mr-1" />
        Quiz Categories
      </button>
      <span className="text-slate-400">/</span>
      {showDetail ? (
        <>
          <button
            onClick={handleBackToList}
            className="flex items-center text-slate-500 hover:text-slate-700 transition-colors"
          >
            <Trophy className="h-4 w-4 mr-1" />
            Quiz History
          </button>
          <span className="text-slate-400">/</span>
          <span className="flex items-center text-slate-900 font-medium">
            <Award className="h-4 w-4 mr-1" />
            Quiz Results
          </span>
        </>
      ) : (
        <span className="flex items-center text-slate-900 font-medium">
          <Trophy className="h-4 w-4 mr-1" />
          Quiz History
        </span>
      )}
    </nav>
  )

  const handleViewHistory = (history: UserQuizQuestionHistory) => {
    setSelectedHistory(history)
    setShowHistoryDetail(true)
  }

  const handleBackToList = () => {
    setShowHistoryDetail(false)
    setSelectedHistory(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="h-16 w-16 text-blue-600 animate-spin mx-auto mb-6" />
            <div className="absolute inset-0 h-16 w-16 border-4 border-blue-200 rounded-full mx-auto"></div>
          </div>
          <h2 className="text-xl font-semibold text-slate-700 mb-2">Loading Quiz History</h2>
          <p className="text-slate-500">Please wait while we fetch your results...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Unable to Load History</h2>
          <p className="text-slate-600 mb-6">
            We encountered an error while loading your quiz history. Please try again.
          </p>
          <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const historyData = data?.questions

  // Since only one history item comes, handle it directly
  const validHistoryData: UserQuizQuestionHistory[] =
    historyData &&
    typeof historyData === "object" &&
    "id" in historyData &&
    "correctQuestions" in historyData &&
    "wrongQuestions" in historyData
      ? [historyData as UserQuizQuestionHistory]
      : []

  if (showHistoryDetail && selectedHistory) {
    const stats = calculateHistoryStats(selectedHistory)
    const allQuestions = [...selectedHistory.correctQuestions, ...selectedHistory.wrongQuestions]

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">

        <div className="relative z-10 w-full p-6 lg:p-8 max-w-7xl mx-auto">
          <BreadcrumbNav showDetail={true} />

          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Quiz Results</h1>
                <p className="text-lg text-gray-600">Completed on {formatDate(selectedHistory.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-6">
              {/* Score Card */}
              <div className={`rounded-2xl shadow-xl border-2 p-8 ${getScoreBgColor(stats.score)}`}>
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className={`text-6xl lg:text-7xl font-bold ${getScoreColor(stats.score)}`}>{stats.score}%</div>
                    <div className="absolute -inset-4 bg-white/20 rounded-full blur-xl -z-10"></div>
                  </div>
                  <div className="text-xl text-slate-700 font-medium">
                    {stats.correctCount} out of {stats.totalQuestions} correct
                  </div>
                  <div className="text-sm text-slate-600 font-medium px-4 py-2 bg-white/50 rounded-full">
                    {getScoreMessage(stats.score)}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border-2 border-emerald-200 rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-shadow">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-emerald-600">{stats.correctCount}</div>
                  <div className="text-sm text-emerald-700 font-medium">Correct</div>
                </div>

                <div className="bg-white border-2 border-red-200 rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-shadow">
                  <XCircle className="w-8 h-8 text-red-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-red-600">{stats.wrongCount}</div>
                  <div className="text-sm text-red-700 font-medium">Wrong</div>
                </div>

                <div className="bg-white border-2 border-amber-200 rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-shadow">
                  <Clock className="w-8 h-8 text-amber-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-amber-600">{stats.timeoutCount}</div>
                  <div className="text-sm text-amber-700 font-medium">Timeout</div>
                </div>

                <div className="bg-white border-2 border-purple-200 rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-shadow">
                  <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-purple-600">{formatTime(stats.averageTime)}</div>
                  <div className="text-sm text-purple-700 font-medium">Avg/Question</div>
                </div>
              </div>

              {/* Time Statistics */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-purple-600" />
                  Time Statistics
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 font-medium">Total Time:</span>
                    <span className="font-bold text-slate-900">{formatTime(stats.totalTime)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 font-medium">Average per Question:</span>
                    <span className="font-bold text-slate-900">{formatTime(stats.averageTime)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-600 font-medium">Questions Answered:</span>
                    <span className="font-bold text-slate-900">{stats.totalQuestions}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-8">
              {/* Performance Chart */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <TrendingUp className="h-6 w-6 mr-3 text-purple-600" />
                    Performance Over Time
                  </h2>
                  <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Seconds per question (lower is better)
                  </div>
                </div>
                <TimeSeriesChart
                  times={allQuestions.map((q) => Math.max(0, Math.round(q.timeSpent || 0)))}
                  correctness={allQuestions.map((q) => !!q.isCorrect)}
                />
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm">
                    <span className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                      <span className="w-3 h-3 rounded-full bg-blue-500" />
                      Time Trend
                    </span>
                    <span className="inline-flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      Correct
                    </span>
                    <span className="inline-flex items-center gap-2 bg-red-50 px-3 py-1 rounded-full">
                      <span className="w-3 h-3 rounded-full bg-red-500" />
                      Wrong
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                    Average: {formatTime(Math.round(stats.averageTime))}
                  </div>
                </div>
              </div>

              {/* Quiz Summary */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <BarChart3 className="h-6 w-6 mr-3 text-purple-600" />
                  Quiz Summary
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                    <div className="text-3xl font-bold text-slate-900 mb-2">{stats.totalQuestions}</div>
                    <div className="text-sm text-slate-600 font-medium">Total Questions</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">{stats.correctCount}</div>
                    <div className="text-sm text-emerald-700 font-medium">Correct</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
                    <div className="text-3xl font-bold text-red-600 mb-2">{stats.wrongCount}</div>
                    <div className="text-sm text-red-700 font-medium">Wrong</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                    <div className="text-3xl font-bold text-amber-600 mb-2">{stats.timeoutCount}</div>
                    <div className="text-sm text-amber-700 font-medium">Timeouts</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleBackToList}
                  variant="outline"
                  size="lg"
                  className="px-8 py-3 text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all bg-transparent"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to History
                </Button>
                <Button
                  onClick={() => router.push("/quizzes/academic/category-selection")}
                  size="lg"
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Take Another Quiz
                </Button>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
    )
  }

  if (validHistoryData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto p-6 lg:p-8">
          <BreadcrumbNav />

          <div className="text-center py-20">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Trophy className="h-12 w-12 text-purple-600" />
              </div>
              <div className="absolute -inset-4 bg-purple-200 rounded-full blur-xl opacity-30 -z-10"></div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">No Quiz History Yet</h2>
            <p className="text-xl text-gray-600 mb-2">Ready to start your learning journey?</p>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Complete some quizzes to see your progress, track your performance, and celebrate your achievements!
            </p>
            <Button
              onClick={() => router.push("/quizzes/academic/category-selection")}
              size="lg"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl"
            >
              <Plus className="h-6 w-6 mr-2" />
              Start Your First Quiz
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">

      <div className="relative z-10 w-full max-w-6xl mx-auto p-6 lg:p-8">
        <BreadcrumbNav />

        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl">
              <Trophy className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Quiz History</h1>
          <p className="text-xl lg:text-2xl text-gray-600 max-w-2xl mx-auto">
            Review your past quiz performances and track your learning progress
          </p>
        </div>

        <div className="space-y-8">
          {validHistoryData.map((history: UserQuizQuestionHistory, index: number) => {
            const stats = calculateHistoryStats(history)
            return (
              <div
                key={history.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 lg:p-10 cursor-pointer"
                onClick={() => handleViewHistory(history)}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-6">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl">
                      <Calendar className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">Latest Quiz Attempt</h3>
                      <p className="text-lg text-gray-500 font-medium">{formatDate(history.createdAt)}</p>
                    </div>
                  </div>
                  <div className={`text-5xl lg:text-6xl font-bold ${getScoreColor(stats.score)}`}>
                    {stats.score}%
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 lg:gap-6 mb-8">
                  <div className="text-center p-4 lg:p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{stats.totalQuestions}</div>
                    <div className="text-sm text-gray-600 font-medium">Total Questions</div>
                  </div>
                  <div className="text-center p-4 lg:p-6 bg-green-50 rounded-xl border border-green-200">
                    <div className="text-2xl lg:text-3xl font-bold text-green-600 mb-2">{stats.correctCount}</div>
                    <div className="text-sm text-green-700 font-medium">Correct</div>
                  </div>
                  <div className="text-center p-4 lg:p-6 bg-red-50 rounded-xl border border-red-200">
                    <div className="text-2xl lg:text-3xl font-bold text-red-600 mb-2">{stats.wrongCount}</div>
                    <div className="text-sm text-red-700 font-medium">Wrong</div>
                  </div>
                  <div className="text-center p-4 lg:p-6 bg-orange-50 rounded-xl border border-orange-200">
                    <div className="text-2xl lg:text-3xl font-bold text-orange-600 mb-2">{stats.timeoutCount}</div>
                    <div className="text-sm text-orange-700 font-medium">Timeouts</div>
                  </div>
                  <div className="text-center p-4 lg:p-6 bg-purple-50 rounded-xl border border-purple-200">
                    <div className="text-2xl lg:text-3xl font-bold text-purple-600 mb-2">
                      {formatTime(stats.totalTime)}
                    </div>
                    <div className="text-sm text-purple-700 font-medium">Total Time</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-lg text-gray-600">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                    <span className="font-medium">{getScoreMessage(stats.score)}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    className="text-purple-600 border-purple-300 px-8 py-3 text-lg font-medium"
                  >
                    View Detailed Results
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <Button
            onClick={() => router.push("/quizzes/academic/category-selection")}
            size="lg"
            className="px-10 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl"
          >
            <Plus className="h-6 w-6 mr-2" />
            Start New Quiz
          </Button>
        </div>
      </div>


    </div>
  )
}

export default UserQuizHistoryPage

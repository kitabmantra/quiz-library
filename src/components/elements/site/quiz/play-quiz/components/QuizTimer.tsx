import React from 'react'
import { Clock, Zap, AlertTriangle, Pause } from 'lucide-react'

interface QuizTimerProps {
  timeRemaining: number
  totalTime: number
  difficulty: string
  isTimerEnabled?: boolean
}

export const QuizTimer: React.FC<QuizTimerProps> = ({ timeRemaining, totalTime, difficulty, isTimerEnabled = true }) => {
  const getTimeColor = () => {
    const percentage = (timeRemaining / totalTime) * 100
    if (percentage <= 25) return 'text-red-500'
    if (percentage <= 50) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getProgressColor = () => {
    const percentage = (timeRemaining / totalTime) * 100
    if (percentage <= 25) return 'bg-gradient-to-r from-red-500 to-red-600'
    if (percentage <= 50) return 'bg-gradient-to-r from-yellow-500 to-orange-500'
    return 'bg-gradient-to-r from-green-500 to-emerald-500'
  }

  const getDifficultyColor = () => {
    switch (difficulty) {
      case 'easy': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200'
      case 'medium': return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200'
      case 'hard': return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDifficultyIcon = () => {
    switch (difficulty) {
      case 'easy': return <Zap className="w-3 h-3" />
      case 'medium': return <Clock className="w-3 h-3" />
      case 'hard': return <AlertTriangle className="w-3 h-3" />
      default: return <Clock className="w-3 h-3" />
    }
  }

  const isUrgent = timeRemaining <= totalTime * 0.25

  // If timer is disabled, show a different UI
  if (!isTimerEnabled) {
    return (
      <div className="bg-white rounded-xl shadow-lg border-0 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100">
              <Pause className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-500">
                ∞
              </div>
              <div className="text-xs text-gray-500">no time limit</div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-gray-400 to-gray-500"
                style={{ width: '100%' }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Untimed</span>
              <span>Quiz</span>
            </div>
          </div>
          
          <div className={`px-4 py-2 rounded-full text-sm font-semibold border ${getDifficultyColor()} flex items-center gap-2`}>
            {getDifficultyIcon()}
            {difficulty}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border-0 p-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isUrgent ? 'bg-red-100 animate-pulse' : 'bg-blue-100'
          }`}>
            <Clock className={`w-6 h-6 ${getTimeColor()}`} />
          </div>
          <div>
            <div className={`text-2xl font-bold ${getTimeColor()} ${isUrgent ? 'animate-pulse' : ''}`}>
              {timeRemaining}s
            </div>
            <div className="text-xs text-gray-500">remaining</div>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ease-out ${getProgressColor()} ${
                isUrgent ? 'animate-pulse' : ''
              }`}
              style={{ width: `${(timeRemaining / totalTime) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0s</span>
            <span>{totalTime}s</span>
          </div>
        </div>
        
        <div className={`px-4 py-2 rounded-full text-sm font-semibold border ${getDifficultyColor()} flex items-center gap-2`}>
          {getDifficultyIcon()}
          {difficulty}
        </div>
      </div>
    </div>
  )
}

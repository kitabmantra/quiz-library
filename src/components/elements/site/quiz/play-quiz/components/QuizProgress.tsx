import React from 'react'
import { CheckCircle, XCircle, Target } from 'lucide-react'

interface QuizProgressProps {
  currentIndex: number
  totalQuestions: number
  answers: Array<{ questionId: string; isCorrect: boolean }>
}

export const QuizProgress: React.FC<QuizProgressProps> = ({
  currentIndex,
  totalQuestions,
  answers,
}) => {
  const getQuestionStatus = (index: number) => {
    if (index < currentIndex) {
      const answer = answers[index]
      return answer?.isCorrect ? 'correct' : 'incorrect'
    }
    if (index === currentIndex) return 'current'
    return 'pending'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'correct': return 'bg-gradient-to-r from-green-500 to-emerald-500'
      case 'incorrect': return 'bg-gradient-to-r from-red-500 to-pink-500'
      case 'current': return 'bg-gradient-to-r from-blue-500 to-purple-500'
      default: return 'bg-gray-300'
    }
  }

  const correctAnswers = answers.filter(a => a.isCorrect).length
  const progressPercentage = Math.round(((currentIndex + 1) / totalQuestions) * 100)

  return (
    <div className="bg-white rounded-xl shadow-lg border-0 p-4">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Question {currentIndex + 1} of {totalQuestions}
            </h3>
            <div className="text-sm text-gray-500">
              {correctAnswers} correct • {progressPercentage}% Complete
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-blue-600">{progressPercentage}%</div>
          <div className="text-xs text-gray-500">Progress</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Question Dots */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const status = getQuestionStatus(index)
          const isCurrent = index === currentIndex
          
          return (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${getStatusColor(status)} ${
                isCurrent ? 'ring-2 ring-blue-200 scale-110' : ''
              } flex items-center justify-center`}
            >
              {status === 'correct' && <CheckCircle className="w-1.5 h-1.5 text-white" />}
              {status === 'incorrect' && <XCircle className="w-1.5 h-1.5 text-white" />}
            </div>
          )
        })}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-1 text-xs">
          <CheckCircle className="w-3 h-3 text-green-600" />
          <span className="text-green-700 font-medium">{correctAnswers}</span>
          <span className="text-gray-500">correct</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <XCircle className="w-3 h-3 text-red-600" />
          <span className="text-red-700 font-medium">{answers.length - correctAnswers}</span>
          <span className="text-gray-500">incorrect</span>
        </div>
      </div>
    </div>
  )
}

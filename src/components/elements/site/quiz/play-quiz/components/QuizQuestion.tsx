import React, { useState } from 'react'
import { QuizQuestion as QuizQuestionType } from '@/lib/hooks/tanstack-query/query-hook/quiz/quiz-questions/use-get-quiz-question'
import { CheckCircle, XCircle, Sparkles, AlertCircle } from 'lucide-react'

interface QuizQuestionProps {
  question: QuizQuestionType
  onAnswer: (answer: string) => void
  isAnswered: boolean
  selectedAnswer?: string
  correctAnswer?: string
  currentAnswer?: any
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  onAnswer,
  isAnswered,
  selectedAnswer,
  correctAnswer,
  currentAnswer,
}) => {
  const [selected, setSelected] = useState<string | null>(selectedAnswer || null)

  const handleOptionClick = (option: string) => {
    if (isAnswered) return
    setSelected(option)
    onAnswer(option)
  }

  React.useEffect(() => {
    setSelected(selectedAnswer || null)
  }, [selectedAnswer])

  const getOptionStyle = (option: string) => {
    if (!isAnswered) {
      return selected === option
        ? 'bg-gray-50 text-gray-900 border-gray-300'
        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
    }

    if (option === correctAnswer) {
      return 'bg-green-50 text-green-800 border-green-200'
    }

    if (option === selected && option !== correctAnswer) {
      return 'bg-red-50 text-red-800 border-red-200'
    }

    return 'bg-white text-gray-500 border-gray-200'
  }

  const getOptionIcon = (option: string) => {
    if (!isAnswered) return null
    
    if (option === correctAnswer) {
      return <CheckCircle className="w-5 h-5 text-green-300" />
    }
    
    if (option === selected && option !== correctAnswer) {
      return <XCircle className="w-5 h-5 text-red-300" />
    }
    
    return null
  }

  const isCorrect = currentAnswer?.isCorrect || false

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-700 text-xs font-bold">?</span>
          </div>
          <span className="text-sm text-gray-600">{question.subjectName}</span>
        </div>
        {question.hint && (
          <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            <Sparkles className="w-3 h-3" />
            Hint
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-base font-medium text-gray-900">
          {question.question}
        </h3>

        <div className="space-y-3">
          {(question.shuffledOptions || question.options).map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionClick(option)}
              disabled={isAnswered}
              className={`w-full p-4 text-left rounded-lg border transition-colors duration-200 ${getOptionStyle(
                option
              )} ${!isAnswered ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-xs font-semibold text-gray-600">
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="flex-1 text-base">{option}</span>
                {getOptionIcon(option)}
              </div>
            </button>
          ))}
        </div>

        {isAnswered && (
          <div className={`mt-4 p-3 rounded-lg border ${
            isCorrect 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={`text-sm font-medium ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </span>
              {!isCorrect && (
                <span className="text-sm text-gray-600">
                  • Correct: <span className="font-medium text-green-700">{correctAnswer}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {question.hint && isAnswered && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Hint</span>
            </div>
            <p className="text-sm text-blue-700">{question.hint}</p>
          </div>
        )}
      </div>
    </div>
  )
}

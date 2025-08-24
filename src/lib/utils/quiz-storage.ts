import { Filter } from '../types/quiz/quiz'
import { encodeBase64, decodeBase64 } from './helper'
import { QuizQuestion } from '@/lib/hooks/tanstack-query/query-hook/quiz/quiz-questions/use-get-quiz-question'

const QUIZ_FILTER_KEY = 'qf'
const QUIZ_QUESTIONS_KEY = 'questions'
const QUIZ_START_TIME_KEY = 'quiz_start_time'
const QUIZ_TIMEOUT_MINUTES = 30

export interface QuizStorageData {
  filter: Filter
  questions: QuizQuestion[]
  questionsMap: Map<string, QuizQuestion>
  startTime: number
}

export const quizStorage = {
  storeQuizData: (filter: Filter, questions: QuizQuestion[], shouldShuffle: boolean = true) => {
    const startTime = Date.now()
    const shuffleArray = <T>(array: T[]): T[] => {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    }
    
    let processedQuestions;
    if (shouldShuffle) {
      processedQuestions = shuffleArray(questions).map(q => ({
        ...q,
        shuffledOptions: shuffleArray(q.options) 
      }))
    } else {
      processedQuestions = questions.map(q => ({
        ...q,
        shuffledOptions: shuffleArray(q.options)
      }))
    }
    
    console.log("this is the processed questions : ", processedQuestions)
    console.log("this is the filter : ", filter)
    const encodedFilter = encodeBase64(JSON.stringify(filter))
    localStorage.setItem(QUIZ_FILTER_KEY, encodedFilter)
    const encodedQuestions = encodeBase64(JSON.stringify(processedQuestions))
    localStorage.setItem(QUIZ_QUESTIONS_KEY, encodedQuestions)
    localStorage.setItem(QUIZ_START_TIME_KEY, startTime.toString())
  },

  getQuizData: (): QuizStorageData | null => {
    try {
      const encodedFilter = localStorage.getItem(QUIZ_FILTER_KEY)
      if (!encodedFilter) {
        return null
      }
      console.log("this is the encoded filter : ", encodedFilter)
      const encodedQuestions = localStorage.getItem(QUIZ_QUESTIONS_KEY)
      if (!encodedQuestions) {
        return null
      }

      const filter = JSON.parse(decodeBase64(encodedFilter))
      const questions = JSON.parse(decodeBase64(encodedQuestions))
      const questionsMap = new Map<string, QuizQuestion>()
      questions.forEach((q: QuizQuestion) => {
        questionsMap.set(q.id, q)
      })
      const startTimeStr = localStorage.getItem(QUIZ_START_TIME_KEY)
      if (startTimeStr) {
        const startTime = parseInt(startTimeStr)
        const currentTime = Date.now()
        const elapsedMinutes = (currentTime - startTime) / (1000 * 60)
        if (elapsedMinutes > QUIZ_TIMEOUT_MINUTES) {
          quizStorage.clearQuizData()
          return null
        }
        return {
          filter,
          questions,
          questionsMap,
          startTime
        }
      } else {
        return {
          filter,
          questions,
          questionsMap,
          startTime: Date.now()
        }
      }
    } catch (error) {
      quizStorage.clearQuizData()
      return null
    }
  },

  clearQuizData: () => {
    localStorage.removeItem(QUIZ_FILTER_KEY)
    localStorage.removeItem(QUIZ_QUESTIONS_KEY)
    localStorage.removeItem(QUIZ_START_TIME_KEY)
  },

  clearAllQuizData: () => {
    localStorage.removeItem(QUIZ_FILTER_KEY)
    localStorage.removeItem(QUIZ_QUESTIONS_KEY)
    localStorage.removeItem(QUIZ_START_TIME_KEY)
    
    // Clear all possible quiz-related keys
    const keysToRemove = [
      'qf',
      'questions', 
      'quiz_start_time',
      'quiz_progress',
      'quiz_state',
      'quiz_answers',
      'quiz_current_question',
      'quiz_timer',
      'quiz_completed',
      'quiz_results',
      'quiz-storage' // Zustand store key
    ]
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })
    
    // Also clear any keys that might contain quiz-related data
    const allKeys = Object.keys(localStorage)
    allKeys.forEach(key => {
      if (key.toLowerCase().includes('quiz') || 
          key.toLowerCase().includes('question') ||
          key.toLowerCase().includes('answer') ||
          key.toLowerCase().includes('progress') ||
          key.toLowerCase().includes('timer')) {
        localStorage.removeItem(key)
      }
    })
  },

  isQuizExpired: (): boolean => {
    const startTimeStr = localStorage.getItem(QUIZ_START_TIME_KEY)
    if (!startTimeStr) return false 
    const startTime = parseInt(startTimeStr)
    const currentTime = Date.now()
    const elapsedMinutes = (currentTime - startTime) / (1000 * 60)
    return elapsedMinutes > QUIZ_TIMEOUT_MINUTES
  },
  getRemainingTime: (): number => {
    const startTimeStr = localStorage.getItem(QUIZ_START_TIME_KEY)
    if (!startTimeStr) return 0
    const startTime = parseInt(startTimeStr)
    const currentTime = Date.now()
    const elapsedMinutes = (currentTime - startTime) / (1000 * 60)
    const remainingMinutes = Math.max(0, QUIZ_TIMEOUT_MINUTES - elapsedMinutes)
    return Math.ceil(remainingMinutes)
  },

  getElapsedTime: (): number => {
    const startTimeStr = localStorage.getItem(QUIZ_START_TIME_KEY)
    if (!startTimeStr) return 0

    const startTime = parseInt(startTimeStr)
    const currentTime = Date.now()
    const elapsedMinutes = (currentTime - startTime) / (1000 * 60)

    return Math.floor(elapsedMinutes)
  },

  getQuestionById: (questionId: string): QuizQuestion | null => {
    try {
      const encodedQuestions = localStorage.getItem(QUIZ_QUESTIONS_KEY)
      if (!encodedQuestions) return null

      const questions = JSON.parse(decodeBase64(encodedQuestions))
      
      const questionsMap = new Map<string, QuizQuestion>()
      questions.forEach((q: QuizQuestion) => {
        questionsMap.set(q.id, q)
      })
      
      return questionsMap.get(questionId) || null
    } catch (error) {
      return null
    }
  },

  getQuestionsByIds: (questionIds: string[]): QuizQuestion[] => {
    try {
      const encodedQuestions = localStorage.getItem(QUIZ_QUESTIONS_KEY)
      if (!encodedQuestions) return []

      const questions = JSON.parse(decodeBase64(encodedQuestions))
      
      const questionsMap = new Map<string, QuizQuestion>()
      questions.forEach((q: QuizQuestion) => {
        questionsMap.set(q.id, q)
      })
      
      return questionIds.map(id => questionsMap.get(id)).filter(Boolean) as QuizQuestion[]
    } catch (error) {
      return []
    }
  }
}

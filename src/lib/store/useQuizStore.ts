import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { QuizQuestion } from '@/lib/hooks/tanstack-query/query-hook/quiz/quiz-questions/use-get-quiz-question'
import { quizStorage } from '../utils/quiz-storage'

export interface QuizAnswer {
  questionId: string
  selectedAnswer: string
  isCorrect: boolean
  timeSpent: number
  timestamp: number
  isTimeout: boolean
}

export interface QuizProgress {
  currentQuestionIndex: number
  answers: QuizAnswer[]
  startTime: number
  currentQuestionStartTime: number // Track when current question started
  totalTime: number
  isCompleted: boolean
  score: number
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  skippedAnswers: number
  timeoutAnswers: number
}

export interface QuizState {
  // Quiz data
  questions: QuizQuestion[]
  currentQuestion: QuizQuestion | null
  progress: QuizProgress | null
  
  // Timer state
  timeRemaining: number
  isTimerRunning: boolean
  timerInterval: NodeJS.Timeout | null
  
  isQuizStarted: boolean
  isQuizCompleted: boolean
  showResults: boolean
  
  initializeQuiz: (questions: QuizQuestion[]) => void
  startQuiz: () => void
  answerQuestion: (answer: string) => void
  nextQuestion: () => void

  completeQuiz: () => void
  resetQuiz: () => void
  resetProgressOnly: () => void
  startTimer: () => void
  stopTimer: () => void
  updateTimer: () => void
  getTimeLimit: (difficulty: string) => number
  getQuestionById: (questionId: string) => QuizQuestion | null
  calculateScore: () => void
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      questions: [],
      currentQuestion: null,
      progress: null,
      timeRemaining: 0,
      isTimerRunning: false,
      timerInterval: null,
      isQuizStarted: false,
      isQuizCompleted: false,
      showResults: false,

      initializeQuiz: (questions: QuizQuestion[]) => {
        const existingProgress = get().progress;
        const existingQuestions = get().questions;
        
        if (existingProgress && existingQuestions.length === questions.length && 
            existingQuestions.every((q, i) => q.id === questions[i].id)) {
          
          const currentIndex = existingProgress.currentQuestionIndex;
          const currentQuestion = questions[currentIndex] || questions[0];
          
          let remainingTime = get().getTimeLimit(currentQuestion.difficulty);
          if (existingProgress.currentQuestionStartTime) {
            const timeSinceQuestionStart = Math.floor((Date.now() - existingProgress.currentQuestionStartTime) / 1000);
            remainingTime = Math.max(0, get().getTimeLimit(currentQuestion.difficulty) - timeSinceQuestionStart);
          }
          
          set({
            questions,
            currentQuestion,
            progress: existingProgress,
            timeRemaining: remainingTime,
            isQuizStarted: existingProgress.answers.length > 0, 
            isQuizCompleted: existingProgress.isCompleted,
            showResults: false,
          })
          
          if (existingProgress.answers.length > 0 && !existingProgress.isCompleted && remainingTime > 0) {
            console.log(`Resuming quiz - starting timer with ${remainingTime}s remaining`);
            get().startTimer();
          } else if (remainingTime <= 0) {
            console.log('Time has run out during resume - marking as timeout');
            get().updateTimer(); // This will handle the timeout logic
          }
        } else {
          const progress: QuizProgress = {
            currentQuestionIndex: 0,
            answers: [],
            startTime: Date.now(),
            currentQuestionStartTime: Date.now(), // Initialize current question start time
            totalTime: 0,
            isCompleted: false,
            score: 0,
            totalQuestions: questions.length,
            correctAnswers: 0,
            wrongAnswers: 0,
            skippedAnswers: 0,
            timeoutAnswers: 0,
          }
    
          set({
            questions,
            currentQuestion: questions[0] || null,
            progress,
            timeRemaining: get().getTimeLimit(questions[0]?.difficulty || 'medium'),
            isQuizStarted: false,
            isQuizCompleted: false,
            showResults: false,
          })
        }
      },

      startQuiz: () => {
        const { progress } = get()
        if (progress) {
          set({ 
            isQuizStarted: true,
            progress: {
              ...progress,
              currentQuestionStartTime: Date.now()
            }
          })
        } else {
          set({ isQuizStarted: true })
        }
        get().startTimer()
      },

      answerQuestion: (answer: string) => {
        const { currentQuestion, progress, timeRemaining } = get()
        if (!currentQuestion || !progress) return

        const existingAnswer = progress.answers.find(a => a.questionId === currentQuestion.id)
        if (existingAnswer) return

        const timeSpent = get().getTimeLimit(currentQuestion.difficulty) - timeRemaining
        const isCorrect = answer === currentQuestion.correctAnswer

        const quizAnswer: QuizAnswer = {
          questionId: currentQuestion.id,
          selectedAnswer: answer,
          isCorrect,
          timeSpent,
          timestamp: Date.now(),
          isTimeout: false,
        }

        const newProgress = {
          ...progress,
          answers: [...progress.answers, quizAnswer],
          correctAnswers: progress.correctAnswers + (isCorrect ? 1 : 0),
          wrongAnswers: progress.wrongAnswers + (isCorrect ? 0 : 1),
          currentQuestionStartTime: Date.now(), // Update start time for next question
        }

        set({ progress: newProgress })
        get().stopTimer()
        console.log(`Answer recorded: ${answer}, correct: ${isCorrect}`)
      },

      nextQuestion: () => {
        const { questions, progress } = get()
        if (!progress) return

        const nextIndex = progress.currentQuestionIndex + 1
        
        if (nextIndex >= questions.length) {
          get().completeQuiz()
          return
        }

        get().stopTimer()

        const nextQuestion = questions[nextIndex]
        const newProgress = {
          ...progress,
          currentQuestionIndex: nextIndex,
          currentQuestionStartTime: Date.now(), 
        }

        set({
          currentQuestion: nextQuestion,
          progress: newProgress,
          timeRemaining: get().getTimeLimit(nextQuestion.difficulty),
        })

        get().startTimer()
        
        console.log(`Moved to question ${nextIndex + 1}, timer reset to ${get().getTimeLimit(nextQuestion.difficulty)}s`)
      },



      

      completeQuiz: () => {
        const { progress } = get()
        if (!progress) return

        const totalTimeInSeconds = Math.round((Date.now() - progress.startTime) / 1000)

        const completedProgress = {
          ...progress,
          isCompleted: true,
          totalTime: totalTimeInSeconds,
        }

        set({
          progress: completedProgress,
          isQuizCompleted: true,
          isTimerRunning: false,
          showResults: true, 
        })

        get().calculateScore()
        get().stopTimer()
      },

      resetQuiz: () => {
        set({
          questions: [],
          currentQuestion: null,
          progress: null,
          timeRemaining: 0,
          isTimerRunning: false,
          timerInterval: null,
          isQuizStarted: false,
          isQuizCompleted: false,
          showResults: false,
        })
        quizStorage.clearAllQuizData();
      },

      resetProgressOnly: () => {
        // Only reset progress/score data, keep questions
        set({
          currentQuestion: null,
          progress: null,
          timeRemaining: 0,
          isTimerRunning: false,
          timerInterval: null,
          isQuizStarted: false,
          isQuizCompleted: false,
          showResults: false,
        })
        // Don't clear questions from localStorage
      },
      

      startTimer: () => {
        const { timerInterval } = get()
        if (timerInterval) {
          clearInterval(timerInterval)
        }

        const interval = setInterval(() => {
          get().updateTimer()
        }, 1000)

        set({ 
          isTimerRunning: true, 
          timerInterval: interval 
        })
        
        console.log('Timer started')
      },

      stopTimer: () => {
        const { timerInterval } = get()
        if (timerInterval) {
          clearInterval(timerInterval)
          set({ 
            isTimerRunning: false, 
            timerInterval: null 
          })
          console.log('Timer stopped')
        }
      },

      updateTimer: () => {
        const { timeRemaining, currentQuestion, progress, isTimerRunning } = get()
        
        if (!isTimerRunning) return
        
        if (timeRemaining <= 0) {
          if (currentQuestion && progress) {
            const existingAnswer = progress.answers.find(a => a.questionId === currentQuestion.id)
            if (!existingAnswer) {
              console.log('Time up - marking question as timeout')
              
              const timeoutAnswer: QuizAnswer = {
                questionId: currentQuestion.id,
                selectedAnswer: '',
                isCorrect: false,
                timeSpent: get().getTimeLimit(currentQuestion.difficulty),
                timestamp: Date.now(),
                isTimeout: true,
              }

              const newProgress = {
                ...progress,
                answers: [...progress.answers, timeoutAnswer],
                wrongAnswers: progress.wrongAnswers + 1,
                timeoutAnswers: progress.timeoutAnswers + 1,
              }

              set({ progress: newProgress })
              get().stopTimer()
              
              setTimeout(() => {
                get().nextQuestion()
              }, 1000)
            }
          }
          return
        }

        set({ timeRemaining: timeRemaining - 1 })
      },

      getTimeLimit: (difficulty: string) => {
        switch (difficulty) {
          case 'easy': return 10
          case 'medium': return 15
          case 'hard': return 20
          default: return 15
        }
      },

      getQuestionById: (questionId: string) => {
        const { questions } = get()
        const questionsMap = new Map<string, QuizQuestion>()
        questions.forEach(q => {
          questionsMap.set(q.id, q)
        })
        
        return questionsMap.get(questionId) || null
      },

      calculateScore: () => {
        const { progress } = get()
        if (!progress) return

        const score = Math.round((progress.correctAnswers / progress.totalQuestions) * 100)
        set({
          progress: { ...progress, score }
        })
      },


    }),
    {
      name: 'quiz-storage',
      partialize: (state) => ({
        questions: state.questions,
        progress: state.progress,
        isQuizStarted: state.isQuizStarted,
        isQuizCompleted: state.isQuizCompleted,
      }),
    }
  )
)
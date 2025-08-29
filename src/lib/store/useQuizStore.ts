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
  currentQuestionStartTime: number
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
  questions: QuizQuestion[]
  currentQuestion: QuizQuestion | null
  progress: QuizProgress | null
  
  timeRemaining: number
  isTimerRunning: boolean
  timerInterval: NodeJS.Timeout | null
  timerEnabled: boolean
  
  isQuizStarted: boolean
  isQuizCompleted: boolean
  showResults: boolean
  
  initializeQuiz: (questions: QuizQuestion[], timerEnabled?: boolean) => void
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
  cleanup: () => void
  setTimerEnabled: (enabled: boolean) => void
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
      timerEnabled: true,
      isQuizStarted: false,
      isQuizCompleted: false,
      showResults: false,

      initializeQuiz: (questions: QuizQuestion[], timerEnabled: boolean = true) => {
        const existingProgress = get().progress;
        const existingQuestions = get().questions;
        get().stopTimer();
        
        // Set timer enabled state
        set({ timerEnabled });
        
        if (existingProgress && existingQuestions.length === questions.length) {
          const currentIndex = existingProgress.currentQuestionIndex;
          const currentQuestion = questions[currentIndex] || questions[0];
          
          let remainingTime = get().getTimeLimit(currentQuestion.difficulty);
          if (existingProgress.currentQuestionStartTime && timerEnabled) {
            const timeSinceQuestionStart = Math.floor((Date.now() - existingProgress.currentQuestionStartTime) / 1000);
            remainingTime = Math.max(0, get().getTimeLimit(currentQuestion.difficulty) - timeSinceQuestionStart);
          }
          
          const updatedProgress = existingProgress;
          
          set({
            questions,
            currentQuestion,
            progress: updatedProgress,
            timeRemaining: remainingTime,
            isQuizStarted: existingProgress.answers.length > 0, 
            isQuizCompleted: existingProgress.isCompleted,
            showResults: false,
            isTimerRunning: false,
            timerInterval: null,   
          })
          
          if (existingProgress.answers.length > 0 && !existingProgress.isCompleted && (remainingTime > 0 || !timerEnabled)) {
            // Don't auto-start timer here - let user click Start Quiz
          } else if (remainingTime <= 0 && timerEnabled) {
            console.log('Time has run out during resume - marking as timeout');
            if (currentQuestion && existingProgress) {
              const timeoutAnswer: QuizAnswer = {
                questionId: currentQuestion.id,
                selectedAnswer: '',
                isCorrect: false,
                timeSpent: get().getTimeLimit(currentQuestion.difficulty),
                timestamp: Date.now(),
                isTimeout: true,
              }

              const newProgress = {
                ...existingProgress,
                answers: [...existingProgress.answers, timeoutAnswer],
                wrongAnswers: existingProgress.wrongAnswers + 1,
                timeoutAnswers: existingProgress.timeoutAnswers + 1,
              }

              set({ progress: newProgress })
            }
          }
        } else {
          const progress: QuizProgress = {
            currentQuestionIndex: 0,
            answers: [],
            startTime: Date.now(),
            currentQuestionStartTime: Date.now(),
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
            timeRemaining: timerEnabled ? get().getTimeLimit(questions[0]?.difficulty || 'medium') : 0,
            isQuizStarted: false,
            isQuizCompleted: false,
            showResults: false,
            isTimerRunning: false,
            timerInterval: null,   // Clear any existing interval
          })
        }
      },

      startQuiz: () => {
        const { progress, isTimerRunning, timerEnabled } = get()
        
        if (isTimerRunning) {
          console.log('Quiz already started and timer running, skipping startQuiz call')
          return
        }
        
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
        
        // Only start timer if it's enabled AND user explicitly clicked Start Quiz
        if (timerEnabled) {
          get().startTimer()
        }
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
          currentQuestionStartTime: Date.now(),
        }

        set({ progress: newProgress })
        get().stopTimer()
        console.log(`Answer recorded: ${answer}, correct: ${isCorrect}, timer stopped`);
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
          timeRemaining: get().timerEnabled ? get().getTimeLimit(nextQuestion.difficulty) : 0,
        })

        console.log(`Moved to question ${nextIndex + 1}, starting timer with ${get().getTimeLimit(nextQuestion.difficulty)}s`)
        
        // Only start timer if it's enabled
        if (get().timerEnabled) {
          get().startTimer()
        }
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
        console.log('Quiz completed, timer stopped');
      },

      resetQuiz: () => {
        get().stopTimer();
        
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
        console.log('Quiz completely reset, timer stopped');
      },

      resetProgressOnly: () => {
        // Stop any running timer first
        get().stopTimer();
        
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
        console.log('Quiz progress reset, timer stopped');
      },
      

      startTimer: () => {
        const { timerInterval, isTimerRunning, timerEnabled } = get()
        
        // Don't start timer if it's disabled
        if (!timerEnabled) {
          console.log('Timer is disabled, not starting timer')
          return
        }
        
        if (isTimerRunning || timerInterval) {
          console.log('Timer already running, stopping existing timer first')
          get().stopTimer()
        }

        const interval = setInterval(() => {
          get().updateTimer()
        }, 1000)

        set({ 
          isTimerRunning: true, 
          timerInterval: interval 
        })
        
        console.log('Timer started with interval:', interval)
      },

      stopTimer: () => {
        const { timerInterval } = get()
        if (timerInterval) {
          clearInterval(timerInterval)
          set({ 
            isTimerRunning: false, 
            timerInterval: null 
          })
          console.log('Timer stopped, interval cleared:', timerInterval)
        }
      },

      updateTimer: () => {
        const { timeRemaining, currentQuestion, progress, isTimerRunning, timerInterval, timerEnabled } = get()
        
        // Don't update timer if it's disabled
        if (!timerEnabled) {
          return
        }
        
        if (!isTimerRunning || !timerInterval) {
          console.log('Timer update called but timer not running, stopping')
          get().stopTimer()
          return
        }
        
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

        const newTimeRemaining = Math.max(0, timeRemaining - 1)
        set({ timeRemaining: newTimeRemaining })
        
        if (newTimeRemaining % 5 === 0 || newTimeRemaining <= 10) {
          console.log(`Timer update: ${newTimeRemaining}s remaining`)
        }
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

      cleanup: () => {
        get().stopTimer();
        set({
          isQuizStarted: false,
          isQuizCompleted: false,
          showResults: false,
          isTimerRunning: false,
          timerInterval: null,
          timeRemaining: 0,
          currentQuestion: null,
          progress: null,
        });
        console.log('Quiz store cleanup complete.');
      },

      setTimerEnabled: (enabled: boolean) => {
        set({ timerEnabled: enabled })
        if (!enabled) {
          get().stopTimer()
        }
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
      onRehydrateStorage: () => (state) => {
        console.log('Store rehydrated:', {
          hasQuestions: !!state?.questions?.length,
          hasProgress: !!state?.progress,
          answersCount: state?.progress?.answers?.length || 0,
          isCompleted: state?.progress?.isCompleted || false,
          isQuizStarted: state?.isQuizStarted || false
        });
      },
    }
  )
)
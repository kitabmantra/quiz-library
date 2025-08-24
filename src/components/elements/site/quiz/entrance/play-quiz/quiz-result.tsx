import React, { useState } from 'react'
import { intervalToDuration } from 'date-fns'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Clock, Trophy, BarChart3, RefreshCw, Plus, AlertTriangle } from 'lucide-react'
import { QuizQuestion } from '@/lib/hooks/tanstack-query/query-hook/quiz/quiz-questions/use-get-quiz-question'
import { QuizAnswer } from '@/lib/store/useQuizStore'
import { createUserHistory, UserHistoryType, UserQuestionType } from '@/lib/actions/quiz/history/post/create-user-history'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { quizStorage } from '@/lib/utils/quiz-storage'
import { useQuizStore } from '@/lib/store/useQuizStore'
import { createUserEntranceQuizHistory } from '@/lib/actions/quiz/history/post/create-user-entrance-quiz-history'


interface QuizResultsProps {
  questions: QuizQuestion[]
  answers: QuizAnswer[]
  score: number
  totalTime: number
  onRetry: () => void
  onNewQuiz: () => void
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  questions,
  answers,
  score,
  totalTime,
  onRetry,
  onNewQuiz,
}) => {
  const router = useRouter();
  // Debug: Log the props
  console.log('QuizResults Props:', { questions, answers, score, totalTime });
  console.log('Answers array:', answers);
  console.log('Answers type:', typeof answers);
  console.log('Is answers array?', Array.isArray(answers));
  const [activeTab, setActiveTab] = React.useState<'all' | 'correct' | 'incorrect' | 'timeout'>('all')
  const [isSaving, setIsSaving] = useState(false)
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false)
  
  const correctAnswers = answers.filter(a => a.isCorrect).length
  const wrongAnswers = answers.filter(a => !a.isCorrect && a.selectedAnswer && !a.isTimeout).length
  const timeoutAnswers = answers.filter(a => a.isTimeout).length
  const averageTime = answers.length > 0 ? Math.round(answers.reduce((sum, a) => sum + a.timeSpent, 0) / answers.length) : 0


  const getFilteredQuestions = () => {
    switch (activeTab) {
      case 'correct':
        return questions.filter((_, index) => answers[index]?.isCorrect)
      case 'incorrect':
        return questions.filter((_, index) => !answers[index]?.isCorrect && answers[index]?.selectedAnswer && !answers[index]?.isTimeout)
      case 'timeout':
        return questions.filter((_, index) => answers[index]?.isTimeout)
      default:
        return questions
    }
  }

  const filteredQuestions = getFilteredQuestions()



  const formatTime = (seconds: number) => {
    const safeSeconds = Math.max(0, Math.floor(seconds || 0))
    const d = intervalToDuration({ start: 0, end: safeSeconds * 1000 })
    const hours = d.hours || 0
    const minutes = String(d.minutes || 0).padStart(hours ? 2 : 1, '0')
    const secs = String(d.seconds || 0).padStart(2, '0')
    return hours ? `${hours}:${minutes}:${secs}` : `${minutes}:${secs}`
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Excellent! Outstanding performance!'
    if (score >= 80) return 'Great job! Well done!'
    if (score >= 70) return 'Good work! Keep it up!'
    if (score >= 60) return 'Not bad! Room for improvement.'
    return 'Keep practicing! You can do better!'
  }


  const TimeSeriesChart: React.FC<{ times: number[]; correctness: boolean[] }> = ({ times, correctness }) => {
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

    const polyline = points.map(p => `${p.x},${p.y}`).join(' ')
    const avgY = paddingY + (innerH - (Math.min(maxTime, averageTime) / maxTime) * innerH)

    return (
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
              stroke="#e5e7eb"
              strokeWidth={1}
            />
          ))}
        </g>

        {points.length > 1 && (
          <polyline
            points={polyline}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={2}
          />
        )}

        <line x1={paddingX} x2={width - paddingX} y1={avgY} y2={avgY} stroke="#10b981" strokeDasharray="4 4" />

        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3}
            fill={correctness[i] ? '#10b981' : '#ef4444'}
          />
        ))}
      </svg>
    )
  }

  const handleSaveRecords = async () => {
    // Show confirmation dialog first
    setShowSaveConfirmation(true);
  }

  const confirmSaveAndRedirect = async () => {
    setIsSaving(true);
    setShowSaveConfirmation(false);

    // Debug: Log the incoming data
    console.log('Debug - Questions:', questions);
    console.log('Debug - Answers:', answers);
    console.log('Debug - Questions length:', questions.length);
    console.log('Debug - Answers length:', answers.length);
    console.log('Debug - First few answers:', answers.slice(0, 3));
    console.log('Debug - Questions IDs:', questions.map(q => q.id));
    console.log('Debug - Answer IDs:', answers.map(a => a.questionId));

    // Create question result objects for all questions
    const questionResults = questions.map((question) => {
      // Find the answer by questionId - this should work regardless of question order
      const answer = answers.find(a => a.questionId === question.id);
      console.log(`Debug - Question ${question.id}:`, question);
      console.log(`Debug - Found answer for ${question.id}:`, answer);
      console.log(`Debug - All answer questionIds:`, answers.map(a => a.questionId));
      console.log(`Debug - Looking for questionId: ${question.id}`);
      
      // If no answer found by questionId, this means the question wasn't answered
      const result : UserQuestionType = {
        questionId: question.id,
        userAnswer: answer?.selectedAnswer || 'Skipped',
        isCorrect: answer?.isCorrect || false,
        isTimeOut: answer?.isTimeout || false,
        timeSpent: answer?.timeSpent || 0
      };
      
      console.log(`Debug - Result for ${question.id}:`, result);
      return result;
    });

    console.log('Debug - All question results:', questionResults);

    // Filter into correct and wrong questions
    const correctQuestions = questionResults.filter(result => result.isCorrect);
    const wrongQuestions = questionResults.filter(result => !result.isCorrect);

    console.log('Debug - Correct questions:', correctQuestions);
    console.log('Debug - Wrong questions:', wrongQuestions);

    const quizResults : UserHistoryType = {
      correctQuestions,
      wrongQuestions
    }

    console.log('Debug - Final quiz results:', quizResults);

    try {
      const res = await createUserEntranceQuizHistory(quizResults)
      if(res.success ){
        toast.success('Quiz results saved successfully!')
        
        // Clear all quiz-related data
        quizStorage.clearAllQuizData();
        localStorage.removeItem('quiz_results');
        
        // Clear any other quiz-related cookies/storage
        const quizRelatedKeys = Object.keys(localStorage).filter(key => 
          key.includes('quiz') || key.includes('qf')
        );
        quizRelatedKeys.forEach(key => localStorage.removeItem(key));
        
        // Reset quiz store state
        useQuizStore.getState().resetQuiz();
        
        // Set flag to indicate quiz was recently cleared
        sessionStorage.setItem("quiz_recently_cleared", "true");
        
        // Show success message and redirect
        toast.success('Redirecting to category selection... You can view your latest quiz results there!');
        
        // Redirect to category selection
        setTimeout(() => {
          router.push('/quizzes/competative');
        }, 2000);
        
      } else if (res.error && !res.success){
        toast.error(res.error || 'Failed to save quiz results!')
      } 
    } catch (error) {
      toast.error('An error occurred while saving quiz results!')
      console.error('Error saving quiz results:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const cancelSave = () => {
    setShowSaveConfirmation(false);
  }

  // Confirmation Dialog
  if (showSaveConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-md mx-auto text-center space-y-6 p-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex justify-center mb-6">
              <AlertTriangle className="w-16 h-16 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Save Quiz Results?</h1>
            <div className="space-y-4 text-left mb-8">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="text-base text-gray-700">Your quiz results will be saved to your profile</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                <span className="text-base text-gray-700">You'll be redirected to the category selection</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                <span className="text-base text-gray-700">You can view your latest quiz results there</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                <span className="text-base text-gray-700">All quiz data will be cleared from this session</span>
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={cancelSave}
                className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-all duration-300"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmSaveAndRedirect}
                disabled={isSaving}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Save & Continue'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full p-4 lg:p-6">

        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <Trophy className={`w-12 h-12 ${getScoreColor(score)}`} />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
          <p className="text-lg lg:text-xl text-gray-600">{getScoreMessage(score)}</p>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">

          <div className="lg:col-span-1 space-y-6">

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="text-center space-y-4">
                <div className={`text-5xl lg:text-6xl font-bold ${getScoreColor(score)}`}>
                  {score}%
                </div>
                <div className="text-lg lg:text-xl text-gray-600">
                  {correctAnswers} out of {questions.length} correct
                </div>
              </div>
            </div>


            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center shadow-sm">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-sm text-green-700">Correct</div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center shadow-sm">
                <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">{wrongAnswers}</div>
                <div className="text-sm text-red-700">Wrong</div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center shadow-sm">
                <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">{timeoutAnswers}</div>
                <div className="text-sm text-orange-700">Timeout</div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center shadow-sm">
                <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{formatTime(averageTime)}</div>
                <div className="text-sm text-blue-700">Avg/Question</div>
              </div>
            </div>


            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Time:</span>
                  <span className="font-semibold text-gray-900">{formatTime(totalTime)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average per Question:</span>
                  <span className="font-semibold text-gray-900">{formatTime(averageTime)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Questions Answered:</span>
                  <span className="font-semibold text-gray-900">{answers.length}</span>
                </div>
              </div>
            </div>


            <div className="space-y-3">
              <Button
                onClick={onRetry}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Retry Quiz
              </Button>
              <Button
                onClick={onNewQuiz}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Quiz
              </Button>
              <Button
                onClick={handleSaveRecords}
                disabled={isSaving}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className={`w-5 h-5 mr-2 ${isSaving ? 'animate-pulse' : ''}`} />
                {isSaving ? 'Saving...' : 'Save Records'}
              </Button>
            </div>
          </div>


          <div className="lg:col-span-3 space-y-6">

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Performance Over Time</h2>
                <div className="text-sm text-gray-500">Seconds per question (lower is better)</div>
              </div>
              <TimeSeriesChart
                times={answers.map(a => Math.max(0, Math.round(a.timeSpent || 0)))}
                correctness={answers.map(a => !!a.isCorrect)}
              />
              <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Time</span>
                  <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Correct</span>
                  <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> Wrong</span>
                </div>
                <div className="text-sm font-medium">Avg: {formatTime(Math.round(averageTime))}</div>
              </div>
            </div>

            
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Question Review</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {questions.length} questions • Click tabs to filter
                </p>
              </div>
              
              
              <div className="px-4 sm:px-6 py-4 border-b bg-gray-50">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      activeTab === 'all'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    All ({questions.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('correct')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      activeTab === 'correct'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-green-600 hover:bg-green-50 border border-green-300'
                    }`}
                  >
                    Correct ({correctAnswers})
                  </button>
                  <button
                    onClick={() => setActiveTab('incorrect')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      activeTab === 'incorrect'
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-red-600 hover:bg-red-50 border border-red-300'
                    }`}
                  >
                    Incorrect ({wrongAnswers})
                  </button>
                  <button
                    onClick={() => setActiveTab('timeout')}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      activeTab === 'timeout'
                        ? 'bg-orange-600 text-white'
                        : 'bg-white text-orange-600 hover:bg-orange-50 border border-orange-300'
                    }`}
                  >
                    Timeout ({timeoutAnswers})
                  </button>
                </div>
              </div>
              
              
              <div className="max-h-[600px] overflow-auto p-4 sm:p-6">
                <div className="space-y-6">
                  {filteredQuestions.map((question, questionIndex) => {
                    const answer = answers.find(a => a.questionId === question.id)
                    const isCorrect = answer?.isCorrect
                    const timeSpent = answer?.timeSpent || 0
                    const userAnswer = answer?.selectedAnswer || ''

                    return (
                      <div
                        key={question.id}
                        className="p-4 sm:p-8 rounded-xl border-2 bg-gray-50 border-gray-200 hover:shadow-md transition-shadow"
                      >
                        
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 gap-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 flex-shrink-0 ${
                              answer?.isTimeout ? 'bg-white text-orange-600 border-orange-500' : isCorrect ? 'bg-white text-green-600 border-green-500' : 'bg-white text-red-600 border-red-500'
                            }`}>
                              {questionIndex + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                <span className="text-lg sm:text-xl font-semibold text-gray-900">
                                  Question {questionIndex + 1}
                                </span>
                                {answer?.isTimeout && (
                                  <span className="text-sm font-medium px-3 py-1 rounded bg-orange-100 text-orange-800 self-start sm:self-auto">
                                    TIMEOUT
                                  </span>
                                )}
                              </div>
                              <div className="text-sm sm:text-base text-gray-600 mt-1">
                                Time: {formatTime(timeSpent || 0)} • {question.subjectName}
                              </div>
                            </div>
                          </div>
                        </div>

                        
                        <div className="mb-6">
                          <p className="text-base sm:text-lg text-gray-900 leading-relaxed break-words">{question.question}</p>
                        </div>

                        
                        <div className="grid grid-cols-1 gap-4 mb-6">
                          {(question.shuffledOptions || question.options).map((option, optionIndex) => {
                            const isUserSelected = option === userAnswer
                            const isCorrectAnswer = option === question.correctAnswer
                            
                            let optionStyle = 'bg-white border-gray-300 text-gray-700'
                            let icon = null
                            
                            if (isCorrectAnswer) {
                              optionStyle = 'bg-white border-green-500 text-gray-700'
                              icon = <CheckCircle className="w-5 h-5 text-green-600" />
                            } else if (isUserSelected && !isCorrectAnswer) {
                              optionStyle = 'bg-white border-red-500 text-gray-700'
                              icon = <XCircle className="w-5 h-5 text-red-600" />
                            } else if (isUserSelected && isCorrectAnswer) {
                              optionStyle = 'bg-white border-green-500 text-gray-700'
                              icon = <CheckCircle className="w-5 h-5 text-green-600" />
                            }

                            return (
                              <div
                                key={optionIndex}
                                className={`p-3 sm:p-4 rounded-lg border-2 transition-all duration-200 ${optionStyle}`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 ${
                                    isCorrectAnswer 
                                      ? 'bg-green-500 text-white border-green-500' 
                                      : isUserSelected && !isCorrectAnswer
                                      ? 'bg-red-500 text-white border-red-500'
                                      : 'bg-gray-200 text-gray-600 border-gray-300'
                                  }`}>
                                    {String.fromCharCode(65 + optionIndex)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm sm:text-base break-words">{option}</span>
                                  </div>
                                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                    {icon}
                                    <div className="flex flex-col gap-1">
                                      {isUserSelected && (
                                        <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-800 whitespace-nowrap">
                                          Your Answer
                                        </span>
                                      )}
                                      {isCorrectAnswer && (
                                        <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-800 whitespace-nowrap">
                                          Correct
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                            
                        <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm sm:text-base font-medium text-gray-700">
                                Your Answer: 
                                <span className={`ml-2 font-bold break-words ${
                                  answer?.isTimeout ? 'text-orange-700' : isCorrect ? 'text-green-700' : 'text-red-700'
                                }`}>
                                  {answer?.isTimeout ? 'TIMEOUT' : userAnswer || 'Skipped'}
                                </span>
                              </div>
                              {answer?.isTimeout && (
                                <div className="text-sm sm:text-base text-orange-700 mt-2 font-medium">
                                  ⏰ Question timed out - marked as incorrect
                                </div>
                              )}
                              {!isCorrect && !answer?.isTimeout && (
                                <div className="text-sm sm:text-base text-gray-700 mt-2">
                                  Correct Answer: 
                                  <span className="ml-2 font-bold text-green-700 break-words">
                                    {question.correctAnswer}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="text-center sm:text-right flex-shrink-0">
                              <div className="text-sm sm:text-base text-gray-500">Time Spent</div>
                              <div className="text-lg sm:text-xl font-bold text-gray-900">{formatTime(timeSpent || 0)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
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
      `}</style>
    </div>
  )
}

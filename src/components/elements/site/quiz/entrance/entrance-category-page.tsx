"use client"

import { useEffect, useState } from "react"
import { useGetEntranceCategory } from '@/lib/hooks/tanstack-query/query-hook/quiz/entrance/use-get-entrance-cat'
import {
  BookOpen,
  FileText,
  AlertTriangle,
  Loader2,
  Check,
  X,
  Play,
  Trophy,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { quizStorage } from "@/lib/utils/quiz-storage"

// Type definitions for entrance data
interface EntranceQuestionData {
  entranceName: string
  subjectName: string
  difficulty: string
}

export interface ActiveFilters{
   
  entrance: string | null, 
  subjects: string[], 
  difficulty: string | null,
  questionCount: number 
}

interface EntranceData {
  entranceNames: string[]
  entranceQuestionData: EntranceQuestionData[]
}

function EntranceCategoryPage() {
  const { data, isLoading, isError } = useGetEntranceCategory()
  const [expandedEntrances, setExpandedEntrances] = useState<Set<string>>(new Set())
  const [selectedNumber, setSelectedNumber] = useState(10)
  const [questionCountSelected, setQuestionCountSelected] = useState(true)
  const [isStartingQuiz, setIsStartingQuiz] = useState(false) // Add loading state
  
  const router = useRouter()
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({ 
    entrance: null, 
    subjects: [], 
    difficulty: "all", // Changed from null to "all"
    questionCount: 10 
  })

  const entranceData = data?.data as EntranceData

  useEffect(() => {
    if(localStorage.getItem("entrance-qf")){
      localStorage.removeItem("entrance-qf")
    }
    if(localStorage.getItem("entrance-questions")){
      localStorage.removeItem("entrance-questions")
    }
    if(localStorage.getItem("entrance-quiz_start_time")){
      localStorage.removeItem("entrance-quiz_start_time")
    }
    if(localStorage.getItem("entrance-quiz-storage")){
      localStorage.removeItem("entrance-quiz-storage")
    }
  }, [])

  // Helper functions
  const getEntranceSubjectCount = (entranceName: string, subjectName: string) => {
    if (!entranceName || !subjectName || !entranceData?.entranceQuestionData) return 0
    return entranceData.entranceQuestionData.filter(
      (item: EntranceQuestionData) => item.entranceName === entranceName && item.subjectName === subjectName
    ).length
  }

  const getEntranceDifficultyCount = (entranceName: string, difficulty: string) => {
    if (!entranceName || !difficulty || !entranceData?.entranceQuestionData) return 0
    return entranceData.entranceQuestionData.filter(
      (item: EntranceQuestionData) => item.entranceName === entranceName && item.difficulty === difficulty
    ).length
  }

  const getAvailableQuestionsForFilters = () => {
    if (!activeFilters.entrance || !entranceData?.entranceQuestionData) return 0
    let filteredItems = entranceData.entranceQuestionData.filter((item: EntranceQuestionData) => item.entranceName === activeFilters.entrance)
    
    if (activeFilters.subjects.length > 0) {
      filteredItems = filteredItems.filter((item: EntranceQuestionData) => activeFilters.subjects.includes(item.subjectName))
    }
    
    if (activeFilters.difficulty && activeFilters.difficulty !== "all") {
      filteredItems = filteredItems.filter((item: EntranceQuestionData) => item.difficulty === activeFilters.difficulty)
    }
    
    return filteredItems.length
  }

  const getAvailableQuestionsForCurrentSelection = () => {
    if (!activeFilters.entrance || !entranceData?.entranceQuestionData) return 0
    let filteredItems = entranceData.entranceQuestionData.filter((item: EntranceQuestionData) => item.entranceName === activeFilters.entrance)
    
    if (activeFilters.subjects.length > 0) {
      filteredItems = filteredItems.filter((item: EntranceQuestionData) => activeFilters.subjects.includes(item.subjectName))
    }
    
    if (activeFilters.difficulty && activeFilters.difficulty !== "all") {
      filteredItems = filteredItems.filter((item: EntranceQuestionData) => item.difficulty === activeFilters.difficulty)
    }
    
    return filteredItems.length
  }

  const canPlayQuiz = () => {
    if (!activeFilters.entrance) return false
    const availableQuestions = getAvailableQuestionsForCurrentSelection()
    if (availableQuestions < 1) return false
    if (selectedNumber > availableQuestions) return false
    return true
  }

  const getQuizStatusMessage = () => {
    if (!activeFilters.entrance) {
      return `Ready to play with ${selectedNumber} questions. Select an entrance to continue.`
    }
    
    const availableQuestions = getAvailableQuestionsForCurrentSelection()
    
    if (availableQuestions === 0) {
      return "No questions available for the selected filters"
    }

    if (selectedNumber > availableQuestions) {
      return `❌ Cannot play: You need ${selectedNumber} questions but only ${availableQuestions} are available with current filters. Try different filters or reduce question count.`
    }

    return `✅ Ready to play! ${selectedNumber} questions selected (${availableQuestions} available)`
  }

  const clearFilters = () => {
    setActiveFilters({
      entrance: null, subjects: [], difficulty: "all", questionCount: 10, // Changed from null to "all"
    })
    setSelectedNumber(10)
    setQuestionCountSelected(true)
    setExpandedEntrances(new Set())
  }

  const toggleEntrance = (entranceName: string) => {
    const newExpanded = new Set(expandedEntrances)
    if (newExpanded.has(entranceName)) {
      newExpanded.delete(entranceName)
    } else {
      newExpanded.add(entranceName)
    }
    setExpandedEntrances(newExpanded)
  }

  const isSelected = (type: "entrance" | "subject" | "difficulty", value: string, entranceName?: string) => {
    if (type === "entrance") return activeFilters.entrance === value
    if (type === "subject") return activeFilters.subjects.includes(value) && activeFilters.entrance === entranceName
    if (type === "difficulty") return activeFilters.difficulty === value && activeFilters.entrance === entranceName
    return false
  }

  const handleEntranceSelect = (entranceName: string) => {
    if (activeFilters.entrance === entranceName) {
      setActiveFilters(prev => ({
        ...prev, entrance: null, subjects: [], // Removed difficulty reset
      }))
    } else {
      setActiveFilters(prev => ({
        ...prev, entrance: entranceName, subjects: [], // Removed difficulty reset
      }))
    }
  }

  const handleSubjectSelect = (subjectName: string, entranceName: string) => {
    setActiveFilters(prev => {
      const newSubjects = prev.subjects.includes(subjectName) 
        ? prev.subjects.filter(s => s !== subjectName) 
        : [...prev.subjects, subjectName]
      
      return {
        ...prev, entrance: entranceName, subjects: newSubjects
      }
    })
  }

  const handleDifficultySelect = (difficulty: string, entranceName: string) => {
    setActiveFilters(prev => ({
      ...prev, entrance: entranceName, difficulty: difficulty
    }))
  }

  const handlePlayQuiz = async () => {
    if (canPlayQuiz() && !isStartingQuiz) {
      if (!activeFilters.entrance) return
      
      try {
        setIsStartingQuiz(true) // Set loading state
        
        // Store entrance quiz data with entrance-specific keys
        localStorage.setItem("entrance-qf", JSON.stringify(activeFilters))
        localStorage.setItem("entrance-questions", JSON.stringify([]))
        localStorage.setItem("entrance-quiz_start_time", Date.now().toString())
        localStorage.setItem("entrance-quiz-storage", JSON.stringify({
          filter: activeFilters,
          questions: []
        }))
        
        // Navigate to quiz page
        router.push("/quizzes/competative/play-quiz")
      } catch (error) {
        console.error("Error starting quiz:", error)
        toast.error("Failed to start quiz. Please try again.")
        setIsStartingQuiz(false) // Reset loading state on error
      }
    } else if (isStartingQuiz) {
      toast.error("Quiz is starting, please wait...")
    } else {
      toast.error("Please select an entrance to play the quiz")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading entrance categories...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Error loading entrance categories</p>
        </div>
      </div>
    )
  }

  if (!entranceData?.entranceNames || entranceData.entranceNames.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600">No entrance categories found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full p-4 lg:p-6">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">Entrance Quiz</h1>
          <p className="text-lg lg:text-xl text-gray-600">Test your knowledge for entrance exams</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto min-h-[80vh]">
          {/* Left Column - Quiz Configuration & Filters */}
          <div className="lg:col-span-3 space-y-6">
            {/* Quiz Configuration Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">Quiz Configuration</h3>
                {(questionCountSelected || activeFilters.entrance || activeFilters.subjects.length > 0 || activeFilters.difficulty) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}
              </div>

              {/* Question Count Selection */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${questionCountSelected ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    1
                  </div>
                  <label className="text-base font-semibold text-gray-900">Question Count</label>
                </div>
                <div className="ml-9">
                  <Select
                    value={selectedNumber.toString()}
                    onValueChange={(value) => {
                      const newCount = Number.parseInt(value)
                      const availableQuestions = getAvailableQuestionsForCurrentSelection()

                      if (newCount <= availableQuestions) {
                        setSelectedNumber(newCount)
                        setActiveFilters(prev => ({ ...prev, questionCount: newCount }))
                        setQuestionCountSelected(true)
                      } else {
                        toast.error(`Only ${availableQuestions} questions available for current selection`)
                      }
                    }}
                  >
                    <SelectTrigger className={`w-full h-10 text-base ${questionCountSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-300'}`}>
                      <SelectValue placeholder="Select count" />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 20, 50, 100].map(count => (
                        <SelectItem key={count} value={count.toString()}>
                          {count} questions
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-blue-600 font-medium mt-1 block">
                    ✓ {selectedNumber} questions selected
                  </span>
                </div>
              </div>

              {/* Filter Selection */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${activeFilters.entrance ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    2
                  </div>
                  <label className="text-base font-semibold text-gray-900">Select Filters</label>
                </div>
                <div className="ml-9 space-y-3">
                  {/* Difficulty Selection */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Difficulty Level:</label>
                    <Select
                      value={activeFilters.difficulty || "all"}
                      onValueChange={(value) => handleDifficultySelect(value, activeFilters.entrance || "")}
                    >
                      <SelectTrigger className="w-full h-10 text-base">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Difficulties</SelectItem>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <span className="text-sm text-gray-600">
                    {activeFilters.entrance
                      ? `Available: ${getAvailableQuestionsForFilters()} questions`
                      : "Select an entrance to see available questions"
                    }
                  </span>
                </div>
              </div>

              {/* Selected Filters Display */}
              {(activeFilters.entrance || activeFilters.subjects.length > 0 || activeFilters.difficulty) && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Selected Filters:</h4>
                  <div className="space-y-1.5">
                    {activeFilters.entrance && (
                      <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium">
                        Entrance: {activeFilters.entrance.replace(/-/g, " ")}
                      </div>
                    )}

                    {activeFilters.subjects.slice(0, 3).map((subject, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 rounded-lg text-sm font-medium bg-blue-50 border border-blue-200 text-blue-800"
                      >
                        {subject.replace(/-/g, " ")}
                      </div>
                    ))}
                    {activeFilters.subjects.length > 3 && (
                      <div className="px-3 py-2 rounded-lg text-sm bg-orange-50 border border-orange-200 text-orange-800">
                        +{activeFilters.subjects.length - 3} more subjects
                      </div>
                    )}

                    {activeFilters.difficulty && activeFilters.difficulty !== "all" && (
                      <div className="bg-purple-50 border border-purple-200 text-purple-800 px-3 py-2 rounded-lg text-sm font-medium">
                        Difficulty: {activeFilters.difficulty.charAt(0).toUpperCase() + activeFilters.difficulty.slice(1)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status Message */}
              <div className="mb-4">
                <p className={`text-sm font-medium ${!activeFilters.entrance ? 'text-blue-600' :
                  canPlayQuiz() ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {getQuizStatusMessage()}
                </p>
              </div>

              {/* Action Button */}
              <Button
                onClick={handlePlayQuiz}
                disabled={!canPlayQuiz() || isStartingQuiz}
                className={`w-full px-6 py-3 text-base font-semibold rounded-xl transition-all duration-300 ${canPlayQuiz() && !isStartingQuiz
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                size="default"
              >
                {isStartingQuiz ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Starting Quiz...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-3" />
                    Start Quiz
                  </>
                )}
              </Button>
            </div>

            {/* Help Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">How to Navigate</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mt-0.5">
                    <BookOpen className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">Select Entrance</h4>
                    <p className="text-sm text-gray-600">Choose your entrance exam type</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mt-0.5">
                    <FileText className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">Choose Subjects</h4>
                    <p className="text-sm text-gray-600">Select specific subjects to focus on</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mt-0.5">
                    <AlertTriangle className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">Set Difficulty</h4>
                    <p className="text-sm text-gray-600">Choose your preferred difficulty level</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column - Entrance Selection */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Select Your Entrance Exam</h3>
              <div className="space-y-4">
                {entranceData?.entranceNames?.map((entranceName: string) => {
                  const entranceQuestions = entranceData.entranceQuestionData.filter(
                    (item: EntranceQuestionData) => item.entranceName === entranceName
                  )
                  const subjects = Array.from(new Set(entranceQuestions.map((q: EntranceQuestionData) => q.subjectName)))
                  const difficulties = Array.from(new Set(entranceQuestions.map((q: EntranceQuestionData) => q.difficulty)))
                  const totalQuestions = entranceQuestions.length
                  
                  return (
                    <div key={entranceName} className="relative pl-3">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                      <div
                        className="cursor-pointer"
                        onClick={() => toggleEntrance(entranceName)}
                      >
                        <div
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${isSelected("entrance", entranceName) ? "bg-blue-50 border-blue-200 shadow-lg" : "bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md"}`}
                        >
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected("entrance", entranceName) ? "bg-gradient-to-br from-blue-500 to-blue-600" : "bg-gradient-to-br from-blue-500 to-blue-600"}`}
                          >
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h2 className="font-medium text-gray-800 capitalize text-base truncate">
                              {entranceName.replace(/-/g, " ")}
                            </h2>
                            <p className="text-sm text-gray-500">
                              {subjects.length} Subjects • {(() => {
                                if (activeFilters.difficulty && activeFilters.difficulty !== "all") {
                                  // If specific difficulty is selected, show only that difficulty count
                                  const selectedDifficultyCount = entranceQuestions.filter(q => 
                                    q.difficulty === activeFilters.difficulty
                                  ).length
                                  return `${selectedDifficultyCount} ${activeFilters.difficulty}`
                                } else {
                                  // Show total questions count
                                  return `${totalQuestions} Questions`
                                }
                              })()} • {(() => {
                                if (activeFilters.difficulty && activeFilters.difficulty !== "all") {
                                  return entranceQuestions.filter(q => q.difficulty === activeFilters.difficulty).length
                                }
                                return totalQuestions
                              })()} Questions
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEntranceSelect(entranceName)
                              }}
                              variant={isSelected("entrance", entranceName) ? "default" : "outline"}
                              className="h-8 text-sm px-4"
                            >
                              {isSelected("entrance", entranceName) ? (
                                <div className="flex items-center gap-2">
                                  <Check className="h-4 w-4" />
                                  <span className="hidden sm:inline">Selected</span>
                                  <span className="sm:hidden">✓</span>
                                </div>
                              ) : (
                                "Select"
                              )}
                            </Button>
                            <div className="p-2">
                              {expandedEntrances.has(entranceName) ? (
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                              ) : (
                                <ChevronRight className="h-5 w-5 text-gray-500" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                                              {expandedEntrances.has(entranceName) && (
                          <div className="mt-3 ml-3 space-y-3">
                          {/* Subjects with Difficulty Breakdown */}
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Subjects:</h4>
                            {subjects.map((subject: string) => {
                              const subjectQuestions = entranceQuestions.filter(q => q.subjectName === subject)
                              const difficultyBreakdown = subjectQuestions.reduce((acc, q) => {
                                acc[q.difficulty] = (acc[q.difficulty] || 0) + 1
                                return acc
                              }, {} as Record<string, number>)
                              
                              return (
                                <div key={subject} className="relative pl-3">
                                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                                  <div
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleSubjectSelect(subject, entranceName)
                                    }}
                                    className={`flex items-center gap-3 p-2 rounded-lg border transition-all duration-200 cursor-pointer ${isSelected("subject", subject, entranceName) ? "bg-orange-50 border-orange-200 shadow-sm" : "bg-white border-gray-200 hover:bg-gray-50"}`}
                                  >
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isSelected("subject", subject, entranceName) ? "bg-orange-600" : "bg-gray-200"}`}>
                                      <FileText className={`h-3 w-3 ${isSelected("subject", subject, entranceName) ? "text-white" : "text-gray-600"}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <span className={`text-sm font-medium capitalize block ${isSelected("subject", subject, entranceName) ? "text-orange-800" : "text-gray-700"}`}>
                                        {subject.replace(/-/g, " ")}
                                      </span>
                                      <div className="text-xs text-gray-500 mt-1">
                                        <span className="font-medium">{subjectQuestions.length} questions</span>
                                        {Object.keys(difficultyBreakdown).length > 0 && (
                                          <span className="ml-2">
                                            ({Object.entries(difficultyBreakdown).map(([diff, count], idx) => (
                                              <span key={diff}>
                                                {idx > 0 ? ', ' : ''}
                                                <span className="capitalize">{diff}</span>: {count}
                                              </span>
                                            ))})
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      variant={isSelected("subject", subject, entranceName) ? "default" : "outline"}
                                      className="h-6 text-sm px-3"
                                    >
                                      {isSelected("subject", subject, entranceName) ? (
                                        <div className="flex items-center gap-2">
                                          <Check className="h-3.5 w-3.5" />
                                          <span className="hidden sm:inline">Selected</span>
                                          <span className="sm:hidden">✓</span>
                                        </div>
                                      ) : (
                                        "Select"
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Difficulty Levels Selection */}
                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Difficulty Levels:</h4>
                            <div className="ml-3">
                              <span className="text-sm text-gray-600">
                                {(!activeFilters.difficulty || activeFilters.difficulty === "all") 
                                  ? "All difficulties selected" 
                                  : `${activeFilters.difficulty.charAt(0).toUpperCase() + activeFilters.difficulty.slice(1)} difficulty selected`
                                }
                              </span>
                            </div>
                          </div>


                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Quiz History */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Quiz History</h3>
              </div>
              
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 mb-3">No entrance quiz history yet</p>
                <Button
                  onClick={() => router.push('/quizzes/competative')}
                  variant="outline"
                  className="w-full text-sm py-2 border-blue-300 text-blue-600 hover:bg-blue-50"
                >
                  View Entrance Quizzes
                </Button>
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

export default EntranceCategoryPage

"use client"
import React, { useState, useCallback, useMemo, useEffect } from "react"
import { useYearName } from "@/lib/hooks/params/useYearName"
import { useLevelName } from "@/lib/hooks/params/useLevelName"
import { useFacultyName } from "@/lib/hooks/params/useFaucltyName"
import { redirect } from "next/navigation"
import { useRouter } from "next/navigation"
import { UpdateQuestion, useGetAcademicQuestions } from "@/lib/hooks/tanstack-query/query-hook/quiz/academic/year/use-get-academic-questions"
import { useGetYearAcademicStat } from "@/lib/hooks/tanstack-query/query-hook/quiz/academic/year/use-get-year-academic-stat"
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react"

// Import modular components
import { FilterControls } from "./FilterControls"
import { CompactQuestionsList } from "./CompactQuestionsList"
import { QuestionDetailPanel } from "./QuestionDetailPanel"
import { Question } from "@/lib/hooks/tanstack-query/query-hook/quiz/academic/year/use-get-academic-questions"
import { updateQuestion } from "@/lib/actions/quiz/question/put/update-question"
import toast from "react-hot-toast"
import { deleteQuestionById } from "@/lib/actions/quiz/question/delete/delete-question"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { StatsCards } from "./StatCards"

function YearNamePage() {
  const yearName = useYearName()
  const levelName = useLevelName()  
  const facultyName = useFacultyName()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const queryClient = useQueryClient()

  const { data: yearAcademicStat, error: yearStatError, isLoading: yearStatLoading } = useGetYearAcademicStat(yearName, levelName, facultyName, "academic")
  
  const {
    data: questionsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useGetAcademicQuestions(
    {
      search: debouncedSearchTerm,
        yearName,
      faculty: facultyName,
      levelName,
    },
    100,
  )

  
  
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 1000)

    return () => clearTimeout(timer)
  }, [searchTerm])

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Memoized flattening of questions - only when data exists
  const allQuestions = useMemo(() => {
    if (!questionsData?.pages || questionsData.pages.length === 0) return []
    console.log(questionsData.pages[0].data.questions)
    return questionsData.pages.flatMap((page) => page.data.questions || [])
  }, [questionsData])

  // Memoized stats calculation - only when questions exist
  const stats = useMemo(() => {
    if (!yearAcademicStat?.data) {
      return {
        easyQuestions: 0,
        mediumQuestions: 0,
        hardQuestions: 0,
        recentQuestions: 0,
      }
    }

    return {
      easyQuestions: yearAcademicStat.data.totalEasyQuestions || 0,
      mediumQuestions: yearAcademicStat.data.totalMediumQuestions || 0,
      hardQuestions: yearAcademicStat.data.totalHardQuestions || 0,
      recentQuestions: 0, // This will be calculated from questions if needed
    }
  }, [yearAcademicStat])

  // Memoized total questions count
  const totalQuestions = useMemo(() => {
    return yearAcademicStat?.data?.totalQuestions || 0
  }, [yearAcademicStat])

  // Memoized unique subjects - only when questions exist
  const uniqueSubjects = useMemo(() => {
    if (allQuestions.length === 0) return []
    return [...new Set(allQuestions.map((q) => q.subjectName))].sort()
  }, [allQuestions])

  // Memoized filtered questions - only when questions exist
  const filteredQuestions = useMemo(() => {
    if (allQuestions.length === 0) return []

    return allQuestions.filter((question) => {
      if (difficultyFilter !== "all" && question.difficulty !== difficultyFilter) return false
      if (priorityFilter !== "all" && question.priority.toString() !== priorityFilter) return false
      if (subjectFilter !== "all" && question.subjectName !== subjectFilter) return false
      return true
    })
  }, [allQuestions, difficultyFilter, priorityFilter, subjectFilter])



  // Memoized check for empty state
  const isEmpty = useMemo(() => {
    return !isLoading && !error && allQuestions.length === 0
  }, [isLoading, error, allQuestions.length])

  // Memoized check for filtered empty state
  const isFilteredEmpty = useMemo(() => {
    return !isLoading && !error && allQuestions.length > 0 && filteredQuestions.length === 0
  }, [isLoading, error, allQuestions.length, filteredQuestions.length])

  // Load more data when scrolling near the end
  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage])

  console.log("this is the questions data:", questionsData)
  console.log("all questions:", allQuestions)

  if (!yearName || !levelName || !facultyName) {
        redirect("/quiz-section/academic")
    }

  const handleCreateQuestion = useCallback(() => {
    router.push(`/quiz-section/academic/level/${levelName}/faculty/${facultyName}/${yearName}/create-question`)
  }, [router, levelName, facultyName, yearName])

  const handleBack = useCallback(() => {
    router.push(`/quiz-section/academic/level/${levelName}/faculty/${facultyName}`)
  }, [router, levelName, facultyName])

  const handleQuestionSelect = useCallback((question: Question) => {
    setSelectedQuestion(question)
  }, [])

  const handleCloseDetailPanel = useCallback(() => {
    setSelectedQuestion(null)
    setIsEditing(false)
  }, [])

  const handleEditQuestion = useCallback(async (updatedQuestion: Question) => {
    // Prevent update if no actual changes were made
    if (selectedQuestion) {
      const arraysShallowEqual = (a: string[] = [], b: string[] = []) => {
        if (a.length !== b.length) return false
        for (let i = 0; i < a.length; i++) {
          if (a[i] !== b[i]) return false
        }
        return true
      }

      const original = selectedQuestion
      const hasArrayChanges =
        !arraysShallowEqual(original.options, updatedQuestion.options) ||
        !arraysShallowEqual(original.tags, updatedQuestion.tags)

      const hasPrimitiveChanges =
        original.question !== updatedQuestion.question ||
        original.correctAnswer !== updatedQuestion.correctAnswer ||
        original.difficulty !== updatedQuestion.difficulty ||
        (original.hint || "") !== (updatedQuestion.hint || "") ||
        original.subjectName !== updatedQuestion.subjectName ||
        (original.referenceUrl || "") !== (updatedQuestion.referenceUrl || "") ||
        original.priority !== updatedQuestion.priority

      if (!hasArrayChanges && !hasPrimitiveChanges) {
        toast.error("Please make some changes before updating")
        return
      }
    }

    setIsEditing(true)
    try {
      const updatedQuestionData : UpdateQuestion = {
        ...updatedQuestion,
        yearName,
        faculty: facultyName,
        levelName
      }
      const res = await updateQuestion(updatedQuestionData)
      if(res.success && res.message){
        toast.success(res.message)
        
        // Update the selected question with new data
        setSelectedQuestion(updatedQuestion)
        setIsEditing(false)
        
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({
          queryKey: ["get-academic-questions", {
            search: debouncedSearchTerm, 
            yearName, 
            faculty: facultyName, 
            levelName
          }, 100]
        })
        
        // Also invalidate stats
        queryClient.invalidateQueries({
          queryKey: ["get-year-academic-stat", yearName, levelName, facultyName, "academic"]
        })
      } else if (!res.success && res.erorr){
        toast.error(res.erorr)
        setIsEditing(false)
      } else {
        toast.error("Failed to update question. Please try again.")
        setIsEditing(false)
      }
    } catch (error) {
      console.error("Error updating question:", error)
      toast.error("Failed to update question. Please try again.")
      setIsEditing(false)
    }
  }, [debouncedSearchTerm, yearName, facultyName, levelName, queryClient, selectedQuestion])

  const handleDeleteQuestion = useCallback(async (question: Question) => {
    if (confirm(`Are you sure you want to delete question "${question.question.substring(0, 50)}..."?`)) {
      setIsDeleting(true)
      try {
        const res = await deleteQuestionById(question.id)
        if(res.success && res.message){
          toast.success(res.message)
          setSelectedQuestion(null)
          setIsEditing(false)
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({
            queryKey: ["get-academic-questions", {
              search: debouncedSearchTerm, 
              yearName, 
              faculty: facultyName, 
              levelName
            }, 100]
          })
          
          // Also invalidate stats
          queryClient.invalidateQueries({
            queryKey: ["get-year-academic-stat", yearName, levelName, facultyName, "academic"]
          })
        } else if (!res.success && res.erorr){
          toast.error(res.erorr)
        } else {
          toast.error("Failed to delete question. Please try again.")
        }
      } catch (error) {
        console.error("Error deleting question:", error)
        toast.error("Failed to delete question. Please try again.")
      } finally {
        setIsDeleting(false)
      }
    }
  }, [debouncedSearchTerm, yearName, facultyName, levelName, queryClient])

  // Search and filter functions
  const handleSearch = useCallback(async (searchValue: string) => {
    setSearchTerm(searchValue)
    console.log("Searching for:", searchValue)
  }, [])

  const handleFilterChange = useCallback(async (filterType: "difficulty" | "priority" | "subject", value: string) => {
    if (filterType === "difficulty") {
      setDifficultyFilter(value)
    } else if (filterType === "priority") {
      setPriorityFilter(value)
    } else if (filterType === "subject") {
      setSubjectFilter(value)
    }

    console.log(`Filtering by ${filterType}:`, value)
  }, [])

  const handleSortChange = useCallback(async (sortField: string, order: "asc" | "desc") => {
    setSortBy(sortField)
    setSortOrder(order)

    console.log(`Sorting by ${sortField} ${order}`)
  }, [])

  const clearFilters = useCallback(() => {
    setSearchTerm("")
    setDifficultyFilter("all")
    setPriorityFilter("all")
    setSubjectFilter("all")
    setSortBy("createdAt")
    setSortOrder("desc")

    console.log("Clearing all filters")
  }, [])

  // Check if any action is in progress
  const isActionInProgress = isEditing || isDeleting || isLoading || isFetchingNextPage || yearStatLoading

  // Error page component
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Questions</h3>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : "Failed to load question data"}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => window.location.reload()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header with Breadcrumbs */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-6">
            <button
                        onClick={handleBack}
              disabled={isActionInProgress}
              className="p-2 hover:bg-white/80 rounded-full transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
              ← Back
            </button>
                    <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {yearName.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                </h1>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <button
                  onClick={() => router.push('/quiz-section/academic')}
                  className="hover:text-blue-600 hover:underline transition-colors"
                >
                  Academic
                </button>
                <span>•</span>
                <button
                  onClick={() => router.push(`/quiz-section/academic/level/${levelName}`)}
                  className="hover:text-blue-600 hover:underline transition-colors capitalize"
                >
                  {levelName.replace(/-/g, " ")}
                </button>
                <span>•</span>
                <button
                  onClick={() => router.push(`/quiz-section/academic/level/${levelName}/faculty/${facultyName}`)}
                  className="hover:text-blue-600 hover:underline transition-colors capitalize"
                >
                  {facultyName.replace(/-/g, " ")}
                </button>
                <span>•</span>
                <span className="text-blue-600 font-medium underline capitalize">
                  {yearName.replace(/-/g, " ")}
                </span>
              </div>
              <p className="text-slate-600 text-lg font-medium mt-1">Question Management Dashboard</p>
                    </div>
                </div>
            </div>

        {/* Stats Cards */}
        <StatsCards stats={stats} totalQuestions={totalQuestions} error={yearStatError} isLoading={yearStatLoading} />

        {/* Filter Controls */}
        <FilterControls
          searchTerm={searchTerm}
          difficultyFilter={difficultyFilter}
          priorityFilter={priorityFilter}
          subjectFilter={subjectFilter}
          sortBy={sortBy}
          sortOrder={sortOrder}
          uniqueSubjects={uniqueSubjects}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
          onClearFilters={clearFilters}
          onCreateQuestion={handleCreateQuestion}
          disabled={isActionInProgress}
        />

        {/* Questions Layout */}
        <div className="flex gap-6">
          {/* Questions List - Wider when no selection, left when selected (only on lg+) */}
          <div className={`transition-all duration-700 ease-in-out ${
            selectedQuestion && !isMobile 
              ? 'lg:w-1/2 w-full' 
              : 'w-full max-w-6xl mx-auto'
          }`}>
            <CompactQuestionsList
              isLoading={isLoading}
              error={error}
              isEmpty={isEmpty}
              isFilteredEmpty={isFilteredEmpty}
              filteredQuestions={filteredQuestions}
              totalQuestions={totalQuestions}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              selectedQuestion={selectedQuestion}
              onClearFilters={clearFilters}
              onCreateQuestion={handleCreateQuestion}
              onQuestionSelect={handleQuestionSelect}
              onLoadMore={loadMore}
              disabled={isActionInProgress}
            />
            </div>

          {/* Detail Panel - Slides in from right (only on lg+) */}
          {selectedQuestion && (
            <div className={`transition-all duration-700 ease-in-out ${
              isMobile 
                ? 'fixed inset-0 z-50' 
                : 'lg:w-1/2 w-0 opacity-100 translate-x-0'
            }`}>
              <QuestionDetailPanel
                question={selectedQuestion}
                onClose={handleCloseDetailPanel}
                onEdit={handleEditQuestion}
                onDelete={handleDeleteQuestion}
                isMobile={isMobile}
                isEditing={isEditing}
                isDeleting={isDeleting}
                disabled={isActionInProgress}
                            />
                        </div>
          )}
        </div>
        </div>
    </div>
  )
}

export default YearNamePage

"use client"

import { useState } from "react"
import { useGetAllAcademicCat } from "@/lib/hooks/tanstack-query/query-hook/quiz/users/use-get-all-academic-cat"
import {
  GraduationCap,
  BookOpen,
  Calendar,
  FileText,
  ChevronRight,
  ChevronDown,
  AlertTriangle,
  Loader2,
  Check,
  HelpCircle,
  X,
  Play,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"

interface Subject {
  subjectName: string
  yearId: string
}

interface Year {
  id: string
  yearName: string
}

interface Faculty {
  faculty: string
  years: Year[]
}

interface Level {
  levelName: string
  faculties: Faculty[]
}

interface CountQuestionItem {
  levelName: string
  faculty: string
  yearName: string
  count: number
  subjectName: string
}

interface AcademicCategories {
  type: string
  levels: Level[]
  subjects?: Subject[]
  countQuestionData?: CountQuestionItem[]
}

function PlayQuizPage() {
  const { data, isLoading, error } = useGetAllAcademicCat()
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set())
  const [expandedFaculties, setExpandedFaculties] = useState<Set<string>>(new Set())
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set())
  const [showMobileHelp, setShowMobileHelp] = useState(false)

  const [activeFilters, setActiveFilters] = useState<{
    level: string | null
    faculty: string | null
    year: string | null
    subjects: string[]
    questionCount: number
  }>({    
    level: null,
    faculty: null,
    year: null,
    subjects: [],
    questionCount: 10,
  })

  const [questionCountSelected, setQuestionCountSelected] = useState(true)

  const academicData = data?.data as AcademicCategories
  const countData: CountQuestionItem[] = Array.isArray(academicData?.countQuestionData)
    ? (academicData?.countQuestionData as CountQuestionItem[])
    : []

  // Auto-adjust question count when available questions change
  // useEffect(() => {
  //   const availableQuestions = getAvailableQuestionsForFilters()
    
  //   if (availableQuestions > 0) {
  //     // If question count exceeds available questions, adjust to available
  //     if (activeFilters.questionCount > availableQuestions) {
  //       setActiveFilters(prev => ({
  //         ...prev,
  //         questionCount: Math.min(availableQuestions, 100) // Cap at 100
  //       }))
  //     }
  //   } else if (activeFilters.level) {
  //     // If no questions available but level is selected, reset to minimum
  //     setActiveFilters(prev => ({
  //       ...prev,
  //       questionCount: 10
  //     }))
  //   }
  // }, [activeFilters.level, activeFilters.faculty, activeFilters.year, activeFilters.subjects])

  // Helper functions for counting questions
  const sumCounts = (items: CountQuestionItem[]) =>
    items.reduce((acc, curr) => acc + (typeof curr.count === "number" ? curr.count : 0), 0)

  const getLevelCount = (levelName: string) => {
    if (!levelName) return 0
    return sumCounts(countData.filter((item) => item.levelName === levelName))
  }

  const getFacultyCount = (levelName: string, facultyName: string) => {
    if (!levelName || !facultyName) return 0
    return sumCounts(
      countData.filter((item) => item.levelName === levelName && item.faculty === facultyName),
    )
  }

  const getYearCount = (levelName: string, facultyName: string, yearName: string) => {
    if (!levelName || !facultyName || !yearName) return 0
    return sumCounts(
      countData.filter(
        (item) => item.levelName === levelName && item.faculty === facultyName && item.yearName === yearName,
      ),
    )
  }

  const getSubjectCount = (
    levelName: string,
    facultyName: string,
    yearName: string,
    subjectName: string,
  ) => {
    if (!subjectName) return 0
    return sumCounts(
      countData.filter(
        (item) =>
          item.subjectName === subjectName &&
          item.levelName === levelName &&
          item.faculty === facultyName &&
          item.yearName === yearName,
      ),
    )
  }

  // Get total available questions for all subjects in a year
  const getTotalYearSubjectCount = (levelName: string, facultyName: string, yearName: string) => {
    return sumCounts(
      countData.filter(
        (item) =>
          item.levelName === levelName &&
          item.faculty === facultyName &&
          item.yearName === yearName
      )
    )
  }

  // Get available questions based on current filters
  const getAvailableQuestionsForFilters = () => {
    if (!activeFilters.level) return 0
    
    // If subjects are selected, we need to match the exact level, faculty, and year context
    if (activeFilters.subjects.length > 0) {
      if (!activeFilters.faculty || !activeFilters.year) return 0
      
      return sumCounts(
        countData.filter(
          (item) =>
            activeFilters.subjects.includes(item.subjectName) &&
            item.levelName === activeFilters.level &&
            item.faculty === activeFilters.faculty &&
            item.yearName === activeFilters.year
        )
      )
    }
    
    // If year is selected, we need faculty context
    if (activeFilters.year) {
      if (!activeFilters.faculty) return 0
      
      return getYearCount(activeFilters.level, activeFilters.faculty, activeFilters.year)
    }
    
    // If faculty is selected, we can play with all questions in that faculty
    if (activeFilters.faculty) {
      return getFacultyCount(activeFilters.level, activeFilters.faculty)
    }
    
    // If only level is selected, we can play with all questions in that level
    return getLevelCount(activeFilters.level)
  }

  // Validate question count
  const isQuestionCountValid = () => {
    const availableQuestions = getAvailableQuestionsForFilters()
    return activeFilters.questionCount <= availableQuestions
  }

  // Get maximum available questions for current filter level
  const getMaxAvailableQuestions = () => {
    return getAvailableQuestionsForFilters()
  }

  // Get minimum required questions for current filter
  const getMinRequiredQuestions = () => {
    const availableQuestions = getAvailableQuestionsForFilters()
    return Math.min(availableQuestions, 10) // Default to 10
  }

  // Check if quiz can be played with the pre-selected question count
  const canPlayQuiz = () => {
    // Must have selected at least a level
    if (!activeFilters.level) return false
    
    // If subjects are selected, we need full context (level, faculty, year)
    if (activeFilters.subjects.length > 0) {
      if (!activeFilters.faculty || !activeFilters.year) return false
    }
    
    // If year is selected, we need faculty context
    if (activeFilters.year && !activeFilters.faculty) return false
    
    const availableQuestions = getAvailableQuestionsForFilters()
    
    // Must have enough questions available for the pre-selected count
    return availableQuestions >= activeFilters.questionCount
  }

  // Get detailed validation info for debugging
  const getValidationInfo = () => {
    const availableQuestions = getAvailableQuestionsForFilters()
    return {
      hasLevel: !!activeFilters.level,
      hasFaculty: !!activeFilters.faculty,
      hasYear: !!activeFilters.year,
      subjectsCount: activeFilters.subjects.length,
      selectedQuestionCount: activeFilters.questionCount,
      availableQuestions,
      canPlay: canPlayQuiz(),
      reason: !activeFilters.level ? "No level selected" :
              activeFilters.subjects.length > 0 && (!activeFilters.faculty || !activeFilters.year) ? "Subjects need faculty and year" :
              activeFilters.year && !activeFilters.faculty ? "Year needs faculty" :
              availableQuestions < 1 ? "No questions available" :
              activeFilters.questionCount > availableQuestions ? "Selected count exceeds available" :
              "Can play"
    }
  }

  // Get quiz status message
  const getQuizStatusMessage = () => {
    if (!activeFilters.level) {
      return `Ready to play with ${activeFilters.questionCount} questions. Select a level to continue.`
    }
    
    const availableQuestions = getAvailableQuestionsForFilters()
    
    if (availableQuestions === 0) {
      if (activeFilters.subjects.length > 0 && (!activeFilters.faculty || !activeFilters.year)) {
        return "To play with subjects, you must select both faculty and year"
      }
      if (activeFilters.year && !activeFilters.faculty) {
        return "To play with a specific year, you must select a faculty first"
      }
      return "No questions available for the selected filters"
    }
    
    if (availableQuestions < activeFilters.questionCount) {
      return `❌ Cannot play: You need ${activeFilters.questionCount} questions but only ${availableQuestions} are available with current filters. Try different level/faculty or reduce question count.`
    }
    
    return `✅ Ready to play! ${activeFilters.questionCount} questions selected (${availableQuestions} available)`
  }

  // Get subjects for a specific year
  const getSubjectsForYear = (yearId: string) => {
    if (!yearId || !academicData?.subjects || !Array.isArray(academicData.subjects)) {
      return []
    }

    try {
      const subjectsForYear = academicData.subjects.filter((subject) => 
        subject?.yearId === yearId
      )

      const uniqueNames = Array.from(new Set(subjectsForYear.map((s) => s.subjectName)))
      return uniqueNames.map((name) => ({ name, yearId }))
    } catch (error) {
      console.error(`Error getting subjects for yearId ${yearId}:`, error)
      return []
    }
  }

  // Toggle expansion functions
  const toggleLevel = (levelName: string) => {
    const newExpanded = new Set(expandedLevels)
    if (newExpanded.has(levelName)) {
      newExpanded.delete(levelName)
    } else {
      newExpanded.add(levelName)
    }
    setExpandedLevels(newExpanded)
  }

  const toggleFaculty = (facultyName: string) => {
    const newExpanded = new Set(expandedFaculties)
    if (newExpanded.has(facultyName)) {
      newExpanded.delete(facultyName)
    } else {
      newExpanded.add(facultyName)
    }
    setExpandedFaculties(newExpanded)
  }

  const toggleYear = (yearId: string) => {
    const newExpanded = new Set(expandedYears)
    if (newExpanded.has(yearId)) {
      newExpanded.delete(yearId)
    } else {
      newExpanded.add(yearId)
    }
    setExpandedYears(newExpanded)
  }

  // Filter selection handlers
  const handleLevelSelect = (levelName: string) => {
    if (activeFilters.level === levelName) {
      setActiveFilters(prev => ({
        ...prev,
        level: null,
        faculty: null,
        year: null,
        subjects: [],
      }))
    } else {
      setActiveFilters(prev => ({
        ...prev,
        level: levelName,
        faculty: null,
        year: null,
        subjects: [],
      }))
    }
  }

  const handleFacultySelect = (facultyName: string, levelName: string) => {
    if (activeFilters.faculty === facultyName) {
      setActiveFilters(prev => ({
        ...prev,
        faculty: null,
        year: null,
        subjects: [],
      }))
    } else {
      setActiveFilters(prev => ({
        ...prev,
        level: levelName,
        faculty: facultyName,
        year: null,
        subjects: [],
      }))
    }
  }

  const handleYearSelect = (yearId: string, yearName: string, levelName: string, facultyName: string) => {
    if (activeFilters.year === yearName) {
      setActiveFilters(prev => ({
        ...prev,
        year: null,
        subjects: [],
      }))
    } else {
      setActiveFilters(prev => ({
        ...prev,
        level: levelName,
        faculty: facultyName,
        year: yearName,
        subjects: [],
      }))
    }
  }

  // Handle subject selection with proper question count adjustment
  const handleSubjectSelect = (subjectName: string, levelName: string, facultyName: string, yearName: string) => {
    setActiveFilters(prev => {
      const newSubjects = prev.subjects.includes(subjectName)
        ? prev.subjects.filter(s => s !== subjectName)
        : [...prev.subjects, subjectName]
      
      // Calculate new available questions
      const newAvailableQuestions = newSubjects.length > 0
        ? sumCounts(
            countData.filter(
              (item) =>
                newSubjects.includes(item.subjectName) &&
                item.levelName === levelName &&
                item.faculty === facultyName &&
                item.yearName === yearName
            )
          )
        : getYearCount(levelName, facultyName, yearName)
      
      // Adjust question count if needed
      let newQuestionCount = prev.questionCount
      if (newQuestionCount > newAvailableQuestions) {
        newQuestionCount = Math.min(newAvailableQuestions, 100)
      }
      
      // Ensure minimum of 10 questions (or available if less)
      if (newAvailableQuestions > 0 && newQuestionCount < Math.min(10, newAvailableQuestions)) {
        newQuestionCount = Math.min(10, newAvailableQuestions)
      }
      
      return {
        ...prev,
        level: levelName,
        faculty: facultyName,
        year: yearName,
        subjects: newSubjects,
        questionCount: newQuestionCount
      }
    })
  }

  const clearFilters = () => {
    setActiveFilters({
      level: null,
      faculty: null,
      year: null,
      subjects: [],
      questionCount: 10,
    })
    setQuestionCountSelected(true)
    setExpandedLevels(new Set())
    setExpandedFaculties(new Set())
    setExpandedYears(new Set())
  }

  // Check if an item is selected
  const isSelected = (type: "level" | "faculty" | "year" | "subject", value: string, levelName?: string, facultyName?: string, yearName?: string) => {
    if (type === "subject") {
      // For subject, check if it's selected AND belongs to the current level, faculty, and year
      return activeFilters.subjects.includes(value) && 
             activeFilters.level === levelName && 
             activeFilters.faculty === facultyName && 
             activeFilters.year === yearName
    }
    if (type === "faculty") {
      // For faculty, check if it's selected AND belongs to the current level
      return activeFilters.faculty === value && activeFilters.level === levelName
    }
    if (type === "year") {
      // For year, check if it's selected AND belongs to the current level and faculty
      return activeFilters.year === value && activeFilters.level === levelName && activeFilters.faculty === facultyName
    }
    return activeFilters[type] === value
  }

  // Check if an item has subcategories
  const hasSubcategories = (type: "level" | "faculty" | "year", item: any) => {
    if (!item) return false
    
    switch (type) {
      case "level":
        return Array.isArray(item.faculties) && item.faculties.length > 0
      case "faculty":
        return Array.isArray(item.years) && item.years.length > 0
      case "year":
        if (!item.id) return false
        const subjects = getSubjectsForYear(item.id)
        return Array.isArray(subjects) && subjects.length > 0
      default:
        return false
    }
  }




  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading academic categories...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Error loading academic categories</p>
          <p className="text-red-500 text-sm mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  if (!academicData?.levels || academicData.levels.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600">No academic categories found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-xl">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Academic Structure</h1>
                <p className="text-gray-600 mt-1">Explore your academic options</p>
              </div>
            </div>
            {/* Mobile Help Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowMobileHelp(true)}
                className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
              >
                <HelpCircle className="h-5 w-5 text-blue-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Quiz Configuration Panel - Always Visible */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Quiz Configuration</h3>
            {(questionCountSelected || activeFilters.level || activeFilters.faculty || activeFilters.year || activeFilters.subjects.length > 0) && (
              <button 
                onClick={clearFilters} 
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Clear All
              </button>
            )}
          </div>
          
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${questionCountSelected ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
                1
              </div>
              <label className="text-sm font-medium text-gray-700">Question count (default: 10):</label>
            </div>
            <div className="flex items-center gap-4 ml-8">
              <Select
                value={activeFilters.questionCount.toString()}
                onValueChange={(value) => {
                  const newCount = Number.parseInt(value)
                  setActiveFilters(prev => ({
                    ...prev,
                    questionCount: newCount
                  }))
                  setQuestionCountSelected(true)
                }}
              >
                <SelectTrigger className={`w-32 ${questionCountSelected ? 'border-green-300 bg-green-50' : 'border-blue-300'}`}>
                  <SelectValue placeholder="Select count" />
                </SelectTrigger>
                <SelectContent>
                  {[10, 20, 50, 100].map(count => (
                    <SelectItem 
                      key={count} 
                      value={count.toString()}
                    >
                      {count} questions
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-sm text-green-600 font-medium">
                ✓ {activeFilters.questionCount} questions selected
              </span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${activeFilters.level ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
                2
              </div>
              <label className="text-sm font-medium text-gray-700">Select level and faculty:</label>
            </div>
                          <div className="ml-8">
              <span className="text-sm text-gray-600">
                {activeFilters.level 
                  ? `Available: ${getAvailableQuestionsForFilters()} questions with current filters`
                  : "Select a level to see available questions"
                }
              </span>
            </div>
          </div>
          
          {/* Active Filters Display */}
          {(activeFilters.level || activeFilters.faculty || activeFilters.year || activeFilters.subjects.length > 0) && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Filters:</h4>
              <div className="flex flex-wrap gap-2">
                {activeFilters.level && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1 rounded-lg text-sm">
                    Level: {activeFilters.level.replace(/-/g, " ")}
                  </div>
                )}
                {activeFilters.faculty && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-3 py-1 rounded-lg text-sm">
                    Faculty: {activeFilters.faculty.replace(/-/g, " ")}
                  </div>
                )}
                {activeFilters.year && (
                  <div className="bg-purple-50 border border-purple-200 text-purple-800 px-3 py-1 rounded-lg text-sm">
                    Year: {activeFilters.year.replace(/-/g, " ")}
                  </div>
                )}
                {activeFilters.subjects.slice(0, 8).map((subject, index) => (
                  <div
                    key={index}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      activeFilters.faculty && activeFilters.year 
                        ? "bg-orange-50 border border-orange-200 text-orange-800"
                        : "bg-red-50 border border-red-200 text-red-800"
                    }`}
                  >
                    {subject.replace(/-/g, " ")}
                    {(!activeFilters.faculty || !activeFilters.year) && (
                      <span className="ml-1 text-xs">(incomplete)</span>
                    )}
                  </div>
                ))}
                {activeFilters.subjects.length > 8 && (
                  <div 
                    className="px-3 py-1 rounded-lg text-sm bg-orange-50 border border-orange-200 text-orange-800 cursor-help"
                    title={`All subjects: ${activeFilters.subjects.map(s => s.replace(/-/g, " ")).join(", ")}`}
                  >
                    +{activeFilters.subjects.length - 8} more
                  </div>
                )}
              </div>
              
              {/* Warning messages for incomplete filters */}
              {activeFilters.subjects.length > 0 && (!activeFilters.faculty || !activeFilters.year) && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ To play with subjects, you must select both faculty and year
                  </p>
                </div>
              )}
              {activeFilters.year && !activeFilters.faculty && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ To play with a specific year, you must select a faculty first
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Quiz Status and Play Button */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                !activeFilters.level ? 'text-blue-600' :
                canPlayQuiz() ? 'text-green-600' : 'text-red-600'
              }`}>
                {getQuizStatusMessage()}
              </p>
            </div>
            <Button
              onClick={() => {
                if (canPlayQuiz()) {
                  toast.success(`Starting quiz with ${activeFilters.questionCount} questions!`)
                  // TODO: Navigate to quiz page with selected filters
                }
              }}
              disabled={!canPlayQuiz()}
              className="ml-4"
              size="default"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Quiz
            </Button>
          </div>
        </div>

                                   {/* Academic Categories */}
          <div className="flex flex-col lg:flex-row gap-8">
             {/* Academic Structure Tree */}
             <div className="flex-1">
               <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                 <h3 className="text-lg font-semibold text-gray-800 mb-6">Select Your Academic Path</h3>
                 <div className="space-y-6">
                   {academicData?.levels?.map((level) => {
                        const hasFaculties = hasSubcategories("level", level)
                        const faculties = Array.isArray(level?.faculties) ? level.faculties : []
                        const levelCount = getLevelCount(level.levelName)

                        return (
                          <div key={level.levelName} className="relative pl-8">
                            {/* Vertical line for level */}
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300"></div>

                            {/* Level Node */}
                            <div
                              className={`${hasFaculties ? "cursor-pointer" : "cursor-default"}`}
                              onClick={() => hasFaculties && toggleLevel(level.levelName)}
                            >
                              <div
                                className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 ${
                                  isSelected("level", level.levelName)
                                    ? "bg-blue-50 border-blue-200 shadow-sm"
                                    : "bg-white border-gray-200 hover:bg-gray-50"
                                }`}
                              >
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    isSelected("level", level.levelName) ? "bg-blue-600" : "bg-blue-600"
                                  }`}
                                >
                                  <GraduationCap className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h2 className="font-medium text-gray-800 capitalize">
                                    {level.levelName.replace(/-/g, " ")}
                                  </h2>
                                  <p className="text-sm text-gray-500">
                                    {hasFaculties ? `${faculties.length} Faculties` : "No Faculties"}
                                    {" \u2022 "}
                                    {levelCount} Questions
                                  </p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if (hasFaculties) {
                                        handleLevelSelect(level.levelName)
                                      }
                                    }}
                                    disabled={!hasFaculties}
                                    variant={isSelected("level", level.levelName) ? "default" : "outline"}
                                    className="h-8"
                                  >
                                    {!hasFaculties ? "No Faculties" : isSelected("level", level.levelName) ? (
                                      <div className="flex items-center gap-2">
                                        <Check className="h-4 w-4" />
                                        Selected
                                      </div>
                                    ) : (
                                      "Select"
                                    )}
                                  </Button>
                                  <div className={`p-2 ${!hasFaculties ? 'opacity-30' : ''}`}>
                                    {expandedLevels.has(level.levelName) ? (
                                      <ChevronDown className="h-5 w-5 text-gray-500" />
                                    ) : (
                                      <ChevronRight className="h-5 w-5 text-gray-500" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Faculties Tree */}
                            {expandedLevels.has(level.levelName) && (
                              <div className="mt-4 ml-8 space-y-4">
                                {hasFaculties ? (
                                  faculties.map((faculty) => {
                                    const hasYears = hasSubcategories("faculty", faculty)
                                    const years = Array.isArray(faculty?.years) ? faculty.years : []
                                    const facultyCount = getFacultyCount(level.levelName, faculty.faculty)

                                    return (
                                      <div key={faculty.faculty} className="relative pl-8">
                                        {/* Vertical line for faculty */}
                                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300"></div>

                                        {/* Faculty Node */}
                                        <div
                                          className={`${hasYears ? "cursor-pointer" : "cursor-default"}`}
                                          onClick={() => hasYears && toggleFaculty(faculty.faculty)}
                                        >
                                          <div
                                            className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 ${
                                              isSelected("faculty", faculty.faculty, level.levelName)
                                                ? "bg-green-50 border-green-200 shadow-sm"
                                                : "bg-white border-gray-200 hover:bg-gray-50"
                                            }`}
                                        >
                                          <div
                                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                              isSelected("faculty", faculty.faculty, level.levelName) ? "bg-green-600" : "bg-green-600"
                                            }`}
                                          >
                                            <BookOpen className="h-5 w-5 text-white" />
                                          </div>
                                          <div className="flex-1">
                                            <h3 className="font-medium text-gray-800 capitalize">
                                              {faculty.faculty.replace(/-/g, " ")}
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                              {hasYears ? `${years.length} Years` : "No Years"}
                                              {" \u2022 "}
                                              {facultyCount} Questions
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <Button
                                              onClick={(e) => {
                                                e.stopPropagation()
                                                if (hasYears) {
                                                  handleFacultySelect(faculty.faculty, level.levelName)
                                                }
                                              }}
                                              disabled={!hasYears}
                                              variant={isSelected("faculty", faculty.faculty, level.levelName) ? "default" : "outline"}
                                              className="h-8"
                                            >
                                              {!hasYears ? "No Years" : isSelected("faculty", faculty.faculty, level.levelName) ? (
                                                <div className="flex items-center gap-2">
                                                  <Check className="h-4 w-4" />
                                                  Selected
                                                </div>
                                              ) : (
                                                "Select"
                                              )}
                                            </Button>
                                            <div className={`p-2 ${!hasYears ? 'opacity-30' : ''}`}>
                                              {expandedFaculties.has(faculty.faculty) ? (
                                                <ChevronDown className="h-5 w-5 text-gray-500" />
                                              ) : (
                                                <ChevronRight className="h-5 w-5 text-gray-500" />
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Years Tree */}
                                      {expandedFaculties.has(faculty.faculty) && (
                                        <div className="mt-4 ml-8 space-y-4">
                                          {hasYears ? (
                                            years.map((year) => {
                                              const hasSubjects = hasSubcategories("year", year)
                                              const yearSubjects = getSubjectsForYear(year.id)
                                              const yearCount = getYearCount(level.levelName, faculty.faculty, year.yearName)

                                              return (
                                                <div key={year.id} className="relative pl-8">
                                                  {/* Vertical line for year */}
                                                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300"></div>

                                                  {/* Year Node */}
                                                  <div
                                                    className={`${hasSubjects ? "cursor-pointer" : "cursor-default"}`}
                                                    onClick={() => hasSubjects && toggleYear(year.id)}
                                                  >
                                                    <div
                                                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 ${
                                                        isSelected("year", year.yearName, level.levelName, faculty.faculty)
                                                          ? "bg-purple-50 border-purple-200 shadow-sm"
                                                          : "bg-white border-gray-200 hover:bg-gray-50"
                                                      }`}
                                                    >
                                                      <div
                                                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                          isSelected("year", year.yearName, level.levelName, faculty.faculty) ? "bg-purple-600" : "bg-purple-600"
                                                        }`}
                                                      >
                                                        <Calendar className="h-5 w-5 text-white" />
                                                      </div>
                                                      <div className="flex-1">
                                                        <h4 className="font-medium text-gray-800 capitalize">
                                                          {year.yearName.replace(/-/g, " ")}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">
                                                          {hasSubjects ? `${yearSubjects.length} Subjects` : "No Subjects"}
                                                          {" \u2022 "}
                                                          {yearCount} Questions
                                                        </p>
                                                      </div>
                                                      <div className="flex items-center gap-3">
                                                        <Button
                                                          onClick={(e) => {
                                                            e.stopPropagation()
                                                            if (hasSubjects) {
                                                              handleYearSelect(year.id, year.yearName, level.levelName, faculty.faculty)
                                                            }
                                                          }}
                                                          disabled={!hasSubjects}
                                                          variant={isSelected("year", year.yearName, level.levelName, faculty.faculty) ? "default" : "outline"}
                                                          className="h-8"
                                                        >
                                                          {!hasSubjects ? "No Subjects" : isSelected("year", year.yearName, level.levelName, faculty.faculty) ? (
                                                            <div className="flex items-center gap-2">
                                                              <Check className="h-4 w-4" />
                                                              Selected
                                                            </div>
                                                          ) : (
                                                            "Select"
                                                          )}
                                                        </Button>
                                                        <div className={`p-2 ${!hasSubjects ? 'opacity-30' : ''}`}>
                                                          {expandedYears.has(year.id) ? (
                                                            <ChevronDown className="h-5 w-5 text-gray-500" />
                                                          ) : (
                                                            <ChevronRight className="h-5 w-5 text-gray-500" />
                                                          )}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>

                                                  {/* Subjects List */}
                                                  {expandedYears.has(year.id) && (
                                                    <div className="mt-4 ml-8 space-y-2">
                                                      {hasSubjects ? (
                                                        yearSubjects.map((subject) => (
                                                          <div key={subject.name} className="relative pl-8">
                                                            {/* Vertical line for subject */}
                                                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300"></div>

                                                            <div
                                                              onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleSubjectSelect(subject.name, level.levelName, faculty.faculty, year.yearName)
                                                              }}
                                                              className={`flex items-center gap-4 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${
                                                                isSelected("subject", subject.name, level.levelName, faculty.faculty, year.yearName)
                                                                  ? "bg-orange-50 border-orange-200 shadow-sm"
                                                                  : "bg-white border-gray-200 hover:bg-gray-50"
                                                              }`}
                                                            >
                                                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                                isSelected("subject", subject.name, level.levelName, faculty.faculty, year.yearName)
                                                                  ? "bg-orange-600"
                                                                  : "bg-gray-200"
                                                              }`}>
                                                                <FileText className={`h-4 w-4 ${
                                                                  isSelected("subject", subject.name, level.levelName, faculty.faculty, year.yearName)
                                                                    ? "text-white"
                                                                    : "text-gray-600"
                                                                }`} />
                                                              </div>
                                                              <span className={`text-sm font-medium capitalize flex-1 ${
                                                                isSelected("subject", subject.name, level.levelName, faculty.faculty, year.yearName)
                                                                  ? "text-orange-800"
                                                                  : "text-gray-700"
                                                              }`}>
                                                                {subject.name.replace(/-/g, " ")}
                                                              </span>
                                                              <span className="text-xs text-gray-500 mr-2">
                                                                {getSubjectCount(
                                                                  level.levelName,
                                                                  faculty.faculty,
                                                                  year.yearName,
                                                                  subject.name,
                                                                )} Questions
                                                              </span>
                                                              <Button
                                                                variant={isSelected("subject", subject.name, level.levelName, faculty.faculty, year.yearName) ? "default" : "outline"}
                                                                className="h-8"
                                                              >
                                                                {isSelected("subject", subject.name, level.levelName, faculty.faculty, year.yearName) ? (
                                                                  <div className="flex items-center gap-2">
                                                                    <Check className="h-4 w-4" />
                                                                    Selected
                                                                  </div>
                                                                ) : (
                                                                  "Select"
                                                                )}
                                                              </Button>
                                                            </div>
                                                          </div>
                                                        ))
                                                      ) : (
                                                        <div className="relative pl-8">
                                                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                                                          <div className="flex items-center gap-4 p-3 rounded-lg border bg-gray-50 border-gray-200">
                                                            <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                                                              <FileText className="h-4 w-4 text-gray-400" />
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-500 capitalize flex-1">
                                                              No subjects available for {year.yearName.replace(/-/g, " ")}
                                                            </span>
                                                          </div>
                                                        </div>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>
                                              )
                                            })
                                          ) : (
                                            <div className="relative pl-8">
                                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                                              <div className="flex items-center gap-4 p-4 rounded-lg border bg-gray-50 border-gray-200">
                                                <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                                  <Calendar className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <div className="flex-1">
                                                  <h4 className="font-medium text-gray-500 capitalize">
                                                    No years available for {faculty.faculty.replace(/-/g, " ")}
                                                  </h4>
                                                  <p className="text-sm text-gray-400">
                                                    This faculty has no years configured
                                                  </p>
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })
                              ) : (
                                <div className="relative pl-8">
                                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                                  <div className="flex items-center gap-4 p-4 rounded-lg border bg-gray-50 border-gray-200">
                                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                      <BookOpen className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="font-medium text-gray-500 capitalize">
                                        No faculties available for {level.levelName.replace(/-/g, " ")}
                                      </h3>
                                      <p className="text-sm text-gray-400">This level has no faculties configured</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Desktop Help Section */}
                <div className="hidden lg:block w-80 flex-shrink-0">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                    <h3 className="font-medium text-gray-800 mb-4">How to Navigate</h3>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mt-1">
                          <GraduationCap className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 mb-1">Select Level</h4>
                          <p className="text-sm text-gray-600">Click on any level to explore its faculties</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mt-1">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 mb-1">Choose Faculty</h4>
                          <p className="text-sm text-gray-600">Select your field of study</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mt-1">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 mb-1">Pick Year</h4>
                          <p className="text-sm text-gray-600">Choose your year and subjects</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

        {/* Mobile Help Dialog */}
        {showMobileHelp && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 lg:hidden">
            <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 max-w-sm w-full shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-800">How to Navigate</h3>
                <button
                  onClick={() => setShowMobileHelp(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mt-1 shadow-sm">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Select Level</h4>
                    <p className="text-sm text-gray-600">Click on any level to explore its faculties</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mt-1 shadow-sm">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Choose Faculty</h4>
                    <p className="text-sm text-gray-600">Select your field of study</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center mt-1 shadow-sm">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-1">Pick Year</h4>
                    <p className="text-sm text-gray-600">Choose your year and subjects</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PlayQuizPage

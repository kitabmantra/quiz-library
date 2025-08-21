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
  X,
  Play,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import { AcademicCategories, CountQuestionItem } from "@/lib/types/quiz/quiz"
import { useRouter } from "next/navigation"
import { quizStorage } from "@/lib/utils/quiz-storage"
function PlayQuizPage() {
  const { data, isLoading, error } = useGetAllAcademicCat()
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(new Set())
  const [expandedFaculties, setExpandedFaculties] = useState<Set<string>>(new Set())
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set())
  const [selectedNumber, setSelectedNumber] = useState(10)

  const router = useRouter()
  const [activeFilters, setActiveFilters] = useState<{ level: string | null, faculty: string | null, year: string | null, subjects: string[], questionCount: number }>({ level: null, faculty: null, year: null, subjects: [], questionCount: 10 })
  const [questionCountSelected, setQuestionCountSelected] = useState(true)
  const academicData = data?.data as AcademicCategories
  const countData: CountQuestionItem[] = Array.isArray(academicData?.countQuestionData) ? (academicData?.countQuestionData as CountQuestionItem[]) : []

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

  const getSubjectCount = (levelName: string, facultyName: string, yearName: string, subjectName: string,
  ) => {
    if (!subjectName) return 0
    return sumCounts(
      countData.filter((item) => item.subjectName === subjectName && item.levelName === levelName && item.faculty === facultyName && item.yearName === yearName),
    )
  }




  const getAvailableQuestionsForFilters = () => {
    if (!activeFilters.level) return 0
    let filteredItems = countData.filter(item => item.levelName === activeFilters.level)
    if (activeFilters.subjects.length > 0) {
      if (!activeFilters.faculty || !activeFilters.year) return 0
      return sumCounts(filteredItems.filter((item) =>
        activeFilters.subjects.includes(item.subjectName) &&
        item.faculty === activeFilters.faculty &&
        item.yearName === activeFilters.year
      ))
    }
    if (activeFilters.year) {
      if (!activeFilters.faculty) return 0
      return sumCounts(filteredItems.filter((item) =>
        item.faculty === activeFilters.faculty &&
        item.yearName === activeFilters.year
      ))
    }
    if (activeFilters.faculty) {
      return sumCounts(filteredItems.filter((item) =>
        item.faculty === activeFilters.faculty
      ))
    }
    return sumCounts(filteredItems)
  }

  const getAvailableQuestionsForCurrentSelection = () => {
    if (!activeFilters.level) return 0
    let filteredItems = countData.filter(item => item.levelName === activeFilters.level)
    if (activeFilters.subjects.length > 0) {
      if (!activeFilters.faculty || !activeFilters.year) return 0
      return sumCounts(filteredItems.filter((item) =>
        activeFilters.subjects.includes(item.subjectName) &&
        item.faculty === activeFilters.faculty &&
        item.yearName === activeFilters.year
      ))
    }
    return getAvailableQuestionsForFilters()
  }
  const canPlayQuiz = () => {
    if (!activeFilters.level) return false
    if (activeFilters.subjects.length > 0) {
      if (!activeFilters.faculty || !activeFilters.year) return false
    }
    if (activeFilters.year && !activeFilters.faculty) return false
    const availableQuestions = getAvailableQuestionsForCurrentSelection()
    if (availableQuestions < 1) return false
    if (selectedNumber > availableQuestions) return false
    return true
  }

  const getQuizStatusMessage = () => {
    if (!activeFilters.level) {
      return `Ready to play with ${selectedNumber} questions. Select a level to continue.`
    }
    const availableQuestions = getAvailableQuestionsForCurrentSelection()
    if (activeFilters.subjects.length > 0) {
      if (!activeFilters.faculty || !activeFilters.year) {
        if (!activeFilters.faculty && !activeFilters.year) {
          return "To play with subjects, you must select both faculty and year"
        } else if (!activeFilters.faculty) {
          return "To play with subjects, you must select a faculty"
        } else {
          return "To play with subjects, you must select a year"
        }
      }
    }

    if (availableQuestions === 0) {
      if (activeFilters.year && !activeFilters.faculty) {
        return "To play with a specific year, you must select a faculty first"
      }
      if (activeFilters.subjects.length > 0) {
        return "No questions available for the selected subjects"
      }
      return "No questions available for the selected filters"
    }

    if (selectedNumber > availableQuestions) {
      if (activeFilters.subjects.length > 0) {
        return `❌ Cannot play: You need ${selectedNumber} questions but only ${availableQuestions} are available for selected subjects. Try different subjects or reduce question count.`
      } else {
        return `❌ Cannot play: You need ${selectedNumber} questions but only ${availableQuestions} are available with current filters. Try different level/faculty or reduce question count.`
      }
    }

    if (activeFilters.subjects.length > 0) {
      return `✅ Ready to play! ${selectedNumber} questions selected from ${activeFilters.subjects.length} subject(s) (${availableQuestions} available)`
    } else {
      return `✅ Ready to play! ${selectedNumber} questions selected (${availableQuestions} available)`
    }
  }
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
      return []
    }
  }
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
  const handleLevelSelect = (levelName: string) => {
    if (activeFilters.level === levelName) {
      setActiveFilters(prev => ({
        ...prev, level: null, faculty: null, year: null, subjects: [],
      }))
    } else {
      setActiveFilters(prev => ({
        ...prev, level: levelName, faculty: null, year: null, subjects: [],
      }))
    }
  }
  const handleFacultySelect = (facultyName: string, levelName: string) => {
    if (activeFilters.faculty === facultyName) {
      setActiveFilters(prev => ({
        ...prev, faculty: null, year: null, subjects: [],
      }))
    } else {
      setActiveFilters(prev => ({
        ...prev, level: levelName, faculty: facultyName, year: null, subjects: [],
      }))
    }
  }

  const handleYearSelect = (yearName: string, levelName: string, facultyName: string) => {
    if (activeFilters.year === yearName) {
      setActiveFilters(prev => ({
        ...prev, year: null, subjects: [],
      }))
    } else {
      setActiveFilters(prev => ({
        ...prev, level: levelName, faculty: facultyName, year: yearName, subjects: [],
      }))
    }
  }

  const handleSubjectSelect = (subjectName: string, levelName: string, facultyName: string, yearName: string) => {
    setActiveFilters(prev => {
      const newSubjects = prev.subjects.includes(subjectName) ? prev.subjects.filter(s => s !== subjectName) : [...prev.subjects, subjectName]
      const newAvailableQuestions = newSubjects.length > 0 ? sumCounts(countData.filter((item) => newSubjects.includes(item.subjectName) && item.levelName === levelName && item.faculty === facultyName && item.yearName === yearName)) : getYearCount(levelName, facultyName, yearName)
      let newQuestionCount = selectedNumber
      if (newAvailableQuestions === 0) {
        newQuestionCount = 10
      } else {
        if (newQuestionCount > newAvailableQuestions) {
          newQuestionCount = Math.min(newAvailableQuestions, 100)
        }
        if (newQuestionCount < Math.min(10, newAvailableQuestions)) {
          newQuestionCount = Math.min(10, newAvailableQuestions)
        }
      }
      return {
        ...prev, level: levelName, faculty: facultyName, year: yearName, subjects: newSubjects, questionCount: newQuestionCount
      }
    })
  }

  const clearFilters = () => {
    setActiveFilters({
      level: null, faculty: null, year: null, subjects: [], questionCount: 10,
    })
    setSelectedNumber(10)
    setQuestionCountSelected(true)
    setExpandedLevels(new Set())
    setExpandedFaculties(new Set())
    setExpandedYears(new Set())
  }
  const isSelected = (type: "level" | "faculty" | "year" | "subject", value: string, levelName?: string, facultyName?: string, yearName?: string) => {
    if (type === "subject") return activeFilters.subjects.includes(value) && activeFilters.level === levelName && activeFilters.faculty === facultyName && activeFilters.year === yearName
    if (type === "faculty") return activeFilters.faculty === value && activeFilters.level === levelName
    if (type === "year") return activeFilters.year === value && activeFilters.level === levelName && activeFilters.faculty === facultyName
    return activeFilters[type] === value
  }

  const hasSubcategories = (type: "level" | "faculty" | "year", item: any) => {
    if (!item) return false
    if (type === "level") return Array.isArray(item.faculties) && item.faculties.length > 0
    if (type === "faculty") return Array.isArray(item.years) && item.years.length > 0
    if (type === "year") return !item.id ? false : Array.isArray(getSubjectsForYear(item.id)) && getSubjectsForYear(item.id).length > 0
    return false
  }

  const handlePlayQuiz = () => {
    if (canPlayQuiz()) {
      const quizData = quizStorage.getQuizData();
      if (quizData && quizData !== null) {
        console.log("this is the quiz data : ", quizData)
        console.log("this is the active filters : ", activeFilters)
        if (quizData.filter.level === activeFilters.level &&
          quizData.filter.faculty === activeFilters.faculty &&
          quizData.filter.year === activeFilters.year &&
          quizData.filter.subjects.length === activeFilters.subjects.length) {
          router.push("/quizzes/academic/category-selection/play-quiz");
          return;
        }
      }
      if (!activeFilters.level) return;
      quizStorage.clearQuizData();
      quizStorage.storeQuizData(activeFilters, []);
      router.push("/quizzes/academic/category-selection/play-quiz");
    } else {
      toast.error("Please select a level to play the quiz")
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative z-10 w-full p-4 lg:p-6">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Academic Quiz</h1>
          <p className="text-lg lg:text-xl text-gray-600">Select your subjects and start testing</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* Left Column - Quiz Configuration & Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quiz Configuration Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Quiz Configuration</h3>
                {(questionCountSelected || activeFilters.level || activeFilters.faculty || activeFilters.year || activeFilters.subjects.length > 0) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                )}
              </div>

              {/* Question Count Selection */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${questionCountSelected ? 'bg-purple-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
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
                    <SelectTrigger className={`w-full ${questionCountSelected ? 'border-purple-300 bg-purple-50' : 'border-gray-300'}`}>
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
                  <span className="text-sm text-purple-600 font-medium mt-2 block">
                    ✓ {selectedNumber} questions selected
                  </span>
                </div>
              </div>

              {/* Filter Selection */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${activeFilters.level ? 'bg-purple-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                    2
                  </div>
                  <label className="text-base font-semibold text-gray-900">Select Filters</label>
                </div>
                <div className="ml-9">
                  <span className="text-sm text-gray-600">
                    {activeFilters.level
                      ? `Available: ${getAvailableQuestionsForFilters()} questions`
                      : "Select a level to see available questions"
                    }
                  </span>
                </div>
              </div>

              {/* Selected Filters Display */}
              {(activeFilters.level || activeFilters.faculty || activeFilters.year || activeFilters.subjects.length > 0) && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Selected Filters:</h4>
                  <div className="space-y-2">
                    {activeFilters.level && (
                      <div className="bg-purple-50 border border-purple-200 text-purple-800 px-3 py-2 rounded-lg text-sm font-medium">
                        Level: {activeFilters.level.replace(/-/g, " ")}
                      </div>
                    )}
                    {activeFilters.faculty && (
                      <div className="bg-purple-50 border border-purple-200 text-purple-800 px-3 py-2 rounded-lg text-sm font-medium">
                        Faculty: {activeFilters.faculty.replace(/-/g, " ")}
                      </div>
                    )}
                    {activeFilters.year && (
                      <div className="bg-purple-50 border border-purple-200 text-purple-800 px-3 py-2 rounded-lg text-sm font-medium">
                        Year: {activeFilters.year.replace(/-/g, " ")}
                      </div>
                    )}
                    {activeFilters.subjects.slice(0, 3).map((subject, index) => (
                      <div
                        key={index}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${activeFilters.faculty && activeFilters.year ? "bg-purple-50 border border-purple-200 text-purple-800" : "bg-red-50 border border-red-200 text-red-800"}`}
                      >
                        {subject.replace(/-/g, " ")}
                        {(!activeFilters.faculty || !activeFilters.year) && (
                          <span className="ml-1 text-xs">(incomplete)</span>
                        )}
                      </div>
                    ))}
                    {activeFilters.subjects.length > 3 && (
                      <div className="px-3 py-2 rounded-lg text-xs bg-orange-50 border border-orange-200 text-orange-800">
                        +{activeFilters.subjects.length - 3} more subjects
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status Message */}
              <div className="mb-6">
                <p className={`text-sm font-medium ${!activeFilters.level ? 'text-purple-600' :
                  canPlayQuiz() ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {getQuizStatusMessage()}
                </p>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => {
                  if (canPlayQuiz()) {
                    handlePlayQuiz()
                  }
                }}
                disabled={!canPlayQuiz()}
                className={`w-full px-6 py-3 text-base font-semibold rounded-xl transition-all duration-300 ${canPlayQuiz()
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                size="default"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Quiz
              </Button>
            </div>

            {/* Help Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">How to Navigate</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mt-1">
                    <GraduationCap className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">Select Level</h4>
                    <p className="text-xs text-gray-600">Click on any level to explore its faculties</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mt-1">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">Choose Faculty</h4>
                    <p className="text-xs text-gray-600">Select your field of study</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mt-1">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1 text-sm">Pick Year</h4>
                    <p className="text-xs text-gray-600">Choose your year and subjects</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Category Selection */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Select Your Academic Path</h3>
              <div className="space-y-4">
                {academicData?.levels?.map((level) => {
                  const hasFaculties = hasSubcategories("level", level)
                  const faculties = Array.isArray(level?.faculties) ? level.faculties : []
                  const levelCount = getLevelCount(level.levelName)
                  return (
                    <div key={level.levelName} className="relative pl-4">
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                      <div
                        className={`${hasFaculties ? "cursor-pointer" : "cursor-default"}`}
                        onClick={() => hasFaculties && toggleLevel(level.levelName)}
                      >
                        <div
                          className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${isSelected("level", level.levelName) ? "bg-purple-50 border-purple-200 shadow-lg" : "bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md"}`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected("level", level.levelName) ? "bg-gradient-to-br from-purple-500 to-purple-600" : "bg-gradient-to-br from-purple-500 to-purple-600"}`}
                          >
                            <GraduationCap className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h2 className="font-medium text-gray-800 capitalize text-sm truncate">
                              {level.levelName.replace(/-/g, " ")}
                            </h2>
                            <p className="text-xs text-gray-500">
                              {hasFaculties ? `${faculties.length} Faculties` : "No Faculties"}
                              {" \u2022 "}
                              {levelCount} Questions
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (hasFaculties) handleLevelSelect(level.levelName)
                              }}
                              disabled={!hasFaculties}
                              variant={isSelected("level", level.levelName) ? "default" : "outline"}
                              className="h-7 text-xs"
                            >
                              {!hasFaculties ? "No Faculties" : isSelected("level", level.levelName) ? (
                                <div className="flex items-center gap-1">
                                  <Check className="h-3 w-3" />
                                  <span className="hidden sm:inline">Selected</span>
                                  <span className="sm:hidden">✓</span>
                                </div>) : ("Select")}
                            </Button>
                            <div className={`p-1 ${!hasFaculties ? 'opacity-30' : ''}`}>
                              {expandedLevels.has(level.levelName) ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />) : (<ChevronRight className="h-4 w-4 text-gray-500" />)}
                            </div>
                          </div>
                        </div>
                      </div>
                      {expandedLevels.has(level.levelName) && (
                        <div className="mt-3 ml-4 space-y-3">
                          {hasFaculties ? (
                            faculties.map((faculty) => {
                              const hasYears = hasSubcategories("faculty", faculty)
                              const years = Array.isArray(faculty?.years) ? faculty.years : []
                              const facultyCount = getFacultyCount(level.levelName, faculty.faculty)
                              return (
                                <div key={faculty.faculty} className="relative pl-4">
                                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                                  <div className={`${hasYears ? "cursor-pointer" : "cursor-default"}`} onClick={() => hasYears && toggleFaculty(faculty.faculty)} >
                                    <div
                                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${isSelected("faculty", faculty.faculty, level.levelName) ? "bg-purple-50 border-purple-200 shadow-lg" : "bg-white border-gray-200 hover:bg-gray-50 hover:shadow-md"}`}>
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected("faculty", faculty.faculty, level.levelName) ? "bg-gradient-to-br from-purple-500 to-purple-600" : "bg-gradient-to-br from-purple-500 to-purple-600"}`}> <BookOpen className="h-5 w-5 text-white" /> </div>
                                      <div className="flex-1 min-w-0"> <h3 className="font-medium text-gray-800 capitalize text-sm truncate">{faculty.faculty.replace(/-/g, " ")}</h3><p className="text-xs text-gray-500"> {hasYears ? `${years.length} Years` : "No Years"} {" \u2022 "} {facultyCount} Questions</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            if (hasYears) handleFacultySelect(faculty.faculty, level.levelName)
                                          }}
                                          disabled={!hasYears}
                                          variant={isSelected("faculty", faculty.faculty, level.levelName) ? "default" : "outline"}
                                          className="h-7 text-xs"
                                        >
                                          {!hasYears ? "No Years" : isSelected("faculty", faculty.faculty, level.levelName) ? (
                                            <div className="flex items-center gap-1"> <Check className="h-3 w-3" /> <span className="hidden sm:inline">Selected</span> <span className="sm:hidden">✓</span> </div>) : ("Select")}
                                        </Button>
                                        <div className={`p-1 ${!hasYears ? 'opacity-30' : ''}`}>
                                          {expandedFaculties.has(faculty.faculty) ? (<ChevronDown className="h-4 w-4 text-gray-500" />) : (<ChevronRight className="h-4 w-4 text-gray-500" />)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  {expandedFaculties.has(faculty.faculty) && (
                                    <div className="mt-3 ml-4 space-y-3">
                                      {hasYears ? (
                                        years.map((year) => {
                                          const hasSubjects = hasSubcategories("year", year)
                                          const yearSubjects = getSubjectsForYear(year.id)
                                          const yearCount = getYearCount(level.levelName, faculty.faculty, year.yearName)
                                          return (
                                            <div key={year.id} className="relative pl-4">
                                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                                              <div className={`${hasSubjects ? "cursor-pointer" : "cursor-default"}`} onClick={() => hasSubjects && toggleYear(year.id)} >
                                                <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${isSelected("year", year.yearName, level.levelName, faculty.faculty) ? "bg-purple-50 border-purple-200 shadow-sm" : "bg-white border-gray-200 hover:bg-gray-50"}`}>
                                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected("year", year.yearName, level.levelName, faculty.faculty) ? "bg-purple-600" : "bg-purple-600"}`} >
                                                    <Calendar className="h-4 w-4 text-white" />
                                                  </div>
                                                  <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-800 capitalize text-sm truncate"> {year.yearName.replace(/-/g, " ")}</h4>
                                                    <p className="text-xs text-gray-500"> {hasSubjects ? `${yearSubjects.length} Subjects` : "No Subjects"} {" \u2022 "} {yearCount} Questions</p>
                                                  </div>
                                                  <div className="flex items-center gap-2">
                                                    <Button
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        if (hasSubjects) handleYearSelect(year.yearName, level.levelName, faculty.faculty)
                                                      }}
                                                      disabled={!hasSubjects}
                                                      variant={isSelected("year", year.yearName, level.levelName, faculty.faculty) ? "default" : "outline"}
                                                      className="h-7 text-xs"
                                                    >
                                                      {!hasSubjects ? "No Subjects" : isSelected("year", year.yearName, level.levelName, faculty.faculty) ? (
                                                        <div className="flex items-center gap-1"> <Check className="h-3 w-3" /> <span className="hidden sm:inline">Selected</span> <span className="sm:hidden">✓</span> </div>) : ("Select")}
                                                    </Button>
                                                    <div className={`p-1 ${!hasSubjects ? 'opacity-30' : ''}`}>  {expandedYears.has(year.id) ? (<ChevronDown className="h-4 w-4 text-gray-500" />) : (<ChevronRight className="h-4 w-4 text-gray-500" />)} </div>
                                                  </div>
                                                </div>
                                              </div>
                                              {expandedYears.has(year.id) && (
                                                <div className="mt-3 ml-4 space-y-2">
                                                  {hasSubjects ? (
                                                    yearSubjects.map((subject) => (
                                                      <div key={subject.name} className="relative pl-4">
                                                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                                                        <div onClick={(e) => { e.stopPropagation(); handleSubjectSelect(subject.name, level.levelName, faculty.faculty, year.yearName) }}
                                                          className={`flex items-center gap-3 p-2 rounded-lg border transition-all duration-200 cursor-pointer ${isSelected("subject", subject.name, level.levelName, faculty.faculty, year.yearName) ? "bg-orange-50 border-orange-200 shadow-sm" : "bg-white border-gray-200 hover:bg-gray-50"}`}
                                                        >
                                                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isSelected("subject", subject.name, level.levelName, faculty.faculty, year.yearName) ? "bg-orange-600" : "bg-gray-200"}`}>
                                                            <FileText className={`h-3 w-3 ${isSelected("subject", subject.name, level.levelName, faculty.faculty, year.yearName) ? "text-white" : "text-gray-600"}`} />
                                                          </div>
                                                          <span className={`text-xs font-medium capitalize flex-1 truncate ${isSelected("subject", subject.name, level.levelName, faculty.faculty, year.yearName) ? "text-orange-800" : "text-gray-700"}`}>
                                                            {subject.name.replace(/-/g, " ")}
                                                          </span>
                                                          <span className="text-xs text-gray-500 mr-2 hidden sm:inline">
                                                            {getSubjectCount(level.levelName, faculty.faculty, year.yearName, subject.name,
                                                            )} Questions
                                                          </span>
                                                          <Button
                                                            variant={isSelected("subject", subject.name, level.levelName, faculty.faculty, year.yearName) ? "default" : "outline"}
                                                            className="h-6 text-xs"
                                                          >
                                                            {isSelected("subject", subject.name, level.levelName, faculty.faculty, year.yearName) ? (
                                                              <div className="flex items-center gap-1">
                                                                <Check className="h-3 w-3" />
                                                                <span className="hidden sm:inline">Selected</span>
                                                                <span className="sm:hidden">✓</span>
                                                              </div>
                                                            ) : (
                                                              "Select"
                                                            )}
                                                          </Button>
                                                        </div>
                                                      </div>
                                                    ))
                                                  ) : (
                                                    <div className="relative pl-4">
                                                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                                                      <div className="flex items-center gap-3 p-2 rounded-lg border bg-gray-50 border-gray-200">
                                                        <div className="w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center">
                                                          <FileText className="h-3 w-3 text-gray-400" />
                                                        </div>
                                                        <span className="text-xs font-medium text-gray-500 capitalize flex-1">
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
                                        <div className="relative pl-4">
                                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                                          <div className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50 border-gray-200">
                                            <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                                              <Calendar className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <h4 className="font-medium text-gray-500 capitalize text-sm truncate">
                                                No years available for {faculty.faculty.replace(/-/g, " ")}
                                              </h4>
                                              <p className="text-xs text-gray-400">
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
                            <div className="relative pl-4">
                              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-300"></div>
                              <div className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50 border-gray-200">
                                <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <BookOpen className="h-4 w-4 text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-gray-500 capitalize text-sm truncate">
                                    No faculties available for {level.levelName.replace(/-/g, " ")}
                                  </h3>
                                  <p className="text-xs text-gray-400">This level has no faculties configured</p>
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

export default PlayQuizPage

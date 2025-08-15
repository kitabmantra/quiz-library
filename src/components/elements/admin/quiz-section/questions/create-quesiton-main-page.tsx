/*eslint-disable */
"use client"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ChevronRight, Brain, Plus, FileText, Upload } from "lucide-react"
import toast from "react-hot-toast"
import { ImageUpload } from "./imageUpload"
import { QuestionForm } from "./QuestionForm"
import { QuestionPreview } from "./QuestionPreview"
import { QuestionList } from "./QuestionList"
import { ManualQuestionList } from "./ManualQuestionList"
import { ModeSelector } from "./ModeSelector"
import { QuestionData } from "@/lib/types/quiz/quiz"
import { CreationMode } from "@/lib/types/quiz/quiz"
import { CreateQuesitonForBackend, CreateQuestionRequestType } from "@/lib/actions/quiz/question/post/create-question"
import { useYearName } from "@/lib/hooks/params/useYearName"
import { useLevelName } from "@/lib/hooks/params/useLevelName"
import { useFacultyName } from "@/lib/hooks/params/useFaucltyName"
import { useQueryClient } from "@tanstack/react-query"

const getErrorMessage = (error: any) => {
  return error?.message || "An error occurred"
}

export default function CreateQuestionPage() {
  const yearName = useYearName()
  const levelName = useLevelName()
  const facultyName = useFacultyName()
  const router = useRouter()

  const [mode, setMode] = useState<CreationMode>("multiple")
  const [isCreating, setIsCreating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [questions, setQuestions] = useState<QuestionData[]>([])
  const [manualQuestions, setManualQuestions] = useState<QuestionData[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const queryClient = useQueryClient()

  const [questionData, setQuestionData] = useState<QuestionData>({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: -1,
    difficulty: "medium",
    hint: "",
    referenceUrl: "",
    tags: [],
    priority: 3,
    subjectName: "",
  })

  const validateQuestion = useCallback((data: QuestionData): string | null => {
    if (!data.question.trim()) return "Question is required"
    if (data.question.length < 5 || data.question.length > 1000) {
      return "Question must be between 5 and 1000 characters"
    }
    if (data.options.some((option) => !option.trim())) return "All options are required"
    if (data.correctAnswer === -1) return "Please select a correct answer"
    if (data.tags.length === 0) return "At least one tag is required"
    if (data.tags.length > 5) return "Maximum 5 tags allowed"
    if (!data.subjectName.trim()) return "Subject name is required"
    return null
  }, [])

  const handleQuestionChange = useCallback((data: QuestionData) => {
    setQuestionData(data)
  }, [])

  const handleGenerateFromImages = useCallback(async (files: File[], type: "multiple") => {
    setIsGenerating(true)
    try {
      // TODO: Implement actual image processing
      console.log("Generating questions from images:", files, type)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock multiple questions generation
      const mockQuestions: QuestionData[] = files.map((_, index) => ({
        question: `Sample question ${index + 1} generated from image`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: 0,
        difficulty: "medium",
        tags: ["image-generated"],
        priority: 3,
        subjectName: questionData.subjectName || "General",
        hint: "",
        referenceUrl: "",
      }))
      setQuestions(mockQuestions)
      toast.success(`${mockQuestions.length} questions generated from images successfully!`)
    } catch (error) {
      toast.error(error as string|| "Failed to generate questions from images")
    } finally {
      setIsGenerating(false)
    }
  }, [questionData.subjectName])

  const handleGenerateFromAI = useCallback(async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt for AI generation")
      return
    }

    setIsGeneratingAI(true)
    try {
      // TODO: Implement actual AI API call
      console.log("Generating questions from AI prompt:", aiPrompt)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Mock AI questions generation
      const mockQuestions: QuestionData[] = [
        {
          question: `AI Generated Question 1 based on: "${aiPrompt}"`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 0,
          difficulty: "medium",
          tags: ["ai-generated"],
          priority: 3,
          subjectName: questionData.subjectName || "General",
          hint: "",
          referenceUrl: "",
        },
        {
          question: `AI Generated Question 2 based on: "${aiPrompt}"`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: 1,
          difficulty: "medium",
          tags: ["ai-generated"],
          priority: 3,
          subjectName: questionData.subjectName || "General",
          hint: "",
          referenceUrl: "",
        }
      ]
      setQuestions(mockQuestions)
      toast.success(`${mockQuestions.length} questions generated from AI successfully!`)
      setAiPrompt("") // Clear prompt after generation
    } catch (error) {
      toast.error(error as string|| "Failed to generate questions from AI")
    } finally {
      setIsGeneratingAI(false)
    }
  }, [aiPrompt, questionData.subjectName])

  const handleRemoveQuestion = useCallback((index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleAddToManualList = useCallback((): void => {
    const validationError = validateQuestion(questionData)
    if (validationError) {
      toast.error(validationError)
      return
    }

    if (editingIndex !== null) {
      // Update existing question
      setManualQuestions((prev) => prev.map((q, i) => (i === editingIndex ? { ...questionData } : q)))
      setEditingIndex(null)
      toast.success("Question updated in list!")
    } else {
      // Add new question
      setManualQuestions((prev) => [...prev, { ...questionData }])
      toast.success("Question added to list!")
    }

    // Reset form for next question
    setQuestionData({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: -1,
      difficulty: "medium",
      hint: "",
      referenceUrl: "",
      tags: [],
      priority: 3,
      subjectName: questionData.subjectName, // Keep subject name for consistency
    })
  }, [validateQuestion, questionData, editingIndex])

  const handleSaveAllManualQuestions = useCallback(async () => {
    if (manualQuestions.length === 0) {
      toast.error("add question to list to save questions")
      return
    }
    setIsCreating(true)
    try {
      const data: CreateQuestionRequestType = {
        levelName,
        yearName,
        type: "academic",
        faculty: facultyName,
        questions: manualQuestions
      }

      const res = await CreateQuesitonForBackend(data)
      if (res.success && res.message) {
        toast.success("Questions saved successfully")
        setManualQuestions([])
        router.push(`/quiz-section/academic/level/${levelName}/faculty/${facultyName}/${yearName}`)
        queryClient.invalidateQueries({ queryKey: ["get-academic-questions",{
         search: "",
         yearName,
         faculty: facultyName,
         levelName,
        }, 100] })

        queryClient.invalidateQueries({ queryKey: ["get-year-academic-stat", yearName, levelName, facultyName, "academic"] })
      } else if (!res.success && res.error) {
        const error = getErrorMessage(res.error)
        toast.error(error)
      }
      else {
        toast.error("something went worng ")
      }
    } catch (error) {
      error = getErrorMessage(error)
      toast.error(error as string)
    } finally {
      setIsCreating(false)
    }

  }, [manualQuestions, levelName, facultyName, yearName, router])

  const handleEditManualQuestion = useCallback((index: number) => {
    const questionToEdit = manualQuestions[index]
    setQuestionData({ ...questionToEdit })
    setEditingIndex(index)
    toast.success("Question loaded for editing")
  }, [manualQuestions])

  const handleRemoveManualQuestion = useCallback((index: number) => {
    setManualQuestions((prev) => prev.filter((_, i) => i !== index))
    if (editingIndex === index) {
      setEditingIndex(null)
    }
    toast.success("Question removed from list")
  }, [editingIndex])

  const formatBreadcrumbText = useCallback((text: string) => {
    return text.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="outline" 
              onClick={() => router.back()} 
              size="sm"
              className="hover:bg-sky-50 border-sky-300 text-sky-700 hover:border-sky-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                Create Questions
              </h1>
              <div className="flex items-center gap-1 text-sm text-sky-600 mt-2">
                <span className="font-medium">Academic</span>
                <ChevronRight className="w-4 h-4" />
                <span className="capitalize font-medium">{formatBreadcrumbText(levelName)}</span>
                <ChevronRight className="w-4 h-4" />
                <span className="capitalize font-medium">{formatBreadcrumbText(facultyName)}</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-sky-700 font-semibold capitalize">{formatBreadcrumbText(yearName)}</span>
              </div>
            </div>
          </div>

          {/* Mode Selection */}
          <div className="bg-white rounded-xl shadow-lg border-0 p-6">
            <ModeSelector mode={mode} onModeChange={setMode} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mode === "multiple" && (
          <div className="space-y-8">
            {/* Image Upload for Multiple Mode */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5 text-sky-600" />
                  Image Upload & Generation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  onImagesUploaded={() => { }}
                  onGenerateFromImages={handleGenerateFromImages}
                  isGenerating={isGenerating}
                  mode="multiple"
                />
              </CardContent>
            </Card>

            {/* Generated Questions List */}
            {questions.length > 0 && (
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-sky-600" />
                    Generated Questions ({questions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <QuestionList
                    questions={questions}
                    onSaveQuestion={handleSaveAllManualQuestions}
                    onRemoveQuestion={handleRemoveQuestion}
                    isSaving={isCreating}
                  />
                </CardContent>
              </Card>
            )}

            {/* Manual Question Form and List for Multiple Mode */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <QuestionForm
                questionData={questionData}
                onQuestionChange={handleQuestionChange}
                onAddToList={handleAddToManualList}
                showAddToList={true}
                isSaving={isCreating}
              />
              <QuestionPreview questionData={questionData} />
            </div>

            {/* Manual Question List for Multiple Mode */}
            {manualQuestions.length > 0 && (
              <div className="mt-8">
                <ManualQuestionList
                  questions={manualQuestions}
                  onEditQuestion={handleEditManualQuestion}
                  onRemoveQuestion={handleRemoveManualQuestion}
                  onSaveAll={handleSaveAllManualQuestions}
                  isSaving={isCreating}
                />
              </div>
            )}
          </div>
        )}

        {mode === "ai" && (
          <div className="space-y-8">
            {/* AI Generation Form */}
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  AI Question Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-sky-700">
                    Describe what kind of questions you want to generate:
                  </label>
                  <Textarea
                    placeholder="e.g., Generate 5 multiple choice questions about JavaScript fundamentals, covering variables, functions, and arrays..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={4}
                    className="resize-none border-sky-200 focus:border-sky-500 focus:ring-sky-500"
                  />
                </div>
                <Button
                  onClick={handleGenerateFromAI}
                  disabled={isGeneratingAI || !aiPrompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingAI ? "Generating Questions..." : "Generate Questions with AI"}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Questions List */}
            {questions.length > 0 && (
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-sky-600" />
                    Generated Questions ({questions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <QuestionList
                    questions={questions}
                    onSaveQuestion={handleSaveAllManualQuestions}
                    onRemoveQuestion={handleRemoveQuestion}
                    isSaving={isCreating}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {mode === "import" && (
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mb-6">
                <Upload className="w-8 h-8 text-sky-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-sky-800">Import Questions</h3>
              <p className="text-sky-600 mb-6 max-w-md mx-auto">
                Import functionality coming soon. Upload CSV, Excel, or JSON files to bulk import questions.
              </p>
              <Button variant="outline" disabled className="border-sky-300 text-sky-500">
                Choose File to Import
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

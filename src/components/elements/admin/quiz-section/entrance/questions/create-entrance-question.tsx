/*eslint-disable */
"use client"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ChevronRight, Brain, Plus, FileText, Upload } from "lucide-react"
import toast from "react-hot-toast"
import { ImageUpload } from "../../questions/imageUpload"
import { QuestionForm } from "../../questions/QuestionForm"
import { QuestionPreview } from "../../questions/QuestionPreview"
import { QuestionList } from "../../questions/QuestionList"
import { ManualQuestionList } from "../../questions/ManualQuestionList"
import { ModeSelector } from "../../questions/ModeSelector"
import GenerateEntranceQuestionWithAI from "./generate-entrance-question-with-ai"
import { EntranceQuestionData, CreationMode } from "@/lib/types/quiz/quiz"
import { CreateEntranceQuestionForBackend } from "@/lib/actions/quiz/entrance/question/post/create-entrance-question"
import { useEntranceName } from "@/lib/hooks/params/useEntranceName"
import { useQueryClient } from "@tanstack/react-query"

const getErrorMessage = (error: any) => {
  return error?.message || "An error occurred"
}

export default function CreateEntranceQuestionPage() {
  const entranceName = useEntranceName()
  const router = useRouter()

  const [mode, setMode] = useState<CreationMode>("multiple")
  const [isCreating, setIsCreating] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [questions, setQuestions] = useState<EntranceQuestionData[]>([])
  const [manualQuestions, setManualQuestions] = useState<EntranceQuestionData[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)


  const queryClient = useQueryClient()

  
  const [questionData, setQuestionData] = useState<EntranceQuestionData>({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    difficulty: "medium",
    hint: "",
    referenceUrl: "",
    tags: [],
    priority: 3,
    subjectName: "",
  })

  const validateQuestion = useCallback((data: EntranceQuestionData): string | null => {
    if (!data.question.trim()) return "Question is required"
    if (data.question.length < 5 || data.question.length > 1000) {
      return "Question must be between 5 and 1000 characters"
    }
    if (data.options.some((option) => !option.trim())) return "All options are required"
    if (!data.correctAnswer.trim()) return "Please select a correct answer"
    if (data.tags.length === 0) return "At least one tag is required"
    if (data.tags.length > 5) return "Maximum 5 tags allowed"
    if (!data.subjectName.trim()) return "Subject name is required"
    return null
  }, [])

  const handleQuestionChange = useCallback((data: any) => {
    // Convert from QuestionData format to EntranceQuestionData format
    const entranceData: EntranceQuestionData = {
      ...data,
      correctAnswer: data.correctAnswer === -1 ? "" : data.options[data.correctAnswer] || "",
    }
    setQuestionData(entranceData)
  }, [])

  const handleGenerateFromImages = useCallback(async (files: File[], type: "multiple") => {
    setIsGenerating(true)
    try {
      // TODO: Implement actual image processing
      console.log("Generating questions from images:", files, type)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock multiple questions generation
      const mockQuestions: EntranceQuestionData[] = files.map((_, index) => ({
        question: `Sample entrance question ${index + 1} generated from image`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A",
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
      toast.error(error as string || "Failed to generate questions from images")
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
      const mockQuestions: EntranceQuestionData[] = [
        {
          question: `AI Generated Entrance Question 1 based on: "${aiPrompt}"`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: "Option A",
          difficulty: "medium",
          tags: ["ai-generated"],
          priority: 3,
          subjectName: questionData.subjectName || "General",
          hint: "",
          referenceUrl: "",
        },
        {
          question: `AI Generated Entrance Question 2 based on: "${aiPrompt}"`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: "Option B",
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
      toast.error(error as string || "Failed to generate questions from AI")
    } finally {
      setIsGeneratingAI(false)
    }
  }, [aiPrompt, questionData.subjectName])

  const handleRemoveQuestion = useCallback((index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleQuestionsGenerated = useCallback((generatedQuestions: EntranceQuestionData[]) => {
    setQuestions(generatedQuestions)
  }, [])

  const handleAddToManualList = useCallback((questionsToAdd: EntranceQuestionData[] | EntranceQuestionData) => {
    const questionsArray = Array.isArray(questionsToAdd) ? questionsToAdd : [questionsToAdd]
    
    // Validate each question before adding
    const validQuestions = questionsArray.filter(question => {
      const validationError = validateQuestion(question)
      if (validationError) {
        toast.error(`Question "${question.question.substring(0, 50)}..." - ${validationError}`)
        return false
      }
      return true
    })

    if (validQuestions.length === 0) {
      toast.error("No valid questions to add")
      return
    }

    setManualQuestions((prev) => [...prev, ...validQuestions])
    toast.success(`${validQuestions.length} questions added to manual list!`)
  }, [validateQuestion])

  const handleAddSingleToManualList = useCallback((): void => {
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
      correctAnswer: "",
      difficulty: "medium",
      hint: "",
      referenceUrl: "",
      tags: [],
      priority: 3,
      subjectName: questionData.subjectName, // Keep subject name for consistency
    })
  }, [validateQuestion, questionData, editingIndex])

  const handleRemoveAllManualQuestions = useCallback(() => {
    if (manualQuestions.length === 0) {
      toast.error("No questions to remove")
      return
    }
    
    setManualQuestions([])
    setEditingIndex(null)
    toast.success("All questions removed from list")
  }, [manualQuestions])

  const handleSaveAllManualQuestions = useCallback(async () => {
    if (manualQuestions.length === 0) {
      toast.error("Add question to list to save questions")
      return
    }
    setIsCreating(true)
    try {
      const data = {
        entranceName,
        questions: manualQuestions
      }

      const res = await CreateEntranceQuestionForBackend(data)
      if (res.success && res.message) {
        toast.success("Questions saved successfully")
        setManualQuestions([])
        router.push(`/quiz-section/entrance/${entranceName}`)
        queryClient.invalidateQueries({ queryKey: ["get-entrance-questions", entranceName] })
        queryClient.invalidateQueries({ queryKey: ["get-entrance-question-stat", entranceName] })

      } else if (!res.success && res.error) {
        const error = getErrorMessage(res.error)
        toast.error(error)
      } else {
        toast.error("Something went wrong")
      }
    } catch (error) {
      error = getErrorMessage(error)
      toast.error(error as string)
    } finally {
      setIsCreating(false)
    }
  }, [manualQuestions, entranceName, router, queryClient])

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

  // Convert EntranceQuestionData to QuestionData for compatibility with existing components
  const convertToQuestionData = useCallback((data: EntranceQuestionData) => {
    const correctAnswerIndex = data.options.findIndex(option => option === data.correctAnswer)
    return {
      ...data,
      correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : -1
    }
  }, [])

  // Convert questions for display in QuestionList
  const displayQuestions = questions.map(convertToQuestionData)
  const displayManualQuestions = manualQuestions.map(convertToQuestionData)

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
                Create Entrance Questions
              </h1>
              <div className="flex items-center gap-1 text-sm text-sky-600 mt-2">
                <span className="font-medium">Entrance</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-sky-700 font-semibold capitalize">{formatBreadcrumbText(entranceName)}</span>
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
                    questions={displayQuestions}
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
                  questionData={convertToQuestionData(questionData)}
                  onQuestionChange={handleQuestionChange}
                  onAddToList={handleAddSingleToManualList}
                  showAddToList={true}
                  isSaving={isCreating}
                />
              <QuestionPreview questionData={convertToQuestionData(questionData)} />
            </div>

            {/* Manual Question List for Multiple Mode */}
            {manualQuestions.length > 0 && (
              <div className="mt-8">
                <ManualQuestionList
                  questions={displayManualQuestions}
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
                    Describe what kind of entrance questions you want to generate:
                  </label>
                  <Textarea
                    placeholder="e.g., Generate 5 multiple choice questions about mathematics for engineering entrance, covering algebra, calculus, and trigonometry..."
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
                    questions={displayQuestions}
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
          <div className="space-y-8">
            {/* AI Generation Component */}
            <GenerateEntranceQuestionWithAI
              onQuestionsGenerated={handleQuestionsGenerated}
              onAddToManualList={handleAddToManualList}
              isSaving={isCreating}
              manualQuestionsCount={manualQuestions.length}
            />

            {/* Manual Question Form and List for Import Mode */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <QuestionForm
                questionData={convertToQuestionData(questionData)}
                onQuestionChange={handleQuestionChange}
                onAddToList={handleAddSingleToManualList}
                showAddToList={true}
                isSaving={isCreating}
              />
              <QuestionPreview questionData={convertToQuestionData(questionData)} />
            </div>

            {/* Manual Question List for Import Mode */}
            {manualQuestions.length > 0 && (
              <div className="mt-8">
                <ManualQuestionList
                  questions={displayManualQuestions}
                  onEditQuestion={handleEditManualQuestion}
                  onRemoveQuestion={handleRemoveManualQuestion}
                  onSaveAll={handleSaveAllManualQuestions}
                  onRemoveAllQuestions={handleRemoveAllManualQuestions}
                  isSaving={isCreating}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, X, FileText } from "lucide-react"
import { QuestionData } from "@/lib/types/quiz/quiz"

interface QuestionFormProps {
  questionData: QuestionData
  onQuestionChange: (data: QuestionData) => void
  onAddToList?: () => void
  showAddToList?: boolean
  isSaving?: boolean
}

export const QuestionForm = memo(function QuestionForm({
  questionData,
  onQuestionChange,
  onAddToList,
  showAddToList,
  isSaving,
}: QuestionFormProps) {
  const [tagInput, setTagInput] = useState("")

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...questionData.options]
    newOptions[index] = value.toLowerCase()
    onQuestionChange({ ...questionData, options: newOptions })
  }

  const handleFormKeyPress = (e: React.KeyboardEvent, currentField: string) => {
    if (e.key === "Enter") {
      e.preventDefault()
      
      // Define the navigation order
      const fieldOrder = [
        'option-0', 'option-1', 'option-2', 'option-3',
        'difficulty', 'priority', 'subject',
        'tag-input', 'reference'
      ]
      
      const currentIndex = fieldOrder.indexOf(currentField)
      if (currentIndex !== -1 && currentIndex < fieldOrder.length - 1) {
        const nextField = fieldOrder[currentIndex + 1]
        
        // Handle different field types
        if (nextField.startsWith('option-')) {
          const optionIndex = nextField.split('-')[1]
          const nextInput = document.querySelector(`[data-option-index="${optionIndex}"]`) as HTMLInputElement
          if (nextInput) nextInput.focus()
        } else if (nextField === 'difficulty') {
          const difficultyTrigger = document.querySelector('[data-difficulty-select]') as HTMLButtonElement
          if (difficultyTrigger) difficultyTrigger.click()
        } else if (nextField === 'priority') {
          const priorityTrigger = document.querySelector('[data-priority-select]') as HTMLButtonElement
          if (priorityTrigger) priorityTrigger.click()
        } else {
          const nextInput = document.querySelector(`[data-field="${nextField}"]`) as HTMLInputElement | HTMLTextAreaElement
          if (nextInput) nextInput.focus()
        }
      }
    }
  }

  const handleCorrectAnswerChange = (index: number) => {
    onQuestionChange({ ...questionData, correctAnswer: index })
  }

  const formatTagInput = (input: string): string => {
    return input
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9\-_]/g, "")
  }

  const handleAddTag = () => {
    const formattedTag = formatTagInput(tagInput)
    if (formattedTag && formattedTag.length >= 2 && questionData.tags.length < 5) {
      if (!questionData.tags.includes(formattedTag)) {
        onQuestionChange({
          ...questionData,
          tags: [...questionData.tags, formattedTag],
        })
        setTagInput("")
      }
    }
  }

  const handleRemoveTag = (indexToRemove: number) => {
    onQuestionChange({
      ...questionData,
      tags: questionData.tags.filter((_, index) => index !== indexToRemove),
    })
  }

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTagInput(e.target.value)
    setTagInput(formatted)
  }

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="border-b border-sky-100 pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600" />
            <span className="text-sky-800">Question Details</span>
          </div>
          <div className="flex gap-2">
            {showAddToList && onAddToList && (
              <Button 
                onClick={onAddToList} 
                variant="outline" 
                className="gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Save className="w-4 h-4" />
                Add to List
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-sky-700">Question Text * (5-1000 characters)</label>
          <Textarea
            value={questionData.question}
            onChange={(e) => onQuestionChange({ ...questionData, question: e.target.value })}
            placeholder="Enter your question here..."
            rows={4}
            className="resize-none border-sky-200 focus:border-sky-500 focus:ring-sky-500 transition-all duration-200"
            maxLength={1000}
            disabled={isSaving}
          />
          <p className="text-xs text-sky-500 mt-1">{questionData.question.length}/1000 characters</p>
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-semibold mb-3 text-sky-700">Answer Options * (All 4 required)</label>
          <div className="space-y-3">
            {questionData.options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={questionData.correctAnswer === index}
                  onChange={() => handleCorrectAnswerChange(index)}
                  className="text-sky-600 focus:ring-sky-500"
                  disabled={isSaving}
                />
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  onKeyDown={(e) => handleFormKeyPress(e, `option-${index}`)}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  disabled={isSaving}
                  data-option-index={index}
                  className={`border-sky-200 focus:border-sky-500 focus:ring-sky-500 transition-all duration-200 ${
                    questionData.correctAnswer === index ? "border-emerald-500 bg-emerald-50" : ""
                  }`}
                />
                {questionData.correctAnswer === index && (
                  <Badge
                    variant="secondary"
                    className="text-xs bg-emerald-100 text-emerald-800 border-emerald-200"
                  >
                    Correct
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Difficulty, Priority, Subject */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-sky-700">Difficulty *</label>
            <Select
              value={questionData.difficulty}
              onValueChange={(value: "easy" | "medium" | "hard") =>
                onQuestionChange({ ...questionData, difficulty: value })
              }
              disabled={isSaving}
            >
              <SelectTrigger 
                className="border-sky-200 focus:border-sky-500 focus:ring-sky-500"
                data-difficulty-select
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-sky-700">Priority *</label>
            <Select
              value={questionData.priority.toString()}
              onValueChange={(value) => onQuestionChange({ ...questionData, priority: Number.parseInt(value) })}
              disabled={isSaving}
            >
              <SelectTrigger 
                className="border-sky-200 focus:border-sky-500 focus:ring-sky-500"
                data-priority-select
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Low</SelectItem>
                <SelectItem value="2">2 - Medium</SelectItem>
                <SelectItem value="3">3 - High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-sky-700">Subject *</label>
            <Input
              value={questionData.subjectName}
              onChange={(e) => {
                const formattedSubject = formatTagInput(e.target.value)
                onQuestionChange({ ...questionData, subjectName: formattedSubject })
              }}
              onKeyDown={(e) => handleFormKeyPress(e, 'subject')}
              placeholder="Enter subject name"
              disabled={isSaving}
              data-field="subject"
              className="border-sky-200 focus:border-sky-500 focus:ring-sky-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-sky-700">Tags * (1-5 tags required)</label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    if (tagInput.trim() && tagInput.length >= 2 && questionData.tags.length < 5) {
                      handleAddTag()
                    } else {
                      handleFormKeyPress(e, 'tag-input')
                    }
                  }
                }}
                placeholder="Enter tag (letters, numbers, - or _ only)"
                disabled={questionData.tags.length >= 5 || isSaving}
                data-field="tag-input"
                className="flex-1 border-sky-200 focus:border-sky-500 focus:ring-sky-500 transition-all duration-200"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || tagInput.length < 2 || questionData.tags.length >= 5 || isSaving}
                size="sm"
                variant="outline"
                className="border-sky-300 hover:bg-sky-50 text-sky-700 hover:border-sky-400"
              >
                Add
              </Button>
            </div>
            {questionData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {questionData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-sky-100 text-sky-800 border-sky-200">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(index)}
                      className="ml-1 hover:text-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-sky-500">
              <span>{questionData.tags.length}/5 tags</span>
              <span>Only letters, numbers, hyphens (-) and underscores (_) allowed</span>
            </div>
          </div>
        </div>

        {/* Hint */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-sky-700">Hint (Optional)</label>
          <Textarea
            value={questionData.hint || ""}
            onChange={(e) => onQuestionChange({ ...questionData, hint: e.target.value })}
            placeholder="Optional hint for students..."
            rows={2}
            className="resize-none border-sky-200 focus:border-sky-500 focus:ring-sky-500 transition-all duration-200"
          />
        </div>

        {/* Reference URL */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-sky-700">Reference URL (Optional)</label>
          <Input
            type="url"
            value={questionData.referenceUrl || ""}
            onChange={(e) => onQuestionChange({ ...questionData, referenceUrl: e.target.value })}
            onKeyDown={(e) => handleFormKeyPress(e, 'reference')}
            placeholder="https://example.com/reference"
            data-field="reference"
            className="border-sky-200 focus:border-sky-500 focus:ring-sky-500 transition-all duration-200"
          />
        </div>
      </CardContent>
    </Card>
  )
})

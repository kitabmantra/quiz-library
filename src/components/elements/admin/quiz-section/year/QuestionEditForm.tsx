import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { 
  Save, 
  X, 
  Plus, 
} from "lucide-react"
import { Question } from "@/lib/hooks/tanstack-query/query-hook/quiz/academic/year/use-get-academic-questions"

interface QuestionEditFormProps {
  question: Question
  onSave: (updatedQuestion: Question) => void
  onCancel: () => void
  isSaving?: boolean
}

export const QuestionEditForm = React.memo(({ 
  question, 
  onSave, 
  onCancel, 
  isSaving = false 
}: QuestionEditFormProps) => {
  const [formData, setFormData] = useState({
    question: question.question,
    options: [...question.options],
    correctAnswer: question.correctAnswer,
    difficulty: question.difficulty,
    hint: question.hint || "",
    referenceUrl: question.referenceUrl || "",
    tags: [...question.tags],
    priority: question.priority,
    subjectName: question.subjectName,
  })
  const [newTag, setNewTag] = useState("")

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index] = value
    setFormData(prev => ({ ...prev, options: newOptions }))
  }

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 5) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }))
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
  }

  const handleSave = () => {
    // Validate form data
    if (!formData.question.trim()) {
      alert("Question is required")
      return
    }
    if (formData.options.some(option => !option.trim())) {
      alert("All options are required")
      return
    }
    if (!formData.subjectName.trim()) {
      alert("Subject name is required")
      return
    }
    if (formData.tags.length === 0) {
      alert("At least one tag is required")
      return
    }

    const updatedQuestion: Question = {
      ...question,
      question: formData.question,
      options: formData.options,
      correctAnswer: formData.correctAnswer,
      difficulty: formData.difficulty,
      hint: formData.hint,
      referenceUrl: formData.referenceUrl,
      tags: formData.tags,
      priority: formData.priority,
      subjectName: formData.subjectName,
    }

    onSave(updatedQuestion)
  }

  return (
    <div className="h-full flex flex-col bg-white shadow-xl border-l border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-white">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Edit Question</h2>
          <p className="text-sm text-slate-600 mt-1">ID: #{question.id}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="question" className="text-sm font-semibold text-slate-700">
              Question Text
            </Label>
            <Textarea
              id="question"
              value={formData.question}
              onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              placeholder="Enter your question here..."
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Difficulty and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Difficulty</Label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Priority</Label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>High (1)</option>
                <option value={2}>Medium (2)</option>
                <option value={3}>Low (3)</option>
              </select>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-semibold text-slate-700">
              Subject Name
            </Label>
            <Input
              id="subject"
              value={formData.subjectName}
              onChange={(e) => setFormData(prev => ({ ...prev, subjectName: e.target.value }))}
              placeholder="Enter subject name..."
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700">Answer Options</Label>
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium">
                  {String.fromCharCode(65 + index)}
                </div>
                <Input
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  className="flex-1"
                />
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={formData.correctAnswer === option}
                  onChange={() => setFormData(prev => ({ ...prev, correctAnswer: option }))}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-xs text-slate-500">Correct</span>
              </div>
            ))}
          </div>

          {/* Hint */}
          <div className="space-y-2">
            <Label htmlFor="hint" className="text-sm font-semibold text-slate-700">
              Hint (Optional)
            </Label>
            <Textarea
              id="hint"
              value={formData.hint}
              onChange={(e) => setFormData(prev => ({ ...prev, hint: e.target.value }))}
              placeholder="Enter a hint for this question..."
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Reference URL */}
          <div className="space-y-2">
            <Label htmlFor="reference" className="text-sm font-semibold text-slate-700">
              Reference URL (Optional)
            </Label>
            <Input
              id="reference"
              value={formData.referenceUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, referenceUrl: e.target.value }))}
              placeholder="https://example.com/reference"
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700">Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                className="flex-1"
              />
              <Button
                onClick={handleAddTag}
                disabled={!newTag.trim() || formData.tags.length >= 5}
                size="sm"
                variant="outline"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              {formData.tags.length}/5 tags (max 5 tags allowed)
            </p>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="p-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1 py-3"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
})

QuestionEditForm.displayName = "QuestionEditForm" 
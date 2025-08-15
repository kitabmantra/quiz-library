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
import { Question } from "@/lib/hooks/tanstack-query/query-hook/quiz/entrance/use-get-entrance-questions"

interface EntranceQuestionEditFormProps {
  question: Question
  onSave: (updatedQuestion: Question) => void
  onCancel: () => void
  isSaving?: boolean
}

export const EntranceQuestionEditForm = React.memo(({ 
  question, 
  onSave, 
  onCancel, 
  isSaving = false 
}: EntranceQuestionEditFormProps) => {
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
    
    // If this was the correct answer, update it
    if (formData.correctAnswer === question.options[index]) {
      setFormData(prev => ({ ...prev, correctAnswer: value }))
    }
  }

  const handleCorrectAnswerChange = (selectedOption: string) => {
    setFormData(prev => ({ ...prev, correctAnswer: selectedOption }))
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
    if (!formData.correctAnswer.trim()) {
      alert("Correct answer must be selected")
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
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-white">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 truncate">Edit Entrance Question</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 truncate">ID: #{question.id}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0 ml-2"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="question" className="text-sm font-semibold text-slate-700">
              Question Text
            </Label>
            <Textarea
              id="question"
              value={formData.question}
              onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              placeholder="Enter your entrance question here..."
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
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value={1}>High (1)</option>
                <option value={2}>Medium (2)</option>
                <option value={3}>Low (3)</option>
              </select>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700">Answer Options</Label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-semibold text-slate-600 flex-shrink-0">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <Input
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="flex-1 min-w-0"
                  />
                  <label className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={formData.correctAnswer === option}
                      onChange={() => handleCorrectAnswerChange(option)}
                      className="text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs sm:text-sm text-slate-600 whitespace-nowrap">Correct</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Name */}
          <div className="space-y-2">
            <Label htmlFor="subjectName" className="text-sm font-semibold text-slate-700">
              Subject Name
            </Label>
            <Input
              id="subjectName"
              value={formData.subjectName}
              onChange={(e) => setFormData(prev => ({ ...prev, subjectName: e.target.value }))}
              placeholder="e.g., Mathematics, Physics, Chemistry"
            />
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-slate-700">Tags</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-700">
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-2 hover:text-purple-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {formData.tags.length < 5 && (
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  variant="outline"
                  size="sm"
                  disabled={!newTag.trim() || formData.tags.includes(newTag.trim())}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
            <p className="text-xs text-slate-500">
              {formData.tags.length}/5 tags used
            </p>
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
              placeholder="Provide a helpful hint for this question..."
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Reference URL */}
          <div className="space-y-2">
            <Label htmlFor="referenceUrl" className="text-sm font-semibold text-slate-700">
              Reference URL (Optional)
            </Label>
            <Input
              id="referenceUrl"
              type="url"
              value={formData.referenceUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, referenceUrl: e.target.value }))}
              placeholder="https://example.com/reference"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-slate-200 p-4 sm:p-6 bg-slate-50">
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  )
})

EntranceQuestionEditForm.displayName = "EntranceQuestionEditForm"

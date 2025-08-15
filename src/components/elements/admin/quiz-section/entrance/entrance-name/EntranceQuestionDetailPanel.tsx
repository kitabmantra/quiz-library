import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  FileText, 
  Star, 
  Target, 
  BarChart3, 
  Zap, 
  Edit, 
  Trash2, 
  X,
  Calendar,
  Clock
} from "lucide-react"
import { Question } from "@/lib/hooks/tanstack-query/query-hook/quiz/entrance/use-get-entrance-questions"
import { EntranceQuestionEditForm } from "./EntranceQuestionEditForm"

interface EntranceQuestionDetailPanelProps {
  question: Question | null
  onClose: () => void
  onEdit: (question: Question) => void
  onDelete: (question: Question) => void
  isMobile?: boolean
  isEditing?: boolean
  isDeleting?: boolean
  disabled?: boolean
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    case "medium":
      return "bg-amber-50 text-amber-700 border-amber-200"
    case "hard":
      return "bg-rose-50 text-rose-700 border-rose-200"
    default:
      return "bg-slate-50 text-slate-700 border-slate-200"
  }
}

const getDifficultyIcon = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return <Target className="w-4 h-4" />
    case "medium":
      return <BarChart3 className="w-4 h-4" />
    case "hard":
      return <Zap className="w-4 h-4" />
    default:
      return <Star className="w-4 h-4" />
  }
}

export const EntranceQuestionDetailPanel = React.memo(({ 
  question, 
  onClose, 
  onEdit, 
  onDelete, 
  isMobile = false,
  isEditing = false,
  isDeleting = false,
  disabled = false
}: EntranceQuestionDetailPanelProps) => {
  const [isEditingLocal, setIsEditingLocal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  if (!question) return null

  const handleEditClick = () => {
    setIsEditingLocal(true)
  }

  const handleSaveEdit = async (updatedQuestion: Question) => {
    setIsSaving(true)
    try {
      // Call the parent's edit handler
      await onEdit(updatedQuestion)
      setIsEditingLocal(false)
    } catch (error) {
      console.error("Error saving entrance question:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditingLocal(false)
  }

  // Show edit form if in editing mode
  if (isEditingLocal) {
    return (
      <EntranceQuestionEditForm
        question={question}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
        isSaving={isSaving || isEditing}
      />
    )
  }

  return (
    <div className={`${isMobile ? 'fixed inset-0 z-50' : 'w-full h-full'} bg-white shadow-xl border-l border-slate-200`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-white">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900 truncate">Entrance Question Details</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 truncate">ID: #{question.id}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={disabled}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 ml-2"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
            {/* Question Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={`${getDifficultyColor(question.difficulty)} border font-medium px-3 py-1`}>
                  {getDifficultyIcon(question.difficulty)}
                  <span className="ml-2 capitalize">{question.difficulty}</span>
                </Badge>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="text-sm text-slate-600 font-medium">Priority {question.priority}</span>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-slate-900 leading-relaxed">
                  {question.question}
                </h3>
              </div>
            </div>

            {/* Hint Section */}
            {question.hint && (
              <div className="bg-purple-50 rounded-lg border border-purple-100 p-4">
                <div className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-purple-800 mb-1">Hint</p>
                    <p className="text-sm text-purple-700 leading-relaxed">{question.hint}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Options */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Answer Options
              </h4>
              <div className="grid gap-2">
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border transition-all ${
                      option === question.correctAnswer
                        ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                        option === question.correctAnswer
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className={`text-sm ${
                        option === question.correctAnswer
                          ? 'text-emerald-900 font-medium'
                          : 'text-slate-700'
                      }`}>
                        {option}
                      </span>
                      {option === question.correctAnswer && (
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs ml-auto">
                          Correct Answer
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subject and Tags */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Subject</h4>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700 px-3 py-1">
                  {question.subjectName}
                </Badge>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {question.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Reference URL */}
            {question.referenceUrl && (
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Reference URL</h4>
                <a
                  href={question.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-800 underline text-sm break-all"
                >
                  {question.referenceUrl}
                </a>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Metadata</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-600">Created:</span>
                  <span className="text-slate-900 font-medium">
                    {new Date(question.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-600">Updated:</span>
                  <span className="text-slate-900 font-medium">
                    {new Date(question.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-slate-200 p-4 sm:p-6 bg-slate-50">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleEditClick}
              disabled={disabled || isEditing || isDeleting}
              className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Edit Question</span>
              <span className="sm:hidden">Edit</span>
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(question)}
              disabled={disabled || isEditing || isDeleting}
              className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Deleting..." : (
                <>
                  <span className="hidden sm:inline">Delete</span>
                  <span className="sm:hidden">Delete</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
})

EntranceQuestionDetailPanel.displayName = "EntranceQuestionDetailPanel"

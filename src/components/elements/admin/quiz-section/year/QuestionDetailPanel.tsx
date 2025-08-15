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
import { Question } from "@/lib/hooks/tanstack-query/query-hook/quiz/academic/year/use-get-academic-questions"
import { QuestionEditForm } from "./QuestionEditForm"

interface QuestionDetailPanelProps {
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

export const QuestionDetailPanel = React.memo(({ 
  question, 
  onClose, 
  onEdit, 
  onDelete, 
  isMobile = false,
  isEditing = false,
  isDeleting = false,
  disabled = false
}: QuestionDetailPanelProps) => {
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
      console.error("Error saving question:", error)
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
      <QuestionEditForm
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
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Question Details</h2>
            <p className="text-sm text-slate-600 mt-1">ID: #{question.id}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={disabled}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-8">
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
              <div className="bg-blue-50 rounded-lg border border-blue-100 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-blue-600 font-medium text-sm">💡 Hint</span>
                </div>
                <p className="text-sm text-blue-700 leading-relaxed">{question.hint}</p>
              </div>
            )}

            {/* Options Section */}
            <div className="space-y-3">
              <h4 className="text-base font-semibold text-slate-900">Answer Options:</h4>
              <div className="space-y-3">
                {question.options && question.options.length > 0 ? (
                  question.options.map((option, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                      <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-medium mt-0.5 flex-shrink-0">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <div className="flex-1">
                        <span
                          className={`text-sm leading-relaxed ${
                            option === question.correctAnswer ? "text-emerald-700 font-semibold" : "text-slate-700"
                          }`}
                        >
                          {option}
                        </span>
                      </div>
                      {option === question.correctAnswer && (
                        <Badge className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1">✓ Correct</Badge>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic text-sm py-4 text-center">No options available</div>
                )}
              </div>
            </div>

            {/* Metadata Section */}
            <div className="space-y-6">
              {/* Subject and Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Subject
                  </h4>
                  <Badge variant="outline" className="text-sm font-medium px-3 py-1">
                    {question.subjectName}
                  </Badge>
                </div>

                {question.tags && question.tags.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-slate-700">Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {question.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-slate-100 text-slate-600 px-2 py-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Created
                  </h4>
                  <p className="text-sm text-slate-600">{new Date(question.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Updated
                  </h4>
                  <p className="text-sm text-slate-600">{new Date(question.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Reference URL */}
              {question.referenceUrl && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Reference
                  </h4>
                  <a
                    href={question.referenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline transition-colors bg-blue-50 px-3 py-2 rounded-lg"
                  >
                    <FileText className="w-4 h-4" />
                    Open Reference Link
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex gap-3">
            <Button
              onClick={handleEditClick}
              disabled={disabled || isEditing || isDeleting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? "Editing..." : "Edit Question"}
            </Button>
            <Button
              onClick={() => onDelete(question)}
              disabled={disabled || isEditing || isDeleting}
              variant="destructive"
              className="flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
          {isMobile && (
            <Button
              onClick={onClose}
              disabled={disabled}
              variant="outline"
              className="w-full mt-3 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  )
})

QuestionDetailPanel.displayName = "QuestionDetailPanel" 
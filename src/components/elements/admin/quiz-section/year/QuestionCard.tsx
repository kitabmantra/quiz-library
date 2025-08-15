import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, FileText, Star, Target, BarChart3, Zap } from "lucide-react"
import { Question } from "@/lib/hooks/tanstack-query/query-hook/quiz/academic/year/use-get-academic-questions"

interface QuestionCardProps {
  question: Question
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
      return <Target className="w-3 h-3" />
    case "medium":
      return <BarChart3 className="w-3 h-3" />
    case "hard":
      return <Zap className="w-3 h-3" />
    default:
      return <Star className="w-3 h-3" />
  }
}

export const QuestionCard = React.memo(({ question }: QuestionCardProps) => (
  <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-200 bg-white overflow-hidden">
    <CardContent className="p-6">
      {/* Header with difficulty and ID */}
      <div className="flex items-center justify-between mb-4">
        <Badge className={`${getDifficultyColor(question.difficulty)} border font-medium`}>
          {getDifficultyIcon(question.difficulty)}
          <span className="ml-1.5 capitalize">{question.difficulty}</span>
        </Badge>
        <div className="text-xs text-slate-500 font-mono">#{question.id}</div>
      </div>

      {/* Question Text */}
      <h3 className="font-semibold text-slate-900 mb-3 line-clamp-2 text-lg leading-relaxed group-hover:text-blue-700 transition-colors">
        {question.question}
      </h3>

      {/* Hint Section */}
      {question.hint && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-blue-600 font-medium text-sm">💡 Hint</span>
          </div>
          <p className="text-sm text-blue-700 leading-relaxed">{question.hint}</p>
        </div>
      )}

      {/* Options Section */}
      <div className="mb-4">
        <div className="text-sm font-medium text-slate-700 mb-2">Answer Options:</div>
        <div className="space-y-2">
          {question.options && question.options.length > 0 ? (
            question.options.map((option, index) => (
              <div key={index} className="flex items-start gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors">
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
                  {String.fromCharCode(65 + index)}
                </span>
                <span
                  className={`text-sm leading-relaxed ${option === question.correctAnswer ? "text-emerald-700 font-medium" : "text-slate-600"}`}
                >
                  {option}
                </span>
                {option === question.correctAnswer && (
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs ml-auto">✓ Correct</Badge>
                )}
              </div>
            ))
          ) : (
            <div className="text-slate-500 italic text-sm py-2">No options available</div>
          )}
        </div>
      </div>

      {/* Metadata Section */}
      <div className="space-y-3">
        {/* Subject and Priority */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <Badge variant="outline" className="text-xs font-medium">
              {question.subjectName}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-600 font-medium">Priority {question.priority}</span>
          </div>
        </div>

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600">Tags:</span>
            <div className="flex flex-wrap gap-1">
              {question.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-slate-100 text-slate-600">
                  {tag}
                </Badge>
              ))}
              {question.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
                  +{question.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Footer with dates and reference */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Created: {new Date(question.createdAt).toLocaleDateString()}</span>
            <span>Updated: {new Date(question.updatedAt).toLocaleDateString()}</span>
          </div>
          {question.referenceUrl && (
            <a
              href={question.referenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:underline transition-colors"
            >
              <FileText className="w-3 h-3" />
              Reference Link
            </a>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
))

QuestionCard.displayName = "QuestionCard" 
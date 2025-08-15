import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Target, BarChart3, Zap, Star } from "lucide-react"
import { Question } from "@/lib/hooks/tanstack-query/query-hook/quiz/entrance/use-get-entrance-questions"

interface EntranceCompactQuestionCardProps {
  question: Question
  isSelected: boolean
  onClick: (question: Question) => void
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
      return <Target className="w-3 h-3" />
    case "medium":
      return <BarChart3 className="w-3 h-3" />
    case "hard":
      return <Zap className="w-3 h-3" />
    default:
      return <Star className="w-3 h-3" />
  }
}

export const EntranceCompactQuestionCard = React.memo(({ 
  question, 
  isSelected, 
  onClick, 
  disabled = false 
}: EntranceCompactQuestionCardProps) => (
  <Card 
    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
      isSelected 
        ? 'ring-2 ring-purple-500 bg-purple-50 border-purple-200' 
        : 'hover:bg-slate-50 border-slate-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    onClick={() => !disabled && onClick(question)}
  >
    <CardContent className="p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-900 mb-2 line-clamp-2 text-sm leading-relaxed">
            {question.question}
          </h3>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            <Badge className={`${getDifficultyColor(question.difficulty)} border text-xs`}>
              {getDifficultyIcon(question.difficulty)}
              <span className="ml-1 capitalize">{question.difficulty}</span>
            </Badge>
            <Badge variant="outline" className="text-xs">
              P{question.priority}
            </Badge>
            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-600 max-w-[100px] truncate">
              {question.subjectName}
            </Badge>
          </div>
          {/* Show first few tags */}
          {question.tags && question.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {question.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-slate-50 max-w-[80px] truncate">
                  {tag}
                </Badge>
              ))}
              {question.tags.length > 2 && (
                <Badge variant="outline" className="text-xs bg-slate-50">
                  +{question.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="text-xs text-slate-500 font-mono flex-shrink-0 self-start">
          #{question.id.slice(-8)}
        </div>
      </div>
    </CardContent>
  </Card>
))

EntranceCompactQuestionCard.displayName = "EntranceCompactQuestionCard"
